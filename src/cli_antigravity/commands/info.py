import platform
import sys

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from cli_antigravity import __version__
from cli_antigravity.core.config import settings

app = typer.Typer(help="Display project and environment information.")
console = Console()


@app.callback(invoke_without_command=True)
def show_info() -> None:
    """Show system, Python, and CLI runtime details."""
    table = Table(title=f"[bold cyan]{settings.app_name}[/bold cyan] System Info", show_header=True)
    table.add_column("Property", style="bold green", width=20)
    table.add_column("Value", style="yellow")

    table.add_row("CLI Version", __version__)
    table.add_row("Environment", settings.app_env)
    table.add_row("Debug Mode", str(settings.debug))
    table.add_row("Python Version", sys.version.split()[0])
    table.add_row("Platform", platform.platform())
    table.add_row("Data Directory", str(settings.data_dir))

    console.print(Panel(table, border_style="cyan"))
