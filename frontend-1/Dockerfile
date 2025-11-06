FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

# Expose Vite preview default port
EXPOSE 5503

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5503"]
