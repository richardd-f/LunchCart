# -------- Stage 1: Build --------
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Environment variables for build
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummydb"
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm prisma generate
RUN pnpm build
RUN ls -la .next && ls -la .next/standalone

# -------- Stage 2: Runtime --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what standalone needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma (for migration and seeder from image)
COPY --from=builder /app/prisma ./prisma
RUN npm install prisma

EXPOSE 3000

CMD ["node" , "server.js"]