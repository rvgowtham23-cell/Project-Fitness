# Build from the monorepo root: docker build -f apps/backend/Dockerfile .
# (needs root package-lock.json and packages/shared-types in context - a
# single apps/backend context can't resolve the npm workspace or shared types)

FROM node:20-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json turbo.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN npm ci

RUN npm run build --workspace=apps/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json turbo.json ./
COPY packages ./packages
COPY apps/backend/package.json ./apps/backend/package.json

# Install production deps only, then layer in the compiled output - keeps the
# runtime image free of TypeScript/build tooling.
RUN npm ci --omit=dev --workspace=apps/backend --include-workspace-root=false

COPY --from=builder /repo/apps/backend/dist ./apps/backend/dist

EXPOSE 3000
USER node

CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]
