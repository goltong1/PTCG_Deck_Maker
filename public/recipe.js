import {cardName} from './rules.js';
export const RECIPE_LIMITS={pokemon:28,trainer:28,energy:22};
const groupLabels={pokemon:'포켓몬',trainer:'트레이너스',energy:'에너지'};
export const DIVISIONS={junior:'주니어 (Junior)',senior:'시니어 (Senior)',master:'마스터 (Master)'};
const escapeXML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function buildRecipe(deck,byId) {
  const groups={pokemon:new Map(),trainer:new Map(),energy:new Map()};
  for(const e of deck.cards){
    const c=byId.get(e.id);
    if(!c)throw Error(`카드 정보를 찾을 수 없습니다: ${e.id}`);
    if(!Number.isInteger(e.qty)||e.qty<1)throw Error('카드 수량을 확인해 주세요.');
    if(/V-UNION/.test(c.name))throw Error('V-UNION 통합 레코드는 파트별 장수를 구분할 수 없습니다. 실제 4파트를 확인해 양식에 직접 기입해 주세요.');
    const set=c.seriesMark||c.set, number=c.collectionNumber||c.number;
    if(c.group==='pokemon'&&(!set||['promo','no_set','none'].includes(set)||!number))throw Error(`${c.name}: 시리즈 마크·컬렉션 넘버를 확인해 주세요.`);
    const name=c.group==='trainer'&&/^(보스의\s*지령|박사의\s*연구)/.test(c.name)?c.name.replace(/\s*\([^)]*\)$/,''):c.name;
    const key=c.group==='pokemon'?`${cardName(name)}|${set}|${number}`:cardName(name)+(c.ace?'|ACE':'');
    const map=groups[c.group], row=map.get(key)||{name,set,number,qty:0};
    row.qty+=e.qty;map.set(key,row);
  }
  const rows=Object.fromEntries(Object.entries(groups).map(([g,m])=>[g,[...m.values()]]));
  for(const [g,list] of Object.entries(rows))if(list.length>RECIPE_LIMITS[g])throw Error(`${groupLabels[g]} ${list.length}행: 양식의 ${RECIPE_LIMITS[g]}행을 초과합니다. 카드 판본을 정리한 뒤 다시 내보내세요.`);
  const totals=Object.fromEntries(Object.entries(rows).map(([g,list])=>[g,list.reduce((n,r)=>n+r.qty,0)]));
  totals.total=totals.pokemon+totals.trainer+totals.energy;
  return {rows,totals};
}
export function recipeCells(recipe,profile={}) {
  const cells={A3:{value:'이름 : '+String(profile.name||'').slice(0,50)}};
  for(const [division,address] of [['junior','K3'],['senior','K4'],['master','K5']])cells[address]={value:(profile.division===division?'◯ ':'')+DIVISIONS[division]};
  for(let i=0;i<28;i++){
    const p=recipe.rows.pokemon[i],t=recipe.rows.trainer[i],r=i+9;
    cells[`A${r}`]={value:p?.name||''};cells[`B${r}`]={value:p?.set||''};cells[`C${r}`]={value:p?.number||''};cells[`D${r}`]={value:p?.qty??''};
    cells[`F${r}`]={value:t?.name||''};cells[`I${r}`]={value:t?.qty??''};
    if(i<22){const e=recipe.rows.energy[i];cells[`K${r}`]={value:e?.name||''};cells[`M${r}`]={value:e?.qty??''};}
  }
  for(const [cell,formula,total] of [['D37','SUM(D9:D36)','pokemon'],['I37','SUM(I9:I36)','trainer'],['M31','SUM(M9:M30)','energy'],['M34','D37+I37+M31','total']])cells[cell]={formula,value:recipe.totals[total]};
  return cells;
}
function updateCell(xml,address,entry) {
  const re=new RegExp(`<c\\b([^>]*?\\br="${address}"[^>]*?)(?:\\s*/>|>([\\s\\S]*?)</c>)`);
  const match=xml.match(re);
  if(!match)throw Error(`양식 셀을 찾을 수 없습니다: ${address}`);
  const attrs=match[1].replace(/\s+t="[^"]*"/g,'').replace(/\s*\/$/,'');
  const {value,formula}=entry;
  const cell=formula?`<c${attrs}><f>${escapeXML(formula)}</f><v>${value}</v></c>`
    :typeof value==='number'?`<c${attrs}><v>${value}</v></c>`
    :`<c${attrs} t="inlineStr"><is><t xml:space="preserve">${escapeXML(value)}</t></is></c>`;
  return xml.replace(re,()=>cell);
}
// Small standards-based ZIP STORE writer. No CDN, server or third-party Excel
// runtime is required. Original OOXML styles, merges and print settings survive.
const encoder=new TextEncoder(),decoder=new TextDecoder();
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function concat(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
export function zipStore(files) {
  const local=[],central=[];let offset=0;
  for(const {name,bytes} of files){
    const filename=encoder.encode(name),crc=crc32(bytes);
    const h=new Uint8Array(30),v=new DataView(h.buffer);
    v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);
    v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,filename.length,true);
    local.push(h,filename,bytes);
    const d=new Uint8Array(46),dv=new DataView(d.buffer);
    dv.setUint32(0,0x02014b50,true);dv.setUint16(4,20,true);dv.setUint16(6,20,true);dv.setUint16(8,0x800,true);dv.setUint16(14,33,true);
    dv.setUint32(16,crc,true);dv.setUint32(20,bytes.length,true);dv.setUint32(24,bytes.length,true);dv.setUint16(28,filename.length,true);dv.setUint32(42,offset,true);
    central.push(d,filename);offset+=h.length+filename.length+bytes.length;
  }
  const directory=concat(central),end=new Uint8Array(22),ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,directory.length,true);ev.setUint32(16,offset,true);
  return concat([...local,directory,end]);
}
export function createRecipeXlsx(template,recipe,profile={}) {
  const files=template.files.map(f=>({name:f.name,bytes:Uint8Array.from(atob(f.data),c=>c.charCodeAt(0))}));
  const sheet=files.find(f=>f.name==='xl/worksheets/sheet1.xml');
  if(!sheet)throw Error('내보내기 양식이 손상되었습니다.');
  let xml=decoder.decode(sheet.bytes);
  for(const [address,entry] of Object.entries(recipeCells(recipe,profile)))xml=updateCell(xml,address,entry);
  sheet.bytes=encoder.encode(xml);
  return zipStore(files);
}
export function recipeHTML(recipe,profile={}) {
  const esc=escapeXML;
  const table=(group,columns)=>`<table class="recipe-table ${group}"><colgroup>${(group==='pokemon'?[44,21,23,12]:[80,20]).map(w=>`<col style="width:${w}%">`).join('')}</colgroup><thead><tr><th colspan="${columns.length}">●${groupLabels[group]} 카드</th></tr><tr>${columns.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${Array.from({length:RECIPE_LIMITS[group]},(_,i)=>{const r=recipe.rows[group][i];return `<tr>${(group==='pokemon'?[r?.name,r?.set,r?.number,r?.qty]:[r?.name,r?.qty]).map(v=>`<td>${v==null?'&nbsp;':esc(v)}</td>`).join('')}</tr>`;}).join('')}</tbody><tfoot><tr><td colspan="${columns.length-1}">합계</td><td>${recipe.totals[group]}</td></tr></tfoot></table>`;
  return `<section class="recipe-sheet"><h1>포켓몬 카드 게임 덱 기입용지</h1><div class="recipe-identification"><div class="recipe-name">이름 : ${esc(profile.name||'')}</div><div class="recipe-divisions"><small>동그라미를 쳐주십시오.</small>${Object.entries(DIVISIONS).map(([key,label],i)=>`<div><span class="${profile.division===key?'selected-division':''}">${label}</span><span>${['2014년 1월 1일 이후','2010년 1월 1일 ~ 2013년 12월 31일','2009년 12월 31일 이전'][i]}</span></div>`).join('')}</div></div><div class="recipe-columns">${table('pokemon',['카드 이름','시리즈 마크','컬렉션 넘버','장수'])}${table('trainer',['카드 이름','장수'])}<div>${table('energy',['카드 이름','장수'])}<div class="recipe-total"><span>총 합계</span><b>${recipe.totals.total}</b></div><p class="recipe-footnote">*제출하기 전에 반드시 60장이 맞는지 확인해 주십시오.</p></div></div></section>`;
}
