import json,sys
S,ID=sys.argv[1],sys.argv[2]
v=lambda n,r:{"name":n,"ref":r}
projects=[{"root":S+"/work","serviceAccount":"sa-a","vault":"Dev","prompt":"","variables":[v("ITEM_0_KEY","op://Dev/Item 1/KEY_1")]}]
json.dump({"version":1,"values":{"projects":projects}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
