# Dockerfile cho zalo-worker (dùng được trên Railway/Render/Fly.io).
FROM node:20-alpine

WORKDIR /app

# Cài deps trước để tận dụng cache layer.
COPY package.json ./
RUN npm install --omit=dev

# Copy mã nguồn.
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "src/index.js"]
