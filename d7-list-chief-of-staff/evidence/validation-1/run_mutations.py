"""Run bounded probes in an ignored, uniquely owned copy of exact candidate bytes."""
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import sys

HERE=Path(__file__).resolve().parent
WT=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d7-list-chief-of-staff')
PKG=WT/'spacedock-bridge'
HEAD='3fbbdfb9845ba04935e1d703c837e3d1ab26542b'
REPLAY_ONLY='--replay-only' in sys.argv
PREFIX='additional-' if REPLAY_ONLY else ''
SENTENCE="Whenever you show a what-will-be-sent preview in a widget, also write the same complete preview as plain text in your reply, including each item's destination FO/agent id and exact proposed message, so it is readable in Bridge's conversation."
assert subprocess.check_output(['git','-C',str(WT),'rev-parse','HEAD'],text=True).strip()==HEAD
assert not subprocess.check_output(['git','-C',str(WT),'status','--porcelain'],text=True)
scratch=Path(tempfile.mkdtemp(prefix='.d7-validation-',dir=PKG/'node_modules'))
results=[]
def run(name,cmd,expected):
    with (HERE/(PREFIX+name+'.log')).open('x') as out:
        result=subprocess.run(cmd,cwd=scratch,stdout=out,stderr=subprocess.STDOUT,env=env)
    results.append({'name':name,'command':cmd,'exit':result.returncode,'expected':expected})
    assert result.returncode==expected,(name,result.returncode)
env=dict(__import__('os').environ,D7_EVIDENCE=str(HERE.parent))
try:
    files=subprocess.check_output(['git','-C',str(WT),'ls-files','spacedock-bridge'],text=True).splitlines()
    for name in files:
        target=scratch/Path(name).relative_to('spacedock-bridge');target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(subprocess.check_output(['git','-C',str(WT),'show',HEAD+':'+name]))
    (scratch/'node_modules').symlink_to(PKG/'node_modules',target_is_directory=True)
    (scratch/'native-replay.test.mts').write_bytes((HERE/'native-replay.test.mts.txt').read_bytes())
    run('native-replay',['node','--import','tsx','--test','native-replay.test.mts'],0)
    if REPLAY_ONLY:
        raise SystemExit(0)
    run('mutation-source-control',['node','--import','tsx','--test','test/chief-list.test.mts','test/coordinator-switch.test.mts'],0)
    source=scratch/'shared/chief.ts';original=source.read_text()
    assert original.count(' || since <= this.observedAt')==1
    source.write_text(original.replace(' || since <= this.observedAt',''))
    run('mutation-old-admitted',['node','--import','tsx','--test','--test-name-pattern=list input applies','test/chief-list.test.mts'],1)
    source.write_text(original)
    prompt=scratch/'shared/coordinator.ts';original=prompt.read_text()
    assert original.count(SENTENCE)==1
    prompt.write_text(original.replace(SENTENCE,''))
    run('mutation-text-preview-removed',['node','--import','tsx','--test','--test-name-pattern=widget previews','test/coordinator-switch.test.mts'],1)
    prompt.write_text(original)
    run('mutation-early-relay',['python3',str(HERE/'audit_evidence.py'),'early-relay','EvidenceChecks.test_no_relay_on_all_recommendations_before_separate_confirmation'],1)
    run('mutation-permission-relay',['python3',str(HERE/'audit_evidence.py'),'permission-relay','EvidenceChecks.test_permission_never_relayed_or_decided'],1)
finally:
    assert scratch.parent==PKG/'node_modules' and scratch.name.startswith('.d7-validation-')
    shutil.rmtree(scratch)
    with (HERE/(PREFIX+'mutations.json')).open('x') as out:
        json.dump({'head':HEAD,'results':results,'scratchDeleted':not scratch.exists(),'limit':'Old admission and text preview mutate candidate source. Early/permission relays mutate saved native traces to falsify offline acceptance checks, not model behavior or a code-enforced relay guard.'},out,indent=2)
    assert not subprocess.check_output(['git','-C',str(WT),'status','--porcelain'],text=True)
print(json.dumps(results,indent=2))
