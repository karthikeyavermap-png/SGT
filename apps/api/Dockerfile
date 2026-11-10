FROM node:20-alpine AS base
RUN npm install -g pnpm@10.5.2

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/api db:generate
RUN pnpm --filter @repo/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=builder /app /app
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

