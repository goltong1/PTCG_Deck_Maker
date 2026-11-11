// Reviewed rule snapshot. Change the date and sources together when updating.
// Korean Standard + Japanese Extra rules applied to Korean card equivalents.
export const RULES_DATE = '2026-11-11';
export const STANDARD_MARKS = ['H', 'I', 'J'];
export const FORMATS = ['standard', 'expanded'];
export const RULE_SOURCES = {
  standard: 'https://pokemoncard.co.kr/card/197',
  expanded: 'https://www.pokemon-card.com/rules/regulation/',
  reprints: 'https://pokemoncard.co.kr/s3.php?key=home/data/data1_www/2026/06/2026-06-30_11-59-04-49501-1782788344.png',
};
export function cardName(name) {
  // These character subtitles do not create separate card names.
  return String(name ?? '').normalize('NFKC')
    .replace(/^(보스의\s*지령|박사의\s*연구)\s*\([^)]*\)$/, '$1')
    .replace(/\s+/g, '');
}
const names = list => new Set(list.map(cardName));
const standardReprints = names([
  '개조해머','다크볼','럭키멧','몬스터볼','벌레회피스프레이','보스의 지령','상처약',
  '성스러운분말','스크램블 스위치','승리의 징표','에너지 갈아 달기','에너지 리사이클',
  '에너지 전송','에너지 회수','이상한사탕','저지맨','좋은상처약','체렌','축하 팡파레',
  '카운터 게인','쿡','크래시 해머','툴스크래퍼','파라다이스 리조트','포켓기어3.0',
  '포켓몬 교체','포켓몬 캐처','포켓몬 회수 사이클론','포켓몬센터 직원','풍선',
  '프리즘 에너지','하이퍼볼',
]);
const expandedReprints = names([
  'TV리포터','탈출로프','에너지 회수','에너지 전송','에너지 갈아 달기','에너지 순환장치',
  '에너지 리사이클','자뭉열매','학습장치','상처약','퀵볼','행복의알','자기장','저지맨',
  '슈퍼볼','슈퍼 포켓몬 회수','더블 무색 에너지','먹다남은음식','지저탐험대','낚시꾼',
  '만병통치제','배틀서처','이상한사탕','부활초','플러스파워','포켓기어3.0','포켓내비',
  '포켓몬 교체','포켓몬 통신','이수재의 메인터넌스','튼튼밀크','흉내내기 아가씨',
  '몬스터볼','리샘열매','레인보우 에너지','레벨볼','로켓단 등장!','워프 에너지',
]);
const basicStandard = names(['기본 풀 에너지','기본 불꽃 에너지','기본 물 에너지','기본 번개 에너지','기본 초 에너지','기본 격투 에너지','기본 악 에너지','기본 강철 에너지']);
const bannedTrainers = names([
  '플라드리 최후의 수단','거대식물의 숲','마적의 히든볼트릭','무서운 아가씨','로사와 로이',
  '리셋 스탬프','레드카드','자박자박피켈','섬 순례 증표','게치스플라스마단','마티스의 작전',
  '시간의퍼즐','오컬트마니아','회수네트',
]);
// A name alone MUST NOT ban every Pokémon printing. Match the banned effect,
// with a set/number fallback for source records missing an ability field.
export const BANNED_POKEMON = [
  ['애프룡', '애플드롭', 'S2', '012'],
  ['아케오스', '원시의힘', 'BW2', '040'],
  ['안농', 'DAMAGE[데미지]', 'SM8', '041'],
  ['안농', 'HAND[핸드]', 'SM8', '042'],
  ['마샤도', '피장파장', 'SM3PLUS', '046'],
  ['플라베베', '미리진화', 'SM6', '057'],
  ['무우마직', '이상한전언', 'SM10', '039'],
  ['하랑우탄', '리소스매니지먼트', 'SM5S', '052'],
  ['쉐이미 EX', '세트업', 'XY6', '063'],
  ['밀로틱', '에너지그레이스', 'XY2', '018'],
  ['깜까미', '정크헌트', 'BW4', '043'],
  ['해골몽', '혼령불진화', 'SM11A', '023'],
  ['요가램 V', '요가루프', 'S7R', '036'],
];
export function seriesOf(c) {
  return c.series || c.originalImage?.match(/\/wmimages\/([^/]+)\//)?.[1]?.toUpperCase() || '';
}
const result = (status, reason, reasonEn) => ({status, reason, reasonEn});
export function cardLegality(c, format = 'standard') {
  if (!c) return result('unknown', '카드 데이터가 없습니다.', 'Card data is missing.');
  if (!FORMATS.includes(format)) return result('unknown', '지원하지 않는 덱 형식입니다.', 'Unsupported format.');
  const name = cardName(c.name), text = cardName(c.text + ' ' + (c.attacks || []).map(a=>a.name+' '+a.effect).join(' '));
  if (/공식대회.{0,20}사용.{0,8}(?:없|불가)/.test(text)) return result('illegal','카드에 공식 대회 사용 불가가 명시되어 있습니다.','The card prohibits tournament use.');
  if (/V-UNION/.test(c.name)) return result('unknown','DB의 V-UNION은 4파트 통합 레코드입니다. 실제 파트별 장수를 확인하세요.','The catalog combines four V-UNION parts. Verify the individual physical cards.');
  const series = seriesOf(c);
  if (format === 'standard') {
    if (c.basicEnergy) return basicStandard.has(name)
      ? result('legal','사용 가능한 기본 에너지입니다.','Permitted Basic Energy.')
      : result('illegal','현재 스탠다드의 기본 에너지 8종에 포함되지 않습니다.','Not one of the eight permitted Standard Basic Energy types.');
    if (STANDARD_MARKS.includes(c.mark)) return result('legal',`${c.mark} 마크 · 스탠다드 사용 가능`,`${c.mark} regulation mark · Standard eligible`);
    if (c.group !== 'pokemon' && standardReprints.has(name)) return result('legal','한국 공식 구판 재록 허용 목록 · 최신 카드 문구 적용','Korean reprint exception · use the latest card wording.');
    if (name===cardName('마스터볼') && c.ace) return result('legal','ACE SPEC 마스터볼 재록 허용','ACE SPEC Master Ball reprint exception.');
    if (!c.mark && !['DP','BW','XY'].includes(series)) return result('unknown','레귤레이션 마크 누락 · 실제 카드 확인 필요','Regulation mark missing · inspect the physical card.');
    return result('illegal',`${c.mark || series || '미상'} 판본 · H·I·J 및 구판 허용 목록에 포함되지 않습니다.`,`${c.mark || series || 'Unknown'} printing is outside H/I/J and the Korean reprint exceptions.`);
  }
  if (c.group==='trainer' && bannedTrainers.has(name)) return result('illegal','일본 엑스트라 금지 카드입니다.','Banned in Japanese Extra.');
  for (const [n, effect, set, number] of BANNED_POKEMON) {
    if (name!==cardName(n)) continue;
    if (text.includes(cardName(effect)) || (c.set?.toUpperCase()===set && String(c.number).padStart(3,'0')===number))
      return result('illegal',`금지 판본 · ${n} (${effect})`,`Banned printing · ${n} (${effect})`);
    // Missing effect data must not silently turn a potential reprint legal.
    if (!(c.attacks?.length) && !c.text) return result('unknown','금지 판본과 비교할 효과 데이터가 없습니다.','Effect data is missing for comparison with a banned printing.');
  }
  if (c.basicEnergy) return result('legal','기본 에너지 사용 가능','Basic Energy eligible.');
  if (['BW','XY','SM','S','SV','MEGA'].includes(series)) return result('legal','BW 이후 판본 · 금지 목록 제외','BW or later printing · not on the ban list.');
  if (c.group!=='pokemon' && expandedReprints.has(name)) return result('legal','일본 엑스트라 구판 재록 허용 목록','Japanese Extra older-card exception.');
  if (series==='DP') return result('illegal','BW 이전 판본이며 구판 허용 목록에 없습니다.','Pre-BW printing without an older-card exception.');
  return result('unknown','발매 시리즈 정보가 불명확합니다.','Release series is unknown.');
}
export function createLegalityIndex(cards) {
  return Object.fromEntries(FORMATS.map(f=>[f,new Map(cards.map(c=>[c.id,cardLegality(c,f)]))]));
}
export function formatIssues(deck, byId, index) {
  const format = deck.format || 'standard';
  const illegal=[], unknown=[];
  for (const e of deck.cards) {
    const c=byId.get(e.id), r=index?.[format]?.get(e.id)||cardLegality(c,format);
    if(r.status!=='legal') (r.status==='illegal'?illegal:unknown).push({...e,name:c?.name||e.id,set:c?.set,number:c?.number,...r});
  }
  const conflicts=[];
  if(format==='expanded') {
    const included=names(deck.cards.map(e=>byId.get(e.id)?.name));
    for(const group of [['주박사','플라타느박사','박사의 연구'],['플라드리','보스의 지령']]) {
      const found=group.filter(n=>included.has(cardName(n)));
      if(found.length>1) conflicts.push(found);
    }
  }
  return {format,illegal,unknown,conflicts,formatOk:!illegal.length&&!unknown.length&&!conflicts.length};
}
