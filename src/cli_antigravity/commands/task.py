import time

import typer
from loguru import logger
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

app = typer.Typer(help="Manage and execute automated tasks.")
console = Console()


@app.command("run")
def run_task(
    name: str = typer.Argument(..., help="Name of the task to run"),
    steps: int = typer.Option(5, "--steps", "-s", help="Number of steps in the task"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Simulate without making changes"),
) -> None:
    """Execute a demonstration task with real-time progress indicators."""
    logger.info(f"Starting task '{name}' with {steps} steps (dry_run={dry_run})")

    if dry_run:
        console.print(
            f"[yellow][DRY RUN][/yellow] Simulating execution for task: [bold]{name}[/bold]"
        )
        return

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        task_id = progress.add_task(description=f"Processing {name}...", total=steps)
        for step in range(1, steps + 1):
            time.sleep(0.3)
            progress.update(task_id, description=f"Executing step {step}/{steps}...")
            progress.advance(task_id)

    console.print(
        f"[bold green]✓[/bold green] Task [bold cyan]{name}[/bold cyan] completed successfully!"
    )
