"""CLI script to ingest mock data into the database."""
from __future__ import annotations

import argparse
from pathlib import Path

from sqlmodel import Session

from app.db.database import engine
from app.services.ingest_service import ingest_from_payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest mock data JSON files")
    parser.add_argument(
        "--no-embed",
        action="store_true",
        help="Skip embedding generation (for faster ingest when vectors not needed)",
    )
    parser.add_argument(
        "--base-path",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="Directory containing asset_type_rows.json and assets_rows.json",
    )
    args = parser.parse_args()

    with Session(engine) as session:
        result = ingest_from_payload(
            session,
            asset_types=None,
            assets=None,
            embed=not args.no_embed,
            base_path=args.base_path,
        )
        print("Ingestion complete:", result)


if __name__ == "__main__":
    main()
