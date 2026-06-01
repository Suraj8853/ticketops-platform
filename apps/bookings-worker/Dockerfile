FROM node:20 AS builder
WORKDIR /app
COPY package*.json  .
RUN npm install 
COPY . .

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY package*.json .
RUN npm install --only=production
COPY --from=builder /app/src ./src
RUN chown -R nodejs:nodejs ./src
USER nodejs
EXPOSE 9090
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:9090/health || exit 1
CMD ["node","src/worker.js"]
        


