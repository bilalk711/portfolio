import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
path = Path('output/outreach/paced-outreach-2026-10-06.json')
q = json.loads(path.read_text(encoding='utf-8-sig'))
now = datetime.now(timezone(timedelta(hours=5)))
p = next(x for x in q['prospects'] if x['id']=='new-01')
assert q['state']=='queued' and p['status']=='drafted'
assert now.weekday()<5 and 9<=now.hour<19
assert datetime.fromisoformat(p['scheduled_at'])<=now
sent_today=[x for x in q['prospects'] if x.get('sent_at','')[:10]==now.date().isoformat()]
assert len(sent_today)<3
if q.get('last_sent_at'):
    assert (now-datetime.fromisoformat(q['last_sent_at'])).total_seconds()>=7200
p['source_last_rechecked_at']=now.isoformat()
p['source_recheck_evidence']='Official careers page lists REQ-001 Senior Full-Stack Engineer as actively open, remote US hours; careers@draxion.io is the published Apply contact. 4+ years TypeScript/React/PostgreSQL required; no explicit residence restriction. Saved email discloses Pakistan and asks about eligibility and hours.'
p['pre_send_checks']={'account_verified':'bilalkazmi0711@gmail.com','sent_history_matches':0,'queue_sent_matches':0,'company_inbound_matches':0,'new_bounce_ids':[],'saved_draft_exact_match':True,'no_attachments':True,'checked_at':now.isoformat()}
p['status']='sending'
p['send_attempt_at']=now.isoformat()
temp=path.with_suffix('.tmp')
temp.write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
temp.replace(path)
print(json.dumps({'status':p['status'],'id':p['id'],'attempt':p['send_attempt_at']}))

