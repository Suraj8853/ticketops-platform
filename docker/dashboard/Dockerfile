FROM node:20 as builder
WORKDIR /app
COPY package.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine as production
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
 CMD wget -qO- http://localhost:80/healthz || exit 1
CMD ["nginx","-g","daemon off"]