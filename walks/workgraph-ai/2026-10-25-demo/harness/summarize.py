"""Summarize every walk folder into summary.json (stand-in for `msw report`). Usage: python3 harness/summarize.py"""
import json, os, glob, collections, re
D = '/wt/.msw-walks/workgraph-ai/2026-10-25-demo'
out = []
for wd in sorted(glob.glob(f'{D}/walks/*/') + glob.glob(f'{D}/pass-2/walks/*/') + glob.glob(f'{D}/smoke/walks/*/')):
    ev = [json.loads(l) for l in open(wd + 'events.jsonl')]
    fi = [json.loads(l) for l in open(wd + 'findings.jsonl')] if os.path.exists(wd + 'findings.jsonl') else []
    ins = [json.loads(l) for l in open(wd + 'instrument.jsonl')] if os.path.exists(wd + 'instrument.jsonl') else []
    seal = json.load(open(wd + 'seal.json')) if os.path.exists(wd + 'seal.json') else None
    quit = next((e for e in ev if e['kind'] == 'quit'), None)
    blocked = collections.Counter((e['data'].get('why'), re.sub(r'https?://[^/]+', '', e['data'].get('url', ''))) for e in ev if e['kind'] == 'blocked')
    itypes = collections.Counter(i['type'] for i in ins)
    noise = [i for i in ins if i['type'] in ('console', 'pageerror', 'requestfailed', 'failed') and re.search(r'ERR_(PROXY|TUNNEL|CONNECTION|NAME|ABORTED|BLOCKED)|blocked|api/events', json.dumps(i))]
    w = [f for f in fi if f['source'] == 'walker']; inst = [f for f in fi if f['source'] != 'walker']
    out.append({
        'folder': wd.replace(D + '/', ''), 'walker': ev[0]['data'].get('walker'), 'journey': ev[0]['data'].get('journey'),
        'viewport': ev[0]['data'].get('viewport'), 'acts': sum(e['kind'] == 'act' for e in ev), 'refused': sum(e['kind'] == 'refused' for e in ev),
        'drift_acts': sum(1 for e in ev if e['kind'] == 'act' and 'drift_from' in e['data']),
        'quit': quit and {'reason': quit['data'].get('reason'), 'detail': quit['data'].get('detail', '')[:300]},
        'sealed': bool(seal), 'verified': seal and seal['verified'], 'alive': seal and seal['alive'], 'ended': seal and seal['ended'],
        'parrot_failures': seal and len(seal['failures']),
        'walker_findings': collections.Counter(f['severity'] for f in w), 'instrument_findings': collections.Counter(f['severity'] for f in inst),
        'instrument_records': itypes, 'blocked': {f'{k[0]} {k[1]}': v for k, v in blocked.items()}, 'noise_records': len(noise),
        'vitals': [(re.sub(r'https?://[^/]+', '', i['url']), i['detail']) for i in ins if i['type'] == 'vitals'],
    })
json.dump(out, open(f'{D}/summary.json', 'w'), indent=1, default=str)
for o in out:
    print(o['folder'].split('/walks/')[0] if '/walks/' in o['folder'] else '', o['walker'], o['journey'], o['viewport'], 'acts', o['acts'], 'refused', o['refused'], 'drift', o['drift_acts'],
          'quit', o['quit'] and o['quit']['reason'], 'sealed', o['sealed'], 'verified', o['verified'], 'alive', o['alive'], 'W', dict(o['walker_findings']), 'I', dict(o['instrument_findings']),
          'irec', dict(o['instrument_records']), 'noise', o['noise_records'], 'blocked', sum(o['blocked'].values()))
