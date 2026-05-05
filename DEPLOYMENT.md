# Deploy do IROS no Render

Guia passo a passo pra subir o IROS no [Render.com](https://render.com) usando o free tier.

> **Cenário alvo:** uso pessoal (você + 1 amigo) durante lives. Sem hardening complexo, sem disco persistente, sem CI próprio. Render builda o `Dockerfile` automaticamente em cada push pro GitHub.

---

## 1. Subir o código pra sua conta GitHub

O upstream do IROS está em `git.vrsal.cc` (não é GitHub), então não dá pra fazer fork. O caminho é criar um repo novo na sua conta:

```bash
cd iros

# Inicializa repo se ainda não existir
git init
git add .
git commit -m "Initial commit: IROS pronto pra Render"

# Opção A — com gh CLI (mais rápido)
gh repo create iros-meu --private --source=. --push

# Opção B — manual
# 1. Cria repo vazio em https://github.com/new (privado, sem README)
# 2. Liga o remote e dá push:
git remote add origin git@github.com:SEU_USUARIO/iros-meu.git
git branch -M main
git push -u origin main
```

> **Confere antes de pushar:** `git status` não deve listar `config.json` nem `sessions.json` — eles já estão no `.gitignore`. Não vaza segredo.

---

## 2. Criar o Web Service no Render

1. Entra em <https://dashboard.render.com> → **New** → **Web Service**.
2. **Connect** sua conta do GitHub e seleciona o repo `iros-meu`.
3. Preenche:
   - **Name:** `iros-meu` (vira parte do domínio: `iros-meu.onrender.com`)
   - **Region:** a mais próxima dos seus viewers
   - **Branch:** `main`
   - **Runtime:** **Docker**
   - **Instance Type:** **Free**
4. **Health check path:** deixa em branco (Render só verifica se a porta tá aberta).

Não cliques "Create" ainda — vamos setar as env vars primeiro.

---

## 3. Setar as variáveis de ambiente

Na seção **Environment**, adiciona:

| Key | Value | Observação |
|---|---|---|
| `IROS_HTTP_ADDRESS` | `0.0.0.0` | Já está no Dockerfile, mas explícito não dói |
| `IROS_USE_WSS` | `true` | Render serve HTTPS automático |
| `IROS_API_TOKEN` | *(gere localmente)* | `openssl rand -hex 32` — guarda em local seguro |
| `IROS_SERVER_DOMAIN` | *(deixa pro próximo passo)* | Você só sabe a URL depois do 1º deploy |

Clica **Create Web Service**. Render começa o build (~3-5min na primeira vez).

---

## 4. Primeiro deploy — descobrir a URL

Quando o build terminar, Render mostra a URL no topo: algo como
`https://iros-meu.onrender.com`.

Volta em **Environment** e adiciona:

| Key | Value |
|---|---|
| `IROS_SERVER_DOMAIN` | `iros-meu.onrender.com` |

Render redeploya automático ao salvar (~1min). Após o redeploy, o front vai abrir o WebSocket no domínio certo.

---

## 5. Testar

Abre `https://iros-meu.onrender.com/` → página de landing carrega.

Na seção **Create a session**:
1. Preenche stream link (opcional) e size (opcional)
2. Clica **Generate** → aparecem 2 links: editor + overlay
3. Abre o **editor link** em uma aba, adiciona um elemento (texto)
4. Abre o **overlay link** em outra aba → confirma que o elemento aparece em tempo real

DevTools (F12):
- **Console:** sem erros vermelhos
- **Network → WS:** conexão `wss://iros-meu.onrender.com/ws` com status `101`

Se o WebSocket falhar (status diferente de 101), confere se `IROS_SERVER_DOMAIN` e `IROS_USE_WSS=true` estão setados certo no painel do Render.

---

## 6. Adicionar no OBS

1. OBS → `+` em Sources → **Browser**.
2. URL: o **overlay link** que o IROS gerou (ex: `https://iros-meu.onrender.com/viewer?session=...`)
3. Width / Height conforme seu canvas (ex: 1920x1080).
4. Marca **Refresh browser when scene becomes active** (opcional).

---

## ⚠️ Limitações do free tier

- **Soneca após 15min ocioso.** Se ninguém acessou nos últimos 15min, o container hiberna. Próxima request acorda em ~30s. Pra evitar surpresa em live: abre o dashboard 1-2min antes de começar a transmitir.
- **Sem disco persistente.** O `sessions.json` (que guarda o estado dos elementos) **é apagado a cada redeploy/restart**. Sessões duram só enquanto o container fica de pé. Pra uso de live isso é ok — você cria a sessão antes de começar.
- **750h grátis/mês.** Se ficar sempre ligado, ultrapassa. Como dorme após 15min, na prática raramente é problema.

Se incomodar, dá pra:
- Pagar **$7/mês** pelo plano Starter (sem soneca + 1GB de disco persistente).
- Migrar pro **Fly.io** (free tier sem soneca, mas pede cartão).

---

## Atualizar o IROS depois

Toda vez que você fizer push pra `main` no GitHub, Render builda e redeploya automático. Se quiser desativar isso: dashboard do Render → **Settings** → **Auto-Deploy: No**.

---

## Chamar a API autenticada (opcional)

Pra usar `/api/v1/purgeSessions`, `/api/v1/setAnnouncement`, etc:

```bash
curl -X POST \
  -H "Authorization: SEU_IROS_API_TOKEN" \
  https://iros-meu.onrender.com/api/v1/purgeEmptySessions
```

O header `Authorization` recebe o token **direto** (sem prefixo `Bearer`). É o valor exato de `IROS_API_TOKEN`.
