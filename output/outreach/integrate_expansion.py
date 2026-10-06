import json, random, shutil
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter
root = Path('output/outreach')
queue_path = root / 'paced-outreach-2026-10-06.json'
queue = json.loads(queue_path.read_text(encoding='utf-8-sig'))
exp = json.loads((root / 'expanded-drafts-2026-10-06.json').read_text(encoding='utf-8-sig'))
by_id = {p['id']: p for p in exp['prospects']}
for journal in sorted(root.glob('expanded-draft-journal-2026-10-06-*.json')):
    data = json.loads(journal.read_text(encoding='utf-8-sig'))
    for entry in data.get('prospects', [data]):
        p = by_id[entry['id']]
        assert p['to'].lower() == entry['to'].lower()
        p.update(draft_id=entry['draft_id'], draft_message_id=entry['draft_message_id'], status='drafted')
verification = json.loads((root / 'expanded-draft-verification-2026-10-06.json').read_text(encoding='utf-8-sig'))
for result in verification['results']:
    assert not result['errors'], result
    p = by_id[result['id']]
    p['draft_verified'] = True
    p['attachment_verified'] = bool(result['attachment'])
    if p['attachment_required']:
        p['attachment_bytes'] = 73938
        p['attachment_path'] = 'C:/Users/dell/Desktop/Bilal_Kazmi_Senior_Full_Stack_AI_Engineer_Resume.pdf'
assert len(by_id) == 36 and all(p.get('draft_verified') for p in by_id.values())
assert not any(p['id'] in by_id for p in queue['prospects']), 'Expansion was already integrated'
existing = list(queue['prospects'])
assert len(existing) == 6 and all(p['status'] == 'drafted' for p in existing)
shutil.copyfile(queue_path, root / 'paced-outreach-before-expansion-2026-10-06.json')
rng = random.SystemRandom()
new = list(by_id.values())
rng.shuffle(new)
day = datetime.fromisoformat(max(p['scheduled_at'] for p in existing)).replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
windows = [(9*60+5,10*60+25),(12*60+35,14*60),(16*60+15,17*60+55)]
for i,p in enumerate(new):
    if i and i%3 == 0:
        day += timedelta(days=1)
    while day.weekday() >= 5:
        day += timedelta(days=1)
    minute = rng.randint(*windows[i%3])
    p['scheduled_at'] = (day + timedelta(minutes=minute)).isoformat()
    p['schedule_group'] = 'expansion-2026-10-06'
    p.setdefault('location_note', 'Remote listed; email discloses Islamabad, Pakistan (UTC+5). Geographic contracting eligibility is not independently guaranteed.')
    p['draft_verified_at'] = '2026-10-06T03:34:00+05:00'
    p['source_recheck_required'] = True
    p['source_recheck_max_age_days'] = 7
