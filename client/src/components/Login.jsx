import React from 'react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Branding Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Learning Tracker
          </h1>
          <h2 className="mt-2 text-sm font-medium text-gray-600">
            Sign in to continue to your dashboard
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 space-y-6 border border-gray-100">
          <div className="space-y-4">
            {/* Google Login Button */}
            <a
              href="http://localhost:3000/auth/google"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
              Continue with Google
            </a>

            {/* GitHub Login Button */}
            <a
              href="http://localhost:3000/auth/github"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <FaGithub className="h-5 w-5 mr-2" />
              Continue with GitHub
            </a>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Protected by industry-leading security
              </span>
            </div>
          </div>

          {/* Footer Text */}
          <p className="mt-2 text-center text-xs text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
