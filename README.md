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
from which the site can be generated.

Below is the way I've been building the site! I
`touch` in case files don't exist, and then I download
the xlsx from google (the sheet must be "published"),
assuming that works I remove previous files
(`generate_pages.py` does not remove files that are
missing from the sheet, only adds/updates the ones
that are there), then runs `generate_pages.py` on the
sheet.

```bash
touch _carousel_images/foo _cases/foo _items/foo index.md;
wget 'https://docs.google.com/spreadsheets/d/e/{long id string}/pub?output=xlsx' -O../stamps.xlsx &&
rm _carousel_images/* _cases/* _items/* index.md &&
uv run _generate_pages.py ../stamps.xlsx .
```

I'll outline the specifications for the
sheet/markdown-files in a fresh
repo soon.
