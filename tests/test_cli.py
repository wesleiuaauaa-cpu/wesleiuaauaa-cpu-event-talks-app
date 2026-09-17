from typer.testing import CliRunner

from cli_antigravity import __version__
from cli_antigravity.main import app

runner = CliRunner()


def test_cli_help() -> None:
    result = runner.invoke(app, ["--help"])
    assert result.exit_code == 0
    assert "Cli Antigravity" in result.output
    assert "info" in result.output
    assert "config" in result.output
    assert "task" in result.output


def test_cli_version() -> None:
    result = runner.invoke(app, ["--version"])
    assert result.exit_code == 0
    assert __version__ in result.output


def test_cli_info_command() -> None:
    result = runner.invoke(app, ["info"])
    assert result.exit_code == 0
    assert "System Info" in result.output
    assert "CLI Version" in result.output


def test_cli_config_show() -> None:
    result = runner.invoke(app, ["config", "show"])
    assert result.exit_code == 0
    assert "Current Settings" in result.output


def test_cli_task_dry_run() -> None:
    result = runner.invoke(app, ["task", "run", "demo-task", "--dry-run"])
    assert result.exit_code == 0
    assert "DRY RUN" in result.output
    assert "demo-task" in result.output
