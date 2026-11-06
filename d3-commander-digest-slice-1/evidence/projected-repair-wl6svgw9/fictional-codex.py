#!/usr/bin/env python3
import json,sys,uuid,os
if '--version' in sys.argv:print('codex-cli 0.100.0');sys.exit()
thread='fictional-thread';n=0
out=lambda v:print(json.dumps(v),flush=True)
for line in sys.stdin:
 try:v=json.loads(line)
 except ValueError:continue
 method=v.get('method');params=v.get('params',{});result={}
 if method=='initialize':result={'userAgent':'codex-cli 0.100.0','platformFamily':'unix','platformOs':'macos'}
 elif method=='account/read':result={'account':{'type':'apiKey'},'requiresOpenaiAuth':False}
 elif method=='model/list':result={'data':[{'id':'fictional','model':'fictional','displayName':'Fictional','description':'Local deterministic fixture','isDefault':True,'supportedReasoningEfforts':[],'defaultReasoningEffort':'medium'}],'nextCursor':None}
 elif method=='config/read':result={'config':{'model':'fictional','model_provider':'openai','approval_policy':'never','sandbox_mode':'danger-full-access'},'origins':{},'layers':[]}
 elif method in ('thread/start','thread/resume'):
  result={'thread':{'id':thread,'preview':'','modelProvider':'openai','createdAt':1,'updatedAt':1,'path':None,'cwd':os.getcwd(),'cliVersion':'0.100.0','source':'cli','turns':[]},'model':'fictional','modelProvider':'openai','cwd':os.getcwd(),'approvalPolicy':'never','sandbox':{'type':'dangerFullAccess'},'reasoningEffort':None}
 elif method=='thread/read':result={'thread':{'id':thread,'turns':[]}}
 elif method=='turn/start':
  n+=1;turn='fictional-turn-'+str(n);item='fictional-item-'+str(n)
  out({'id':v['id'],'result':{'turn':{'id':turn,'status':'inProgress','items':[],'error':None}}})
  out({'method':'turn/started','params':{'threadId':thread,'turn':{'id':turn,'status':'inProgress','items':[],'error':None}}})
  text='Fictional report '+str(n)
  out({'method':'item/agentMessage/delta','params':{'threadId':thread,'turnId':turn,'itemId':item,'delta':text}})
  out({'method':'item/agentMessage/delta','params':{'threadId':thread,'turnId':turn,'itemId':item,'delta':' with merged local fixture text.'}})
  out({'method':'item/completed','params':{'threadId':thread,'turnId':turn,'item':{'type':'agentMessage','id':item,'text':text+' with merged local fixture text.','phase':'final_answer'}}})
  out({'method':'turn/completed','params':{'threadId':thread,'turn':{'id':turn,'status':'completed','items':[],'error':None}}});continue
 if 'id'in v:out({'id':v['id'],'result':result})
