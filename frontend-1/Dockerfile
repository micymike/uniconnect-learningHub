FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm install -g vite

RUN npm install 

RUN npm run build

# Expose port (Render will set PORT env)
EXPOSE 4173

# Run preview server on the port Render provides
CMD ["sh", "-c", "npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}"]
