# === Build ===
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --production

# === Production ===
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/fonts ./fonts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/entrypoint.sh ./
# RUN chmod +x entrypoint.sh
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh


EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]

