FROM node:22-alpine AS builder

WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci
COPY backend/. .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/subpage-00000000-0000-0000-0000-000000000000.json ./
COPY frontend/src/i18n/locales ./locales

RUN npx prisma generate

EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
