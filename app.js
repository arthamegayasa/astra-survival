import { Game } from './game.js';
import { render } from './render.js';
import { audio } from './audio.js';
import { CLASSES, ITEMS, openShop, buy, reroll, rerollCost, levelChoices, chooseLevel, rewardChoices, claimReward, synergies, loadMeta, finishRun, unlock } from './build.js';

const $ = id => document.getElementById(id);
const screen = $('screen'), stage = $('stage'), hud = $('hud');
const ctx = $('arena').getContext('2d', {alpha:false});
const items = Object.fromEntries(ITEMS.map(item => [item.id,item]));
const symbols = ['✧','➶','☾'];
const keys = new Set(), stick = {x:0,y:0};
const meta = loadMeta();
let settings = {music:.55,sfx:.65,muted:false,reducedEffects:matchMedia('(prefers-reduced-motion: reduce)').matches};
try {Object.assign(settings,JSON.parse(localStorage.getItem('astra.settings') || '{}'));} catch {}
let game, page, settingsBack, previousTime=0, accumulator=0, hudTick=0, cast=false, challenge=0, toastTimer;
function saveSettings(){
  audio.volume(settings.music,settings.sfx); audio.mute(settings.muted);
  $('audio').textContent=settings.muted?'♩':'♫';
  $('audio').setAttribute('aria-label',settings.muted?'Enable sound':'Mute sound');
  try{localStorage.setItem('astra.settings',JSON.stringify(settings));}catch{}
}
function announce(message){
  clearTimeout(toastTimer); $('announcement').textContent=message;
  toastTimer=setTimeout(()=>{$('announcement').textContent='';},2200);
}
function clearInput(){keys.clear();cast=false;stick.x=stick.y=0;$('stick').firstElementChild.style.transform='';}
function display(name,html=''){
  const focused=screen.contains(document.activeElement);
  page=name; screen.innerHTML=html;
  const live=name==='combat';
  stage.classList.toggle('play',!!game);
  hud.hidden=!live; $('touch').hidden=!live; $('pause').hidden=!live;
  if(!live)clearInput();
  if(focused)screen.querySelector('button:enabled')?.focus({preventScroll:true});
}
function btn(label,action,primary=false,disabled=false){
  return '<button class="btn '+(primary?'primary':'')+'" data-action="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
}
function panel(kicker,title,content){
  return '<section class="panel"><div class="kicker">'+kicker+'</div><h2>'+title+'</h2>'+content+'</section>';
}
function card(action,label,title,description,foot,disabled=false,symbol='',accent=''){
  return '<button class="card" style="--accent:'+(accent||'var(--gold)')+'" data-action="'+action+'" '+(disabled?'disabled':'')+'>'+(symbol?'<span class="glyph">'+symbol+'</span>':'')+'<span class="tag">'+label+'</span><h3>'+title+'</h3><small>'+description+'</small><strong>'+foot+'</strong></button>';
}
function home(){
  game=null;audio.scene('menu');
  display('home','<section class="hero"><div class="eyebrow">A dark fantasy roguelike</div><h1>Astra<span>Survival</span></h1><p>The sky broke. The pieces kept us.<br>Now we keep the light.</p><div class="actions">'+btn('Begin expedition <span class="arrow">→</span>','select',true)+btn('Archives','archive')+'</div><div class="controls"><kbd>W A S D</kbd> Move &nbsp; · &nbsp; <kbd>Space</kbd> Cast Rite &nbsp; · &nbsp; <kbd>Esc</kbd> Pause</div></section>');
}
function select(){
  display('select',panel('Expedition preparation','Choose your Kept','<p class="desc">Move to evade. Your weapon fires automatically. Gather fallen Glint to grow stronger between Pulses.</p><div class="cards">'+CLASSES.map((c,i)=>card('start/'+c.id,c.weapon,c.name,c.description,c.rite+' →',false,symbols[i],c.color)).join('')+'</div><div class="actions">'+btn('← Back','home')+(meta.wins?btn('Threat level '+(challenge+1),'difficulty'):'')+'</div>'));
}
function archives(){
  const records=meta.runs+' expeditions &nbsp; · &nbsp; Deepest Pulse '+meta.bestWave+' &nbsp; · &nbsp; '+meta.wins+' victories';
  display('archive',panel('The archives','Reliquary','<p class="desc">'+records+'</p><div class="meta">Spend earned Silt to add rare Keepsakes to future shops.</div><div class="cards">'+ITEMS.filter(i=>i.unlockCost).map(i=>card('unlock/'+i.id,i.tag,i.name,i.description,meta.unlocks.includes(i.id)?'Unlocked':i.unlockCost+' Silt',meta.unlocks.includes(i.id)||meta.silt<i.unlockCost)).join('')+'</div><div class="actions">'+btn('← Back','home')+'<span class="tag">'+meta.silt+' Silt</span></div>'));
}
function combat(){
  display('combat'); clearInput();accumulator=0;
  audio.scene([7,14,20].includes(game.wave)?'boss':'combat');updateHud();
}
function start(id){
  game=new Game(id,Math.random,challenge);combat();announce('Pulse 01 · Gather Glint from the fallen');
}
function updateHud(){
  const p=game.player, b=game.build;
  const time=Math.max(0,Math.ceil(game.timeLeft)), rite=p.riteCooldown>0?Math.ceil(p.riteCooldown)+'s':'READY';
  hud.innerHTML='<b>PULSE '+String(game.wave).padStart(2,'0')+' / 20</b> &nbsp; '+time+'s &nbsp; · &nbsp; '+Math.ceil(Math.max(0,p.hp))+' HP<div class="hp"><i style="width:'+Math.max(0,Math.min(100,p.hp/p.maxHp*100))+'%"></i></div><div class="hudline">✧ '+b.glint+' Glint &nbsp; · &nbsp; Lv '+b.level+' &nbsp; · &nbsp; Rite '+rite+'</div>';
  $('cast').textContent=rite==='READY'?'RITE':rite;
}
function shop(){
  const b=game.build;
  openShop(b,game.wave,meta);audio.scene('shop');
  const levels=levelChoices(b);
  const rewards=game.rewardEarned || [7,14].includes(game.wave);
  const gifts=!levels.length && rewards?rewardChoices(b,meta):[];
  const offers=levels.length?levels:gifts.length?gifts:b.offers.map(id=>items[id]);
  const mode=levels.length?'level':gifts.length?'gift':'buy';
  const title=levels.length?'Shape your light':gifts.length?'Warden’s bequest':'The Glazier';
  const cards=offers.map(i=>card(mode+'/'+i.id,i.tag||'Training',i.name,i.description,mode==='buy'?i.price+' Glint · Tier '+((b.inventory[i.id]||0)+1):'Claim →',mode==='buy'&&i.price>b.glint)).join('');
  const inventory=Object.entries(b.inventory).map(([id,t])=>items[id].name+' '+['','I','II','III'][t]).join(' · ');
  const bonds=synergies(b).filter(s=>s.active).map(s=>s.tag+' — '+s.description).join(' · ');
  display('shop',panel('Intermission · Pulse '+game.wave+' complete',title,'<p class="desc">'+(levels.length?'Choose a free level upgrade. '+b.pendingLevels+' remaining.':gifts.length?'Choose a Keepsake from the fallen Warden.':'Trade Glint for weapons and Keepsakes. Matching pairs of tags unlock a synergy.')+'</p><div class="cards">'+cards+'</div><div class="actions">'+(mode==='buy'?btn('Next Pulse →','next',true)+btn('Reroll · '+rerollCost(b)+' Glint','reroll',false,b.glint<rerollCost(b)):'')+'<span class="tag">'+b.glint+' Glint</span></div>'+(inventory?'<p class="meta">Loadout · '+inventory+'</p>':'')+(bonds?'<p class="meta">'+bonds+'</p>':'')));
}
function end(){
  const won=game.phase==='won';const earned=finishRun(meta,{wave:game.wave,kills:game.kills,won});
  audio.scene(won?'victory':'defeat');
  display('end',panel(won?'Expedition complete':'Expedition lost',won?'The light holds.':'The glass remembers.','<p class="desc">Pulse '+game.wave+' of 20 &nbsp; · &nbsp; '+game.kills+' Unlit banished &nbsp; · &nbsp; Level '+game.level+'</p><p class="meta">+'+earned+' Silt returned to the archives.</p><div class="actions">'+btn('New expedition →','retry',true)+btn('Title screen','home')+'</div>'));
}
function pause(){
  if(page!=='combat')return;
  display('pause',panel('Expedition paused','A moment of stillness','<p class="desc">Move with WASD, arrows, or the touch stick. Cast your Rite with Space or the Rite button.</p><div class="actions">'+btn('Resume →','resume',true)+btn('Settings','settings')+btn('Leave expedition','leave')+'</div>'));
  audio.scene('menu');
}
function options(){
  if(page==='combat')pause();
  settingsBack=page;
  display('settings',panel('Preferences','Settings',['music','sfx'].map((k,i)=>'<label class="row">'+['Music','Sound effects'][i]+'<input type="range" min="0" max="1" step=".05" data-option="'+k+'" value="'+settings[k]+'"></label>').join('')+'<label class="row">Reduce motion and effects<input type="checkbox" data-option="reducedEffects" '+(settings.reducedEffects?'checked':'')+'></label><div class="actions">'+btn('Done','close-settings',true)+'</div>'));
}
function closeSettings(){
  if(settingsBack==='pause'){page='combat';pause();}
  else if(settingsBack==='shop')shop();else if(settingsBack==='select')select();
  else if(settingsBack==='archive')archives();else home();
}
function action(value){
  const [name,id]=value.split('/');
  if(name==='home')home();
  else if(name==='retry'){game=null;select();}
  else if(name==='select')select();
  else if(name==='archive')archives();
  else if(name==='difficulty'){challenge=(challenge+1)%(Math.min(meta.wins,4)+1);select();}
  else if(name==='start')start(id);
  else if(name==='unlock'){unlock(meta,id);archives();}
  else if(name==='resume')combat();
  else if(name==='settings')options();
  else if(name==='close-settings')closeSettings();
  else if(name==='leave')display('leave',panel('Leave expedition','Return to the archives?','<p class="desc">Leaving ends this expedition without earning Silt.</p><div class="actions">'+btn('Keep playing','resume',true)+btn('Leave now','home')+'</div>'));
  else if(name==='next'){game.nextWave();combat();announce('Pulse '+game.wave);}
  else if(['buy','reroll','level','gift'].includes(name)){
    const b=game.build;
    if(name==='buy')buy(b,id);else if(name==='reroll')reroll(b,meta);else if(name==='level')chooseLevel(b,id);else claimReward(b,id);
    audio.play('level');shop();
  }
}
screen.addEventListener('click',e=>{const target=e.target.closest('[data-action]');if(target){audio.unlock();action(target.dataset.action);}});
screen.addEventListener('input',e=>{const k=e.target.dataset.option;if(k){settings[k]=e.target.type==='checkbox'?e.target.checked:Number(e.target.value);saveSettings();}});
$('audio').onclick=()=>{audio.unlock();settings.muted=!settings.muted;saveSettings();};
$('settings').onclick=()=>{audio.unlock();if(page==='settings')closeSettings();else options();};
$('pause').onclick=pause;
document.querySelector('.brand').onclick=e=>{e.preventDefault();home();};
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&!e.repeat){if(page==='combat')pause();else if(page==='pause')combat();else if(page==='settings')closeSettings();return;}
  if(page!=='combat'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space'].includes(e.code))return;
  e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)cast=true;
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{clearInput();pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();}});
const joystick=$('stick');
function moveStick(e){const r=joystick.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,d=Math.max(r.width*.36,Math.hypot(x,y));stick.x=x/d;stick.y=y/d;joystick.firstElementChild.style.transform='translate('+stick.x*22+'px,'+stick.y*22+'px)';}
joystick.onpointerdown=e=>{joystick.setPointerCapture(e.pointerId);moveStick(e);};
joystick.onpointermove=e=>{if(joystick.hasPointerCapture(e.pointerId))moveStick(e);};
joystick.onlostpointercapture=()=>{stick.x=stick.y=0;joystick.firstElementChild.style.transform='';};
$('cast').onpointerdown=()=>{cast=true;};
function frame(now){
  const dt=Math.min(.1,(now-previousTime)/1000);previousTime=now;
  if(page==='combat'){
    accumulator+=dt;
    while(accumulator>=1/60&&game.phase==='combat'){
      const key=(a,b)=>Number(keys.has(a)||keys.has(b));
      game.update(1/60,{x:stick.x+key('KeyD','ArrowRight')-key('KeyA','ArrowLeft'),y:stick.y+key('KeyS','ArrowDown')-key('KeyW','ArrowUp'),rite:cast});
      accumulator-=1/60;cast=false;
    }
    for(const event of game.events.splice(0))audio.play(event);
    if(game.phase==='shop')shop();else if(['won','lost'].includes(game.phase))end();
    else if((hudTick+=dt)>.12){updateHud();audio.intensity(Math.max(0,1-game.timeLeft/30));hudTick=0;}
  }
  render(ctx,game,now/1000,{reducedEffects:settings.reducedEffects,reducedMotion:settings.reducedEffects});
  requestAnimationFrame(frame);
}
saveSettings();home();requestAnimationFrame(frame);

