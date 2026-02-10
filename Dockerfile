# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV OPENAI_API_KEY="sk-placeholder"
ENV STRIPE_SECRET_KEY="sk_test_placeholder"
ENV NEXTAUTH_SECRET="placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"
RUN npx prisma generate
RUN npm run build

# Collect prisma CLI dependencies into a single directory
RUN mkdir -p /prisma-deps/node_modules && \
    cp -r node_modules/.bin /prisma-deps/node_modules/.bin && \
    cp -r node_modules/.prisma /prisma-deps/node_modules/.prisma && \
    cp -r node_modules/prisma /prisma-deps/node_modules/prisma && \
    cd /app && node -e " \
      const resolve = require.resolve; \
      const path = require('path'); \
      const fs = require('fs'); \
      const seen = new Set(); \
      function collect(mod) { \
        try { \
          const p = path.dirname(resolve(mod + '/package.json')); \
          const name = mod; \
          if (seen.has(name)) return; \
          seen.add(name); \
          const dest = '/prisma-deps/node_modules/' + name; \
          if (!fs.existsSync(dest)) { \
            fs.cpSync(p, dest, { recursive: true }); \
          } \
          const pkg = JSON.parse(fs.readFileSync(p + '/package.json')); \
          for (const dep of Object.keys(pkg.dependencies || {})) collect(dep); \
        } catch {} \
      } \
      collect('@prisma/config'); \
      collect('prisma'); \
    "

# ---- runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma (for migrations) - all dependencies included
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /prisma-deps/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
