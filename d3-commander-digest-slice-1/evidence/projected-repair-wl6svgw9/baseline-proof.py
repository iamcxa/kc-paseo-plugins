from pathlib import Path
import subprocess,tempfile,tarfile,io,shutil,hashlib,json
w=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1');e=Path(__file__).resolve().parent;root=Path(tempfile.mkdtemp(prefix='.projected-before-',dir=w));baseline='ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43'
try:
 data=subprocess.check_output(['git','-C',str(w),'archive',baseline,'spacedock-bridge'])
 with tarfile.open(fileobj=io.BytesIO(data)) as t:t.extractall(root,filter='data')
 p=root/'spacedock-bridge';(p/'node_modules').symlink_to(w/'spacedock-bridge/node_modules',target_is_directory=True)
 test=w/'spacedock-bridge/test/projected-timeline.test.mts';shutil.copyfile(test,p/'test/projected-timeline.test.mts')
 with (e/'baseline-complete.log').open('w') as log:r=subprocess.run(['node','--import','tsx','--test','--test-reporter=tap','test/projected-timeline.test.mts'],cwd=p,stdout=log,stderr=log)
 result={'baseline':baseline,'exit':r.returncode,'testSha256':hashlib.sha256(test.read_bytes()).hexdigest(),'method':'Unchanged baseline archive; copy only final new test file; installed dependencies symlinked. No mutation of either candidate or live checkout.'};(e/'baseline-binding-complete.json').write_text(json.dumps(result,indent=2));assert r.returncode==1;print(json.dumps(result))
finally:shutil.rmtree(root)
