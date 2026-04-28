#!/usr/bin/env python3
"""Fix indentation issues in pitch-room/page.tsx around the isPublished block."""

with open(r'app\dashboard\pitch-room\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the isPublished block (around line 406)
# We need to remove 4 extra spaces from lines 409-480
fixed_lines = []
for i, line in enumerate(lines):
    line_num = i + 1
    # Line 406 starts the block we need to fix
    # Lines 409-480 have 4 extra spaces (they start with ~16 spaces instead of ~12)
    if 408 <= line_num <= 480:
        # Check if the line starts with enough whitespace
        if line.startswith('                '):  # 16 spaces
            # Remove 4 spaces (go from 16 to 12, etc.)
            fixed_lines.append(line[4:])
        else:
            fixed_lines.append(line)
    else:
        fixed_lines.append(line)

with open(r'app\dashboard\pitch-room\page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print("Fixed indentation in lines 409-480")
