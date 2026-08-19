# 📻 BC75XLT Web Programmer

Página web (estática, para **GitHub Pages**) que programa o rádio **Uniden BC75XLT / UBC75XLT** diretamente pelo navegador usando a **Web Serial API** — sem instalar nada e sem enviar dados para servidores.

![Web Serial](https://img.shields.io/badge/Web%20Serial-Chrome%20%2F%20Edge-blue) ![Estático](https://img.shields.io/badge/static-100%25-34d399)

## Funcionalidades

- 🔌 **Conectar o rádio** pela porta serial (Web Serial API) a 57600 bps.
- 📥 **Ler do rádio**: carrega todas as configurações + os 300 canais (10 bancos × 30).
- 📤 **Gravar no rádio**: envia as configurações e canais (com opção de *limpar memória* antes).
- 📂 **Importar arquivo**: lê arquivos `.bc75xlt_ss` do software original da Uniden.
- 💾 **Salvar arquivo**: exporta `.bc75xlt_ss` compatível com o software original.
- ⚙️ Painel de configurações: Band Plan, Prioridade, Key Lock, Volume, Squelch, pesquisa geral/customizada, Close Call, bancos (SCG), Service Search e lockouts globais.
- 🗂️ Abas com as listas de frequências de cada banco, editáveis.

## Como usar

1. Conecte o rádio ao computador pelo cabo USB (driver **Silicon Labs CP210x** instalado).
2. Abra a página em **Chrome** ou **Edge** (via HTTPS).
3. Clique em **Conectar rádio** e escolha a porta serial.
4. **Ler do rádio** ou **Importar arquivo** para carregar a configuração.
5. Edite e clique em **Gravar no rádio**.

> A Web Serial API exige **HTTPS** (o GitHub Pages fornece automaticamente) ou `localhost` para testes locais.

## Rodando localmente (testes)

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicando no GitHub Pages + domínio `bcp.romildo.net`

1. Crie um repositório no GitHub a partir desta pasta e faça o push:

   ```bash
   git init
   git add .
   git commit -m "BC75XLT Web Programmer"
   git branch -M main
   git remote add origin git@github.com:SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

2. No repositório: **Settings → Pages** → *Source*: **Deploy from a branch** → `main` / root. O arquivo `CNAME` já está no repositório.

3. **Settings → Pages → Custom domain**: informe `bcp.romildo.net` e salve (ativa SSL automático).

4. No seu provedor de DNS, crie o registro apontando para o GitHub Pages:

   | Tipo  | Nome              | Valor                      |
   |-------|-------------------|----------------------------|
   | CNAME | `bcp`             | `SEU_USUARIO.github.io`    |

   (Ou registros `A` para os endereços IP atuais do GitHub Pages — veja a [documentação](https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site).)

5. Aguarde o certificado SSL e acesse **<https://bcp.romildo.net>**.

## Notas técnicas

- A comunicação é feita **direto pelo navegador** via **Web Serial API** — nenhum dado sai do seu computador. Protocolo baseado em `BC75XLT_Protocol.pdf` (Uniden) e no projeto [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl).
- **Protocolo**: linha de comando em ASCII terminada com `\r`, resposta terminada com `\r`, 57600 bps 8N1 (documentado no `BC75XLT_Protocol.pdf`).
- O campo de frequência no rádio (`CIN`/`CSP`) usa unidades de **100 Hz** (MHz × 10000); o arquivo `.bc75xlt_ss` usa **Hz**.
- O arquivo `.bc75xlt_ss` é texto com campos separados por **TAB** e linhas em **CRLF**, reproduzido fielmente na exportação.
- Os lockouts globais são lidos do rádio (somente leitura por enquanto).
- Referências: [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl) e [skriebel/bc75xlt](https://github.com/skriebel/bc75xlt).

## Estrutura

```text
├── index.html          # Página principal
├── css/style.css       # Estilos
├── js/
│   ├── protocol.js     # Web Serial + comandos do protocolo BC75XLT
│   ├── configfile.js   # Parse/exportação do arquivo .bc75xlt_ss
│   └── app.js          # Lógica da interface e operações de leitura/gravação
├── CNAME               # bcp.romildo.net
└── referencias/        # Repositórios de referência (ignorados no git)
```

> ⚠️ **Aviso**: programe seu rádio com responsabilidade e dentro da legislação local de radioamadorismo/bandas.
