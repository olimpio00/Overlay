# IROS

Overlay remoto controlado pelo navegador para uso no OBS.

## Rodar localmente

```bash
go mod download
go run . --config config.json
```

Depois abra http://localhost:8080.

## O que faz

- cria sessões para overlay em tempo real
- permite editar texto, imagem, áudio, vídeo, timer e iframe
- entrega editor e viewer separados para usar no OBS

## Configuração

Use [`.env.example`](.env.example) como referência das variáveis principais.

## Licença

AGPL-3.0
