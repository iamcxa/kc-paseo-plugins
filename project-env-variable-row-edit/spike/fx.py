import json,sys
S="/tmp/variable-row-edit-spike-r15"
names=json.loads(sys.argv[1])
vars=[{"name":n,"ref":r} for n,r in names]
json.dump({"version":1,"values":{"projects":[{"root":S+"/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":vars}]}},open(S+"/home/plugin-settings/row-edit-spike/projects.json","w"))
