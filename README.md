# IROS — Sistema Interativo de Overlay Remoto

![screenshot](./static/img/showcase.png)

IROS é um overlay interativo controlado via navegador, pensado pra ser adicionado como **Browser Source** no OBS durante uma live. Você (ou um amigo) abre o dashboard, adiciona elementos (texto, imagem, áudio, vídeo, timer, iframe) e eles aparecem em tempo real no overlay.

Upstream: [iros.vrsal.cc](https://iros.vrsal.cc) · Fonte original em `git.vrsal.cc/alex/iros`.

---

## Quick start (local)

### Com Docker (recomendado)

```bash
docker compose up --build
```

Abre <http://localhost:8080>. O `data/config.json` é criado na primeira execução.

### Sem Docker (Go 1.19+)

```bash
go mod download
go run . --config config.json
```

---

## Como usar

1. Abre <http://localhost:8080/> no navegador.
2. Na seção **Create a session**:
   - **Stream link** (opcional): URL da sua live (Twitch/YouTube), só pra preview no editor.
   - **Size** (opcional): resolução do overlay, default `1920x1080`.
3. Clica **Generate**. Aparecem dois links:
   - **Editor link** (`/editor?session=...`) — abre pra adicionar/editar elementos.
   - **Overlay link** (`/viewer?session=...`) — esse vai pro OBS.
4. No OBS: `+` em Sources → `Fonte de Navegador` (Browser) → cola o **overlay link**.

A mesma sessão pode ser aberta por mais de uma pessoa — todo mundo edita em tempo real.

> **Windows:** se `http://localhost:8080` não abrir, tenta `http://127.0.0.1:8080`. Em algumas configurações o `localhost` resolve pra IPv6 que o Docker Desktop não forwarda.

### Página de admin (opcional)

Existe um `/dashboard` separado que mostra estatísticas (sessões ativas, uptime, etc). Pra acessar:

1. Abre `/login`
2. Cola seu `IROS_API_TOKEN` (visível no `data/config.json` ou no que você setou via env)
3. Depois `/dashboard` libera

Não é obrigatório pra uso normal — só serve pra monitoramento.

---

## Variáveis de ambiente

Quando setadas, sobrescrevem o `config.json` em runtime (sem persistir de volta no arquivo). Útil pra Docker e plataformas de hosting:

| Variável | Default | Pra que serve |
|---|---|---|
| `IROS_API_TOKEN` | gerado randômico | Token das rotas `/api/v1/*` |
| `IROS_SERVER_DOMAIN` | `localhost` | Domínio que o front usa pra abrir o WebSocket |
| `IROS_HTTP_ADDRESS` | `localhost` | Endereço de bind (use `0.0.0.0` em container) |
| `IROS_USE_WSS` | `true` | `wss://` ou `ws://` na URL do WS |
| `PORT` | `8080` | Porta HTTP (convenção Render/Heroku/Fly) |

Veja [`.env.example`](.env.example).

---

## Deploy

Pra subir em produção (Render, Fly, VPS), veja **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Licença

AGPL-3.0 — veja [LICENSE](LICENSE).
