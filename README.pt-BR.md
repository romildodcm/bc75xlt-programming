# 📻 BC75XLT Web Programmer

> 🇺🇸 [English version](README.md) · English version available

Página web (estática) publicada no **GitHub Pages** que programa o rádio **Uniden BC75XLT / UBC75XLT** diretamente pelo navegador usando a **Web Serial API** — sem instalar nada e sem enviar dados para servidores.

🔗 **Aplicação online: <https://bcp.romildo.net>**

![Web Serial](https://img.shields.io/badge/Web%20Serial-Chrome%20%2F%20Edge-blue) ![Estático](https://img.shields.io/badge/static-100%25-34d399)

## Funcionalidades

- 🔌 **Conectar o rádio** pela porta serial (Web Serial API) a 57600 bps.
- 📥 **Ler do rádio**: carrega todas as configurações + os 300 canais (10 bancos × 30).
- 📤 **Gravar no rádio**: envia as configurações e canais (com opção de *limpar memória* antes).
- 📂 **Importar arquivo**: lê arquivos `.bc75xlt_ss` do software original da Uniden.
- 💾 **Salvar arquivo**: exporta `.bc75xlt_ss` compatível com o software original.
- ⚙️ Painel de configurações: Band Plan, Prioridade, Key Lock, Volume, Squelch, pesquisa geral/customizada, Close Call, bancos (SCG), Service Search e lockouts globais.
- 🗂️ Abas com as listas de frequências de cada banco, editáveis.
- 📋 **Colar frequências** de uma planilha (coluna do Excel) direto em um banco.

## Como usar

1. Conecte o rádio ao computador pelo cabo USB (driver **Silicon Labs CP210x** instalado).
2. Abra **<https://bcp.romildo.net>** no **Chrome** ou **Edge**.
3. Clique em **Conectar rádio** e escolha a porta serial.
4. **Ler do rádio** ou **Importar arquivo** para carregar a configuração.
5. Edite e clique em **Gravar no rádio**.

> A Web Serial API exige **HTTPS**, fornecido automaticamente pelo GitHub Pages. Use **Chrome** ou **Edge** no desktop.

## Notas técnicas

- A comunicação é feita **direto pelo navegador** via **Web Serial API** — nenhum dado sai do seu computador. Protocolo baseado em `BC75XLT_Protocol.pdf` (Uniden) e no projeto [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl).
- **Protocolo**: linha de comando em ASCII terminada com `\r`, resposta terminada com `\r`, 57600 bps 8N1 (documentado no `BC75XLT_Protocol.pdf`).
- O campo de frequência no rádio (`CIN`/`CSP`) usa unidades de **100 Hz** (MHz × 10000); o arquivo `.bc75xlt_ss` usa **Hz**.
- O arquivo `.bc75xlt_ss` é texto com campos separados por **TAB** e linhas em **CRLF**, reproduzido fielmente na exportação.
- Os lockouts globais são lidos do rádio (somente leitura por enquanto).
- Referências: [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl) e [skriebel/bc75xlt](https://github.com/skriebel/bc75xlt).

> ⚠️ **Aviso**: programe seu rádio com responsabilidade e dentro da legislação local de radioamadorismo/bandas.
