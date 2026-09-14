# 📻 BC75XLT Web Programmer

> 🇧🇷 [Versão em português](README.pt-BR.md) · Portuguese version available

A static web page, published on **GitHub Pages**, that programs the **Uniden BC75XLT / UBC75XLT** scanner radio directly from the browser using the **Web Serial API** — no software to install and no data sent to servers.

🔗 **Live app: <https://bcp.romildo.net>**

![Web Serial](https://img.shields.io/badge/Web%20Serial-Chrome%20%2F%20Edge-blue) ![Static](https://img.shields.io/badge/static-100%25-34d399)

## Features

- 🔌 **Connect the radio** via the serial port (Web Serial API) at 57600 bps.
- 📥 **Read from radio**: loads all settings + the 300 channels (10 banks × 30).
- 📤 **Write to radio**: sends settings and channels (with option to *clear memory* first).
- 📂 **Import file**: reads `.bc75xlt_ss` files from Uniden's original software.
- 💾 **Save file**: exports a `.bc75xlt_ss` compatible with the original software.
- ⚙️ Settings panel: Band Plan, Priority, Key Lock, Volume, Squelch, general/custom search, Close Call, banks (SCG), Service Search and global lockouts.
- 🗂️ Tabs with editable frequency lists for each bank.
- 📋 **Paste frequencies** from a spreadsheet (Excel column) directly into a bank.

## How to use

1. Connect the radio to the computer via USB cable (driver **Silicon Labs CP210x** installed).
2. Open **<https://bcp.romildo.net>** in **Chrome** or **Edge**.
3. Click **Connect radio** and pick the serial port.
4. **Read from radio** or **Import file** to load the configuration.
5. Edit and click **Write to radio**.

> The Web Serial API requires **HTTPS**, which GitHub Pages provides automatically. Use **Chrome** or **Edge** on desktop.

## Technical notes

- Communication happens **directly in the browser** via the **Web Serial API** — no data leaves your computer. Protocol based on `BC75XLT_Protocol.pdf` (Uniden) and on the [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl) project.
- **Protocol**: ASCII command line terminated with `\r`, response terminated with `\r`, 57600 bps 8N1 (documented in `BC75XLT_Protocol.pdf`).
- The frequency field in the radio (`CIN`/`CSP`) uses **100 Hz** units (MHz × 10000); the `.bc75xlt_ss` file uses **Hz**.
- The `.bc75xlt_ss` file is text with **TAB**-separated fields and **CRLF** line endings, faithfully reproduced on export.
- Global lockouts are read from the radio (read-only for now).
- References: [mateusza/bearcatctl](https://github.com/mateusza/bearcatctl) and [skriebel/bc75xlt](https://github.com/skriebel/bc75xlt).

> ⚠️ **Disclaimer**: program your radio responsibly and within your local amateur radio / band legislation.
