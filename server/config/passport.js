import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import GitHubStrategy from "passport-github"
import dotenv from "dotenv"
import User from "../models/User.js"
dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profilePic: profile.photos[0].value,
          })
          await user.save()
        }
        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
      scope: ['user:email', 'repo']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("GitHub Profile:", profile);
        console.log("Access Token:", accessToken);

        let email = profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : `no-email-${profile.id}@github.com`;

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = new User({
            name: profile.displayName || profile.username,
            email: email,
            githubId: profile.id,
            profilePic: profile.photos?.[0]?.value || "",
            githubToken: accessToken,
            provider: 'github'
          });
        } else {
          user.name = profile.displayName || profile.username;
          user.profilePic = profile.photos?.[0]?.value || user.profilePic;
          user.githubToken = accessToken;
          user.provider = 'github';
        }

        await user.save();
        console.log("Saved user:", user);
        return done(null, user);
      } catch (error) {
        console.error("GitHub strategy error:", error);
        return done(error, null);
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
