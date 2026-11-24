import os,json,hashlib
from pathlib import Path
root=Path('.')
exclude_dirs={'.git','node_modules','.next','.turbo','dist','build','coverage'}
exclude_files={'P532-ARCHIVE-MANIFEST.json','P532-ARCHIVE-VERIFICATION.txt','build-manifest.py'}
files=[]
for base,dirs,names in os.walk(root):
 dirs[:]=[d for d in dirs if d not in exclude_dirs]
 for name in names:
  if name in exclude_files or name.endswith('.zip') or name.endswith('.sha256') or name.endswith('-ZIP-VERIFICATION.txt'): continue
  p=Path(base)/name
  if p.is_file():
   h=hashlib.sha256()
   with p.open('rb') as f:
    for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
   files.append({'path':str(p).replace('\\','/').removeprefix('./'),'size':p.stat().st_size,'sha256':h.hexdigest()})
files.sort(key=lambda x:x['path'])
manifest={'phase':'P532','baseline':'P531','manifest_excludes_self':True,'entryCount':len(files),'files':files}
Path('docs/phases/P532/P532-ARCHIVE-MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
