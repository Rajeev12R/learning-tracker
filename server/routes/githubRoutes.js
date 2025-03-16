import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

// Fetch and analyze repositories
router.get("/repos", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.githubToken) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Fetch repositories with detailed information
        const repoResponse = await axios.get("https://api.github.com/user/repos", {
            headers: {
                Authorization: `Bearer ${user.githubToken}`,
                Accept: "application/vnd.github.v3+json",
            },
            params: {
                sort: 'pushed',
                direction: 'desc',
                per_page: 100 // Get maximum repos for better statistics
            }
        });

        // Process each repository to get detailed information
        const reposWithDetails = await Promise.all(repoResponse.data.map(async (repo) => {
            try {
                // Get package.json content to detect technologies
                let packageJson = null;
                try {
                    const packageResponse = await axios.get(`${repo.url}/contents/package.json`, {
                        headers: {
                            Authorization: `Bearer ${user.githubToken}`,
                            Accept: "application/vnd.github.v3+json",
                        }
                    });
                    const content = Buffer.from(packageResponse.data.content, 'base64').toString();
                    packageJson = JSON.parse(content);
                } catch (error) {
                    // Package.json not found or invalid - this is normal for non-Node projects
                }

                // Get languages used
                const languagesResponse = await axios.get(repo.languages_url, {
                    headers: {
                        Authorization: `Bearer ${user.githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    }
                });

                // Get last commit information
                const commitsResponse = await axios.get(`${repo.url}/commits`, {
                    headers: {
                        Authorization: `Bearer ${user.githubToken}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                    params: {
                        per_page: 1
                    }
                });

                // Detect technology stack
                const techStack = detectTechStack(packageJson, languagesResponse.data, repo);

                return {
                    id: repo.id,
                    name: repo.name,
                    description: repo.description,
                    html_url: repo.html_url,
                    created_at: repo.created_at,
                    updated_at: repo.updated_at,
                    pushed_at: repo.pushed_at,
                    languages: languagesResponse.data,
                    techStack,
                    lastCommit: commitsResponse.data[0],
                    defaultBranch: repo.default_branch,
                    size: repo.size,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    isPrivate: repo.private
                };
            } catch (error) {
                console.error(`Error fetching details for repo ${repo.name}:`, error);
                return repo;
            }
        }));

        // Calculate meaningful statistics
        const stats = calculateRepoStats(reposWithDetails);

        res.json({
            repos: reposWithDetails,
            stats,
            totalRepos: reposWithDetails.length
        });
    } catch (error) {
        console.error('GitHub API Error:', error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch repositories" });
    }
});

// Helper function to detect technology stack
function detectTechStack(packageJson, languages, repo) {
    const stack = {
        frontend: [],
        backend: [],
        database: [],
        tools: []
    };

    // Check package.json dependencies
    if (packageJson) {
        const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        // Frontend frameworks
        if (allDeps?.react) stack.frontend.push('React');
        if (allDeps?.vue) stack.frontend.push('Vue.js');
        if (allDeps?.angular) stack.frontend.push('Angular');
        if (allDeps?.next) stack.frontend.push('Next.js');
        if (allDeps?.nuxt) stack.frontend.push('Nuxt.js');

        // Backend frameworks
        if (allDeps?.express) stack.backend.push('Express.js');
        if (allDeps?.koa) stack.backend.push('Koa.js');
        if (allDeps?.fastify) stack.backend.push('Fastify');
        if (allDeps['@nestjs/core']) stack.backend.push('NestJS');

        // Databases
        if (allDeps?.mongoose || allDeps?.mongodb) stack.database.push('MongoDB');
        if (allDeps?.sequelize) stack.database.push('SQL');
        if (allDeps?.prisma) stack.database.push('Prisma');

        // Testing and tools
        if (allDeps?.jest) stack.tools.push('Jest');
        if (allDeps?.typescript) stack.tools.push('TypeScript');
        if (allDeps?.webpack) stack.tools.push('Webpack');
    }

    // Check languages
    const langSet = new Set(Object.keys(languages));
    if (langSet.has('Python')) {
        stack.backend.push('Python');
        if (repo.description?.toLowerCase().includes('django')) {
            stack.backend.push('Django');
        }
        if (repo.description?.toLowerCase().includes('flask')) {
            stack.backend.push('Flask');
        }
    }
    if (langSet.has('Java')) stack.backend.push('Java');
    if (langSet.has('Go')) stack.backend.push('Go');
    if (langSet.has('Ruby')) stack.backend.push('Ruby');

    return stack;
}

// Calculate repository statistics
function calculateRepoStats(repos) {
    const stats = {
        totalCommits: 0,
        lastCommitInfo: null,
        topLanguages: {},
        techStacks: {
            frontend: {},
            backend: {},
            database: {},
            tools: {}
        },
        activityByMonth: {},
        totalSize: 0,
        totalStars: 0,
        totalForks: 0
    };

    repos.forEach(repo => {
        // Update total size and engagement metrics
        stats.totalSize += repo.size || 0;
        stats.totalStars += repo.stars || 0;
        stats.totalForks += repo.forks || 0;

        // Track last commit
        if (repo.lastCommit && (!stats.lastCommitInfo || new Date(repo.lastCommit.commit.author.date) > new Date(stats.lastCommitInfo.date))) {
            stats.lastCommitInfo = {
                repo: repo.name,
                date: repo.lastCommit.commit.author.date,
                message: repo.lastCommit.commit.message,
                author: repo.lastCommit.commit.author.name
            };
        }

        // Count languages
        if (repo.languages) {
            Object.entries(repo.languages).forEach(([lang, bytes]) => {
                stats.topLanguages[lang] = (stats.topLanguages[lang] || 0) + bytes;
            });
        }

        // Count tech stacks
        if (repo.techStack) {
            Object.entries(repo.techStack).forEach(([category, techs]) => {
                techs.forEach(tech => {
                    stats.techStacks[category][tech] = (stats.techStacks[category][tech] || 0) + 1;
                });
            });
        }

        // Track activity by month
        const monthYear = new Date(repo.pushed_at).toISOString().slice(0, 7);
        stats.activityByMonth[monthYear] = (stats.activityByMonth[monthYear] || 0) + 1;
    });

    // Sort languages by usage
    stats.topLanguages = Object.entries(stats.topLanguages)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    return stats;
}

export default router;


