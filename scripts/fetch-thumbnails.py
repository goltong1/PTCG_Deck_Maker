import json,io,concurrent.futures,urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
xs=json.loads((root/'scripts/thumbnail-selection.json').read_text())
def f(x):
 p=root/'public/images'/ (x['id']+'.webp')
 if p.exists():return True
 try:
  r=urllib.request.urlopen(x['url'],timeout=35);im=Image.open(io.BytesIO(r.read())).convert('RGB');im.thumbnail((440,620));im.save(p,'WEBP',quality=88);return True
 except Exception as e:print('Image unavailable',x['id'],str(e),flush=True);return False
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(f,xs))
m=json.loads((root/'public/data/meta.json').read_text());m['cachedImages']=sum(results);(root/'public/data/meta.json').write_text(json.dumps(m,ensure_ascii=False,indent=2));print('Thumbnails',sum(results),'/',len(xs),flush=True)
