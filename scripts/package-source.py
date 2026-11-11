from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
out=root/'public/downloads/PTCG_Canvas.zip'
out.parent.mkdir(parents=True,exist_ok=True)
allowed_dirs={'.github','public','scripts','tests','docs'}
allowed_files={'package.json','package-lock.json','README.md','DEPLOY_GITHUB.md','DATA_LICENSE.txt','BUILD_INFO.json','dev-server.mjs','.gitignore','.gitattributes'}
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(root.rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or p.is_symlink() or any(x in ['.git','.openai','.sites','node_modules','dist','downloads','__pycache__'] for x in rel.parts):continue
  if rel.parts[0] not in allowed_dirs and str(rel) not in allowed_files:continue
  if p.name.startswith('.env') or p.suffix in {'.pyc','.tar','.gz'} and rel.parts[0]!='public':continue
  z.write(p,str(rel))
print(out, out.stat().st_size)
