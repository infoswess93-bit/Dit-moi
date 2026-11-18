"""Збирає застосунок в один HTML-файл (для перегляду в Claude): python3 tools/bundle.py вихідний.html"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text(encoding="utf-8")
head = html.split("<head>")[1].split("</head>")[0]
body = html.split("<body>")[1].split("</body>")[0]
title = re.search(r"<title>.*?</title>", head).group(0)
fonts = re.search(r'<link rel="stylesheet" href="https://fonts[^>]*>', head).group(0)
css = (root / "css/styles.css").read_text(encoding="utf-8")
def inline(m):
    return "<script>\n" + (root / m.group(1)).read_text(encoding="utf-8").replace("</script", "<\\/script") + "</script>"
body = re.sub(r'<script>if \("serviceWorker".*?</script>\n?', "", body)
body = re.sub(r'<script src="([^"]+)"></script>', inline, body)
out = f'{title}\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n<style>\n{css}</style>\n{body}'
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
print("ok", len(out))
