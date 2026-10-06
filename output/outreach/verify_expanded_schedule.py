import json
from pathlib import Path
from collections import Counter
from datetime import datetime
base = Path('output/outreach').resolve()
for name in ['paced-outreach-2026-10-06.json','expanded-drafts-2026-10-06.json','expanded-prospect-research-2026-10-06.json']:
    path = base / name
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    for p in data.get('prospects', data.get('candidates', [])):
        if p['company'] == 'Memara':
            p['domains'] = ['memara.io']
    if name == 'paced-outreach-2026-10-06.json':
        data['automation_status_verified'] = 'ACTIVE'
        data['automation_status_checked_at'] = '2026-10-06T03:36:00+05:00'
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
temp = base / 'resume-attachment-base64.tmp'
assert temp.parent == base
temp.unlink(missing_ok=True)
q = json.loads((base / 'paced-outreach-2026-10-06.json').read_text(encoding='utf-8'))
assert q['state'] == 'queued' and len(q['prospects']) == 42
assert all(p.get('draft_verified') and p.get('draft_id') and p.get('draft_message_id') for p in q['prospects'])
assert len(set(p['to'].lower() for p in q['prospects'])) == 42
assert len(set(p['draft_id'] for p in q['prospects'])) == 42
days = Counter(p['scheduled_at'][:10] for p in q['prospects'])
times = sorted(datetime.fromisoformat(p['scheduled_at']) for p in q['prospects'])
assert max(days.values()) <= 3
assert all((b-a).total_seconds() >= 7200 for a,b in zip(times,times[1:]))
assert all(t.weekday()<5 and 9 <= t.hour <19 for t in times)
print(json.dumps({'new':q['expansion']['added_count'],'total':len(q['prospects']),'automation':q['automation_status_verified'],'all_drafts_verified':True,'daily_max':max(days.values()),'first':times[0].isoformat(),'last':times[-1].isoformat()},indent=2))

