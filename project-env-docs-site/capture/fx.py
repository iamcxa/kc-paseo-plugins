import json,sys
S,ID=sys.argv[1],sys.argv[2]
json.dump({"version":1,"values":{"projects":[]}},open(f"{S}/home/plugin-settings/{ID}/projects.json","w"))
