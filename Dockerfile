# --- Backend ---
# 关键点：使用多架构官方镜像；把 TARGET* 透传给 Go；根据 TARGETVARIANT 设置 GOARM
FROM --platform=$TARGETPLATFORM golang:1.20-alpine AS backend

WORKDIR /backend
COPY . .

# Build args from buildx
ARG TARGETOS
ARG TARGETARCH
ARG TARGETVARIANT  # e.g. v7 for linux/arm/v7

# Go env
# 当是 arm(v7) 时，设置 GOARM；arm64 则无需 GOARM
ENV GOOS=$TARGETOS \
    GOARCH=$TARGETARCH \
    GO111MODULE=on \
    CGO_ENABLED=1

# 如果是 arm/v7，导出 GOARM
RUN if [ "$TARGETARCH" = "arm" ] && [ -n "$TARGETVARIANT" ]; then \
      export GOARM="${TARGETVARIANT#v}" && echo "GOARM=$GOARM" > /tmp/goarm; \
    fi

# 依赖
RUN apk update && \
    apk add --no-cache gcc musl-dev g++ make linux-headers

# 编译（静态链接，如果你在某些平台遇到 musl 静态链接问题，可把 CGO_ENABLED=0 并去掉 -static）
# 读取上一步可能写入的 GOARM
RUN if [ -f /tmp/goarm ]; then . /tmp/goarm; fi && \
    go env && \
    go build -o chat -a -ldflags="-extldflags=-static" .

# --- Frontend ---
# Node 官方镜像也是多架构的，保持与后端同平台，避免可选依赖（如 esbuild）装错架构
FROM --platform=$TARGETPLATFORM node:18-alpine AS frontend

WORKDIR /app
COPY ./app ./

# 使用 corepack 或全局 pnpm 都可，这里沿用你的方式
RUN apk add --no-cache python3 make g++ && \
    npm install -g pnpm && \
    pnpm install && \
    pnpm run build && \
    rm -rf node_modules src

# --- Runtime ---
FROM --platform=$TARGETPLATFORM alpine

# 依赖
RUN apk upgrade --no-cache && \
    apk add --no-cache wget ca-certificates tzdata && \
    update-ca-certificates 2>/dev/null || true

# 时区
RUN echo "Asia/Shanghai" > /etc/timezone && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /

# 拷贝构建产物
COPY --from=backend  /backend/chat                          /chat
COPY --from=backend  /backend/config.example.yaml           /config.example.yaml
COPY --from=backend  /backend/utils/templates               /utils/templates
COPY --from=backend  /backend/addition/article/template.docx /addition/article/template.docx
COPY --from=frontend /app/dist                              /app/dist

VOLUME ["/config", "/logs", "/storage"]
EXPOSE 8094

CMD ["./chat"]

