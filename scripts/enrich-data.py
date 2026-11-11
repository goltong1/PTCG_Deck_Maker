"""Restore print identifiers from the pinned source without changing catalog IDs/order."""
import json, sys, re, gzip
from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=Path(sys.argv[1]) if len(sys.argv)>1 else Path('../data-source/data_ko')
raw={}
for p in src.rglob('*.json'):
    c=json.loads(p.read_text()); raw[c.get('ko_id') or p.parent.name+'-'+p.stem]=c
cards=json.loads((root/'public/data/cards.json').read_text())
for c in cards:
    r=raw.get(c['id'],{}); total=str(r.get('set_total') or '')
    c['series']=(re.search(r'/wmimages/([^/]+)/',c['originalImage']).group(1)).upper()
    c['seriesMark']=total if total.endswith('-P') else c['set']
    c['collectionNumber']=c['number']+('/'+total if total and total!='-1' else '')
    # Verified against the official card page; the source omits its ACE rule.
    if c['group']=='pokemon': c['ace']=False
    if c['id'] in {'ST2013005017','BS2013005073','BS2013005074'}: c['ace']=True
b=json.dumps(cards,ensure_ascii=False,separators=(',',':')).encode()
(root/'public/data/cards.json').write_bytes(b)
(root/'public/data/cards.json.gz').write_bytes(gzip.compress(b,compresslevel=9,mtime=0))
print(f'Enriched {len(cards)} cards with series and collection numbers.')
