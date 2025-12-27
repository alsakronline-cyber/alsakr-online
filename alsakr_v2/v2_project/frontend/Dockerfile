# Stage 1: Building the app
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build # Disabled for now to avoid build errors during scaffolding

# Stage 2: Serve the app
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "run", "dev"]
