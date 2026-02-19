"""Revert: remove force-dynamic lines added by add_force_dynamic.py"""
import os

BASE = os.path.dirname(__file__)
MARKER = "export const dynamic = 'force-dynamic'"
FILES = ['app\\[locale]\\admin\\page.tsx', 'app\\[locale]\\admin\\accounting\\page.tsx', 'app\\[locale]\\admin\\activities\\page.tsx', 'app\\[locale]\\admin\\ai\\page.tsx', 'app\\[locale]\\admin\\ai-training\\page.tsx', 'app\\[locale]\\admin\\analytics\\page.tsx', 'app\\[locale]\\admin\\content\\dining\\page.tsx', 'app\\[locale]\\admin\\content\\meeting\\page.tsx', 'app\\[locale]\\admin\\content\\rooms\\page.tsx', 'app\\[locale]\\admin\\crm\\page.tsx', 'app\\[locale]\\admin\\extras\\page.tsx', 'app\\[locale]\\admin\\files\\page.tsx', 'app\\[locale]\\admin\\integrations\\booking\\page.tsx', 'app\\[locale]\\admin\\integrations\\restaurants\\page.tsx', 'app\\[locale]\\admin\\login\\page.tsx', 'app\\[locale]\\admin\\marketing\\page.tsx', 'app\\[locale]\\admin\\menu\\page.tsx', 'app\\[locale]\\admin\\pages\\page.tsx', 'app\\[locale]\\admin\\pages\\new\\page.tsx', 'app\\[locale]\\admin\\pages\\[id]\\editor\\page.tsx', 'app\\[locale]\\admin\\purchasing\\page.tsx', 'app\\[locale]\\admin\\reports\\page.tsx', 'app\\[locale]\\admin\\reservations\\page.tsx', 'app\\[locale]\\admin\\rooms\\page.tsx', 'app\\[locale]\\admin\\settings\\page.tsx', 'app\\[locale]\\admin\\social\\page.tsx', 'app\\[locale]\\admin\\social\\content\\page.tsx', 'app\\[locale]\\admin\\users\\page.tsx', 'app\\[locale]\\admin\\yield\\page.tsx']

for rel in FILES:
    path = os.path.join(BASE, rel)
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    content = content.replace(MARKER + "\n", "", 1)
    content = content.replace(MARKER + "\n\n", "", 1)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)
    print(f"  Reverted: {rel}")
print("Done")
