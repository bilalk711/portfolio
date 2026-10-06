import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
root=Path('output/outreach')
path=root/'paced-outreach-2026-10-06.json'
q=json.loads(path.read_text(encoding='utf-8-sig'))
s=json.loads((root/'sent-confirmation-new-01.json').read_text(encoding='utf-8-sig'))
p=next(x for x in q['prospects'] if x['id']=='new-01')
assert p['status']=='sending' and p['to']==s['to'] and p['subject']==s['subject']
local=datetime.fromisoformat(s['sent_at'].replace('Z','+00:00')).astimezone(timezone(timedelta(hours=5))).isoformat()
p.update(status='sent',sent_message_id=s['sent_message_id'],sent_thread_id=s['sent_thread_id'],sent_at=local,sent_folder_verified=True)
q['last_sent_at']=local
q['last_run_at']=datetime.now(timezone(timedelta(hours=5))).isoformat()
q['last_run_result']='Sent and verified one scheduled email to Draxion.'
temp=path.with_suffix('.tmp')
temp.write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
temp.replace(path)
sent=[x for x in q['prospects'] if x['status']=='sent']
report=root/'paced-outreach-2026-10-06.md'
text=report.read_text(encoding='utf-8')
progress='## Delivery progress\n\n'+str(len(sent))+' confirmed sent; '+str(len(q['prospects'])-len(sent))+' remaining in the queue.\n\n'
for item in sent:
    progress+='- '+item['company']+' — '+item['to']+' — '+item['sent_at']+' — Gmail SENT verified ('+item['sent_message_id']+').\n'
if '## Delivery progress' not in text:
    lines=text.splitlines()
    lines[2:2]=[progress]
    report.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'state':q['state'],'sent':len(sent),'remaining':len(q['prospects'])-len(sent),'last_sent_at':q['last_sent_at'],'sent_folder_verified':p['sent_folder_verified']}))

