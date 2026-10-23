import sys, shutil, os
name, out = sys.argv[1:]
shutil.rmtree(out, ignore_errors=True); shutil.copytree("/tmp/pe-rowv2/cand", out, symlinks=True)
def sub(path, old, new):
    p=f"{out}/project-env/{path}"; s=open(p).read(); assert s.count(old)==1,(name,old,s.count(old)); open(p,"w").write(s.replace(old,new))
O="client/open-project.ts"
if name=="keeprun": sub(O,"set({ ...current, run: undefined, failure: undefined, tests, testing: true });","set({ ...current, failure: undefined, tests, testing: true });")
elif name=="keepfailure": sub(O,"set({ ...current, run: undefined, failure: undefined, tests, testing: true });","set({ ...current, run: undefined, tests, testing: true });")
elif name=="older": sub(O,"if (!current || test !== current.tests || (session !== undefined && session !== current.session)) return;\n    set({ ...current, run, testing: false });","if (!current || (session !== undefined && session !== current.session)) return;\n    set({ ...current, run, testing: false });")
elif name=="nofail": sub(O,"set({ ...current, failure, testing: false });","set({ ...current, testing: false });")
elif name=="nottesting": sub(O,"set({ ...current, run: undefined, failure: undefined, tests, testing: true });","set({ ...current, run: undefined, failure: undefined, tests, testing: false });")
elif name=="stuck": sub(O,"set({ ...current, run, testing: false });","set({ ...current, run });")
else: raise SystemExit("unknown")
