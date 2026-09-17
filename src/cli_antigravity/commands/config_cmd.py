import typer
from rich.console import Console
from rich.panel import Panel
from rich.pretty import Pretty

from cli_antigravity.core.config import settings

app = typer.Typer(help="Manage and inspect CLI configuration.")
console = Console()


@app.command("show")
def show_config() -> None:
    """Display active configuration settings."""
    config_dict = settings.model_dump()
    console.print(
        Panel(
            Pretty(config_dict),
            title="[bold green]Current Settings[/bold green]",
            border_style="green",
        )
    )
