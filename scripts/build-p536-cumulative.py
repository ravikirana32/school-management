from pathlib import Path
import hashlib,json,zipfile
root=Path.cwd();out=Path('/mnt/data');zip_path=out/'school-management-saas-P536-cumulative.zip';manifest_path=root/'P536-ARCHIVE-MANIFEST.json';verify_path=root/'P536-ARCHIVE-VERIFICATION.txt'
baseline=json.loads((root/'P535-ARCHIVE-MANIFEST.json').read_text())
def manifest_rows():
 rows=[]
 for p in sorted(root.rglob('*')):
  if p.is_file() and p!=manifest_path:
   b=p.read_bytes();rows.append({'path':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'size':len(b)})
 return rows
def makezip():
 with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in sorted(root.rglob('*')):
   if p.is_file():z.write(p,p.relative_to(root).as_posix())
def facts():
 with zipfile.ZipFile(zip_path) as z:
  names=z.namelist();missing=[];mismatch=[]
  for r in manifest['files']:
   if r['path'] not in names:missing.append(r['path'])
   elif hashlib.sha256(z.read(r['path'])).hexdigest()!=r['sha256']:mismatch.append(r['path'])
  return {'size':zip_path.stat().st_size,'entries':len(names),'manifest_count':len(manifest['files']),'crc':z.testzip(),'duplicates':len(names)-len(set(names)),'missing':missing,'mismatch':mismatch,'baseline_missing':[r['path'] for r in baseline['files'] if r['path'] not in names],'open_copies':len(list(root.rglob('MASTER-OPEN-GAPS-REGISTER.md'))),'active_copies':len(list(root.rglob('MASTER-ACTIVE-GAPS-REGISTER.md')))}
def sync_ok():
 return all(p.read_bytes()==(root/'MASTER-OPEN-GAPS-REGISTER.md').read_bytes() for p in root.rglob('MASTER-OPEN-GAPS-REGISTER.md')) and all(p.read_bytes()==(root/'MASTER-ACTIVE-GAPS-REGISTER.md').read_bytes() for p in root.rglob('MASTER-ACTIVE-GAPS-REGISTER.md'))
manifest={'phase':'P536','baseline':'P535','files':manifest_rows()};manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
for _ in range(6):
 makezip();f=facts();sync=sync_ok();result=(f['crc'] is None and f['duplicates']==0 and not f['missing'] and not f['mismatch'] and not f['baseline_missing'] and sync)
 report='\n'.join(['P536 ZIP VERIFICATION','Archive: school-management-saas-P536-cumulative.zip',f"Size bytes: {f['size']}",f"ZIP entries: {f['entries']}",f"Manifest entries: {f['manifest_count']}",f"CRC: {'PASS' if f['crc'] is None else f['crc']}",f"Duplicate entries: {f['duplicates']}",f"Manifest files missing from archive: {len(f['missing'])}",f"Manifest hash mismatches: {len(f['mismatch'])}",f"P535 baseline manifest files missing: {len(f['baseline_missing'])}",f"Gap-register copies: {f['open_copies']+f['active_copies']}",f"Open gap registers: {f['open_copies']}",f"Active gap registers: {f['active_copies']}",f"Gap-register synchronization: {'PASS' if sync else 'FAIL'}",f"Result: {'PASS' if result else 'FAIL'}",''])
 old=verify_path.read_text() if verify_path.exists() else None
 verify_path.write_text(report);(root/'docs/phases/P536/P536-ARCHIVE-VERIFICATION.txt').write_text(report)
 manifest={'phase':'P536','baseline':'P535','files':manifest_rows()};manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
 if old==report:break
makezip();f=facts();assert f['crc'] is None and f['duplicates']==0 and not f['missing'] and not f['mismatch'] and not f['baseline_missing'] and sync_ok(),f
checksum=hashlib.sha256(zip_path.read_bytes()).hexdigest();(out/'school-management-saas-P536-cumulative.zip.sha256').write_text(f'{checksum}  {zip_path.name}\n')
print(json.dumps(f,indent=2));print('SHA256',checksum)
