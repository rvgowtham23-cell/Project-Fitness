/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @fitness/shared-types ships raw TS source (see packages/shared-types/package.json) —
  // Next only transpiles first-party app code by default, so workspace packages need an opt-in.
  transpilePackages: ['@fitness/shared-types'],
};

module.exports = nextConfig;
