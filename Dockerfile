# -------- Stage 1: Build --------
FROM node:20-slim AS builder
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
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:/app/node_modules/.bin:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only what standalone needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy the generated Prisma client (required for runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Prisma schema and config (for migration and seeder)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Install CLI tools for migrations/seeding (adds to node_modules/.bin)
RUN pnpm add prisma@7.2.0 tsx dotenv @prisma/client@7.2.0

EXPOSE 3000

CMD ["node" , "server.js"]