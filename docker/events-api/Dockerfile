FROM node:20 AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci
COPY . .

FROM node:20-alpine as production
WORKDIR /app
RUN  addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 
COPY package*.json .
RUN npm ci --production
COPY --from=builder /app/src ./src
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node","src/app.js"]