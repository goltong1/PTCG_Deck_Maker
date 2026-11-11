"""Build Korean PTCG data from type-null/PTCG-database/data_ko. No website crawling."""
import json,re,sys,gzip,hashlib,collections
from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=Path(sys.argv[1]) if len(sys.argv)>1 else Path('../data-source/data_ko')
if not src.exists(): raise SystemExit('Pass the downloaded repository data_ko directory.')
out=root/'public/data';out.mkdir(parents=True,exist_ok=True)
types={'Grass':'풀','Fire':'불꽃','Water':'물','Lightning':'번개','Electric':'번개','Psychic':'초','Fighting':'격투','Darkness':'악','Dark':'악','Metal':'강철','Steel':'강철','Dragon':'드래곤','Fairy':'페어리','Colorless':'무색'}
def clean(v):
 s=str(v or '')
 for k,val in types.items():s=re.sub(r'\b'+k+r'\b',val,s)
 s=re.sub(r'\[/?s\]','',s)
 return s.strip()
cards=[];seen=set()
for p in sorted(src.rglob('*.json')):
 c=json.loads(p.read_text()); ident=c.get('ko_id') or p.parent.name+'-'+p.stem
 if ident in seen:continue
 seen.add(ident)
 name=clean(c.get('name'));typ=c.get('card_type','')
 if '에너지' in typ:group='energy';sub='basic-energy' if typ.startswith('기본') else 'special-energy'
 elif typ.startswith(('서포트','서포터')):group='trainer';sub='supporter'
 elif typ.startswith('아이템'):group='trainer';sub='item'
 elif typ.startswith('포켓몬의 도구'):group='trainer';sub='tool'
 elif typ.startswith('스타디움'):group='trainer';sub='stadium'
 else:group='pokemon';sub='pokemon'
 text='\n'.join(clean(c.get(k)) for k in ['effect','rule_box','flavor_text'] if c.get(k))
 attacks=[{'name':clean(a.get('name')),'damage':a.get('damage') or '', 'cost':[types.get(t,t) for t in a.get('cost',[])], 'effect':clean(a.get('effect'))} for a in c.get('attacks',[])]
 ability=c.get('abilities',c.get('ability',[]))
 if isinstance(ability,dict):ability=[ability]
 if isinstance(ability,str):ability=[{'name':'特性','effect':ability}]
 for a in ability or []:
  if isinstance(a,dict):text+='\n'+clean(a.get('name'))+' '+clean(a.get('effect',a.get('description')))
 tags=c.get('tags',[])
 if not isinstance(tags,list):tags=[str(tags)]
 alltext=' '.join([name,text,*tags,json.dumps(attacks,ensure_ascii=False)])
 ace=c.get('rarity','').upper()=='ACE' or bool(re.search(r'ACE\s*SPEC|에이스\s*스펙',json.dumps(c,ensure_ascii=False),re.I)) or (name=='마스터볼' and c.get('regulation') in ['H','I','J'])
 stage=clean(c.get('stage'))
 if not stage and group=='pokemon':
  stage=next((v for v in ['기본','1진화','2진화','V진화','레벨업','복원','V-UNION'] if v in typ),'')
 img=c.get('img','');m=re.search(r'/data/wmimages/(.+)',img)
 web='https://pokemoncard.co.kr/public-assets/home/data/cards.image_www/data/wmimages/'+re.sub(r'\.(png|jpg|jpeg)$','.webp',m.group(1),flags=re.I)+'?w=256' if m else img
 mark=str(c.get('regulation') or '').upper()
 if mark=='NONE':mark=''
 card={'id':ident,'name':name,'group':group,'subtype':sub,'set':c.get('set_name',p.parent.name),'setName':c.get('set_full_name',''),'number':str(c.get('number',p.stem)),'mark':mark,'rarity':c.get('rarity',''),'types':[types.get(t,t) for t in c.get('types_en',c.get('types',[]))],'hp':c.get('hp'), 'stage':stage,'image':web,'originalImage':img,'url':c.get('url',''),'text':text.strip(),'attacks':attacks,'tags':tags,'ace':ace,'basicEnergy':sub=='basic-energy','basic':group=='pokemon' and stage=='기본','retreat':c.get('retreat'), 'artist':', '.join(c.get('author',[]))}
 cards.append(card)
