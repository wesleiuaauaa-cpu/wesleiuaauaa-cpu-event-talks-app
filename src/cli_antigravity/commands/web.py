import webbrowser

import typer
from rich.console import Console

from bigquery_web.app import app

cmd_app = typer.Typer(help="Launch the BigQuery Release Notes web application.")
console = Console()


@cmd_app.callback(invoke_without_command=True)
def run_server(
    port: int = typer.Option(5000, "--port", "-p", help="Port to bind the server"),
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host address"),
    open_browser: bool = typer.Option(True, "--open/--no-open", help="Open browser on launch"),
    debug: bool = typer.Option(False, "--debug", help="Enable Flask debug mode"),
) -> None:
    """Start the BigQuery Release Notes Flask server."""
    url = f"http://{host}:{port}"
    console.print(
        f"[bold green]Starting BigQuery Release Notes Web App[/bold green] at [cyan]{url}[/cyan]"
    )

    if open_browser:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    app.run(host=host, port=port, debug=debug)
