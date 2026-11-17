"""Encode generated OneSip photographs and self-host Google Fonts assets."""
from pathlib import Path
import json
import re
import urllib.request
from PIL import Image

root = Path(__file__).resolve().parents[1]
sources = json.loads((root / '.superpowers/onesip/asset-sources.json').read_text())
out = root / 'public/images/storefront'
out.mkdir(parents=True, exist_ok=True)
for name, source in sources.items():
    image = Image.open(source).convert('RGB')
    image.thumbnail((1536, 1024) if name == 'hero' else (800, 800))
    image.save(out / f'{name}.webp', 'WEBP', quality=86, method=6)
    if name != 'hero':
        image.thumbnail((400, 400))
        image.save(out / f'{name}-small.webp', 'WEBP', quality=82, method=6)
    print(name, (out / f'{name}.webp').stat().st_size)

fonts = root / 'public/fonts'
fonts.mkdir(parents=True, exist_ok=True)
url = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap'
request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
css = urllib.request.urlopen(request).read().decode()
blocks = re.findall(r'/\* (vietnamese|latin|latin-ext) \*/\s*(@font-face\s*\{[^}]+\})', css)
local = []
for index, (_, block) in enumerate(blocks):
    remote = re.search(r'url\(([^)]+)\)', block).group(1)
    filename = f'onesip-{index}.woff2'
    (fonts / filename).write_bytes(urllib.request.urlopen(remote).read())
    local.append(block.replace(remote, f'/fonts/{filename}'))
assert local, 'No font faces downloaded'
(fonts / 'fonts.css').write_text('\n'.join(local), encoding='utf-8')
for family, folder in [('BeVietnamPro', 'bevietnampro'), ('Lora', 'lora')]:
    license_url = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{folder}/OFL.txt'
    (fonts / f'{family}-OFL.txt').write_bytes(urllib.request.urlopen(license_url).read())
print('Local font faces:', len(local))
