# The History of Firearms in Stamps - Jekyll

This is the static site generation repo for the Brown
University Library History of Firearms in Stamps exhibit.

## Build process

This is a Jekyll site! So to some extent its build
process follows the steps from the [Jekyll docs](https://jekyllrb.com/docs/step-by-step/01-setup/#build).

That said, this repo includes the mysterious
`generate_pages.py`, which is capable of - you guessed
it - generating pages! To spell this out in a less
snarky way, this script uses mostly base-python (with
the exception of pandas) to generate markdown files
from a spreadsheet. It loads these into `_*`
collections (where `*` represents the sheet name),
from which the site can be generated. I'll outline the
specifications for the sheet/markdown-files in a fresh
repo soon.
