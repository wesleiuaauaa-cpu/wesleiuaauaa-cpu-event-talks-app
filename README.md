# Cli Antigravity & BigQuery Release Notes

A modern, production-ready Python CLI application and Web App built with **Flask**, **Typer**, **Rich**, **Pydantic Settings**, **Loguru**, and **vanilla HTML, CSS, and JavaScript**.

---

## 🌐 BigQuery Release Notes Web Application

A lightweight, responsive web application that fetches official BigQuery release notes directly from the Google Cloud Atom Feed: `https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`.

### ✨ Web App Features
- **Zero frontend framework dependencies**: 100% plain vanilla HTML5, CSS3, and modern ES6 JavaScript.
- **Real-time Live Search**: Instant filtering across titles, summaries, and HTML content.
- **Category & Tag Filters**: Filter updates by tag (`Feature`, `Change`, `Preview`, `GA`, `Deprecated`).
- **Date Sorting**: Sort releases Newest First or Oldest First.
- **Dark / Light Mode**: Seamless theme switcher with localStorage persistence.
- **Collapsible Cards & Deep Linking**: Expand/collapse all cards and copy direct links to clipboard.
- **Smart Caching & Force Refresh**: In-memory caching with 15-minute TTL plus a manual "Refresh Feed" button.

### 🚀 Running the Web App

#### Option 1: Direct Python Runner
```powershell
python run_web.py
# Or on a custom port:
python run_web.py 8080
```

#### Option 2: CLI Subcommand
```powershell
$env:PYTHONPATH="src;."
python -m cli_antigravity.main web --port 5000
```
Open your browser at **`http://127.0.0.1:5000`**.

---

## 📁 Project Structure

```text
Cli Antigravity/
├── bigquery_web/                 # BigQuery Flask Web Application
│   ├── app.py                    # Flask routes and REST API endpoints
│   ├── feed_parser.py            # Atom XML feed fetcher, parser & caching
│   ├── templates/
│   │   └── index.html            # Semantic HTML5 template
│   └── static/
│       ├── css/
│       │   └── style.css         # Modern vanilla CSS (Dark/Light themes)
│       └── js/
│           └── app.js            # Vanilla JS (search, filter, sort, cache)
├── src/
│   └── cli_antigravity/
│       ├── __init__.py           # Package version and exports
│       ├── main.py               # Typer app entrypoint & global flags
│       ├── core/
│       │   ├── __init__.py
│       │   ├── config.py         # Pydantic Settings & environment config
│       │   └── logger.py         # Loguru logger setup
│       └── commands/
│           ├── __init__.py
│           ├── info.py           # System and runtime info command
│           ├── config_cmd.py     # Configuration inspection command
│           ├── task.py           # Example task execution command
│           └── web.py            # Flask web server runner command
├── tests/
│   ├── __init__.py
│   ├── test_cli.py               # CLI test coverage
│   ├── test_config.py            # Configuration tests
│   └── test_web.py               # Feed parser & Flask endpoint tests
├── .env.example                  # Sample environment variables
├── .gitignore                    # Python gitignore
├── pyproject.toml                # Project metadata & CLI scripts
├── requirements.txt              # Production dependencies
├── requirements-dev.txt          # Development dependencies
├── run_web.py                    # Standalone web runner
└── README.md                     # Documentation
```

---

## 🛠️ Quick Start

### 1. Setup Environment

Install dependencies:

```powershell
pip install -r requirements-dev.txt
```

Install the package in editable mode:

```powershell
pip install -e .
```

---

## 💻 CLI Commands

```powershell
# Help and available commands
python -m cli_antigravity.main --help

# System & platform information
python -m cli_antigravity.main info

# View current settings
python -m cli_antigravity.main config show

# Run a sample task
python -m cli_antigravity.main task run "data-sync" --steps 3

# Launch the BigQuery Web App
python -m cli_antigravity.main web
```

---

## 🧪 Testing and Linting

Run all unit tests (13 passing tests):

```powershell
$env:PYTHONPATH="src;."; pytest
```

Run code linter and formatter with Ruff:

```powershell
ruff check .
ruff format .
```
