#!/usr/bin/env bash
# This is just to regenerate asciidocs while creating the backend.
# Then Rasciidoc (https://github.com/llicour/raskiidoc) will be used.
find ../ -name '*.txt' -and -not -name 'Notes.txt' -exec asciidoc --conf-file=asciidoc-twbs-backend.conf {} \;