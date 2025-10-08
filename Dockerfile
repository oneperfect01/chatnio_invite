# --- Backend (Go) ---
FROM --platform=$TARGETPLATFORM golang:1.20-alpine AS backend

WORKDIR /backend
COPY . .

ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT

ENV GOOS=$TARGETOS \
    GOARCH=$TARGETARCH \
    GO111MODULE=on \
    CGO_ENABLED=1

# arm/v7 场景设置 GOARM
RUN if [ "$TARGETARCH" = "arm" ] && [ -n "$TARGETVARIANT" ]; then \
      export GOARM="${TARGETVARIANT#v}" && echo "GOARM=$GOARM" > /tmp/goarm; \
    fi

RUN apk update && apk add --no-cache gcc musl-dev g++ make linux-headers

# 如遇静态链接失败，可改为：ENV CGO_ENABLED=0 并去掉 -static
RUN if [ -f /tmp/goarm ]; then . /tmp/goarm; fi && \
    go env && \
    go build -o chat -a -ldflags="-extldflags=-static" .

# --- Frontend (Node) ---
# 关键：在构建机架构跑（BUILDPLATFORM），并用 Debian 避坑
FROM --platform=$BUILDPLATFORM node:18-bullseye AS frontend

WORKDIR /app
COPY ./app ./

# 启用 pnpm（用 corepack 更稳），并安装编译所需工具
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
# CI 优化：跳过浏览器/可选下载
ENV CI=1 \
    PUPPETEER_SKIP_DOWNLOAD=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_update_notifier=false

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 构建依赖（仅在 build 阶段存在）
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
 && pnpm install --no-frozen-lockfile \
 && pnpm run build \
 && rm -rf node_modules src \
 && apt-get purge -y python3 make g++ \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

# --- Runtime (Alpine) ---
FROM --platform=$TARGETPLATFORM alpine

RUN apk upgrade --no-cache && \
    apk add --no-cache wget ca-certificates tzdata && \
    update-ca-certificates 2>/dev/null || true

RUN echo "Asia/Shanghai" > /etc/timezone && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /

COPY --from=backend  /backend/chat                           /chat
COPY --from=backend  /backend/config.example.yaml            /config.example.yaml
COPY --from=backend  /backend/utils/templates                /utils/templates
COPY --from=backend  /backend/addition/article/template.docx /addition/article/template.docx
COPY --from=frontend /app/dist                               /app/dist

VOLUME ["/config", "/logs", "/storage"]
EXPOSE 8094

CMD ["./chat"]

