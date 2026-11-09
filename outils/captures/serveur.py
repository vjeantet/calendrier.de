#!/usr/bin/env python3
"""Serveur local pour les captures : sert public/ comme Netlify (fichier
existant, sinon index.html) et injecte fixture.js en tête de index.html
(date figée, personnalisations de test). Écoute sur 127.0.0.1 uniquement.

Avec --reseau : écoute sur toutes les interfaces et n'injecte rien, pour
tester le site tel quel depuis un autre appareil du réseau local (iPad...).

Usage : serveur.py <port> [--reseau]
"""
import http.server
import pathlib
import sys
import urllib.parse

ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parents[1] / "public"


RESEAU = "--reseau" in sys.argv[2:]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RACINE), **kwargs)

    def do_GET(self):
        chemin = urllib.parse.urlsplit(self.path).path
        if chemin != "/" and pathlib.Path(self.translate_path(chemin)).is_file():
            return super().do_GET()
        html = (RACINE / "index.html").read_text(encoding="utf-8")
        if not RESEAU:
            fixture = (ICI / "fixture.js").read_text(encoding="utf-8")
            html = html.replace("<head>", "<head>\n<script>" + fixture + "</script>", 1)
        corps = html.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1])
    hote = "0.0.0.0" if RESEAU else "127.0.0.1"
    http.server.ThreadingHTTPServer((hote, port), Handler).serve_forever()
