import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
from collections import Counter
root=Path('output/outreach')
path=root/'paced-outreach-2026-10-06.json'
q=json.loads(path.read_text(encoding='utf-8-sig'))
assert q['state']=='queued' and not any(p['status']=='sending' for p in q['prospects'])
now=datetime.now(timezone(timedelta(hours=5)))
backup=root/'paced-outreach-before-two-hour-change-2026-10-06.json'
if not backup.exists(): backup.write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
pending=[p for p in q['prospects'] if p['status']=='drafted']
slots=[]
day=now.replace(hour=0,minute=0,second=0,microsecond=0)
while len(slots)<len(pending):
    if day.weekday()<5:
        for hour in [9,11,13,15,17]:
            slot=day.replace(hour=hour,minute=20)
            if slot>now: slots.append(slot)
            if len(slots)==len(pending): break
    day+=timedelta(days=1)
for p,slot in zip(pending,slots):
    p.setdefault('previous_scheduled_at',p['scheduled_at'])
    p['scheduled_at']=slot.isoformat()
q['daily_max']=5
q.pop('minimum_gap_hours',None)
q['target_interval_hours']=2
q['pacing_mode']='fixed_two_hour_weekday_slots'
q['daily_send_slots']=['09:20','11:20','13:20','15:20','17:20']
q['sending_window']='Monday-Friday, 09:00-19:00 Asia/Karachi'
q['schedule_updated_at']=now.isoformat()
q['schedule_change_authorization']='User requested changing the task interval so at least one email is sent every two hours. This supersedes prior randomized intervals and three-per-day cap; existing weekday daytime window and recipient order retained.'
q['scheduler_note']='One email at each two-hour weekday slot: 09:20, 11:20, 13:20, 15:20 and 17:20 PKT. Maximum five per weekday, one per slot. Execution timing can vary; missed runs shift later without catch-up bursts.'
for p in q['prospects']:
    if p['status']=='sent' and 'sent_slot_at' not in p:
        when=datetime.fromisoformat(p['sent_at'])
        p['sent_slot_at']=when.replace(hour=min([9,11,13,15,17],key=lambda h:abs((when.hour*60+when.minute)-(h*60+20))),minute=20,second=0,microsecond=0).isoformat()
q['expansion']['new_target_times_randomized']=False
q['expansion']['existing_schedules_preserved']=False
q['expansion']['schedule_superseded_by']='User-requested two-hour weekday cadence'
counts=Counter(p['scheduled_at'][:10] for p in pending)
assert max(counts.values())<=5 and len(pending)==41
assert all(t.weekday()<5 for t in slots)
assert all((b-a).total_seconds()>=7200 for a,b in zip(slots,slots[1:]))
temp=path.with_suffix('.tmp')
temp.write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
temp.replace(path)
expanded=root/'expanded-drafts-2026-10-06.json'
e=json.loads(expanded.read_text(encoding='utf-8-sig'))
by_id={p['id']:p for p in q['prospects']}
for p in e['prospects']:
    if p['id'] in by_id:
        p['scheduled_at']=by_id[p['id']]['scheduled_at']
e['pacing_mode']=q['pacing_mode']
expanded.write_text(json.dumps(e,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
lines=['# Personalized outreach schedule — two-hour cadence','','42 total prospects: 1 confirmed sent and 41 pending at the time of this schedule change.','','One email per two-hour slot on weekdays: 09:20, 11:20, 13:20, 15:20 and 17:20, Asia/Karachi (UTC+5). Maximum five per weekday. Recipient order retained. No catch-up bursts; missed runs or blocked messages can delay completion.','','| Target time (PKT) | Company | Contact | Status | Role | Source |','| --- | --- | --- | --- | --- | --- |']
for p in q['prospects']:
    when=p.get('sent_at',p['scheduled_at']) if p['status']=='sent' else p['scheduled_at']
    lines.append(f"| {datetime.fromisoformat(when):%d %b %Y %H:%M} | {p['company']} | {p['to']} | {p['status']} | {p['role']} | [Listing]({p['source_url']}) |")
lines+=['','## Personalized messages','']
for p in q['prospects']:
    lines += [f"### {p['company']}",'',f"To: {p['to']}",f"Subject: {p['subject']}",f"Target: {p['scheduled_at']}",f"Status: {p['status']}",f"Source: {p['source_url']}",'',p['body'],'']
(root/'paced-outreach-2026-10-06.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'pending':len(pending),'next':pending[0]['scheduled_at'],'last':pending[-1]['scheduled_at'],'daily_max':q['daily_max'],'slots':q['daily_send_slots'],'first_company':pending[0]['company']},indent=2))

