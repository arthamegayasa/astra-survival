import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS,CLASSES,createBuild,statsOf,addGlint,openShop,buy,reroll,rerollCost,levelChoices,chooseLevel,rewardChoices,claimReward,finishRun,loadMeta,unlock,synergies } from '../build.js';
import {audio} from '../audio.js';

test('each class starts with a distinct combat profile and all catalog entries can affect it',()=>{
  const profiles=CLASSES.map(c=>statsOf(createBuild(c.id)));
  assert.equal(new Set(profiles.map(p=>p.speed)).size,3);
  assert.equal(ITEMS.length,38);
  for(const item of ITEMS){
    const b=createBuild('vanguard'),before=statsOf(b);
    b.inventory[item.id]=1;
    assert.notDeepEqual(statsOf(b),before,item.id);
    assert.ok(Object.values(statsOf(b)).every(Number.isFinite));
  }
});
test('level rewards persist across redraws and cannot be spent twice',()=>{
  const b=createBuild('ranger');addGlint(b,33);
  assert.equal(b.glint,33);assert.equal(b.level,3);assert.equal(b.pendingLevels,2);assert.equal(b.xp,3);
  const choices=levelChoices(b,()=>0);
  assert.deepEqual(levelChoices(b,()=>.99),choices);
  assert.equal(chooseLevel(b,'invalid'),false);
  assert.equal(chooseLevel(b,choices[0].id),true);
  assert.equal(chooseLevel(b,choices[0].id),false);
  assert.equal(b.pendingLevels,1);
});
test('shop purchases are atomic, merge to tier three, and reject unavailable items',()=>{
  const b=createBuild('oracle');
  const first=openShop(b,1,null,()=>0)[0];
  assert.equal(buy(b,first),false);
  b.glint=150;
  for(let wave=1;wave<=3;wave++){
    openShop(b,wave,null,()=>0);assert.equal(buy(b,first),true);
    assert.equal(buy(b,first),false);assert.equal(b.inventory[first],wave);
  }
  assert.ok(!openShop(b,4,null,()=>0).includes(first));
  const cash=b.glint;assert.ok(reroll(b,null,()=>.95));
  assert.equal(b.glint,cash-2);assert.equal(rerollCost(b),4);
  assert.ok(!b.offers.some(id=>ITEMS.find(i=>i.id===id).unlockCost));
});
test('two distinct tags activate once and preserve fractional Glint',()=>{
  const b=createBuild('vanguard');b.inventory.key=3;assert.ok(!synergies(b)[0].active);
  b.inventory.ledger=1;assert.ok(synergies(b)[0].active);
  for(let i=0;i<4;i++) addGlint(b,1);
  assert.equal(b.glint,5);assert.equal(b.xp,4);
});
test('Warden awards allow one eligible Keepsake per cleared wave',()=>{
  const b=createBuild('ranger');openShop(b,3,null,()=>0);
  const choices=rewardChoices(b,null,()=>0);
  assert.ok(choices.every(i=>i.type==='Keepsake'));
  assert.ok(claimReward(b,choices[0].id));assert.ok(!claimReward(b,choices[0].id));
  assert.equal(rewardChoices(b,null).length,0);
});
test('meta earnings survive reload and unlock once, with malformed saves recoverable',()=>{
  const store=new Map(),previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}});
  try{
    const m=loadMeta();assert.ok(finishRun(m,{wave:20,kills:100,won:true})>=6);
    assert.ok(unlock(m,'reliquary'));assert.ok(!unlock(m,'reliquary'));assert.deepEqual(loadMeta(),m);
    store.set('astra-survival.meta.v1','{bad');assert.equal(loadMeta().silt,0);
  }finally{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;}
});
test('sound preferences work before browser audio unlock and clamp values',async()=>{
  audio.volume(9,-3);audio.mute(true);audio.scene('boss');audio.intensity(9);
  assert.equal(audio.music,1);assert.equal(audio.sfx,0);assert.equal(audio.energy,1);assert.ok(audio.muted);
  assert.equal(await audio.unlock(),false);assert.doesNotThrow(()=>audio.play('rite'));
});
