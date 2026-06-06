# -------- Stage 1: Build --------
FROM node:22-slim AS builder
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-v2,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm i --frozen-lockfile

COPY . .

ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_UPLOAD_PRESET
ARG CLOUDINARY_API_KEY

ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$CLOUDINARY_UPLOAD_PRESET
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY

ARG MIDTRANS_CLIENT_KEY
ARG MIDTRANS_IS_PRODUCTION

ENV NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=$MIDTRANS_CLIENT_KEY
ENV NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=$MIDTRANS_IS_PRODUCTION

# Environment variables for build
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummydb"
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm prisma generate
RUN pnpm build
RUN ls -la .next && ls -la .next/standalone

# NOTE: Do NOT hand-copy @prisma into the standalone output. Next.js file-tracing
# already bundles the full Prisma runtime closure into
# `.next/standalone/node_modules/.pnpm` (the @prisma/client package, its generated
# `.prisma/client` wasm client, @prisma/client-runtime-utils, @prisma/adapter-pg
# and its transitive deps). The top-level `node_modules/@prisma/*` symlinks point
# at `node_modules/.pnpm/...`, which is exactly where they land in the runner once
# the standalone output is copied to /app — the same mechanism that already works
# for `pg`. A manual `rm -rf @prisma && cp` clobbers those symlinks with an
# incomplete copy and is what previously broke `require('.prisma/client/default')`.
# The runner stage below verifies the client resolves before the image is finalized.

# Belt-and-suspenders (additive, non-destructive): if tracing ever fails to place
# the generated wasm client next to the traced @prisma/client, copy it in. This is
# a no-op when tracing already bundled `.prisma` (the normal case) and never
# touches the pnpm symlinks that make resolution work.
RUN set -eux; \
    for d in /app/.next/standalone/node_modules/.pnpm/@prisma+client@*/node_modules; do \
      [ -d "$d/.prisma" ] || cp -rL /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma "$d/"; \
    done

# -------- Stage 2: Runtime --------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
# /tools/node_modules/.bin is prepended so prisma/tsx/dotenv binaries take
# precedence and are found without pnpm ever touching /app/node_modules.
ENV PATH="$PNPM_HOME:/tools/node_modules/.bin:/app/node_modules/.bin:$PATH"
ENV NODE_PATH=/tools/node_modules

RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy only what standalone needs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma schema and config (for migration and seeder)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Install CLI tools (prisma, tsx, dotenv) in an isolated /tools directory.
# Running pnpm here instead of inside /app ensures pnpm never reconciles or
# rewrites the standalone /app/node_modules that Next.js produced — it must stay
# exactly as the builder left it so the traced Prisma client keeps resolving.
WORKDIR /tools
RUN --mount=type=cache,id=pnpm-tools,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm add prisma@7.2.0 tsx dotenv

WORKDIR /app

# Fail the build (not runtime) if the Prisma runtime client can't be resolved from
# the standalone output. This runs in the real runner layout, so it catches any
# packaging regression before the image ships.
RUN node -e "require('@prisma/client'); require('@prisma/adapter-pg'); require('pg'); console.log('Runtime deps resolved OK');"

EXPOSE 3000

CMD ["node", "server.js"]
