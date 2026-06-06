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

# Prisma 7 generates a hash-based runtime package (e.g. @prisma/client-<hash>) in
# node_modules during `prisma generate`. Next.js standalone file-tracing does not
# capture it because it isn't a declared npm dependency. Copy the whole @prisma
# scope (following pnpm symlinks with -L) so the package is present at runtime.
RUN rm -rf /app/.next/standalone/node_modules/@prisma && cp -rL /app/node_modules/@prisma /app/.next/standalone/node_modules/

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
# rewrites the pre-generated @prisma/client that was copied via cp -rL in the
# builder stage. /app/node_modules remains exactly as the builder left it.
WORKDIR /tools
RUN --mount=type=cache,id=pnpm-tools,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm add prisma@7.2.0 tsx dotenv

WORKDIR /app
EXPOSE 3000

CMD ["node", "server.js"]
