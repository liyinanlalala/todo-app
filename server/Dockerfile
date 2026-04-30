FROM node:24-alpine
WORKDIR /app

# Layer 1: 安装依赖（package 文件不变时，这一层有缓存，跳过重新安装）
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Layer 2: 生成 Prisma Client（schema 不变时跳过）
# 修复：Docker 环境下 prisma generate 生成 .ts 路径的 import，
# verbatimModuleSyntax 会原样保留到编译产物，Node.js 无法解析 .ts 文件
# 因此在编译前将所有相对 import 的 .ts 后缀改为 .js
COPY prisma/ ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate && \
    find ./src/generated -name "*.ts" | xargs sed -i -E \
    "s|'(\.[^']+)\.ts'|'\1.js'|g; s|\"(\.[^\"]+)\.ts\"|\"\\1.js\"|g"

# Layer 3: 编译 TypeScript（改了业务代码时只重跑这一层）
COPY src/ ./src/
COPY tsconfig.json ./
RUN pnpm build

EXPOSE 3000

# 启动前先跑迁移（幂等：只执行尚未应用的迁移，已跑过的自动跳过）
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
