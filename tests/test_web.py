from bigquery_web.app import app
from bigquery_web.feed_parser import extract_tags, format_iso_date, parse_feed_xml, strip_html

SAMPLE_ATOM_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>tag:google.com,2016:bigquery-release-notes</id>
  <title>BigQuery - Release notes</title>
  <updated>2026-09-16T00:00:00-07:00</updated>
  <author>
    <name>Google Cloud Platform</name>
  </author>
  <entry>
    <title>September 16, 2026</title>
    <id>tag:google.com,2016:bigquery-release-notes#September_16_2026</id>
    <updated>2026-09-16T00:00:00-07:00</updated>
    <link rel="alternate" href="https://docs.cloud.google.com/bigquery/docs/release-notes#September_16_2026"/>
    <content type="html"><![CDATA[<h3>Feature</h3>
<p>BigQuery migration lineage service is in <a href="#">Preview</a>.</p>
]]></content>
  </entry>
</feed>
"""


def test_extract_tags() -> None:
    html = "<h3>Feature</h3><p>This is in Preview.</p>"
    tags = extract_tags(html)
    assert "Recurso" in tags
    assert "Prévia" in tags


def test_strip_html() -> None:
    html = "<p>Hello <b>World</b>! <a href='#'>Click here</a></p>"
    text = strip_html(html)
    assert text == "Hello World! Click here"


def test_format_iso_date() -> None:
    formatted = format_iso_date("2026-09-16T00:00:00-07:00")
    assert "16 de setembro de 2026" in formatted


def test_parse_feed_xml() -> None:
    result = parse_feed_xml(SAMPLE_ATOM_XML)
    assert result["title"] == "BigQuery - Release notes"
    assert result["total_entries"] == 1
    entry = result["entries"][0]
    assert entry["title"] == "September 16, 2026"
    assert "Recurso" in entry["tags"]
    assert "Prévia" in entry["tags"]
    assert "migration lineage" in entry["summary"]


def test_flask_index_page() -> None:
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert "Notas de Atualização do BigQuery".encode() in response.data
    assert b"css/style.css" in response.data
    assert b"js/app.js" in response.data
    assert b"tweet-modal" in response.data
    assert b"refresh-btn" in response.data




def test_flask_health_endpoint() -> None:
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["status"] == "healthy"


def test_flask_api_notes_endpoint() -> None:
    client = app.test_client()
    response = client.get("/api/notes")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["success"] is True
    assert "entries" in json_data["data"]
    assert len(json_data["data"]["entries"]) > 0
