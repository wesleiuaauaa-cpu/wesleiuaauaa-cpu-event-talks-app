from cli_antigravity.core.config import Settings


def test_default_settings() -> None:
    settings = Settings()
    assert settings.app_name == "Cli Antigravity"
    assert settings.app_env in ["development", "staging", "production"]
    assert settings.debug is False
    assert settings.log_level == "INFO"
