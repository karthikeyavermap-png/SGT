FROM node:20-alpine AS base
RUN npm install -g pnpm@10.5.2

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/web/ apps/web/
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/web build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "@repo/web", "start"]

