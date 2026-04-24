FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Development
FROM deps AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Builder
FROM deps AS builder
COPY . .
ARG VITE_API_URL
ARG VITE_SOCKET_URL
RUN npm run build

# Production (nginx)
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
