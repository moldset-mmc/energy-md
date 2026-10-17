"""Build the existing static site for the /energy-md/ GitHub Pages path."""
from pathlib import Path
import shutil

ROOT = Path(__file__).parent
SOURCE = ROOT / 'dist'
OUTPUT = ROOT / 'pages-build'
BASE = '/energy-md'

shutil.copytree(SOURCE, OUTPUT, dirs_exist_ok=True)
for path in OUTPUT.rglob('*.html'):
    text = path.read_text()
    for attribute in ('href', 'src'):
        text = text.replace(f'{attribute}="/', f'{attribute}="{BASE}/')
    path.write_text(text)

for filename in ('app.js', 'app.ro.js'):
    path = OUTPUT / filename
    text = path.read_text()
    text = text.replace("const route = location.pathname", "const route = localPath(location.pathname)")
    text = text.replace("new URL(a.href).pathname.replace", "localPath(new URL(a.href).pathname).replace")
    text = text.replace("const sectorUrl = s => '/sector/'", f"const sectorUrl = s => '{BASE}/sector/'")
    text = text.replace("const companyUrl = c => '/company/'", f"const companyUrl = c => '{BASE}/company/'")
    text = text.replace('href="/', f'href="{BASE}/')
    for filename in ('data.json', 'data.ro.json', 'registry.json', 'public-energy.json'):
        text = text.replace(f"'/{filename}'", f"'{BASE}/{filename}'")
    text = text.replace("'use strict';", "'use strict';\n" +
        f"const BASE_PATH = '{BASE}';\n" +
        "function localPath(path) { return path === BASE_PATH ? '/' : path.startsWith(BASE_PATH + '/') ? path.slice(BASE_PATH.length) : path; }\n")
    path.write_text(text)
(OUTPUT / '.nojekyll').touch()
print(f'GitHub Pages files: {OUTPUT}')