# Starter deck reprints can omit rarity: carry ACE identity across the same name and mark.
ace_keys={(c['name'],c['mark']) for c in cards if c['ace']}
for c in cards:
 if (c['name'],c['mark']) in ace_keys:c['ace']=True
# Prefer contemporary prints; use the source's card ID only as an ordering hint.
def rank(c):
 y=re.search(r'20\d\d',c['id']);return (int(y.group()) if y else 0,c['mark'] if len(c['mark'])==1 else '',c['id'])
cards.sort(key=rank,reverse=True)
feature_names=['메가루카리오 ex','드래펄트 ex','피카츄 ex','리자몽 ex','메가가디안 ex','오롱털 ex','타부자고 ex','리자몽','리아코','리오르','드라꼰','드래런치','보스의 지령','하이퍼볼','이상한사탕','나무돌이','마릴리','기본 불꽃 에너지','기본 초 에너지','기본 격투 에너지','기본 악 에너지','기본 물 에너지','기본 번개 에너지','기본 강철 에너지','기본 풀 에너지']
featured=[]
for name in feature_names:
 matches=[c for c in cards if c['name']==name]
 if matches:
  # Prefer a legible normal-art print in a current marked set.
  preferred=[c for c in matches if c['mark'] in ['H','I','J'] and c['rarity'] in ['RR','R','U','C','']]
  featured.append((preferred or matches)[0]['id'])
for c in cards:
 if c['id'] not in featured and c['mark'] in ['H','I','J'] and c['group']=='pokemon' and c['rarity'] in ['SAR','SR','AR']:
  featured.append(c['id'])
  if len(featured)>=48:break
featured_rank={v:i for i,v in enumerate(featured)}
cards.sort(key=lambda c:featured_rank.get(c['id'],999))
# A clearly labelled editing example, not a tournament recommendation.
def pick(name):
 matches=[c for c in cards if c['name']==name]
 if not matches:raise ValueError(name)
 return matches[0]['id']
spec=[('드라꼰',4),('드래런치',4),('드래펄트 ex',3),('리오르',2),('메가루카리오 ex',2),('하이퍼볼',4),('이상한사탕',4),('보스의 지령',3),('네스트볼',4),('박사의 연구',4),('포켓몬 교체',3),('슈퍼볼',3),('기본 불꽃 에너지',6),('기본 초 에너지',6),('기본 격투 에너지',8)]
demo={'name':'드래펄트 × 루카리오 · 편집 예시','target':60,'note':'기능을 둘러보기 위한 60장 예시입니다. 대회 추천 덱이나 레귤레이션 검증 덱이 아닙니다.','cards':[{'id':pick(n),'qty':q} for n,q in spec]}
assert sum(x['qty'] for x in demo['cards'])==60
selected=list(dict.fromkeys(featured+[x['id'] for x in demo['cards']]))
for c in cards:
 if c['id'] in selected:c['localImage']='images/'+c['id']+'.webp'
commit=json.loads((src.parent/'source-commit.json').read_text())
meta={'count':len(cards),'sets':len(set(c['set'] for c in cards)),'builtAt':'2026-11-10','sourceUpdatedAt':commit['date'],'sourceCommit':commit['commit'],'source':'https://github.com/type-null/PTCG-database','official':'https://pokemoncard.co.kr/cards','featured':featured,'cachedImages':len(list((root/'public/images').glob('*.webp'))),'groups':dict(collections.Counter(c['group'] for c in cards))}
b=json.dumps(cards,ensure_ascii=False,separators=(',',':')).encode();(out/'cards.json').write_bytes(b);(out/'cards.json.gz').write_bytes(gzip.compress(b,compresslevel=9))
(out/'meta.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2));(out/'example.json').write_text(json.dumps(demo,ensure_ascii=False,indent=2))
(root/'scripts/thumbnail-selection.json').write_text(json.dumps([{'id':c['id'],'url':c['image']} for c in cards if c['id'] in selected],indent=2))
print(json.dumps({'count':len(cards),'jsonMB':len(b)/1e6,'gzipMB':(out/'cards.json.gz').stat().st_size/1e6,'localThumbs':len(selected),'groups':meta['groups']},ensure_ascii=False))
