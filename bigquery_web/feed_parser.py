import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Any

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}
CACHE_DURATION_SECONDS = 900  # 15 minutes

# In-memory cache
_feed_cache: dict[str, Any] = {
    "timestamp": 0,
    "data": None,
}


TAG_TRANSLATIONS = {
    "Feature": "Recurso",
    "Change": "Alteração",
    "Preview": "Prévia",
    "GA": "GA",
    "Deprecated": "Descontinuado",
    "Fix": "Correção",
    "Announcement": "Anúncio",
}

MESES_PT_BR = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
}


def extract_tags(html_content: str) -> list[str]:
    """Extract category tags and translate to PT-BR."""
    tags = set()
    h3_matches = re.findall(r"<h3>(.*?)</h3>", html_content, re.IGNORECASE)
    for match in h3_matches:
        clean_tag = re.sub(r"<[^>]+>", "", match).strip().capitalize()
        if clean_tag:
            tags.add(TAG_TRANSLATIONS.get(clean_tag, clean_tag))

    # Detect preview / GA status
    if re.search(r"\bpreview\b", html_content, re.IGNORECASE):
        tags.add("Prévia")
    if re.search(r"\b(generally available|GA)\b", html_content, re.IGNORECASE):
        tags.add("GA")
    if re.search(r"\bdeprecated?\b", html_content, re.IGNORECASE):
        tags.add("Descontinuado")

    return sorted(list(tags))


def strip_html(html_text: str) -> str:
    """Strip HTML tags to create plain text snippet."""
    text = re.sub(r"</?(?:p|div|h[1-6]|li|br|tr)[^>]*>", " ", html_text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+([.,!?:;])", r"\1", text)
    return " ".join(text.split())


def format_iso_date(iso_str: str) -> str:
    """Format an ISO date string into readable PT-BR format."""
    try:
        dt = datetime.fromisoformat(iso_str)
        mes = MESES_PT_BR.get(dt.month, dt.strftime("%B"))
        return f"{dt.day} de {mes.lower()} de {dt.year}"
    except Exception:
        return iso_str



def parse_feed_xml(xml_bytes: bytes) -> dict[str, Any]:
    """Parse BigQuery Atom XML bytes into structured dictionary."""
    root = ET.fromstring(xml_bytes)

    feed_title_elem = root.find("atom:title", ATOM_NS)
    feed_title = (
        feed_title_elem.text.strip()
        if feed_title_elem is not None and feed_title_elem.text
        else "BigQuery Release Notes"
    )

    feed_updated_elem = root.find("atom:updated", ATOM_NS)
    feed_updated = (
        feed_updated_elem.text.strip()
        if feed_updated_elem is not None and feed_updated_elem.text
        else ""
    )

    author_elem = root.find("atom:author/atom:name", ATOM_NS)
    author = (
        author_elem.text.strip()
        if author_elem is not None and author_elem.text
        else "Google Cloud"
    )

    entries = []
    for entry in root.findall("atom:entry", ATOM_NS):
        title_elem = entry.find("atom:title", ATOM_NS)
        title = (
            title_elem.text.strip()
            if title_elem is not None and title_elem.text
            else "Untitled Release"
        )

        id_elem = entry.find("atom:id", ATOM_NS)
        entry_id = id_elem.text.strip() if id_elem is not None and id_elem.text else ""

        updated_elem = entry.find("atom:updated", ATOM_NS)
        updated = (
            updated_elem.text.strip()
            if updated_elem is not None and updated_elem.text
            else ""
        )

        link_elem = entry.find("atom:link", ATOM_NS)
        link = link_elem.attrib.get("href", "") if link_elem is not None else ""

        content_elem = entry.find("atom:content", ATOM_NS)
        content_html = (
            content_elem.text.strip()
            if content_elem is not None and content_elem.text
            else ""
        )

        tags = extract_tags(content_html)
        raw_summary = strip_html(content_html)
        plain_summary = raw_summary[:280] + ("..." if len(raw_summary) > 280 else "")

        entries.append(
            {
                "id": entry_id,
                "title": title,
                "updated": updated,
                "date_formatted": format_iso_date(updated),
                "link": link,
                "content_html": content_html,
                "tags": tags,
                "summary": plain_summary,
            }
        )

    return {
        "title": feed_title,
        "updated": feed_updated,
        "updated_formatted": format_iso_date(feed_updated),
        "author": author,
        "total_entries": len(entries),
        "fetched_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "entries": entries,
    }


def get_release_notes(force_refresh: bool = False) -> dict[str, Any]:
    """Fetch and parse release notes with caching."""
    now = time.time()
    if (
        not force_refresh
        and _feed_cache["data"] is not None
        and (now - _feed_cache["timestamp"] < CACHE_DURATION_SECONDS)
    ):
        return _feed_cache["data"]

    req = urllib.request.Request(
        FEED_URL,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "application/atom+xml,application/xml,text/xml",
        },
    )

    with urllib.request.urlopen(req, timeout=15) as response:
        xml_data = response.read()

    parsed = parse_feed_xml(xml_data)
    _feed_cache["timestamp"] = now
    _feed_cache["data"] = parsed
    return parsed