exp.update(state='queued', prospects=new, draft_verified_at='2026-10-06T03:34:00+05:00')
queue['prospects'] = existing + new
queue['expansion'] = {'added_at':'2026-10-06T03:34:00+05:00','requested_max_new':100,'added_count':36,'new_order_randomized':True,'existing_schedules_preserved':True,'new_target_times_randomized':True,'duplicates_checked':'All matching Gmail sent mail and drafts; no prior contacts found for the 36 additions','source_policy':'Currently listed official roles or explicitly labelled engineering inquiries. Most posting dates are unavailable; no claim all are newly posted. Recheck before scheduled sends.'}
queue['draft_verified_at'] = '2026-10-06T03:34:00+05:00'
queue['scheduler_note'] = 'Hourly weekday checks; one email at the first eligible check after its randomized target time, maximum three per local day and minimum two hours between confirmed sends. Exact-minute delivery is not guaranteed. Missed runs shift delivery later without bursts.'
queue['excluded'].extend([
{'company':'Dreamcafe','reason':'Careers page lists placeholder +1 (000) phone; uncertain business contact'},
{'company':'Next Soft Global','reason':'Careers page explicitly describes vacancies as demonstration listings'},
{'company':'EADPAG','reason':'Matching React/Node full-stack role specifies Bengaluru rather than remote'},
{'company':'Katixo','reason':'Engineering positions restricted to India'},
{'company':'Workli','reason':'Contracts currently supported only in Estonia, Vietnam and Bangladesh'},
{'company':'GetLaunchDay','reason':'Matching engineering role restricted to US/EU'},
{'company':'Forezyn Plan','reason':'Senior full-stack stack is C#/.NET/Angular rather than resume stack'},
{'company':'Belov Tech','reason':'Matching Python backend role specifies New York/USA'},
{'company':'Sista AI / D4H','reason':'Only future-opening or general talent-pool invitations confirmed'},
{'company':'In The Loop / CyberAtlas / Serevel','reason':'Application requests specific additional artifacts or personal evidence not established in provided materials; not fabricated or scheduled'}
])
all_p = queue['prospects']
assert len(all_p) == 42 and len(new) <= 100
assert len(set(p['to'].lower() for p in all_p)) == 42
counts = Counter(p['scheduled_at'][:10] for p in all_p)
assert max(counts.values()) <= queue['daily_max'] == 3
times = sorted(datetime.fromisoformat(p['scheduled_at']) for p in all_p)
assert all(t.weekday()<5 and 9 <= t.hour < 19 for t in times)
assert all((b-a).total_seconds() >= 7200 for a,b in zip(times,times[1:]))
assert existing == all_p[:6], 'Existing schedule modified'
queue_path.write_text(json.dumps(queue, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
(root / 'expanded-drafts-2026-10-06.json').write_text(json.dumps(exp, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
research = {'checked_at':'2026-10-06','limit_new':100,'qualified_new':36,'candidates':[ {k:v for k,v in p.items() if k not in ['body','html']} for p in new], 'excluded':queue['excluded']}
(root / 'expanded-prospect-research-2026-10-06.json').write_text(json.dumps(research, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
lines = ['# Personalized outreach schedule — 6 October 2026', '', '36 new prospects were added after checks against Gmail sent mail and existing drafts. Total queue: 42, including the original six.', '', 'Sending account: bilalkazmi0711@gmail.com. Both contract and full-time opportunities. All times are Asia/Karachi (UTC+5).', '', 'New prospect order and target times were randomized. The original six schedules were preserved. Maximum three per weekday, at least two hours between confirmed sends. Hourly automation checks may deliver after the target time. Missed runs move delivery later without catch-up bursts.', '', 'All 42 drafts were verified; 30 new application emails include the supplied resume. General-contact inquiries are labelled as inquiries. Public contacts are source-verified, not guaranteed deliverable. Most pages do not provide publication dates. Openings and recipient history must be rechecked immediately before sending.', '', '| Target time (PKT) | Company | Role / engagement | Contact | Source |', '| --- | --- | --- | --- | --- |']
for p in all_p:
    t=datetime.fromisoformat(p['scheduled_at'])
    lines.append(f"| {t:%d %b %Y %H:%M} | {p['company']} | {p['role'].replace('|','/')} / {p['engagement']} | {p['to']} | [Official listing]({p['source_url']}) |")
lines += ['', '## Personalized messages', '']
for p in all_p:
    lines += [f"### {p['company']}", '', f"To: {p['to']}", f"Subject: {p['subject']}", f"Target: {p['scheduled_at']}", f"Draft: {p['draft_id']}", f"Source: {p['source_url']}", f"Source status: {p['source_status']}", f"Location: {p.get('location_note','Remote')}", f"Resume attached: {'Yes' if p.get('attachment_required') else 'No'}", '', p['body'], '']
lines += ['## Exclusions', '']
for p in queue['excluded']:
    lines.append(f"- {p.get('company',p.get('email','Contact'))}: {p['reason']}")
(root / 'paced-outreach-2026-10-06.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'new':len(new),'total':len(all_p),'new_first':new[0]['scheduled_at'],'last':new[-1]['scheduled_at'],'daily_max':max(counts.values()),'minimum_gap_minutes':min((b-a).total_seconds()/60 for a,b in zip(times,times[1:])),'verified_drafts':sum(bool(p.get('draft_verified')) for p in all_p),'with_resume':sum(bool(p.get('attachment_required')) for p in all_p)},indent=2))

