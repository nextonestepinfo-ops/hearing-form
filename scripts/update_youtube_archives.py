from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


DEFAULT_TARGETS = [
    "shirokami-konoha-site-template-v3-summon/youtube-archives.json",
    "shirokami-konoha-site-template-v3-summon-mobile-alt/youtube-archives.json",
]

ATOM_NS = "http://www.w3.org/2005/Atom"
YT_NS = "http://www.youtube.com/xml/schemas/2015"
MEDIA_NS = "http://search.yahoo.com/mrss/"
NS = {"atom": ATOM_NS, "yt": YT_NS, "media": MEDIA_NS}


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def fetch_xml(source_url: str) -> ET.Element:
    request = urllib.request.Request(
        source_url,
        headers={
            "User-Agent": "hearing-form-youtube-archive-updater/1.0",
            "Accept": "application/atom+xml, application/xml;q=0.9, */*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return ET.fromstring(response.read())


def find_text(element: ET.Element, path: str) -> str:
    node = element.find(path, NS)
    return (node.text or "").strip() if node is not None else ""


def video_id_from_entry(entry: ET.Element) -> str:
    video_id = find_text(entry, "yt:videoId")
    if video_id:
        return video_id

    link = entry.find("atom:link[@rel='alternate']", NS)
    href = link.get("href", "") if link is not None else ""
    match = re.search(r"(?:v=|/)([a-zA-Z0-9_-]{11})(?:[?&/]|$)", href)
    return match.group(1) if match else ""


def normalize_thumbnail(video_id: str, quality: str, fallback: str) -> str:
    if video_id:
        return f"https://i.ytimg.com/vi/{video_id}/{quality}.jpg"
    return fallback


def entry_url(entry: ET.Element, video_id: str) -> str:
    link = entry.find("atom:link[@rel='alternate']", NS)
    href = link.get("href", "") if link is not None else ""
    return href or (f"https://www.youtube.com/watch?v={video_id}" if video_id else "#")


def parse_items(feed: ET.Element, quality: str, limit: int) -> list[dict]:
    items: list[dict] = []

    for entry in feed.findall("atom:entry", NS):
        video_id = video_id_from_entry(entry)
        media_group = entry.find("media:group", NS)
        thumbnail = ""

        if media_group is not None:
            thumbnail_node = media_group.find("media:thumbnail", NS)
            if thumbnail_node is not None:
                thumbnail = thumbnail_node.get("url", "")

        items.append(
            {
                "id": video_id,
                "title": find_text(entry, "atom:title") or "YouTube Archive",
                "url": entry_url(entry, video_id),
                "published": find_text(entry, "atom:published"),
                "thumbnail": normalize_thumbnail(video_id, quality, thumbnail),
            },
        )

    return items[:limit]


def payload_items_equal(existing: dict, source_url: str, items: list[dict]) -> bool:
    return existing.get("source") == source_url and existing.get("items") == items


def update_target(path: Path, limit: int) -> bool:
    existing = load_json(path)
    source_url = existing.get("source")
    if not source_url:
        raise ValueError(f"{path} is missing source")

    quality = "hqdefault"
    first_thumbnail = next(
        (item.get("thumbnail", "") for item in existing.get("items", []) if item.get("thumbnail")),
        "",
    )
    quality_match = re.search(r"/([^/]+)\.jpg$", first_thumbnail)
    if quality_match:
        quality = quality_match.group(1)

    feed = fetch_xml(source_url)
    items = parse_items(feed, quality, limit)
    if not items:
        raise ValueError(f"No YouTube items found for {source_url}")

    if payload_items_equal(existing, source_url, items):
        print(f"No archive changes: {path}")
        return False

    payload = {
        "updated": datetime.now(ZoneInfo("Asia/Tokyo")).isoformat(timespec="seconds"),
        "source": source_url,
        "items": items,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {path} with {len(items)} items")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Update static YouTube archive JSON files from YouTube RSS.")
    parser.add_argument("--target", action="append", default=[], help="Archive JSON path to update.")
    parser.add_argument("--limit", type=int, default=6, help="Maximum number of videos to keep.")
    args = parser.parse_args()

    root = Path.cwd()
    targets = args.target or DEFAULT_TARGETS
    changed = False

    for target in targets:
        path = root / target
        if not path.exists():
            print(f"Missing target: {path}", file=sys.stderr)
            return 1
        changed = update_target(path, args.limit) or changed

    print("changed=true" if changed else "changed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
