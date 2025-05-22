#!/usr/bin/env python3
import subprocess
import re
import sys
from pathlib import Path

PREPARE_SOURCE = Path("prepare_source")

def run_uscan_report():
    try:
        result = subprocess.run(
            ["uscan", "--report"],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print("uscan failed:", e.stderr, file=sys.stderr)
        sys.exit(1)

def extract_new_version(report):
    match = re.search(r"Newest version of ignition on remote site is ([\d\.]+)", report)
    if match:
        return match.group(1)
    return None

def read_current_version():
    with open(PREPARE_SOURCE) as f:
        for line in f:
            if line.startswith("version="):
                return line.strip().split("=")[1].split("-")[0].strip('"')


def update_prepare_source(file_path: Path, old :str , new: str):
    content = file_path.read_text()
    updated_content = content.replace(old, new)
    file_path.write_text(updated_content)
    print(f"Replaced all occurrences of '{old}' with '{new}' in {file_path}")


def main():
    report = run_uscan_report()
    print(f"Output of uscan", report)
    new_version = extract_new_version(report)
    if not new_version:
        print("No new version found.")
        sys.exit(0)

    current_version = read_current_version()
    if current_version == new_version:
        print(f"No update needed: version is already {current_version}")
        sys.exit(0)

    print(f"Updating version from {current_version} to {new_version}")
    update_prepare_source(PREPARE_SOURCE, current_version , new_version)

#update_prepare_source(new_version)

if __name__ == "__main__":
    main()
