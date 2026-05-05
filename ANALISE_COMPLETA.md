# IROS - Interactive Remote Overlay System
## Análise Completa do Sistema

**Versão do Documento:** 1.0  
**Data:** Maio 2026  
**Linguagem Principal:** Go (Backend) + JavaScript/HTML/CSS (Frontend)  
**Licença:** GNU Affero General Public License v3

---

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Componentes Backend](#componentes-backend)
4. [Componentes Frontend](#componentes-frontend)
5. [Funcionalidades Implementadas](#funcionalidades-implementadas)
6. [Funcionalidades Não Implementadas](#funcionalidades-não-implementadas)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Estrutura de Dados](#estrutura-de-dados)
9. [API REST](#api-rest)
10. [Protocolo WebSocket](#protocolo-websocket)
11. [Sistema de Autenticação](#sistema-de-autenticação)
12. [Configuração](#configuração)

---

## 🎯 Visão Geral

**IROS (Interactive Remote Overlay System)** é um sistema web que permite controlar uma overlay interativa a partir de um navegador. A overlay pode ser adicionada a um stream via browser source (OBS, Streamlabs, etc.).

### Propósito Principal
- Permitir que streamers criem e gerenciem overlays dinâmicas
- Fornecer um editor visual para criar elementos (texto, imagens, vídeos, etc.)
- Sincronizar mudanças em tempo real com o visualizador da overlay
- Manter estado persistente das sessões

### Arquitetura Geral
```
Cliente (Editor)     Rede      Servidor Go      Rede      Cliente (Viewer/Stream)
     ↓                 ↕              ↕            ↕              ↓
  Browser        WebSocket      HTTP Server   WebSocket     Browser/OBS
  (Editor)       Connection    (Port 8080)    Connection     (Display)
     ↓                 ↕              ↕            ↕              ↓
JavaScript       Troca de        Gerencia      Sincroniza    HTML/CSS
HTML/CSS         Comandos        Estado       Elementos      JavaScript
Gin/JQuery       em JSON         das          e Eventos
                                 Sessões
```

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Diretórios

```
iros/
├── main.go                           # Ponto de entrada do programa
├── go.mod                            # Dependências do projeto
├── cmd/
│   └── root.go                       # Configuração CLI via Cobra
├── core/
│   ├── server.go                     # Inicialização do servidor
│   ├── api/
│   │   ├── api.go                    # Registro de rotas HTTP
│   │   ├── session_management.go     # Endpoints para gerenciar sessões
│   │   └── misc.go                   # Endpoints variados (anúncios)
│   ├── elements/
│   │   ├── element.go                # Interface base de elemento
│   │   ├── text_element.go           # Elemento de texto
│   │   ├── image_element.go          # Elemento de imagem
│   │   ├── video.go                  # Elemento de vídeo
│   │   ├── audio.go                  # Elemento de áudio
│   │   ├── timer_element.go          # Elemento de timer/countdown
│   │   └── iframe.go                 # Elemento iframe
│   ├── util/
│   │   └── config_file.go            # Gerenciamento de configuração
│   ├── web/
│   │   ├── web.go                    # Registro de rotas de páginas
│   │   ├── landing.go                # Página inicial
│   │   ├── login.go                  # Página de login
│   │   ├── editor.go                 # Página do editor
│   │   ├── viewer.go                 # Página do visualizador
│   │   ├── dashboard.go              # Dashboard de estatísticas
│   │   ├── docs.go                   # Página de documentação
│   │   └── notfound.go               # Página 404
│   └── wss/
│       ├── websocket_server.go       # Servidor WebSocket principal
│       ├── session.go                # Gerenciamento de sessões
│       ├── commands.go               # Processamento de comandos
│       └── stats.go                  # Estatísticas do servidor
├── static/
│   ├── css/
│   │   ├── main.css                  # Estilos globais
│   │   ├── dashboard.css
│   │   ├── landing.css
│   │   ├── editor.css
│   │   ├── viewer.css
│   │   ├── player.css
│   │   ├── overlay.css
│   │   └── ui.css
│   ├── img/
│   │   └── showcase.png
│   └── js/
│       ├── util.js                   # Utilitários JavaScript
│       ├── session.js                # Gerenciamento de sessão
│       ├── embed.js                  # Script para embutir
│       ├── viewer.js                 # Lógica do visualizador
│       ├── commands/
│       │   └── base.js               # Definição de comandos base
│       └── editor/
│           ├── editor.js             # Lógica principal do editor
│           ├── 7tv.js                # Integração com 7TV (emotes)
│           ├── modals.js             # Diálogos do editor
│           ├── key_binds.js          # Atalhos de teclado
│           ├── settings_ui.js        # Interface de settings
│           ├── favorites.js          # Sistema de favorites
│           └── elements/
│               ├── element.js
│               ├── text.js
│               ├── image.js
│               ├── video.js
│               ├── audio.js
│               ├── timer.js
│               └── iframe.js
└── templates/
    ├── header.html                   # Cabeçalho comum
    ├── landing.html                  # Template landing page
    ├── login.html                    # Template login
    ├── editor.html                   # Template editor
    ├── viewer.html                   # Template viewer
    ├── dashboard.html                # Template dashboard
    ├── docs.html                     # Template documentação
    ├── 404.html                      # Template 404
    └── announcement.html             # Template para anúncios
```

---

## 🔧 Componentes Backend

### 1. **Servidor HTTP (net/http)**

**Arquivo:** `core/server.go`, `core/web/web.go`, `core/api/api.go`

O servidor HTTP gerencia:
- **Porta:** Configurável (padrão 8080)
- **Endereço:** Configurável (padrão localhost)
- **WebRoot:** Prefixo de URL configurável (padrão "/")

#### Rotas HTTP Registradas:

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/` | Landing page | Não |
| GET | `/static/*` | Arquivos estáticos (CSS, JS, IMG) | Não |
| GET | `/login` | Página de login | Não |
| GET | `/editor` | Editor de overlay | Não |
| GET | `/viewer[/]` | Visualizador da overlay | Não |
| GET | `/dashboard` | Dashboard de estatísticas | **Sim** |
| GET | `/docs` | Documentação | Não |
| POST | `/api/v1/purgeSessions` | Remove sessões inativas (>7 dias) | **Sim** |
| POST | `/api/v1/purgeEmptySessions` | Remove sessões vazias | **Sim** |
| POST | `/api/v1/setAnnouncement` | Define anúncio no editor | **Sim** |

### 2. **Servidor WebSocket (gorilla/websocket)**

**Arquivo:** `core/wss/websocket_server.go`

Gerencia conexões WebSocket em tempo real para sincronização de elementos.

#### Características:
- **Endpoint:** Configurável (padrão "/ws")
- **Protocolo:** JSON
- **Conexões:** Múltiplas conexões por sessão
- **Sincronização:** Broadcast de comandos entre clientes

#### Estrutura de Conexão:
```go
type IrosConnection struct {
    Conn  *websocket.Conn
    Mutex sync.Mutex
}

type WebSocketServer struct {
    Sessions map[string]*IrosSession
}
```

### 3. **Sistema de Sessões**

**Arquivo:** `core/wss/session.go`, `core/api/session_management.go`

Uma sessão representa um conjunto de elementos gerenciados conjuntamente.

#### Estrutura de Sessão:
```go
type IrosSession struct {
    Mutex              sync.Mutex
    Connections        []*IrosConnection
    State              map[string]elements.Element  // Elementos da sessão
    ID                 string
    LastConnectionTime int64
}
```

#### Operações Disponíveis:
- **Criar Sessão:** Automático ao conectar ao WebSocket
- **Carregar Elemento:** `load_element()` - deserializa JSON em elemento
- **Salvar Estado:** `SaveState()` - persiste estado em JSON
- **Restaurar Estado:** `LoadState()` - carrega de backup
- **Purgar:** Remove sessões inativas (>7 dias) ou vazias

#### Tipos de Elementos Suportados:
1. **Text** - Texto renderizado
2. **Image** - Imagem (via URL)
3. **Video** - Vídeo (via URL)
4. **Audio** - Áudio (via URL)
5. **Timer** - Cronômetro/Countdown
6. **IFrame** - Página web embarcada

### 4. **Sistema de Elementos**

**Arquivo:** `core/elements/element.go` e arquivos específicos

Todos os elementos herdam de `ElementBase`:

```go
type ElementBase struct {
    Id        string              // UUID único
    Name      string              // Nome do elemento
    Type      string              // Tipo: text, image, video, etc.
    Transform ElementTransform     // Posição, rotação, escala
}

type ElementTransform struct {
    X         int                 // Posição X (px)
    Y         int                 // Posição Y (px)
    Width     int                 // Largura (px)
    Height    int                 // Altura (px)
    RotationX float32            // Rotação X (graus)
    RotationY float32            // Rotação Y (graus)
    RotationZ float32            // Rotação Z (graus)
    ScaleX    float32            // Escala X
    ScaleY    float32            // Escala Y
    FlipX     bool               // Inverter horizontalmente
    FlipY     bool               // Inverter verticalmente
    ZIndex    int                // Profundidade (ordem de renderização)
    Opacity   float32            // Opacidade (0-1)
    Visible   bool               // Visibilidade
    HPivot    string             // Pivô horizontal (left, center, right)
    VPivot    string             // Pivô vertical (top, center, bottom)
}
```

#### Tipos de Elementos Detalhados:

##### TextElement
```go
type TextElement struct {
    ElementBase
    Font            string  // Nome da font
    Size            int     // Tamanho em px
    Color           string  // Cor em #RRGGBB
    BackgroundColor string  // Cor de fundo
    Text            string  // Conteúdo
}
```

##### ImageElement
```go
type ImageElement struct {
    ElementBase
    Url string  // URL da imagem
}
```

##### AudioElement (base para Video)
```go
type AudioElement struct {
    ElementBase
    Url          string   // URL do media
    Loop         bool     // Repetir
    Volume       float32  // Volume (0-1)
    PlaybackRate float32  // Velocidade
    Paused       bool     // Estado de pausa
    CurrentTime  float32  // Tempo atual (segundos)
}
```

##### VideoElement
```go
type VideoElement struct {
    AudioElement  // Herda de AudioElement
}
```

##### TimerElement
```go
type TimerElement struct {
    TextElement
    Countdown      bool  // Modo countdown
    Active         bool  // Ativo
    StartTimestamp int   // Timestamp de início
    CountdownMS    int   // Milissegundos para countdown
    BaseTimeMS     int   // Tempo base em ms
}
```

##### IFrameElement
```go
type IFrameElement struct {
    ElementBase
    Url         string  // URL a exibir
    BlockEvents bool    // Bloquear eventos do iframe
}
```

### 5. **Sistema de Comandos WebSocket**

**Arquivo:** `core/wss/commands.go`

Processa comandos JSON recebidos via WebSocket:

#### Tipos de Comando:

| Comando | Descrição | Dados | Efeito |
|---------|-----------|-------|--------|
| `add` | Criar novo elemento | `type`, `args` (JSON do elemento) | Adiciona elemento à sessão |
| `update` | Atualizar propriedades | `id`, `args` | Modifica propriedades do elemento |
| `delete` | Remover elemento | `id` | Remove elemento da sessão |
| `move` | Mover elemento | `id`, `pos` (Point: {x, y}) | Atualiza posição |
| `scale` | Escalar elemento | `id`, `scale` (Point) | Atualiza escala |
| `rotate` | Rotacionar elemento | `id`, `rotation` (Rotation: {x, y, z}) | Atualiza rotação |
| `transform` | Transformação completa | `id`, `transform` (ElementTransform) | Atualiza todas as transformações |

### 6. **Configuração**

**Arquivo:** `core/util/config_file.go`

#### Estrutura de Configuração:
```go
type Config struct {
    WebRoot            string  // Prefixo de URL (ex: "/stream/")
    ServerDomain       string  // Domínio do servidor
    WebSocketEndpoint  string  // Endpoint WebSocket
    UseWSS             bool    // Usar WSS (WebSocket Seguro)
    HTTPPort           int     // Porta HTTP
    HTTPServerAddress  string  // Endereço de bind
    DebugMode          bool    // Modo debug
    SessionsBackupFile string  // Arquivo de backup de sessões
    APIToken           string  // Token de autenticação (gerado aleatoriamente)
}
```

#### Comportamento de Configuração:
1. **Se não existe:** Cria arquivo com valores padrão
2. **Se existe:** Carrega e sobrescreve padrões
3. **Adiciona novos campos:** Ao salvar, preenche campos novos com valores padrão

#### Valores Padrão:
```json
{
  "webroot": "/",
  "server_domain": "localhost",
  "websocket_endpoint": "/ws",
  "use_wss": true,
  "http_port": 8080,
  "http_server_address": "localhost",
  "debug_mode": false,
  "sessions_backup_file": "./sessions.json",
  "api_token": "[gerado aleatoriamente]"
}
```

### 7. **Estatísticas e Monitoramento**

**Arquivo:** `core/wss/stats.go`

```go
type StatsData struct {
    StartTime        int64
    Uptime           string
    LastMessage      string
    NumSessions      int32
    NumWSConnections int32
    LastMessageTime  int64
    InactiveSessions uint32
    EmptySessions    uint32
    NonEmptySessions []*IrosSession
}
```

#### Dados Coletados:
- Tempo de atividade do servidor
- Número de sessões ativas
- Número de conexões WebSocket
- Sessões inativas (>7 dias)
- Sessões vazias
- Último tempo de mensagem

---

## 💻 Componentes Frontend

### 1. **Landing Page** (`templates/landing.html`)

**Propósito:** Página inicial do sistema

**Conteúdo:**
- Informações sobre o IROS
- Link para documentação (iros.vrsal.cc)
- Link para editor/login
- Screenshot/showcase

### 2. **Login Page** (`templates/login.html`)

**Propósito:** Autenticação para acesso ao dashboard

**Fluxo:**
1. Usuário insere token de autenticação
2. Token é armazenado em cookie
3. Redirecionado para dashboard ou editor

### 3. **Editor Page** (`templates/editor.html`)

**Propósito:** Interface principal para criar/editar overlay

**Funcionalidades Principais:**
- Canvas visual com elementos
- Painel de propriedades dos elementos
- Gerenciador de camadas (z-index)
- Sistema de favorites
- Atalhos de teclado
- Integração com 7TV (emotes)
- Anúncios em tempo real
- Preview de stream link

**Componentes de Interface:**
```
┌─────────────────────────────────────────────┐
│          Menu Superior / Toolbar             │
├─────────────┬─────────────────────┬─────────┤
│   Elementos │   Canvas Visual     │ Props   │
│   (esq)     │   (centro)          │ (dir)   │
│   - Texto   │   [Elemento 1]      │ Posição │
│   - Imagem  │   [Elemento 2]      │ Escala  │
│   - Vídeo   │   [Elemento 3]      │ Rotação │
│   - Áudio   │                     │ Opacidade│
│   - Timer   │                     │ Visível │
│   - IFrame  │                     │ Z-Index │
│   - Emotes  │                     │ Estilo  │
│             │                     │ Settings│
├─────────────┴─────────────────────┴─────────┤
│   Camadas / Element List (bottom)           │
└─────────────────────────────────────────────┘
```

**Recursos Implementados:**
- ✅ Criar elementos (add)
- ✅ Editar propriedades
- ✅ Deletar elementos (delete com "X" ou Delete)
- ✅ Mover elementos (arrastar)
- ✅ Escalar elementos
- ✅ Rotacionar elementos
- ✅ Copiar/Colar elementos
- ✅ Flip horizontal/vertical
- ✅ Opacidade
- ✅ Visibilidade (toggle com "H")
- ✅ Layer (z-index)
- ✅ Favorites (salvar/carregar elementos)
- ✅ Atalhos de teclado
- ✅ Integração com 7TV (emotes)
- ✅ Persistent storage (canvas size, window pos, stream link)
- ✅ Transform origin (pivot point)
- ✅ Element list com nomes únicos
- ✅ Anúncios/Notificações
- ✅ Text background
- ✅ Documentação básica

### 4. **Viewer Page** (`templates/viewer.html`)

**Propósito:** Exibição da overlay (usado como browser source no OBS)

**Características:**
- Renderiza elementos em tempo real
- Sincronizado com editor via WebSocket
- Sem controles (apenas exibição)
- Transparente (sem fundo)
- Responsivo ao tamanho da página

**Uso:**
```
OBS → Add Source → Browser Source
URL: http://localhost:8080/viewer?session=<session-id>
Width: 1920
Height: 1080
```

### 5. **Dashboard Page** (`templates/dashboard.html`)

**Propósito:** Estatísticas e administração do servidor

**Informações Exibidas:**
- Tempo de atividade (uptime)
- Número de sessões ativas
- Número de conexões WebSocket
- Sessões inativas (>7 dias)
- Sessões vazias
- Lista de sessões não vazias
- Último tempo de mensagem

**Requer Autenticação:** Sim

### 6. **Documentação Page** (`templates/docs.html`)

**Propósito:** Documentação do sistema para usuários

### 7. **JavaScript Frontend**

#### Estrutura de Arquivos JS:

**util.js**
- Funções utilitárias gerais
- WebSocket helper functions
- Métodos de rede

**session.js**
- Gerenciamento de sessão
- ID de sessão persistente
- Sincronização de estado

**embed.js**
- Script para embutir o visualizador
- Iframe generation
- Comunicação entre frames

**viewer.js**
- Renderização de elementos
- Event listeners para sincronização
- Atualização visual em tempo real

**commands/base.js**
- Definição de comandos base
- Estrutura de protocolo de comando

**editor/*.js** (arquivos específicos do editor)

- **editor.js** - Lógica principal do editor, UI controls
- **7tv.js** - Integração com 7TV para emotes
- **modals.js** - Diálogos e modais
- **key_binds.js** - Atalhos de teclado
- **settings_ui.js** - Interface de configurações
- **favorites.js** - Sistema de favorites
- **elements/*.js** - Lógica específica de cada tipo de elemento

#### Atalhos de Teclado Implementados:
- **H** - Toggle visibilidade do elemento
- **Delete** - Deletar elemento selecionado
- **X** - Deletar elemento selecionado
- **Ctrl+C** - Copiar elemento
- **Ctrl+V** - Colar elemento
- Arrastar com mouse - Mover elemento
- Shift + Arrastar - Escalar elemento
- Ctrl + Arrastar - Rotacionar elemento

---

## ✨ Funcionalidades Implementadas

### Funcionalidades Principais ✅

1. **Gerenciamento de Elementos**
   - ✅ Criar elementos (Texto, Imagem, Vídeo, Áudio, Timer, IFrame)
   - ✅ Editar propriedades de elementos
   - ✅ Deletar elementos
   - ✅ Copiar e colar elementos
   - ✅ Nomes únicos para elementos (UUID)

2. **Transformações de Elemento**
   - ✅ Mover (posição X, Y)
   - ✅ Escalar (scale X, Y)
   - ✅ Rotacionar (rotação 3D: X, Y, Z)
   - ✅ Flip horizontal
   - ✅ Flip vertical
   - ✅ Opacity (transparência)
   - ✅ Visibilidade (show/hide)
   - ✅ Z-Index (ordenação de camadas)
   - ✅ Transform Origin (pivot point/origin)

3. **Interface do Editor**
   - ✅ Canvas visual interativo
   - ✅ Painel de propriedades em tempo real
   - ✅ Element list com nomes
   - ✅ Atalhos de teclado (H para hide, Delete, X, Ctrl+C, Ctrl+V)
   - ✅ Settings movable/draggable
   - ✅ Persistent storage (canvas size, window position, stream link)
   - ✅ Anúncios/notificações
   - ✅ Documentação básica

4. **Sistema de Favorites**
   - ✅ Salvar elementos como favoritos
   - ✅ Carregar elementos de favoritos
   - ✅ Acesso rápido

5. **Integrações Externas**
   - ✅ Suporte a emotes 7TV
   - ✅ Visualização de emotes do chat
   - ✅ Seleção e adição de emotes como elementos

6. **Persistência de Dados**
   - ✅ Backup automático de sessões em JSON
   - ✅ Restauração automática ao iniciar servidor
   - ✅ Savefile compatível com editor e viewer
   - ✅ UUID para identificação de elementos

7. **Viewer/Overlay**
   - ✅ Renderização em tempo real
   - ✅ Sincronização com editor via WebSocket
   - ✅ Transparente (sem background)
   - ✅ Compatível com OBS/Streamlabs

8. **Dashboard/Administração**
   - ✅ Estatísticas do servidor
   - ✅ Gerenciamento de sessões (purge)
   - ✅ Listagem de sessões
   - ✅ API REST de administração

9. **Segurança Básica**
   - ✅ Token de autenticação (API)
   - ✅ Proteção de endpoints administrativos
   - ✅ Geração automática de token

10. **Elementos Especializados**
    - ✅ **Texto** - Fonte, tamanho, cor, background
    - ✅ **Imagem** - Via URL
    - ✅ **Vídeo** - Via URL com controles de reprodução
    - ✅ **Áudio** - Via URL com volume, taxa de reprodução
    - ✅ **Timer** - Cronômetro e countdown
    - ✅ **IFrame** - Páginas web embarcadas

11. **Tipos de Transformação**
    - ✅ Mais eficiente (message transform otimizada)
    - ✅ Suporte a rotação 3D
    - ✅ Flip (espelhamento)
    - ✅ Escala independente (X e Y)

---

## ❌ Funcionalidades Não Implementadas / Limitações

### Funcionalidades Pendentes / To-Do

1. **Issues Conhecidas no Performance**
   - ❌ Pasting images from clipboard tem problema de performance no Chrome (B64 encoding)
   - ⚠️ Servir imagens como arquivo local em vez de B64

2. **Recursos de Interatividade Avançada**
   - ❌ Interação com usuário em tempo real (polls, votações)
   - ❌ Chat integration nativa
   - ❌ Reações/emotes animados
   - ❌ Soundboard integrado
   - ❌ Animações de entrada/saída de elementos

3. **Recursos de Colaboração**
   - ❌ Múltiplos editores em uma sessão (editor compartilhado)
   - ❌ Histórico de alterações/undo-redo completo
   - ❌ Sistema de permissões/roles

4. **Recursos de Mídia Avançada**
   - ❌ Webcam/stream camera embed
   - ❌ Captura de tela do editor
   - ❌ Efeitos visuais (blur, shadow, glow, etc.)
   - ❌ Filtros de imagem
   - ❌ Animações de CSS avançadas
   - ❌ SVG animado
   - ❌ Partículas/confetti effects

5. **Recursos de Dados**
   - ❌ Conexão com APIs externas (Twitch, YouTube, Discord)
   - ❌ Sincronização com base de dados remota
   - ❌ Export para diferentes formatos (PNG, SVG, OBS Scene)
   - ❌ Presets/templates predefinidos
   - ❌ Histórico de versões de layout

6. **Recursos de Usuário**
   - ❌ Sistema de login/usuários completo
   - ❌ Múltiplas contas e sessões por usuário
   - ❌ Gerenciamento de equipe
   - ❌ Permissões granulares

7. **Recursos de Segurança Avançada**
   - ❌ SSL/TLS configuração completa
   - ❌ Rate limiting
   - ❌ CSRF protection
   - ❌ XSS/SQL injection prevention robusta

8. **Recursos de Deployment**
   - ❌ Docker container
   - ❌ Docker Compose setup
   - ❌ Kubernetes manifests
   - ❌ CI/CD pipeline
   - ❌ Cloud deployment presets (Azure, AWS, etc.)

9. **Recursos de Mobile**
   - ❌ Interface responsiva para mobile
   - ❌ Touch controls otimizados
   - ❌ Mobile-friendly UI

10. **Recursos de Customização**
    - ❌ Temas customizáveis
    - ❌ Skins/aparências alternativas
    - ❌ Plugins/extensões

11. **Recursos de Performance**
    - ❌ Compressão de imagens automática
    - ❌ Lazy loading
    - ❌ WebWorkers para processamento pesado
    - ❌ Service Workers / PWA

12. **Recursos de Streaming**
    - ❌ Stream quality detection
    - ❌ Adaptive bitrate
    - ❌ Reconexão automática com retry
    - ❌ Heartbeat/keep-alive robust

13. **Recursos de Logging/Debugging**
    - ❌ Logging completo
    - ❌ Sentry integration
    - ❌ Performance monitoring
    - ❌ Error tracking

14. **Recursos de API Pública**
    - ❌ Documentação de API (Swagger/OpenAPI)
    - ❌ Webhooks
    - ❌ OAuth2
    - ❌ GraphQL API

15. **Tipos de Elemento Adicionais**
    - ❌ Shapes (círculos, retângulos, polígonos)
    - ❌ Gráficos/Charts
    - ❌ Mapa interativo
    - ❌ Código/Highlight de sintaxe
    - ❌ QR Code gerador

---

## 🔄 Fluxo de Dados

### Fluxo 1: Criar Elemento no Editor

```
1. Usuário clica "Add Text"
                ↓
2. Frontend envia comando via WebSocket:
   {
     "type": "add",
     "data": {
       "type": "text",
       "args": {
         "id": "uuid-123",
         "name": "Text 1",
         "type": "text",
         "text": "Hello",
         "font": "Arial",
         "size": 24,
         "color": "#000000",
         ...
       }
     }
   }
                ↓
3. Backend processa em commands.go:
   - Desserializa JSON
   - Cria novo TextElement
   - Adiciona ao session.State
                ↓
4. Backend broadcast para todos os clientes:
   {
     "type": "add",
     "element": { ... }
   }
                ↓
5. Viewer renderiza elemento na overlay
   - Atualiza canvas
   - Exibe em tempo real
                ↓
6. Editor atualiza lista de elementos
```

### Fluxo 2: Mover Elemento

```
1. Usuário arrastra elemento no canvas
                ↓
2. Frontend envia comando a cada movimento:
   {
     "type": "move",
     "data": {
       "id": "uuid-123",
       "pos": {"x": 100, "y": 200}
     }
   }
                ↓
3. Backend processa:
   - Busca elemento por ID
   - Atualiza Transform.X e Transform.Y
                ↓
4. Backend broadcast para viewers
                ↓
5. Viewer renderiza em nova posição
```

### Fluxo 3: Sincronização de Sessão

```
1. Servidor inicia
                ↓
2. Carrega sessions.json via LoadState():
   - Desserializa cada sessão
   - Recarrega cada elemento
   - Reconstrói session.State map
                ↓
3. Usuário acessa /editor?session=uuid
                ↓
4. Frontend se conecta ao WebSocket
                ↓
5. Backend cria/acessa sessão com UUID
                ↓
6. Frontend solicita state atual
                ↓
7. Backend envia snapshot da sessão
                ↓
8. Frontend renderiza todos os elementos
                ↓
9. Sincronização ativa com broadcast de mudanças
```

### Fluxo 4: Purge de Sessões

```
1. Admin chama POST /api/v1/purgeSessions
   com Authorization header
                ↓
2. Backend valida token
                ↓
3. Itera todas as sessões:
   - Se > 7 dias: delete
   - Incrementa contador
                ↓
4. Retorna HTTP 200
                ↓
5. Salva novo state em sessions.json
```

---

## 📊 Estrutura de Dados

### JSON Schema de Elemento (Texto)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Title",
  "type": "text",
  "transform": {
    "x": 100,
    "y": 50,
    "width": 400,
    "height": 100,
    "rotation_x": 0,
    "rotation_y": 0,
    "rotation_z": 0,
    "scale_x": 1.0,
    "scale_y": 1.0,
    "flip_x": false,
    "flip_y": false,
    "z_index": 1,
    "opacity": 1.0,
    "visible": true,
    "h_pivot": "center",
    "v_pivot": "center"
  },
  "font": "Arial",
  "size": 32,
  "color": "#FFFFFF",
  "background_color": "#000000",
  "text": "Welcome!"
}
```

### JSON Schema de Elemento (Imagem)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Logo",
  "type": "image",
  "transform": { ... },
  "url": "https://example.com/logo.png"
}
```

### JSON Schema de Sessão (Backup)

```json
{
  "sessions": {
    "session-uuid-1": {
      "state": {
        "element-uuid-1": { ...elemento1... },
        "element-uuid-2": { ...elemento2... }
      },
      "last_update": 1715804400
    }
  }
}
```

### JSON Schema de Comando WebSocket

```json
{
  "type": "add|update|delete|move|scale|rotate|transform",
  "data": {
    "id": "element-uuid",
    "type": "element-type",
    "pos": {"x": 100, "y": 200},
    "scale": {"x": 1.5, "y": 1.5},
    "rotation": {"x": 0, "y": 0, "z": 45},
    "transform": { ...full-transform... },
    "args": { ...element-data... }
  }
}
```

---

## 🌐 API REST

### Autenticação

Todos os endpoints de administração requerem header:
```
Authorization: <api_token>
```

### Endpoints

#### 1. `POST /api/v1/purgeSessions`

**Descrição:** Remove sessões inativas (>7 dias sem conexão)

**Autenticação:** Requerida

**Response:**
```
HTTP 200 OK
```

**Implementação:**
```go
func PurgeSessions(w http.ResponseWriter, r *http.Request) {
    for id, session := range wss.Instance.Sessions {
        if time.Now().Unix()-session.LastConnectionTime > 60*60*24*7 {
            delete(wss.Instance.Sessions, id)
            amount++
        }
    }
}
```

#### 2. `POST /api/v1/purgeEmptySessions`

**Descrição:** Remove sessões sem elementos

**Autenticação:** Requerida

**Response:**
```
HTTP 200 OK
```

#### 3. `POST /api/v1/setAnnouncement`

**Descrição:** Define anúncio a ser exibido na página do editor

**Autenticação:** Requerida

**Request Body:**
```json
{
  "announcement": "Novo anúncio para os usuários",
  "announcementTitle": "Título do Anúncio"
}
```

**Response:**
```
HTTP 200 OK
```

---

## 🔌 Protocolo WebSocket

### URL de Conexão

```
ws://localhost:8080/ws?session=<session-uuid>
```

ou com WSS:

```
wss://example.com/ws?session=<session-uuid>
```

### Handshake

```
GET /ws?session=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ...
Sec-WebSocket-Version: 13
```

### Formato de Mensagem

**Enviar (Cliente → Servidor):**
```json
{
  "type": "add|update|delete|move|scale|rotate|transform",
  "data": {
    "id": "element-uuid",
    "type": "element-type",
    "args": { ... }
  }
}
```

**Receber (Servidor → Cliente):**
```json
{
  "type": "add|update|delete|move|scale|rotate|transform",
  "element": { ... }
}
```

### Ciclo de Vida

1. **Conexão estabelecida**
   - Cliente conecta via WebSocket
   - ID de sessão extraído da query string
   - Sessão criada se não existe
   - Conexão adicionada a `session.Connections`

2. **Envio de comando**
   - Cliente envia JSON de comando
   - Servidor deserializa
   - Processa comando (modifica session.State)
   - Broadcast para todos os clientes da sessão

3. **Recebimento**
   - Clientes recebem comando serializado em JSON
   - Frontend atualiza UI
   - Viewer re-renderiza

4. **Desconexão**
   - WebSocket fecha
   - Conexão removida de session.Connections
   - Sessão persiste em memory
   - Próxima reconexão carrega estado anterior

### Mutex/Sincronização

```go
session.Mutex.Lock()
session.State[id].Update(command)
session.Mutex.Unlock()
```

Garante thread-safety ao modificar estado.

---

## 🔐 Sistema de Autenticação

### Fluxo de Autenticação

```
1. Usuário acessa /dashboard
                ↓
2. Backend checa cookie "authToken"
                ↓
3. Se não existe:
   - HTTP 401 Unauthorized
                ↓
4. Se existe:
   - Compara com util.Cfg.APIToken
                ↓
5. Se válido:
   - Renderiza página
                ↓
6. Se inválido:
   - HTTP 401 Unauthorized
```

### Token

- **Geração:** `GenerateToken()` cria 32 bytes aleatórios via crypto/rand
- **Formato:** Hexadecimal (64 caracteres)
- **Armazenamento:** Cookie de navegador (não seguro para produção sem HTTPS)
- **Configuração:** `config.json` - campo `api_token`

### Endpoints Protegidos

| Endpoint | Método | Proteção |
|----------|--------|----------|
| `/dashboard` | GET | Cookie authToken |
| `/api/v1/purgeSessions` | POST | Header Authorization |
| `/api/v1/purgeEmptySessions` | POST | Header Authorization |
| `/api/v1/setAnnouncement` | POST | Header Authorization |

### Limitações de Segurança

⚠️ **Em Produção:**
- ❌ Token em texto plano em arquivo
- ❌ Sem HTTPS (WSS e WSS necessários)
- ❌ Sem rate limiting
- ❌ Sem CSRF protection
- ❌ Sem session timeout
- ❌ Sem 2FA

---

## ⚙️ Configuração

### Arquivo de Configuração

**Localização padrão:** `./config.json`

**Localização customizada:** `iros --config /path/to/config.json`

### Estrutura de Configuração

```json
{
  "webroot": "/",
  "server_domain": "localhost",
  "websocket_endpoint": "/ws",
  "use_wss": true,
  "http_port": 8080,
  "http_server_address": "localhost",
  "debug_mode": false,
  "sessions_backup_file": "./sessions.json",
  "api_token": "a1b2c3d4e5f6..."
}
```

### Parâmetros de Configuração

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `webroot` | string | "/" | Prefixo de URL base (ex: "/stream/") |
| `server_domain` | string | "localhost" | Domínio do servidor |
| `websocket_endpoint` | string | "/ws" | Rota do WebSocket |
| `use_wss` | bool | true | Usar WSS (WebSocket Seguro) |
| `http_port` | int | 8080 | Porta HTTP |
| `http_server_address` | string | "localhost" | Endereço de bind do servidor |
| `debug_mode` | bool | false | Modo debug (logging extra) |
| `sessions_backup_file` | string | "./sessions.json" | Arquivo de backup de sessões |
| `api_token` | string | [gerado] | Token de autenticação API |

### Exemplos de Configuração

**Exemplo 1: Localhost Simples**
```json
{
  "webroot": "/",
  "server_domain": "localhost",
  "websocket_endpoint": "/ws",
  "use_wss": false,
  "http_port": 8080,
  "http_server_address": "localhost",
  "debug_mode": true,
  "sessions_backup_file": "./sessions.json",
  "api_token": "dev-token-123"
}
```

**Exemplo 2: Production com Subfolder**
```json
{
  "webroot": "/stream/overlay/",
  "server_domain": "iros.example.com",
  "websocket_endpoint": "/stream/overlay/ws",
  "use_wss": true,
  "http_port": 8080,
  "http_server_address": "0.0.0.0",
  "debug_mode": false,
  "sessions_backup_file": "/data/sessions.json",
  "api_token": "abc123def456..."
}
```

### CLI

**Uso:**
```bash
./iros                                    # Usa config.json padrão
./iros --config /path/to/config.json     # Config customizado
```

**Flags disponíveis:**
- `--config` - Caminho do arquivo de configuração

---

## 🚀 Inicialização do Sistema

### Sequência de Startup

```
main.go
    ↓
cmd.Execute() (Cobra CLI)
    ↓
core.StartServer(cfgPath)
    ↓
1. wss.Stats.StartTime = now
2. wss.Stats.LastMessageTime = now
3. util.LoadConfig(cfgPath)
4. api.RegisterRoutes()
   - POST /api/v1/purgeSessions
   - POST /api/v1/purgeEmptySessions
   - POST /api/v1/setAnnouncement
5. web.RegisterPages()
   - GET /
   - GET /dashboard
   - GET /login
   - GET /editor
   - GET /viewer
   - GET /docs
6. wss.Instance.Start()
   - Listener na porta configurada
   - Aguarda conexões WebSocket
7. wss.LoadState()
   - Carrega sessions.json se existir
   - Restaura todas as sessões

HTTP Server aguarda requisições indefinidamente
WebSocket Server aguarda conexões indefinidamente
```

### Shutdown

O servidor pode ser parado via:
- **Ctrl+C** no terminal (intercepta SIGINT/SIGTERM)
- Ao parar, automaticamente salva estado em sessions.json

---

## 📈 Fluxo de Uso Típico

### Fluxo 1: Streamer Criando Overlay

```
1. Acessa http://localhost:8080/
   - Vê landing page
   
2. Clica "Go to Editor"
   - Redirecionado para /editor
   - Novo UUID de sessão gerado
   
3. Conecta WebSocket automaticamente
   - URL: ws://localhost:8080/ws?session=<uuid>
   
4. Adiciona primeiro elemento (Texto)
   - Clica "Add Text"
   - Escreve "Welcome to Stream"
   
5. Comando enviado:
   POST /ws
   {
     "type": "add",
     "data": {
       "type": "text",
       "args": { ...texto... }
     }
   }
   
6. Backend adiciona a session.State["uuid"]
   
7. Broadcast para todos os clientes
   
8. Frontend renderiza no canvas
   
9. Elemento aparece no editor

10. Abre OBS → Add Source → Browser
    - URL: http://localhost:8080/viewer?session=<uuid>
    
11. Viewer conecta ao WebSocket
    
12. Recebe snapshot da sessão
    
13. Renderiza elementos em tempo real
    
14. Quando edita no editor, viewer atualiza automaticamente
    
15. Elemento aparece ao vivo na stream!
```

### Fluxo 2: Persistência entre Restarts

```
1. Streamer fecha OBS (servidor ainda rodando)

2. Mas clientes ainda conectados ao WebSocket

3. Quando editor se desconecta, servidor salva state
   - SaveState() → sessions.json
   
4. Streamer reinicia o servidor
   
5. StartServer() → LoadState()
   - Lê sessions.json
   - Reconstrói todas as sessões
   
6. Streamer re-abre editor
   - Mesmo session UUID
   
7. Todos os elementos ainda lá!
   - Persistência preservada
```

---

## 🛠️ Dependências Externas

### Go Modules (go.mod)

```
module git.vrsal.cc/alex/iros

go 1.19

require (
    github.com/gorilla/websocket v1.5.0
    github.com/spf13/cobra v1.6.1
    github.com/spf13/pflag v1.0.5
)
```

### Dependências:

1. **gorilla/websocket** - WebSocket server
   - Gerenciamento de conexões
   - Upgrade HTTP → WebSocket
   - Envio/recebimento de mensagens

2. **spf13/cobra** - CLI framework
   - Parsing de arguments
   - Help system
   - Flags

3. **spf13/pflag** - Flag parsing
   - Definição de flags customizadas

### Dependências Frontend (CDN/Local)

- **jQuery** - DOM manipulation (se usado)
- **Bulma/Bootstrap** - CSS framework (se usado)
- Nenhuma outra dependency externa declarada

---

## 📝 Convenções de Código

### Backend (Go)

1. **Nomes:**
   - `CamelCase` para funções/tipos exportados
   - `camelCase` para privados
   - `UPPER_CASE` para constantes

2. **Estrutura:**
   - Uma responsabilidade por arquivo
   - Interfaces para elementos polimórficos
   - Mutex para thread-safety

3. **Tratamento de Erro:**
   ```go
   if err != nil {
       log.Println(err)
       return
   }
   ```

4. **JSON:**
   - Tags `json:"field_name"`
   - Suporta serialização automática

### Frontend (JavaScript)

1. **Arquivos modulares:**
   - Um conceito por arquivo
   - Carregamento via `<script>` tags

2. **Comunicação:**
   - JSON para todos os protocolos
   - Async await / Promises

3. **DOM:**
   - Seletores CSS padrão
   - Event listeners diretos

---

## 📊 Resumo de Capacidades

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| **Backend** | ✅ | Go com HTTP + WebSocket |
| **Frontend** | ✅ | HTML/CSS/JavaScript vanilla |
| **Elementos** | ✅ | 6 tipos (texto, imagem, vídeo, áudio, timer, iframe) |
| **Transformações** | ✅ | Posição, escala, rotação, flip, opacidade, z-index |
| **Persistência** | ✅ | JSON backup automático |
| **Sincronização Real-time** | ✅ | WebSocket broadcast |
| **Autenticação** | ⚠️ | Token básico (não seguro para produção) |
| **Interface** | ✅ | Editor visual, dashboard, viewer |
| **Integração 7TV** | ✅ | Emotes do Twitch/7TV |
| **Mobile** | ❌ | Não otimizado |
| **Deployment** | ⚠️ | Manual (sem Docker/K8s) |
| **Logging** | ⚠️ | Básico (log.Println) |
| **Performance** | ⚠️ | Sem otimizações avançadas |

---

## 🎯 Conclusão

O **IROS** é um sistema bem estruturado para criar e gerenciar overlays interativas de stream. Tem uma arquitetura clara dividida em:

- **Backend Go** com servidor HTTP e WebSocket
- **Frontend vanilla** com editor visual interativo
- **Sistema de persistência** via JSON
- **Sincronização real-time** entre clientes

### Pontos Fortes:
✅ Arquitetura limpa e modular  
✅ Sistema de elementos extensível  
✅ Sincronização real-time eficiente  
✅ Persistência de estado  
✅ Integração com plataformas (7TV)  
✅ Interface visual intuitiva  

### Áreas de Melhoria:
❌ Segurança em produção  
❌ Documentação de API pública  
❌ Testes automatizados  
❌ Performance e otimizações  
❌ Suporte a mobile  
❌ Deployment automatizado  

### Próximos Passos Recomendados:
1. Adicionar HTTPS/WSS obrigatório
2. Implementar sistema de usuários
3. Criar testes automatizados
4. Adicionar documentação de API (Swagger)
5. Otimizar performance de imagens
6. Implementar Docker container
7. Adicionar CI/CD pipeline

---

**Documento Gerado:** Maio 2026  
**Status:** Completo  
**Versão:** 1.0
