import sys, shutil
name, out = sys.argv[1:]
shutil.rmtree(out, ignore_errors=True); shutil.copytree("/tmp/pe-rowv3/cand", out, symlinks=True)
def sub(path, old, new):
    p=f"{out}/project-env/{path}"; s=open(p).read(); assert s.count(old)==1,(name,old,s.count(old)); open(p,"w").write(s.replace(old,new))
O="client/open-project.ts"; M="shared/test-marks.ts"
if name=="alwaysshow": sub(M,"return unchanged(draft, failure)\n      ? [{ text: `Test failed: ${failure.message}`, tone: \"bad\" }]\n      : [{ text: \"Not tested since changes\", tone: \"muted\" }];","return [{ text: `Test failed: ${failure.message}`, tone: \"bad\" }];")
elif name=="keepfailure": sub(O,"set({ ...current, run: undefined, failure: undefined, tests, testing: true });","set({ ...current, run: undefined, tests, testing: true });")
elif name=="inputsignored": sub(M,"    sameInputs(draft, run.sent) &&\n","")
else: raise SystemExit("unknown")
