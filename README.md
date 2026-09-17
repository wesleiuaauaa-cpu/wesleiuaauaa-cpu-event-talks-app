# 🚀 Cli Antigravity & BigQuery Release Notes

[![Python Version](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/framework-Flask%20%7C%20Typer-green.svg)](https://flask.palletsprojects.com/)
[![Code Style](https://img.shields.io/badge/code%20style-ruff-black.svg)](https://github.com/astral-sh/ruff)
[![Tests](https://img.shields.io/badge/tests-pytest-yellow.svg)](https://docs.pytest.org/)
[![Repository](https://img.shields.io/badge/github-wesleiuaauaa--cpu--event--talks--app-blueviolet.svg)](https://github.com/wesleiuaauaa-cpu/wesleiuaauaa-cpu-event-talks-app)

Aplicação moderna em Python combinando uma **CLI de alta performance** (construída com **Typer**, **Rich**, **Pydantic Settings** e **Loguru**) e uma **Aplicação Web interativa** (construída com **Flask** e **Vanilla JavaScript/CSS/HTML5**) para consulta, filtro e compartilhamento das notas de atualização oficiais do **Google Cloud BigQuery**.

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Recursos Principais](#-recursos-principais)
- [Arquitetura da Aplicação](#-arquitetura-da-aplicação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Executar](#-como-executar)
  - [Aplicação Web](#1-executando-a-aplicação-web)
  - [Interface de Linha de Comando (CLI)](#2-utilizando-a-cli)
- [Endpoints da API REST](#-endpoints-da-api-rest)
- [Testes e Qualidade de Código](#-testes-e-qualidade-de-código)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)

---

## 🌟 Visão Geral

O projeto resolve o desafio de acompanhar as constantes atualizações e anúncios da plataforma BigQuery do Google Cloud. Ele consome o feed oficial Atom XML (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`), processa o conteúdo, sanitiza marcações HTML, categoriza os itens, traduz os metadados para português (PT-BR) e os apresenta através de:

1. Uma **interface gráfica web responsiva** com busca instantânea, ordenação, temas e compositor de tweets.
2. Uma **suíte de comandos CLI** para automações, inspeções de ambiente e tarefas em lote.

---

## ✨ Recursos Principais

### 🌐 Aplicação Web
- **Zero Frameworks Frontend Pesados**: Interface construída 100% em HTML5 semântico, CSS3 moderno e JavaScript ES6 puro (Vanilla JS).
- **Busca em Tempo Real**: Filtro instantâneo em títulos, sumários e corpo HTML das notas.
- **Filtragem por Categoria**: Detecção automática de tags traduzidas (`Recurso`, `Alteração`, `Prévia`, `GA`, `Descontinuado`, `Correção`, `Anúncio`).
- **Ordenação Cronológica**: Alternância ágil entre mais recentes primeiro e mais antigas primeiro.
- **Tema Claro / Escuro**: Suporte a Dark/Light mode com persistência local no navegador (`localStorage`).
- **Cache Inteligente**: Cache em memória no servidor com TTL de 15 minutos e botão de atualização forçada (*Force Refresh*) com indicador visual de spinner.
- **Compositor de Tweets (𝕏)**: Compartilhamento rápido de notas ou trechos de texto selecionados diretamente para o Twitter/𝕏, com validação de 280 caracteres.

### 💻 Interface de Linha de Comando (CLI)
- Desenvolvida com **Typer** e visual moderno no terminal com **Rich**.
- Configurações tipadas e validadas com **Pydantic Settings**.
- Logging estruturado e configurável com **Loguru**.
- Comandos modulares para inspeção de sistema, execução de tarefas de sincronização e lançamento do servidor web.

---

## 🏛️ Arquitetura da Aplicação

A solução é dividida de forma desacoplada entre cliente e servidor:

```
┌────────────────────────────────────────────────────────┐
│               LADO DO CLIENTE (Navegador)              │
│  - index.html (Layout responsivo)                      │
│  - style.css (Variáveis CSS para temas claro/escuro)   │
│  - app.js (Estado reativo, busca e modal de tweet)     │
└───────────────────────────┬────────────────────────────┘
                            │ Requisição HTTP Fetch (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│               LADO DO SERVIDOR (Python / Flask)        │
│  - app.py (Rotas REST /api/notes e /api/health)        │
│  - feed_parser.py (Cache em memória e parser XML)      │
│  - cli_antigravity (Interface de terminal)             │
└───────────────────────────┬────────────────────────────┘
                            │ urllib (Atom XML)
                            ▼
           Google Cloud BigQuery Release Notes Feed
```

---

## 📁 Estrutura do Projeto

```text
Cli Antigravity/
├── bigquery_web/                 # Aplicação Web Flask
│   ├── app.py                    # Rotas do Flask e endpoints REST
│   ├── feed_parser.py            # Download, parsing XML Atom, cache e tradução
│   ├── templates/
│   │   └── index.html            # Template HTML5 semântico
│   └── static/
│       ├── css/
│       │   └── style.css         # Estilos e temas Dark/Light
│       └── js/
│           └── app.js            # Lógica Vanilla JS de renderização e estado
├── src/
│   └── cli_antigravity/          # Pacote Python da CLI
│       ├── __init__.py           # Metadados e versão
│       ├── main.py               # Ponto de entrada Typer
│       ├── core/
│       │   ├── config.py         # Configurações com Pydantic Settings
│       │   └── logger.py         # Configuração do Loguru
│       └── commands/             # Comandos da CLI
│           ├── info.py           # Informações do sistema
│           ├── config_cmd.py     # Inspeção de configurações
│           ├── task.py           # Execução de tarefas de exemplo
│           └── web.py            # Inicializador do servidor web
├── tests/                        # Suíte de testes automatizados
│   ├── test_cli.py               # Testes dos comandos Typer
│   ├── test_config.py            # Testes do Pydantic Settings
│   └── test_web.py               # Testes dos endpoints Flask e feed parser
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Regras de exclusão do Git
├── pyproject.toml                # Metadados do projeto e empacotamento
├── requirements.txt              # Dependências de produção
├── requirements-dev.txt          # Dependências de desenvolvimento e testes
├── run_web.py                    # Script de inicialização rápida do servidor web
└── README.md                     # Documentação do projeto
```

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório

```powershell
git clone https://github.com/wesleiuaauaa-cpu/wesleiuaauaa-cpu-event-talks-app.git
cd wesleiuaauaa-cpu-event-talks-app
```

### 2. Criar e ativar ambiente virtual

No Windows (PowerShell):
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

No Linux / macOS:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependências

```powershell
pip install -r requirements-dev.txt
pip install -e .
```

---

## 🚀 Como Executar

### 1. Executando a Aplicação Web

Você pode iniciar o servidor web de duas formas simples:

#### Opção A: Via Runner Direto
```powershell
python run_web.py
# Ou especificando uma porta personalizada:
python run_web.py 8080
```

#### Opção B: Via Subcomando da CLI
```powershell
$env:PYTHONPATH="src;."
python -m cli_antigravity.main web --port 5000 --open
```

Acesse no seu navegador: **`http://127.0.0.1:5000`**

---

### 2. Utilizando a CLI

A CLI possui comandos interativos com saída formatada via Rich:

```powershell
# Ajuda geral e comandos disponíveis
python -m cli_antigravity.main --help

# Informações de runtime e sistema operacional
python -m cli_antigravity.main info

# Inspecionar variáveis de configuração atuais
python -m cli_antigravity.main config show

# Executar simulação de tarefas em etapas
python -m cli_antigravity.main task run "sincronizar-feed" --steps 4

# Iniciar o servidor web diretamente pela CLI
python -m cli_antigravity.main web --port 5000
```

---

## 🔌 Endpoints da API REST

| Método | Endpoint | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Renderiza a página principal (`index.html`). |
| `GET` | `/api/notes` | `refresh=true` (opcional) | Retorna as notas de lançamento parseadas em formato JSON. |
| `GET` | `/api/health` | — | Endpoint de verificação de integridade (*health check*). |

#### Exemplo de Resposta de `/api/notes`:
```json
{
  "success": true,
  "data": {
    "title": "BigQuery Release Notes",
    "total_entries": 45,
    "fetched_at": "2026-09-17 16:00:00",
    "updated_formatted": "15 de setembro de 2026",
    "entries": [
      {
        "id": "tag:google.com,2026:bigquery-release-2026-09-15",
        "title": "September 15, 2026",
        "date_formatted": "15 de setembro de 2026",
        "link": "https://cloud.google.com/bigquery/docs/release-notes#September_15_2026",
        "tags": ["Recurso", "GA"],
        "summary": "Suporte aprimorado para particionamento de tabelas...",
        "content_html": "<p>Suporte aprimorado para particionamento...</p>"
      }
    ]
  }
}
```

---

## 🧪 Testes e Qualidade de Código

### Executar Testes Automatizados
O projeto conta com suíte de testes unitários cobrindo CLI, configurações, rotas Flask e parser de feed:

```powershell
$env:PYTHONPATH="src;."
pytest -v
```

### Análise Estática e Formatação de Código
Para manter a consistência e conformidade com as regras PEP8:

```powershell
# Executar o linter com Ruff
ruff check .

# Formatar o código automaticamente
ruff format .
```

---

## 🔒 Variáveis de Ambiente

O arquivo [`.env.example`](file:///C:/Users/usuario/Desktop/Projetos/Cli%20Antigravity/.env.example) contém os parâmetros configuráveis:

```env
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=INFO
APP_HOST=127.0.0.1
APP_PORT=5000
```

Copie para `.env` para personalizar o ambiente local:
```powershell
cp .env.example .env
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença MIT. Consulte o repositório oficial para mais detalhes: [wesleiuaauaa-cpu/wesleiuaauaa-cpu-event-talks-app](https://github.com/wesleiuaauaa-cpu/wesleiuaauaa-cpu-event-talks-app).
