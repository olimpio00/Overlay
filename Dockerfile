# syntax=docker/dockerfile:1
# IROS - Interactive Remote Overlay System
# Multi-stage build para produção segura e otimizada

# --- Stage 1: Builder ---
FROM golang:1.19-alpine AS builder

WORKDIR /src

# Download dependências primeiro (cache layer)
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY . .

# Build otimizado para produção
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -X main.Version=$(git describe --tags --always 2>/dev/null || echo 'dev')" \
    -o /out/iros .

# --- Stage 2: Runtime ---
FROM alpine:3.19

# Instalações necessárias
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Usuário não-root por segurança
RUN addgroup -S iros && adduser -S iros -G iros

# Diretórios
RUN mkdir -p /app /data && chown -R iros:iros /app /data

WORKDIR /app

# Copiar binário e assets do builder
COPY --from=builder --chown=iros:iros /out/iros ./iros
COPY --chown=iros:iros static ./static
COPY --chown=iros:iros templates ./templates
COPY --chown=iros:iros meta ./meta

# Trocar para usuário iros (segurança)
USER iros

# Variáveis de ambiente
ENV IROS_HTTP_ADDRESS=0.0.0.0 \
    IROS_HTTP_PORT=8080 \
    IROS_USE_WSS=true

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Volume para persistência de dados
VOLUME ["/data"]

# Comando de inicialização
CMD ["./iros", "--config", "/data/config.json"]
