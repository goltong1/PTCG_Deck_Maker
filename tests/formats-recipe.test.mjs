import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cardLegality,cardName,BANNED_POKEMON} from '../public/rules.js';
import {validateDeck,parseImport} from '../public/core.js';
import {buildRecipe,recipeCells,createRecipeXlsx,recipeHTML} from '../public/recipe.js';
const cards=JSON.parse(readFileSync(new URL('../public/data/cards.json',import.meta.url)));
const byId=new Map(cards.map(c=>[c.id,c]));
const template=JSON.parse(readFileSync(new URL('../public/templates/recipe-template-2026.json',import.meta.url)));
const example=JSON.parse(readFileSync(new URL('../public/data/example.json',import.meta.url)));
const card=(name,predicate=()=>true)=>{const c=cards.find(c=>c.name===name&&predicate(c));assert.ok(c,`Missing fixture: ${name}`);return c;};
const status=(c,f='standard')=>cardLegality(c,f).status;
const deck=(entries,format='standard')=>({name:'검증용 덱',format,target:60,cards:entries.map(([c,qty])=>({id:c.id,qty}))});
test('Korean Standard uses marks and explicit trainer reprints, not matching Pokemon names',()=>{
  assert.equal(status(card('리오르',c=>c.mark==='G')),'illegal');
  assert.equal(status(card('리오르',c=>c.mark==='H'||c.mark==='I')),'legal');
  assert.equal(status(card('하이퍼볼',c=>c.series==='BW')),'legal');
  assert.equal(status(card('네스트볼',c=>c.mark==='G')),'illegal');
  const fairy=card('기본 페어리 에너지');assert.equal(status(fairy),'illegal');assert.equal(status(fairy,'expanded'),'legal');
  const modernMissing={...card('리오르'),mark:''};assert.equal(status(modernMissing),'unknown');
});
test('Expanded distinguishes banned effects from legal same-name Pokemon',()=>{
  for(const [name,effect,set,number] of BANNED_POKEMON){
    const c=card(name,c=>c.set.toUpperCase()===set&&c.number.padStart(3,'0')===number);
    assert.equal(status(c,'expanded'),'illegal',`${name}: ${effect}`);
  }
  assert.equal(status(card('애프룡',c=>c.series==='SV'),'expanded'),'legal');
  const banned=card('애프룡',c=>c.set==='S2');assert.equal(status({...banned,set:'OTHER',number:'999'},'expanded'),'illegal');
  for(const name of ['플라드리 최후의 수단','거대식물의 숲','마적의 히든볼트릭','무서운 아가씨','로사와 로이','리셋 스탬프','레드카드','자박자박피켈','섬 순례 증표','게치스플라스마단','마티스의 작전','시간의퍼즐','오컬트마니아','회수네트'])assert.equal(status(card(name),'expanded'),'illegal',name);
});
test('Expanded checks BW boundary, old reprints and exclusive supporter names',()=>{
  assert.equal(status(cards.find(c=>c.group==='pokemon'&&c.series==='DP'),'expanded'),'illegal');
  assert.equal(status(card('포켓몬 교체',c=>c.series==='DP'),'expanded'),'legal');
  const d=deck([[card('플라드리'),1],[card('보스의 지령'),1]],'expanded');assert.equal(validateDeck(d,byId).conflicts.length,1);
  const e=deck([[card('주박사'),1],[card('박사의 연구'),1]],'expanded');assert.equal(validateDeck(e,byId).conflicts.length,1);
});
test('Known legacy ACE cards count; Pokemon mentioning ACE SPEC do not',()=>{
  for(const id of ['ST2013005017','BS2013005073','BS2013005074'])assert.equal(byId.get(id).ace,true,id);
  assert.equal(cards.filter(c=>c.group==='pokemon'&&c.ace).length,0);
  assert.equal(status(byId.get('ST2013005017')),'legal');
  const old={...byId.get('ST2013005017'),series:'DP',mark:'',ace:false};assert.equal(status(old),'illegal');
});
test('Format verdict, basic Pokemon, copy exceptions, and uncertainty are independent',()=>{
  const p=cards.find(c=>c.basic&&status(c)==='legal'),e=cards.find(c=>c.basicEnergy&&status(c)==='legal');
  assert.equal(validateDeck(deck([[p,4],[e,56]]),byId).ok,true);
  assert.equal(validateDeck({...deck([[p,4],[e,36]]),target:40},byId).countOk,false);
  assert.equal(validateDeck(deck([[e,60]]),byId).basicOk,false);
  const prism=cards.find(c=>c.tags.some(t=>/프리즘/.test(t)));
  assert.equal(validateDeck(deck([[prism,2]]),byId).copiesOk,false);
  const vUnion=cards.find(c=>c.name.includes('V-UNION'));
  assert.equal(status(vUnion,'expanded'),'unknown');
  assert.equal(validateDeck({...example,format:'expanded'},byId).ok,true);
  assert.equal(validateDeck({...example,format:'standard'},byId).ok,false);
});
test('Professor and Boss character subtitles share the four-copy limit',()=>{
  assert.equal(cardName('박사의 연구(오박사)'),cardName('박사의 연구 (투로박사)'));
  const c=card('박사의 연구');const fictional=[{...c,id:'a',name:'박사의 연구(오박사)'},{...c,id:'b',name:'박사의 연구(투로박사)'}];
  assert.equal(validateDeck(deck([[fictional[0],3],[fictional[1],2]]),new Map(fictional.map(c=>[c.id,c]))).copiesOk,false);
});
test('JSON preserves format, form profile and print selection; legacy JSON migrates',()=>{
  const source={...example,format:'expanded',recipe:{name:'검증',division:'master'}};
  const r=parseImport(JSON.stringify(source),cards,byId);assert.equal(r.format,'expanded');assert.deepEqual(r.recipe,source.recipe);assert.deepEqual(r.entries,example.cards);
  assert.equal(parseImport(JSON.stringify(example),cards,byId).format,'standard');
});
test('Recipe retains Pokemon print identifiers and merges trainer artwork',()=>{
  const p=cards.find(c=>c.group==='pokemon'&&c.collectionNumber.includes('/'));
  const mirror={...p,id:'mirror'};const other={...p,id:'other',collectionNumber:'999/999'};
  const trainers=cards.filter(c=>c.name==='하이퍼볼').slice(0,2);
  const m=new Map([...byId,[mirror.id,mirror],[other.id,other]]);
  const r=buildRecipe(deck([[p,1],[mirror,2],[other,1],[trainers[0],2],[trainers[1],2]]),m);
  assert.equal(r.rows.pokemon.length,2);assert.equal(r.rows.pokemon[0].qty,3);assert.equal(r.rows.pokemon[0].number,p.collectionNumber);
  assert.equal(r.rows.trainer.length,1);assert.equal(r.rows.trainer[0].qty,4);assert.equal(r.totals.total,8);
  const cells=recipeCells(r,{name:'홍길동',division:'master'});assert.equal(cells.C9.value,p.collectionNumber);assert.equal(cells.D37.value,4);assert.equal(cells.K5.value,'◯ 마스터 (Master)');
});
test('Recipe refuses overflow and combined V-UNION records without dropping cards',()=>{
  const rows=cards.filter(c=>c.group==='pokemon').slice(0,40);assert.throws(()=>buildRecipe(deck(rows.map(c=>[c,1])),byId),/행을 초과/);
  const c=cards.find(c=>c.name.includes('V-UNION'));assert.throws(()=>buildRecipe(deck([[c,1]]),byId),/4파트/);
});
function unzipStore(bytes){const buffer=Buffer.from(bytes),files=new Map();let offset=0;while(buffer.readUInt32LE(offset)===0x04034b50){const size=buffer.readUInt32LE(offset+18),n=buffer.readUInt16LE(offset+26),extra=buffer.readUInt16LE(offset+28),start=offset+30;files.set(buffer.subarray(start,start+n).toString(),buffer.subarray(start+n+extra,start+n+extra+size).toString());offset=start+n+extra+size;}return files;}
test('XLSX exports totals, safe literal names and original formatting/print setup',()=>{
  const r=buildRecipe(example,byId),f=unzipStore(createRecipeXlsx(template,r,{name:'=SUM(1,2) <홍&길동>',division:'master'}));
  const xml=f.get('xl/worksheets/sheet1.xml');const original=Buffer.from(template.files.find(f=>f.name==='xl/worksheets/sheet1.xml').data,'base64').toString();
  assert.match(xml,/<f>D37\+I37\+M31<\/f><v>60<\/v>/);assert.match(xml,/이름 : =SUM\(1,2\) &lt;홍&amp;길동&gt;/);
  for(const tag of ['mergeCells','pageSetup','pageMargins'])assert.equal(xml.match(new RegExp(`<${tag}\\b[^>]*(?:\\/>|>[\\s\\S]*?<\\/${tag}>)`))?.[0],original.match(new RegExp(`<${tag}\\b[^>]*(?:\\/>|>[\\s\\S]*?<\\/${tag}>)`))?.[0]);
  assert.equal(f.get('xl/styles.xml'),Buffer.from(template.files.find(f=>f.name==='xl/styles.xml').data,'base64').toString());
  assert.ok(recipeHTML(r).includes('60'));assert.ok(recipeHTML(r,{name:'<script>alert(1)</script>'}).includes('&lt;script&gt;'));
});
