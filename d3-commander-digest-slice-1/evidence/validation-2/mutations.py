from pathlib import Path
import subprocess,tempfile,shutil,json,re

wt=Path('/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1')
out=Path(__file__).parent
root=Path(tempfile.mkdtemp(prefix='.validation2-mutations-',dir=wt))
package=root/'spacedock-bridge'
shutil.copytree(wt/'spacedock-bridge',package,ignore=shutil.ignore_patterns('node_modules'))
(package/'node_modules').symlink_to(wt/'spacedock-bridge/node_modules',target_is_directory=True)
(package/'test/independent-validation.test.mts').write_text('''import assert from 'node:assert/strict';
import {test} from 'node:test';
import {reportSource,validateDigest} from '../server/report-sources';
test('independent exact membership still refuses changed read-back hash',async()=>{
 const original:any={seqStart:2,seqEnd:6,sourceSeqRanges:[{startSeq:2,endSeq:6}],collapsed:['assistant_merge'],timestamp:'2026-11-06',item:{type:'assistant_message',text:'Fictional original report'}};
 const source=reportSource('host','fo','epoch',original)!;
 const raw:any={roundId:'round',collectedAt:'now',points:[{pointId:'p',sentence:'Must stay hidden',sources:[source],contextLines:['about','before','now'].map(kind=>({kind,sentence:kind,refs:[source]}))}]};
 const round={roundId:'round',collectedAt:'now',hostId:'host',agentId:'co',sources:[source]};
 const read:any=async()=>({agentId:'fo',epoch:'epoch',projection:'projected',reset:false,gap:false,staleCursor:false,error:null,entries:[{...original,item:{...original.item,text:'Fictional changed report'}}],agent:{status:'idle'},hasOlder:false,hasNewer:false});
 assert.equal((await validateDigest(raw,round,read))?.points[0].valid,false);
});
''')
mutations=[
 ('wrong-round','server/report-sources.ts','parsed.data.roundId !== round.roundId || ','','digest.test.mts','reject round without exposing unverified text'),
 ('foreign-source','server/report-sources.ts','members.has(key) ? readSource','true ? readSource','digest.test.mts','reject foreign without exposing unverified text'),
 ('hash-mismatch','server/report-sources.ts','sourceKey(reportSource(hostId, source.agentId, page.epoch, entry) ?? { ...source, textHash: "" }) !== sourceKey(source)','false','independent-validation.test.mts','independent exact membership'),
 ('missing-line-ref','shared/digest.ts','refs: z.array(sourceSchema).min(1).max(12)','refs: z.array(sourceSchema).min(0).max(12)','digest.test.mts','reject missing without exposing unverified text'),
 ('agent-notice-ends-collection','shared/commander-replies.ts','&& !parseEnvelope(text)','','digest-ui.test.mts','collection provenance survives agent-notification'),
 ('rejected-question-reader','client/use-co-ask.ts',' && last.provenance === "ordinary"','','commander-ui.test.mts','no rejected collection prose question in desktop card and header after none'),
 ('refuse-merged-entry','shared/timeline.ts','return sequence(entry.seqStart)','return entry.seqStart === entry.seqEnd && sequence(entry.seqStart)','projected-timeline.test.mts','projected first is a healthy page'),
 ('refuse-collapsed-entry','shared/timeline.ts','Array.isArray(entry.collapsed) &&','Array.isArray(entry.collapsed) && entry.collapsed.length === 0 &&','projected-timeline.test.mts','a projected source hashes the entire merged entry'),
 ('accept-writing-source','server/report-sources.ts','entryIsWriting(page, entry) || ','','projected-timeline.test.mts','an assistant entry still being written is not an exact source'),
 ('no-identical-completion-reread','client/use-verification.ts','if (cancelled || disconnected || !connected) return;','if (true) return;','verification-lifecycle.test.mts','Commander turn_completed re-verifies identical completed content without a click'),
]
results=[]
def run(label,file,pattern):
 p=subprocess.run(['node','--import','tsx','--test','--test-reporter=tap','--test-name-pattern',pattern,'test/'+file],cwd=package,text=True,capture_output=True,timeout=100)
 (out/(label+'.log')).write_text(p.stdout+p.stderr)
 failures=re.findall(r'^not ok \d+ - (.+)$',p.stdout,re.M)
 count=len(re.findall(r'^ok \d+ - ',p.stdout,re.M))
 return p.returncode,failures,count
try:
 for name,file,old,new,test,pattern in mutations:
  path=package/file;original=path.read_text();assert original.count(old)==1,(name,original.count(old))
  baseline,failed,passed=run(name+'-baseline',test,pattern)
  assert baseline==0 and passed>0,(name,'baseline',baseline,failed,passed)
  path.write_text(original.replace(old,new))
  try:code,failed,_=run(name+'-mutant',test,pattern)
  finally:path.write_text(original)
  row={'mutation':name,'file':file,'from':old,'to':new,'baseline_exit':baseline,'baseline_tests':passed,'mutant_exit':code,'failed_tests':failed,'detected':code!=0 and bool(failed)}
  results.append(row);(out/'mutations.json').write_text(json.dumps(results,indent=2));print(json.dumps(row),flush=True)
finally:
 shutil.rmtree(root)
 (out/'mutation-cleanup.json').write_text(json.dumps({'path':str(root),'removed':not root.exists()}))
assert len(results)==10 and all(r['detected'] for r in results)
