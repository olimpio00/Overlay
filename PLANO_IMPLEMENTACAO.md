# 📋 PLANO DE IMPLEMENTAÇÃO - IROS MELHORADO

**Objetivo:** Preparar o IROS para hospedagem segura e profissional  
**Data:** Maio 2026  
**Tempo Estimado:** 8-10 horas  
**Status:** Pronto para começar

---

## 🎯 Visão Geral do Plano

### Fase 1: INFRAESTRUTURA (Essencial)
```
├─ Docker (Dockerfile + docker-compose.yml)
├─ Segurança Básica (Rate Limit, Headers, CORS)
└─ Documentação (README, Setup, Deployment)
```

### Fase 2: MELHORIAS UX (Opcional - 4-6h extra)
```
├─ Corrigir Bug Clipboard
└─ Logging Melhorado
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ **PARTE 1: DOCKER** (3-4 horas)

#### Arquivos a Criar:
- [ ] `Dockerfile` - Build do Go
- [ ] `docker-compose.yml` - Ambiente local
- [ ] `.dockerignore` - Ignore arquivos desnecessários
- [ ] `scripts/docker-build.sh` - Script de build
- [ ] `scripts/docker-run.sh` - Script de execução

#### O que vai fazer:
```dockerfile
# Dockerfile será multi-stage:
# Stage 1: Build (Go compiler)
#   - Compila código Go
#   - Otimizado para produção
#   - Size mínimo

# Stage 2: Runtime (Go app)
#   - Apenas binário + assets
#   - ~50MB total
#   - Seguro e leve
```

#### Resultado:
```bash
docker-compose up                 # Local dev
docker build -t iros:latest .     # Build para produção
docker run -p 8080:8080 iros      # Roda em qualquer lugar
```

---

### ✅ **PARTE 2: SEGURANÇA** (3-4 horas)

#### Arquivos a Modificar:
- [ ] `core/api/api.go` - Adicionar rate limiting middleware
- [ ] `core/wss/websocket_server.go` - Validação de conexão
- [ ] `core/server.go` - Headers de segurança
- [ ] `core/util/config_file.go` - Novas opções de segurança

#### Mudanças:
```go
// Novo middleware - Rate Limiting
func RateLimitMiddleware(maxRequests int, windowSeconds int) http.Handler

// Novos headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block

// Validação de entrada
- Validar URLs (XSS prevention)
- Sanitizar JSON
- Checker de tipo de elemento

// CORS configurável
"cors_allowed_origins": ["https://example.com"]
```

#### Resultado:
```json
{
  "http_port": 8080,
  "https_port": 8443,
  "use_tls": false,
  "tls_cert_path": "/etc/certs/cert.pem",
  "tls_key_path": "/etc/certs/key.pem",
  "rate_limit_enabled": true,
  "rate_limit_requests": 30,
  "rate_limit_window_seconds": 60,
  "cors_enabled": true,
  "cors_allowed_origins": ["*"]
}
```

---

### ✅ **PARTE 3: DOCUMENTAÇÃO** (2-3 horas)

#### Arquivos a Criar:
- [ ] `README.md` - Novo e completo
- [ ] `DEPLOYMENT.md` - Guia de hospedagem
- [ ] `SECURITY.md` - Boas práticas
- [ ] `API.md` - Referência de API
- [ ] `DEVELOPMENT.md` - Setup local
- [ ] `.env.example` - Variáveis de ambiente

#### Conteúdo:

**README.md:**
```markdown
# IROS - Interactive Remote Overlay System

## Quick Start
- Como rodar localmente
- Como fazer build
- Requisitos mínimos
- Uso básico
```

**DEPLOYMENT.md:**
```markdown
## Deploy em Produção

### Opção 1: Docker (Recomendado)
- Pull image
- docker-compose.yml
- Reverse proxy (nginx)
- HTTPS com Let's Encrypt

### Opção 2: VPS Manual
- Go 1.19+
- Compilar
- Systemd service
- Nginx reverse proxy

### Opção 3: Cloud (AWS/Azure/Heroku)
- Dockerfile
- Env vars
- Managed DB (opcional)
```

**SECURITY.md:**
```markdown
## Checklist de Segurança

- [ ] Usar HTTPS/WSS em produção
- [ ] Mudar API token padrão
- [ ] Rate limiting ativado
- [ ] Firewall configurado
- [ ] Backup automático
- [ ] Logs monitorados
```

**DEVELOPMENT.md:**
```markdown
## Development Setup

### Requisitos
- Go 1.19+
- Node.js 16+ (optional, para minificar)
- Docker (optional)

