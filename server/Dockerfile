FROM node:24-alpine
WORKDIR /app

# Layer 1: 安装依赖（package 文件不变时，这一层有缓存，跳过重新安装）
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Layer 2: 生成 Prisma Client（schema 不变时跳过）
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Layer 3: 编译 TypeScript（改了业务代码时只重跑这一层）
COPY src/ ./src/
COPY tsconfig.json ./
RUN pnpm build

EXPOSE 3000

# 启动前先跑迁移（幂等：只执行尚未应用的迁移，已跑过的自动跳过）
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
