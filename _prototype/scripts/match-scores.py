# Compute per-match scores from PGN headers (prototype timeline data).
import json, re, sys, glob, os
from collections import Counter

def games(path):
    text = open(path, encoding='latin-1').read()
    for block in re.split(r'\n(?=\[Event )', text):
        h = dict(re.findall(r'\[(\w+) "([^"]*)"\]', block))
        if 'White' in h: yield h

def surname(name):
    return name.split(',')[0].strip()

rows = []
files = sorted(glob.glob(sys.argv[1] + '/WorldChamp*.pgn')) + [sys.argv[1] + f'/FideChamp{y}.pgn' for y in (1993, 1996, 2005)]
for path in files:
    gs = list(games(path))
    players = Counter()
    for g in gs: players.update([surname(g['White']), surname(g['Black'])])
    score = Counter()
    for g in gs:
        w, b, r = surname(g['White']), surname(g['Black']), g.get('Result')
        if r == '1-0': score[w] += 1
        elif r == '0-1': score[b] += 1
        elif r == '1/2-1/2': score[w] += .5; score[b] += .5
    top = players.most_common()
    tournament = len(top) > 2
    year = re.search(r'(\d{4})', os.path.basename(path)).group(1)
    ranked = sorted(score.items(), key=lambda kv: -kv[1])
    rows.append({'file': os.path.basename(path), 'year': int(year), 'games': len(gs), 'tournament': tournament,
                 'site': gs[0].get('Site'), 'standings': ranked[:2] if not tournament else ranked[:3]})
rows.sort(key=lambda r: (r['year'], r['file']))
json.dump(rows, open(sys.argv[2], 'w'))
for r in rows: print(r['year'], r['file'], r['games'], 'T' if r['tournament'] else ' ', r['site'], r['standings'])
