#!/usr/bin/env bash
# This is just to regenerate asciidocs while creating the backend.
# Then Rasciidoc (https://github.com/llicour/raskiidoc) will be used.
find ../ -name '*.txt' -and -not -name 'Notes.txt' -and -not -name 'doc_template.txt' \
-exec asciidoc --conf-file=asciidoc-twbs-backend.conf -b html5 {} \;
ruby build_index_files.rb 
ruby build_menu_xml.rb
ruby build_sitemap_xml.rb 

