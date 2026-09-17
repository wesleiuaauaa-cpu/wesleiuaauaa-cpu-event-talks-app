# Cli Antigravity

A modern, production-ready Python CLI application boilerplate engineered with **Typer**, **Rich**, **Pydantic Settings**, and **Loguru**.

---

## 🚀 Features

- **Modern CLI framework**: Built with [Typer](https://typer.tiangolo.com/) for type-hinted, intuitive command-line interfaces.
- **Rich Output**: Pretty tables, spinners, panels, and colored output powered by [Rich](https://rich.readthedocs.io/).
- **Robust Configuration**: Environment variable validation and `.env` parsing with [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/).
- **Structured Logging**: Pre-configured [Loguru](https://github.com/Delgan/loguru) logging with colored stderr sinks and optional file rotation.
- **Modular Subcommands**: Extensible structure separating core utilities from CLI command groups.
- **Testing Ready**: Pre-configured [pytest](https://docs.pytest.org/) suite with `typer.testing.CliRunner`.
- **Code Quality**: Pre-configured [Ruff](https://astral.sh/ruff) linting and formatting rules.

---

## 📁 Project Structure

```text
Cli Antigravity/
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
│           └── task.py           # Example task execution command
├── tests/
│   ├── __init__.py
│   ├── test_cli.py               # CLI test coverage
│   └── test_config.py            # Configuration tests
├── .env.example                  # Sample environment variables
├── .gitignore                    # Python gitignore
├── pyproject.toml                # Project metadata & CLI scripts
├── requirements.txt              # Production dependencies
├── requirements-dev.txt          # Development dependencies
└── README.md                     # Documentation
```

---

## 🛠️ Quick Start

### 1. Setup Environment

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements-dev.txt
```

Install the package in editable mode (adds `cli-antigravity` command to your PATH):

```powershell
pip install -e .
```

---

## 💻 CLI Usage

### View Available Commands

```powershell
python -m cli_antigravity.main --help
# Or directly if installed with -e .:
cli-antigravity --help
```

### Check System and Environment Info

```powershell
python -m cli_antigravity.main info
```

### Inspect Configuration

```powershell
python -m cli_antigravity.main config show
```

### Run a Demonstration Task

```powershell
# Run with default 5 steps
python -m cli_antigravity.main task run "my-etl-job"

# Run with custom steps
python -m cli_antigravity.main task run "my-etl-job" --steps 10

# Dry-run mode
python -m cli_antigravity.main task run "my-etl-job" --dry-run
```

---

## 🧪 Testing and Linting

Run all unit tests:

```powershell
pytest
```

Run code linter with Ruff:

```powershell
ruff check .
```

Format code:

```powershell
ruff format .
```
