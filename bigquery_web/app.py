from pathlib import Path

from flask import Flask, jsonify, render_template, request

from bigquery_web.feed_parser import get_release_notes

BASE_DIR = Path(__file__).resolve().parent

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
)


@app.route("/")
def index():
    """Render the main release notes interface."""
    return render_template("index.html")


@app.route("/api/notes")
def api_notes():
    """Return parsed release notes as JSON."""
    force = request.args.get("refresh", "false").lower() in ("true", "1", "yes")
    try:
        data = get_release_notes(force_refresh=force)
        return jsonify({"success": True, "data": data})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@app.route("/api/health")
def api_health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


def create_app() -> Flask:
    """Application factory."""
    return app


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
