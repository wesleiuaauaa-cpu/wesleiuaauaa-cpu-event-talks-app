import typer
from rich.console import Console

from cli_antigravity import __version__
from cli_antigravity.commands import config_cmd, info, task, web
from cli_antigravity.core.config import settings
from cli_antigravity.core.logger import setup_logger

app = typer.Typer(
    name="cli-antigravity",
    help="Cli Antigravity - A modern, modular Python CLI application.",
    no_args_is_help=True,
)

console = Console()

# Register subcommands
app.add_typer(info.app, name="info")
app.add_typer(config_cmd.app, name="config")
app.add_typer(task.app, name="task")
app.add_typer(web.cmd_app, name="web")


def version_callback(value: bool) -> None:
    if value:
        console.print(
            f"[bold cyan]cli-antigravity[/bold cyan] version [bold green]{__version__}[/bold green]"
        )
        raise typer.Exit()


@app.callback()
def main(
    version: bool | None = typer.Option(
        None,
        "--version",
        "-v",
        help="Show version and exit.",
        callback=version_callback,
        is_eager=True,
    ),
    verbose: bool = typer.Option(
        False,
        "--verbose",
        help="Enable verbose / debug logging.",
    ),
) -> None:
    """Main CLI application entrypoint."""
    log_level = "DEBUG" if verbose or settings.debug else settings.log_level
    setup_logger(log_level=log_level)


if __name__ == "__main__":
    app()
