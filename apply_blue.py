#!/usr/bin/env python3
import re, pathlib

ROOT = pathlib.Path(__file__).parent

# ── 1. tailwind.config.ts ──────────────────────────────────────────────
tw = ROOT / "tailwind.config.ts"
content = tw.read_text()
replacements = {
    '"#C4612A"': '"#1648c0"',
    '"#E8835A"': '"#3b7dff"',
    '"#FAEDE4"': '"#e8f0ff"',
    '"#5A6E3A"': '"#0284c7"',
    '"#7A9250"': '"#38bdf8"',
    '"#EBF0E2"': '"#e0f2fe"',
    '"#1E1A14"': '"#0d1c45"',
    '"#4A4035"': '"#2d4a7a"',
    '"#8A7E72"': '"#6b8cae"',
    '"#FFFDF9"': '"#f8faff"',
    '"#C4922A"': '"#145cff"',
    '"#FBF3E2"': '"#dbeafe"',
    '"#F7F3ED"': '"#eff6ff"',
    '"#EDE6DB"': '"#dbeafe"',
}
for old, new in replacements.items():
    content = content.replace(old, new)
tw.write_text(content)
print("✓ patched tailwind.config.ts")

# ── 2. JourneySection.tsx ──────────────────────────────────────────────
js = ROOT / "components" / "JourneySection.tsx"
content = js.read_text()
content = content.replace(
    'linear-gradient(135deg, #C4612A 0%, #A84E22 100%)',
    'linear-gradient(135deg, #0d1c45 0%, #1648c0 100%)'
)
js.write_text(content)
print("✓ patched components/JourneySection.tsx")

# ── 3. HeroCtaCards.tsx ────────────────────────────────────────────────
hc = ROOT / "components" / "HeroCtaCards.tsx"
content = hc.read_text()
content = content.replace(
    'rgba(196,97,42,0.28)',
    'rgba(22,72,192,0.28)'
).replace(
    'rgba(196,97,42,0.36)',
    'rgba(22,72,192,0.36)'
)
hc.write_text(content)
print("✓ patched components/HeroCtaCards.tsx")

print("\n✅ Done! Now run:")
print("   git add .")
print('   git commit -m "design: unified blue visual identity"')
print("   git push -u origin hannini-2.0")
