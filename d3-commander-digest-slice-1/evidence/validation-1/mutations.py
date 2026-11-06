from pathlib import Path
import subprocess,tempfile,shutil,json,re
wt=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1")
e=Path(__file__).parent
root=Path(tempfile.mkdtemp(prefix=".validation-mutations-",dir=wt))
copy=root/"spacedock-bridge"
shutil.copytree(wt/"spacedock-bridge",copy,ignore=shutil.ignore_patterns("node_modules"))
(copy/"node_modules").symlink_to(wt/"spacedock-bridge/node_modules",target_is_directory=True)
custom=copy/"test/independent-hash.test.mts"
custom.write_text('''import assert from "node:assert/strict";
import { test } from "node:test";
import { reportSource,validateDigest } from "../server/report-sources";
test("independent reread hash mismatch hides the point",async()=>{
 const original:any={seqStart:3,seqEnd:3,sourceSeqRanges:[{startSeq:3,endSeq:3}],collapsed:[],timestamp:"2026-11-06",item:{type:"assistant_message",text:"Exact report"}};
 const source=reportSource("host","fo","epoch",original)!;
 const raw:any={roundId:"round",collectedAt:"now",points:[{pointId:"p",sentence:"DO NOT EXPOSE",sources:[source],contextLines:["about","before","now"].map(kind=>({kind,sentence:kind,refs:[source]}))}]};
 const round={roundId:"round",collectedAt:"now",hostId:"host",agentId:"co",sources:[source]};
 const read:any=async()=>({agentId:"fo",epoch:"epoch",projection:"canonical",reset:false,gap:false,staleCursor:false,error:null,entries:[{...original,item:{...original.item,text:"Altered report"}}]});
 assert.equal((await validateDigest(raw,round,read))?.points[0].valid,false);
});''')
mutations=[
("wrong-round","server/report-sources.ts","parsed.data.roundId !== round.roundId || ","", "reject round without exposing unverified text","digest.test.mts"),
("foreign-source","server/report-sources.ts","members.has(key) ? readSource","true ? readSource","reject foreign without exposing unverified text","digest.test.mts"),
("hash-mismatch","server/report-sources.ts",'sourceKey(reportSource(hostId, source.agentId, page.epoch, entry) ?? { ...source, textHash: "" }) !== sourceKey(source)',"false","independent reread hash mismatch hides the point","independent-hash.test.mts"),
("missing-line-ref","shared/digest.ts","refs: z.array(sourceSchema).min(1).max(12)","refs: z.array(sourceSchema).min(0).max(12)","reject missing without exposing unverified text","digest.test.mts"),
("agent-notice-ends-collection","shared/commander-replies.ts",'&& !parseEnvelope(text)',"", "collection provenance survives agent-notification before malformed output","digest-ui.test.mts"),
("rejected-question-reader","client/use-co-ask.ts",' && last.provenance === "ordinary"',"", "no rejected collection prose question in desktop card and header after none","commander-ui.test.mts"),
("whole-failure-keeps-context","client/digest.tsx",'catch { if (id === request.current) { setError("來源不可用"); setWindow(null); } }', 'catch { if (id === request.current) { setLoading(false); } }',"whole","digest-boundaries.test.mts"),
]
results=[]
def run(name,testfile,pattern=None):
 args=[str(copy/"node_modules/.bin/tsx"),"--test"]
 if pattern:args += ["--test-name-pattern",pattern]
 args += ["test/"+testfile]
 p=subprocess.run(args,cwd=copy,text=True,capture_output=True,timeout=90)
 (e/(name+".log")).write_text(p.stdout+p.stderr)
 failed=list(dict.fromkeys(re.sub(r" \(.*ms\)$", "", line[2:]) for line in p.stdout.splitlines() if line.startswith("✖ ") and line != "✖ failing tests:"))
 return p.returncode,failed
try:
 for name,file,old,new,pattern,testfile in mutations:
  p=copy/file;s=p.read_text();assert s.count(old)==1,(name,s.count(old))
  before,bfail=run(name+"-baseline",testfile,pattern)
  assert before==0,(name,"baseline failed",bfail)
  p.write_text(s.replace(old,new))
  try: code,fail=run(name+"-mutant",testfile,pattern)
  finally:p.write_text(s)
  result={"mutation":name,"file":file,"from":old,"to":new,"baseline_exit":before,"mutant_exit":code,"failed_tests":fail,"detected":code!=0 and bool(fail)}
  results.append(result);(e/"mutations.json").write_text(json.dumps(results,indent=2));print(json.dumps(result),flush=True)
finally:
 shutil.rmtree(root)
 (e/"mutation-cleanup.json").write_text(json.dumps({"root":str(root),"removed":not root.exists()}))
assert len(results)==7 and all(r["detected"] for r in results)
