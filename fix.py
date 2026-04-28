#!/usr/bin/env python3
import sys

with open(r'app\dashboard\pitch-room\page.tsx', 'r') as f:
    lines = f.readlines()

# Remove line 400 (0-indexed as 399)
if 399 < len(lines) and lines[399].strip() == '</div>':
    lines.pop(399)

with open(r'app\dashboard\pitch-room\page.tsx', 'w') as f:
    f.writelines(lines)

print("Fixed: Removed extra </div> at line 400")
