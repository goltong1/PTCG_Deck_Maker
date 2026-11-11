import test from 'node:test';
import assert from 'node:assert/strict';
import {placeTutorial} from '../public/tutorial.js';
const overlap=(p,box,a)=>Math.max(0,Math.min(p.left+box.width,a.right)-Math.max(p.left,a.left))*Math.max(0,Math.min(p.top+box.height,a.bottom)-Math.max(p.top,a.top));
test('Guide bubble avoids the target on either edge of a desktop viewport',()=>{
  const viewport={width:1363,height:936},panel={width:380,height:430};
  for(const anchor of [{left:80,top:187,right:423,bottom:231},{left:1180,top:20,right:1320,bottom:65},{left:450,top:850,right:700,bottom:900}]){
    const p=placeTutorial(anchor,viewport,panel);
    assert.equal(overlap(p,panel,anchor),0);
    assert.ok(p.left>=12&&p.left+panel.width<=viewport.width-12);
    assert.ok(p.top>=12&&p.top+panel.height<=viewport.height-12);
  }
});
test('Mobile guide stays inside a narrow viewport and leaves the upper control visible',()=>{
  for(const width of [320,390,720]){
    const viewport={width,height:740},panel={width:width-24,height:350},anchor={left:15,right:width-15,top:150,bottom:200};
    const p=placeTutorial(anchor,viewport,panel);assert.equal(p.side,'bottom');assert.equal(p.left,12);assert.ok(p.top>anchor.bottom);assert.equal(p.top+panel.height,728);
  }
});
