#!/usr/bin/env python3
"""Runner script to launch the BigQuery Release Notes web application."""

import sys

from bigquery_web.app import app

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    print(f"Starting BigQuery Release Notes Web App on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
