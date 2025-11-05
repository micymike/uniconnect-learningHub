# For building from frontend-1 directory
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY .env* ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 5502

CMD ["nginx", "-g", "daemon off;"]