import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as E from '../src/engine.js';
const d=JSON.parse(fs.readFileSync(new URL('../data/game.json',import.meta.url)));
test('body selectors enforce every archetype boundary and reject unsupported input',()=>{
 for(const a of d.archetypes){const b=E.fresh(d,a.name);for(const field of ['height','weight']){
  const sizes=E.bodySizes(d,b,field);assert.ok(sizes.includes(b[field]));
  for(const value of [sizes[0],sizes.at(-1)])assert.deepEqual(E.validate(d,E.setBodySize(d,b,field,value)),[]);
  for(const value of [sizes[0]-1,sizes.at(-1)+1,175.5,NaN,'175'])assert.throws(()=>E.setBodySize(d,b,field,value),/supported/);
 }
 }
 assert.deepEqual([E.bodySizes(d,E.fresh(d,'Magician'),'height')[0],E.bodySizes(d,E.fresh(d,'Magician'),'height').at(-1)],[163,188]);
 assert.deepEqual([E.bodySizes(d,E.fresh(d,'Target'),'height')[0],E.bodySizes(d,E.fresh(d,'Target'),'height').at(-1)],[178,196]);
});
test('all 11 archetypes start valid at both ends of progression',()=>{for(const a of d.archetypes)for(const level of [1,100])assert.deepEqual(E.validate(d,E.fresh(d,a.name,level)),[],a.name);});
test('source calculator checkpoints: AP and Magician incremental costs',()=>{const b=E.fresh(d,'Magician',1);assert.equal(E.budget(d,b),100);assert.equal(E.budget(d,{...b,level:100}),3167);for(const [k,expected]of Object.entries({Agility:6,Balance:4,Reactions:4,BallControl:6,Dribbling:8,Composure:4}))assert.equal(E.attributeCost(d,b,k,b.attributes[k]+1),expected,k);});
test('Target strength tier override, star costs, and slot boundary',()=>{const b=E.fresh(d,'Target');assert.equal(E.attributeCost(d,b,'Strength',76),6);b.skillMoves=5;b.weakFoot=5;assert.equal(E.spent(d,b),185);assert.equal(E.slots(d,{...b,level:20}),2);assert.equal(E.slots(d,{...b,level:30}),3);});
test('facility boosts never satisfy base PlayStyle unlocks',()=>{const b=E.fresh(d);b.attributes.Composure=79;const p=d.playstyles.find(p=>E.normalize(p.name)==='firsttouch');assert.equal(E.requirements(b,p).length,1);const facility=d.facilities.find(f=>f.levels.some(l=>l.boosts.Composure>=2));b.facilities[facility.name]=1;assert.ok(E.effective(d,b).Composure>=80);assert.equal(E.requirements(b,p).length,1);});
test('optimizer fits AP budget and preserves locked attributes',()=>{for(const a of d.archetypes){const b=E.fresh(d,a.name);const key=Object.keys(b.attributes)[0];b.locks=[key];const next=E.optimize(d,b,{priorities:Object.fromEntries(Object.keys(b.attributes).map(k=>[k,5]))});assert.deepEqual(E.validate(d,next),[]);assert.equal(next.attributes[key],b.attributes[key]);assert.ok(E.spent(d,next)<=E.budget(d,next));}});
test('invalid and stale-purpose AI changes fail closed',()=>{const b=E.fresh(d);b.locks=['Finishing'];assert.throws(()=>E.applyChanges(d,b,{attributes:{Finishing:99}}),/locked/);assert.throws(()=>E.applyChanges(d,b,{attributes:{MadeUp:90}}),/Unknown/);assert.throws(()=>E.applyChanges(d,b,{level:1}),/cannot change/);assert.throws(()=>E.applyChanges(d,b,{attributes:{Agility:100}}),/must be/);b.facilityMode='active';assert.throws(()=>E.applyChanges(d,b,{facilities:{Scout:1}}),/fixed/);});
test('facilities enforce team budget and reject unknown equipment',()=>{const b=E.fresh(d);b.facilities=Object.fromEntries(d.facilities.map(f=>[f.name,3]));assert.ok(E.validate(d,b).some(e=>e.includes('budget')));b.facilities={Fake:1};assert.ok(E.validate(d,b).some(e=>e.includes('Invalid facility')));});
test('unaffordable targets cannot be silently cut',()=>{const b=E.fresh(d,'Magician',1);assert.throws(()=>E.optimize(d,b,{targets:{Finishing:99,Acceleration:95}}),/exceed/);});

