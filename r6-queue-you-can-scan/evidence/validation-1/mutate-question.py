from pathlib import Path
import tempfile,shutil,subprocess,json,sys
WT=Path("/Users/kent/Project/kc-paseo-plugins/.worktrees/spacedock-ensign-r6-queue-you-can-scan")
def main():
 root=Path(tempfile.mkdtemp(prefix=".validation-mutation-",dir=WT))
 ev=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).parent
 if len(sys.argv)>1: ev.mkdir(parents=True,exist_ok=False)
 try:
  plugin=root/"spacedock-bridge"
  shutil.copytree(WT/"spacedock-bridge",plugin,ignore=shutil.ignore_patterns("node_modules"))
  (plugin/"node_modules").symlink_to(WT/"spacedock-bridge/node_modules",target_is_directory=True)
  q=plugin/"shared/queue.ts"; before=q.read_text(); target="if (reply?.onCaptain && reply.preview)"
  assert before.count(target)==1
  q.write_text(before.replace(target,"if (false && reply?.onCaptain && reply.preview)"))
  result=subprocess.run([str(plugin/"node_modules/.bin/tsx"),"--test","test/board-question-preview.test.mts"],cwd=plugin,capture_output=True,text=True)
  (ev/"mutation.log").write_text(result.stdout+result.stderr)
  assert result.returncode!=0 and "show the actual unread question exactly once" in result.stdout, result.stderr
  report=dict(candidate="f10a3f29a43fb09adff4beda268799f514f7b43b",mutation="Disable unread fallback in shared buildQueue",exit=result.returncode,assertion="show the actual unread question exactly once",temporaryCopy=str(root))
 finally:
  shutil.rmtree(root)
 report["temporaryCopyRemoved"]=not root.exists()
 (ev/"mutation.json").write_text(json.dumps(report,indent=2)+"\n")
 print("PASS: shared-builder mutation rejected by mounted two-view table test; copy removed")
if __name__=="__main__":main()
