# /// script
# dependencies = [
#   "pandas",
#   "openpyxl"
# ]
# ///

from csv import DictReader
from argparse import ArgumentParser
from pathlib import Path
import re
import unicodedata
import pandas as pd
from tempfile import TemporaryDirectory

def handle_csv(file, out, lang):
    with open(file,"r") as f:
      reader = DictReader(f)
      for row in reader:
        filepath,markdown = markdownify_row_dict(row,out,lang)
        with open(filepath,"w") as f:
          f.write(markdown)
    return
  
def handle_ods(file, outpath, lang, sheets_to_skip):
  dataframe_dict = pd.read_excel(file,None)
  with TemporaryDirectory() as td:
    for sheetname in dataframe_dict.keys():
      if sheetname[0] == "_" or sheets_to_skip and sheetname in sheets_to_skip:
        continue
      print(f'handling sheet "{sheetname}"')
      df = dataframe_dict[sheetname].convert_dtypes()
      filepath = outpath.joinpath(f'_{sheetname}')
      if sheetname == "toplevel_pages":
        filepath = outpath
      if not filepath.exists():
        filepath.mkdir()
      newcsv = Path(td).joinpath(sheetname+'.csv') 
      df.to_csv(newcsv,index=False)
      handle_csv(newcsv,filepath,lang)
  # dataframe = dataframe_dict[sheet]
  # for row_num in range(dataframe.shape[0]):
  #   row_dict = dataframe.loc[row_num].to_dict()
  #   filename,markdown = markdownify_row_dict(row_dict,lang)
  #   with open(filepath.joinpath(filename+".md"),"w") as f:
  #     f.write(markdown)
  return

def markdownify_row_dict(row,outpath,lang):
  # take out cols like "*_en" and
  # reintroduce any that match lang
  to_pop=[] 
  to_append={}
  for key, value in row.items():
    if key[-3] != "_":
      continue
    if key[-2:] == lang:
      to_append[key[:-3]] = value
    to_pop.append(key)
  
  for key in to_pop:
    row.pop(key)
  for key,value in to_append.items():
    row[key] = value

  # except description & slug
  # print(f"{row.get('objectid')=} {row.get('slug')=} {row.get('title')=}")
  if row.get("slug"):
    fileslug = row.get("slug")
  elif row.get("objectid"):
    fileslug = row.get("objectid")
  else:
    if not row.get("title"):
        raise ValueError(f"no objectid, slug, or title for row: {row}")
    fileslug = row['title'].split(" ")[:3]
  filename = slugify(fileslug)
  filepath = outpath.joinpath(filename+".md")
  i=0
  while filepath.exists():
    print(f'{filepath} exists, incrementing')
    i += 1
    filepath = outpath.joinpath(filename+str(i)+".md")
    print(f'new path: {filepath}')
  if row.get("description"):
    desc = row.pop("description")
  else:
    desc=""

  # replace inline images in markdown content with responsive images
  desc = re.sub(r'\n?!\[(?P<alt>.*)\]\(img\/(?P<name>.*)\)(\n<small>(?P<caption>.*)<\/small>)?',
         r'{% assign srcsetimg = "\g<name>" %}\n{% include imgsrcset.html %}\n<figure>\n  <img sizes="400px" srcset="{{ srcset }}" alt="\g<alt>" />\n <figcaption>{{ "\g<caption>" | markdownify }}</figcaption>\n</figure>',
         desc)
          

  # put all other keys in frontmatter
  frontmatter = "\n".join([
    make_frontmatter(key,value)
    for key,value in row.items()
    ])

  markdown = "---\n"+frontmatter+"\n---\n"+desc
  return filepath,markdown

def make_frontmatter(key,value):
  if type(value) is not type(""):
    int(value)
  frontmatter = key+": "
  needs_escape = any(string in str(value) for string in "#:\n*")
  if needs_escape:
    frontmatter += '"'
  frontmatter += escape(value)
  if needs_escape:
    frontmatter += '"'
  return frontmatter

def parse_args():
  argparser = ArgumentParser(description="foo")
  argparser.add_argument("file")
  argparser.add_argument("out")
  argparser.add_argument("-l","--lang", default="en") 
  argparser.add_argument("-s","--skip",nargs="*")
  return argparser.parse_args()

def escape(string):
  string = str(string)
  string = string.replace('"','\\"')
  string = string.replace('\n','\\n')
  return string

def slugify(value, allow_unicode=False):
  """
  Taken from https://github.com/django/django/blob/master/django/utils/text.py
  Convert to ASCII if 'allow_unicode' is False. Convert spaces or repeated
  dashes to single dashes. Remove characters that aren't alphanumerics,
  underscores, or hyphens. Convert to lowercase. Also strip leading and
  trailing whitespace, dashes, and underscores.
  """
  value = str(value)
  if allow_unicode:
      value = unicodedata.normalize('NFKC', value)
  else:
      value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
  value = re.sub(r'[^\w\s-]', '', value.lower())
  return re.sub(r'[-\s]+', '-', value).strip('-_')

if __name__ == "__main__":
  args = parse_args()
  outpath = Path(args.out)
  extension = Path(args.file).suffix[1:]
  filepath = Path(args.file)
  print(f'generating md pages from sheet {filepath}')

  if extension == "csv":
    handle_csv(filepath,outpath,args.lang)
  elif extension in ("ods","xlsx"):
    handle_ods(filepath,outpath,args.lang,args.skip)
  else:
    raise ValueError(f"{extension} is not a recognized file extension")

