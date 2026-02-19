"""
Add export const dynamic = 'force-dynamic' to all admin page.tsx files
Saves a revert script to undo the changes later
"""
import os

BASE = os.path.join(os.path.dirname(__file__), 'app', '[locale]', 'admin')
MARKER = "export const dynamic = 'force-dynamic'"
modified = []

for root, dirs, files in os.walk(BASE):
    for f in files:
        if f == 'page.tsx':
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
            if MARKER not in content:
                rel = os.path.relpath(path, os.path.dirname(__file__))
                # Insert after 'use client' if present, else at top
                if "'use client'" in content:
                    new_content = content.replace("'use client'", "'use client'\n" + MARKER, 1)
                elif '"use client"' in content:
                    new_content = content.replace('"use client"', '"use client"\n' + MARKER, 1)
                else:
                    new_content = MARKER + '\n\n' + content
                with open(path, 'w', encoding='utf-8') as fh:
                    fh.write(new_content)
                modified.append(rel)
                print(f'  + {rel}')
            else:
                rel = os.path.relpath(path, os.path.dirname(__file__))
                print(f'  ✓ {rel} (already)')

print(f'\nModified: {len(modified)} files')

# Save revert script
revert_path = os.path.join(os.path.dirname(__file__), 'revert_force_dynamic.py')
with open(revert_path, 'w', encoding='utf-8') as fh:
    fh.write('"""Revert: remove force-dynamic lines added by add_force_dynamic.py"""\nimport os\n\n')
    fh.write(f'BASE = os.path.dirname(__file__)\n')
    fh.write(f'MARKER = "export const dynamic = \'force-dynamic\'"\n')
    fh.write(f'FILES = {modified!r}\n\n')
    fh.write('for rel in FILES:\n')
    fh.write('    path = os.path.join(BASE, rel)\n')
    fh.write('    with open(path, "r", encoding="utf-8") as fh:\n')
    fh.write('        content = fh.read()\n')
    fh.write('    content = content.replace(MARKER + "\\n", "", 1)\n')
    fh.write('    content = content.replace(MARKER + "\\n\\n", "", 1)\n')
    fh.write('    with open(path, "w", encoding="utf-8") as fh:\n')
    fh.write('        fh.write(content)\n')
    fh.write('    print(f"  Reverted: {rel}")\n')
    fh.write('print("Done")\n')

print(f'Revert script: {revert_path}')