### Setup Local
1. Clone repo
2. go mod download
3. ./iros --config config-dev.json
4. Acesse http://localhost:8080
```

---

### ✅ **PARTE 4: CI/CD** (2-3 horas) - OPCIONAL

#### Arquivos a Criar:
- [ ] `.github/workflows/build.yml` - GitHub Actions
- [ ] `.github/workflows/test.yml` - Testes
- [ ] `Makefile` - Comandos comuns

#### O que faz:
```yaml
# No push para main:
- Lint (golangci-lint)
- Testes (go test)
- Build Docker
- Push para Docker Hub (opcional)
```

---

## 🛠️ ARQUIVOS A CRIAR (Resumo)

```
iros/
├── Dockerfile                    ← NOVO
├── docker-compose.yml           ← NOVO
├── .dockerignore                ← NOVO
├── Makefile                     ← NOVO
├── .env.example                 ← NOVO
├── README.md                    ← NOVO/ATUALIZAR
├── DEPLOYMENT.md                ← NOVO
├── SECURITY.md                  ← NOVO
├── API.md                       ← NOVO
├── DEVELOPMENT.md               ← NOVO
├── .github/
│   └── workflows/
│       ├── build.yml            ← NOVO
│       └── test.yml             ← NOVO
└── scripts/
    ├── docker-build.sh          ← NOVO
    ├── docker-run.sh            ← NOVO
    └── build-local.sh           ← NOVO
```

---

## 📝 ARQUIVOS A MODIFICAR (Resumo)

```
iros/
├── core/server.go               ← Adicionar security headers
├── core/api/api.go              ← Adicionar rate limiting
├── core/util/config_file.go     ← Novas opções de config
├── core/wss/websocket_server.go ← Validação de input
└── go.mod                       ← Adicionar dependências
```

---

## 🚀 SEQUÊNCIA DE IMPLEMENTAÇÃO

### **DIA 1 - Manhã (3-4h)**
```
1. Criar Dockerfile
2. Criar docker-compose.yml
3. Testar build local
```

### **DIA 1 - Tarde (3-4h)**
```
1. Adicionar rate limiting (middleware)
2. Adicionar security headers
3. Modificar config para segurança
```

### **DIA 2 - Manhã (2-3h)**
```
1. Escrever README.md
2. Escrever DEPLOYMENT.md
3. Escrever SECURITY.md
```

### **DIA 2 - Tarde (1-2h - OPCIONAL)**
```
1. CI/CD workflow
2. Makefile
3. .env.example
```

---

## 📦 DEPENDÊNCIAS A ADICIONAR

No `go.mod`:
```go
require (
    // Existentes
    github.com/gorilla/websocket v1.5.0
    github.com/spf13/cobra v1.6.1
    
    // NOVOS - Rate Limiting & Segurança
    github.com/urfave/negroni v1.0.0
    github.com/ulule/limiter/v3 v3.11.0
    
    // OPCIONAL - Logging
    github.com/sirupsen/logrus v1.9.0
)
```

---

## ✨ RESULTADO FINAL

Após implementar, você terá:

### ✅ Infraestrutura
- Docker pronto para produção
- docker-compose para dev local
- Scripts de build/run
- CI/CD automático

### ✅ Segurança
- Rate limiting ativo (30 req/min)
- Headers de segurança
- CORS configurável
- Validação de input

### ✅ Documentação
- README claro
- Setup fácil
- Guia de deployment
- Boas práticas

### ✅ Deployment
```bash
# Local (Dev)
docker-compose up

# Produção
docker build -t iros:latest .
docker run -p 8080:8080 -e API_TOKEN=seu-token iros:latest

# ou Reverse Proxy + Let's Encrypt (nginx)
```

---

## 🎯 PRÓXIMOS PASSOS (Opcional)

Se quiser depois:
- [ ] Corrigir bug do clipboard (4-6h)
- [ ] Logging melhorado com logrus (2-3h)
- [ ] Testes automatizados (4-6h)
- [ ] Integração Twitch (6-8h)

---

## 📋 CHECKLIST FINAL

Antes de hospedar:

### Segurança
- [ ] API token mudado do padrão
- [ ] Rate limiting testado
- [ ] HTTPS/WSS ativado em produção
- [ ] CORS configurado corretamente
- [ ] Headers de segurança presentes

### Funcionalidade
- [ ] Docker build funciona
- [ ] docker-compose up funciona
- [ ] Elementos salvam corretamente
- [ ] WebSocket sincroniza
- [ ] Viewer recebe updates

### Documentação
- [ ] README está claro
- [ ] DEPLOYMENT.md completo
- [ ] Exemplos funcionam
- [ ] Troubleshooting documentado

---

## 🚀 COMEÇAR AGORA?

**Você quer que eu comece a implementar?**

Se sim, em que ordem?

1. **"Começa tudo (Docker → Segurança → Docs)"** ← RECOMENDO
2. **"Só Docker mesmo"**
3. **"Segurança em primeiro"**
4. **"Outra coisa"**

---

**Documento Criado:** Maio 2026  
**Status:** Pronto para implementação  
**Tempo Total:** 8-10 horas (Phase 1) + 4-6 horas (Phase 2 - Opcional)
