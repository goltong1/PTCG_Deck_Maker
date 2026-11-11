import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stats,validateDeck,exportText,parseImport,mergeEntries} from '../public/core.js';
const cards=JSON.parse(readFileSync(new URL('../public/data/cards.json',import.meta.url))),byId=new Map(cards.map(c=>[c.id,c]));
const example=JSON.parse(readFileSync(new URL('../public/data/example.json',import.meta.url)));
test('Full Korean catalog has unique IDs and valid categories',()=>{assert.equal(cards.length,20323);assert.equal(byId.size,cards.length);assert.ok(cards.every(c=>c.name&&['pokemon','trainer','energy'].includes(c.group)));assert.ok(cards.some(c=>c.ace));assert.ok(cards.some(c=>c.basicEnergy));});
test('Example is 60 cards and passes only the advertised construction checks',()=>{assert.equal(stats(example,byId).total,60);assert.equal(validateDeck(example,byId).ok,true);});
test('Text export roundtrips exact printing and quantities',()=>{const result=parseImport(exportText(example,byId),cards,byId);assert.deepEqual(result.errors,[]);assert.deepEqual(new Map(result.entries.map(e=>[e.id,e.qty])),new Map(example.cards.map(e=>[e.id,e.qty])));});
test('Same name on different prints shares the four-copy limit',()=>{const prints=cards.filter(c=>c.name==='하이퍼볼');assert.ok(prints.length>=2);const d={target:60,cards:[{id:prints[0].id,qty:3},{id:prints[1].id,qty:2}]};const result=validateDeck(d,byId);assert.equal(result.copiesOk,false);assert.equal(result.over[0].qty,5);});
test('Basic energy is exempt while special energy is not',()=>{const basic=cards.find(c=>c.basicEnergy),special=cards.find(c=>c.subtype==='special-energy');assert.equal(validateDeck({target:60,cards:[{id:basic.id,qty:30}]},byId).copiesOk,true);assert.equal(validateDeck({target:60,cards:[{id:special.id,qty:5}]},byId).copiesOk,false);});
test('Different ACE SPEC names still share one slot',()=>{const a=cards.find(c=>c.ace),b=cards.find(c=>c.ace&&c.name!==a.name);const v=validateDeck({target:60,cards:[{id:a.id,qty:1},{id:b.id,qty:1}]},byId);assert.equal(v.aceOk,false);});
test('Import rejects missing IDs, negative/fractional quantities, and unknown lines',()=>{for(const qty of [-1,1.5,0])assert.throws(()=>mergeEntries([{id:cards[0].id,qty}],byId));assert.throws(()=>mergeEntries([{id:'missing',qty:1}],byId));assert.ok(parseImport('4 nonexistent-card',cards,byId).errors.length);assert.ok(parseImport('{"cards":[{"id":"missing","qty":1}]}',cards,byId).errors.length);});
test('Exact JSON backup preserves 40-card format and artwork selection',()=>{const d={name:'실드전',target:40,cards:example.cards.slice(0,3)};const result=parseImport(JSON.stringify(d),cards,byId);assert.equal(result.target,40);assert.equal(result.name,'실드전');assert.deepEqual(result.entries,d.cards);});

test('Pokemon ex and Pokemon EX remain separate card names',()=>{const small=cards.find(c=>c.name==='리자몽 ex'),large=cards.find(c=>c.name==='리자몽 EX');assert.ok(small&&large);assert.equal(validateDeck({target:60,cards:[{id:small.id,qty:4},{id:large.id,qty:4}]},byId).copiesOk,true);const imported=parseImport('4 리자몽 EX',cards,byId);assert.equal(byId.get(imported.entries[0].id).name,'리자몽 EX');});
test('ACE rarity and starter Master Ball are recognized',()=>{assert.ok(cards.filter(c=>c.name==='프라임 캐처').every(c=>c.ace));assert.equal(byId.get('BS2024002025').ace,true);});
