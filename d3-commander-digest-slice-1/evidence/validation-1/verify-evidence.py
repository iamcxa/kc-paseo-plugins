from pathlib import Path
import subprocess,json,hashlib,struct,os,socket
E=Path(__file__).parent
WT=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-d3-commander-digest-slice-1")
head="ee18aa51fb607e0f8c72c1099c5ff85b3dc8af43"
assert subprocess.check_output(["git","-C",str(WT),"rev-parse","HEAD"],text=True).strip()==head
required=["digest","replay-three-lines","source-about-0","source-before-0","source-now-0","replay-expanded-bottom","exit-discuss","exit-new-decision","exit-open-fo-arrival","open-fo-return","source-unavailable","switch-offer","switch-confirm","old-conversation-after-switch"]
artifacts=[]
all_states={1440:set(),360:set()}
for folder,width,height in [("desktop-4",1440,1000),("phone-2",360,780),("phone-switch-2",360,780)]:
 root=E/folder
 identity=json.loads((root/"source-identity.json").read_text())
 for name,expected in identity.items():assert hashlib.sha256((WT/"spacedock-bridge"/name).read_bytes()).hexdigest()==expected,name
 rows=json.loads((root/"observed.json").read_text())
 if folder=="phone-2":rows=rows[:17]
 all_states[width].update(r["state"] for r in rows)
 assert not any(r["overflow"] for r in rows)
 for r in rows:
  if r["state"] in ["exit-discuss","exit-new-decision"]:assert r["active"]=="Message Comms officer"
  p=root/(str(width)+"-"+r["state"]+".png");data=p.read_bytes();assert struct.unpack(">II",data[16:24])==(width,height)
  artifacts.append({"path":str(p.relative_to(E)),"sha256":hashlib.sha256(data).hexdigest(),"width":width,"height":height,"state":r["state"]})
 launch=json.loads((root/"launch.json").read_text());assert not Path(launch["home"]).exists()
 try:os.kill(launch["pid"],0)
 except ProcessLookupError:pass
 else:raise AssertionError("isolated PID remains")
 for port in launch["ports"]:
  assert port not in [6767,6787] and not 6860<=port<=6935
  with socket.socket() as s:s.settimeout(.2);assert s.connect_ex(("127.0.0.1",port))!=0
for p in E.glob("*/cleanup.json"):
 launch=json.loads((p.parent/"launch.json").read_text());assert not Path(launch["home"]).exists()
assert len(artifacts)==40 and all(all(s in all_states[w] for s in required) for w in [1440,360])
mutations=json.loads((E/"mutations.json").read_text());assert len(mutations)==7 and all(r["detected"] and r["baseline_exit"]==0 and r["failed_tests"] for r in mutations)
pr=json.loads((E/"pr-verified.json").read_text());assert pr["headRefOid"]==head and pr["state"]=="OPEN" and pr["isDraft"]
(E/"capture-binding.json").write_text(json.dumps({"candidate":head,"candidate_files_per_capture":len(identity),"artifacts":artifacts,"scope":"Real installed host UI and unchanged production JSX with fictional SDK/RPC; no provider or native-device proof."},indent=2))
print("PASS: 40 bound captures, 7 detected mutations, exact candidate, Draft PR, and both successful hosts cleaned")
