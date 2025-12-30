# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/mcp-servers/package.json ./packages/mcp-servers/
COPY packages/mock-tenant/package.json ./packages/mock-tenant/
COPY packages/prompts/package.json ./packages/prompts/
COPY packages/content/package.json ./packages/content/

RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npm run db:generate --workspace=@pmkit/web || true

# Build packages
RUN npm run build --workspace=@pmkit/core
RUN npm run build --workspace=@pmkit/mcp
RUN npm run build --workspace=@pmkit/mcp-servers
RUN npm run build --workspace=@pmkit/mock-tenant
RUN npm run build --workspace=@pmkit/prompts
RUN npm run build --workspace=@pmkit/content

# Build web app
RUN npm run build --workspace=@pmkit/web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]

