#!/usr/bin/env python3
import sys
from pathlib import Path

if len(sys.argv) != 4:
    print("Usage: log_to_md.py <input_log> <output_md> <title>")
    sys.exit(1)

log_file = Path(sys.argv[1])
out_file = Path(sys.argv[2])
title = sys.argv[3]

if not log_file.exists():
    print(f"ERROR: {log_file} not found")
    sys.exit(2)

out_file.parent.mkdir(parents=True, exist_ok=True)

lines = log_file.read_text(errors="ignore").splitlines()

with out_file.open("w") as f:
    f.write(f"#v1877.0 {title}\n\n")
    f.write("```python\n")
    for line in lines:
        f.write(line + "\n")
    f.write("```\n")

