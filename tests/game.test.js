import test from 'node:test';
import assert from 'node:assert/strict';
import {Game, seededRandom} from '../game.js';
import {openShop, buy, levelChoices, chooseLevel, rewardChoices, claimReward} from '../build.js';

test('fixed step simulation reproduces the same seeded run at different frame rates', () => {
  function simulate(frames, dt) {
    const game = new Game('ranger', seededRandom(227));
    for (let i=0;i<frames;i++) game.update(dt,{x:1,y:1});
    return [game.player, game.enemies, game.drops, game.kills, game.timeLeft];
  }
  assert.deepEqual(simulate(1200,1/120),simulate(300,1/30));
});

test('Rite stays queued across short frames and honors cooldown', () => {
  for (const id of ['ranger','oracle','vanguard']) {
    const g = new Game(id,seededRandom(1));
    g.update(1/120,{rite:true});
    g.update(1/120,{});
    g.update(1/60,{rite:true});
    assert.equal(g.events.filter(s=>s==='rite').length,1);
    assert.ok(g.player.riteCooldown>0);
  }
});

test('death is terminal and freezes simulation', () => {
  const g = new Game('ranger',seededRandom(1));
  g.player.invuln=0;
  g.hurt(999);
  assert.equal(g.phase,'lost');
  assert.equal(g.nextWave(),false);
  const before=g.elapsed;
  g.update(0.2,{rite:true});
  assert.equal(g.elapsed,before);
});

test('boss blocks shop after the pulse timer expires', () => {
  const g = new Game('oracle',seededRandom(9));
  g.wave=7;
  g.clock=g.duration-0.01;
  g.update(1/60);
  assert.equal(g.phase,'combat');
  const boss=g.enemies.find(e=>e.kind==='boss');
  assert.ok(boss);
  g.hit(boss,boss.hp);
  g.update(1/60);
  assert.equal(g.phase,'shop');
  assert.equal(g.rewardEarned,true);
});

test('seeded campaign can win through movement, attacks and ordinary shop purchases', () => {
  const rng=seededRandom(1987);
  const g=new Game('oracle',rng);
  const bosses=new Set();
  for(let frame=0;frame<60*1700&&g.phase!=='won'&&g.phase!=='lost';frame++) {
    if(g.phase==='shop'){
      openShop(g.build,g.wave,{},rng);
      while(g.pendingLevels) chooseLevel(g.build,levelChoices(g.build,rng)[0].id);
      if(g.rewardEarned) {
        const reward=rewardChoices(g.build,{},rng)[0];
        if(reward) claimReward(g.build,reward.id);
      }
      for(const id of [...g.build.offers]) buy(g.build,id);
      g.nextWave();
    }
    const a=g.elapsed*.59;
    const dx=480+200*Math.cos(a)-g.player.x,dy=270+145*Math.sin(a)-g.player.y;
    g.update(1/60,{x:dx,y:dy,rite:g.enemies.some(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)<120)});
    if(g.events.includes('boss')) bosses.add(g.wave);
    g.events.length=0;
  }
  assert.equal(g.phase,'won', 'campaign ended at wave '+g.wave);
  assert.deepEqual([...bosses],[7,14,20]);
  assert.ok(g.kills>100);
});
