import {CFG,CHARS,WEAPONS,ARENAS} from '../shared/config.js';
import * as A from './audio.js';
import {Fx,drawGame,drawPreview,buildArena} from './renderer.js';
const $=id=>document.getElementById(id),cv=$('c'),ctx=cv.getContext('2d');
const url=window.BACKEND_URL||location.origin;
let sock,me=null,room=null,G=null,screen='menu',selW=0,ses=null,dpr=1,lastIn='';
const keys={},mouse={x:0,y:0,down:false};
try{ses=JSON.parse(sessionStorage.getItem('ses'))}catch{}
$('name').value=localStorage.getItem('name')||'';
const show=s=>{screen=s;for(const e of document.querySelectorAll('.screen'))e.classList.toggle('on',e.id===s||(s==='pause'&&e.id==='hud')||(s==='end'&&e.id==='hud'&&false))};
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display='none',2500)}
const saveSes=(code,token)=>{ses=code?{code,token}:null;if(ses)sessionStorage.setItem('ses',JSON.stringify(ses));else sessionStorage.removeItem('ses')};
// ---------- network ----------
function loadIO(){return new Promise((res,rej)=>{if(window.io)return res();const s=document.createElement('script');s.src=url+'/socket.io/socket.io.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
let ready;
function connect(){return ready||(ready=loadIO().then(()=>{sock=io(url,{transports:['websocket','polling']});
 sock.on('connect',()=>{$('conn').textContent='Online';if(ses)sock.emit('rejoin',ses,r=>{if(r&&r.ok){me=r.id;room=r.room;if(r.playing)beginGame(r.arena);else showLobby()}else{saveSes(null);if(screen!=='menu'){G=null;show('menu')}}})});
 sock.on('disconnect',()=>$('conn').textContent='Reconnecting…');
 sock.on('room',onRoom);sock.on('start',d=>beginGame(d.arena));sock.on('countdown',()=>{A.sfx.click();toast('Match starting…')});
 sock.on('s',onSnap);sock.on('end',onEnd)}).catch(()=>{ready=null;toast('Cannot reach game server');throw 0}))}
async function enter(ev,data){A.init();A.sfx.click();localStorage.setItem('name',$('name').value);try{await connect()}catch{return}
 const wait=()=>new Promise(r=>sock.connected?r():sock.once('connect',r));await wait();
 sock.emit(ev,{...data,name:$('name').value},r=>{if(!r.ok)return toast(r.err||'Error');me=r.id;saveSes(r.code,r.token);showLobby()})}
$('bQuick').onclick=()=>enter('quick');$('bCreate').onclick=()=>enter('create');
$('bJoin').onclick=()=>{const c=$('code').value.trim();if(c.length<4)return toast('Enter the 4-letter room code');enter('join',{code:c})};
$('bLeave').onclick=()=>{A.sfx.click();sock.emit('leave');saveSes(null);room=null;show('menu')};
$('bReady').onclick=()=>{A.sfx.click();const m=room.players.find(p=>p.id===me);sock.emit('ready',!m.ready)};
$('arena').innerHTML=ARENAS.map((a,i)=>`<option value="${i}">${a.name}</option>`).join('');$('arena').onchange=e=>sock.emit('arena',+e.target.value);
$('bResume').onclick=()=>show('hud');$('bMute').onclick=()=>A.toggle();
$('bQuit').onclick=()=>{sock.emit('leave');saveSes(null);G=null;room=null;show('menu')};
$('bAgain').onclick=()=>{A.sfx.click();if(room&&room.state==='lobby')showLobby();else{show('lobby');renderLobby()}};
$('bMenu').onclick=()=>{sock.emit('leave');saveSes(null);G=null;room=null;show('menu')};
// ---------- lobby ----------
$('chars').innerHTML=CHARS.map((c,i)=>`<div class="card" data-i="${i}"><canvas width="120" height="120"></canvas><b>${c.name}</b>${c.desc}<br>HP ${c.hp} · SPD ${c.speed}</div>`).join('');
for(const el of $('chars').children)el.onclick=()=>{A.sfx.click();sock.emit('char',+el.dataset.i)};
function showLobby(){show('lobby');renderLobby()}
function onRoom(r){room=r;if(screen==='lobby'||(screen==='end'&&r.state==='lobby'))showLobby();if(screen==='end'&&r.state==='lobby')$('bAgain').textContent='Back to Lobby'}
function renderLobby(){if(!room)return;const m=room.players.find(p=>p.id===me)||{};$('lcode').textContent=room.code;
 $('lstate').textContent=room.state==='countdown'?'Starting in 3…':room.pub?'Public match · waiting for 2–4 players':'Private room · share the code with friends';
 for(const el of $('chars').children)el.classList.toggle('sel',+el.dataset.i===m.char);
 $('arena').value=room.arena;$('arena').disabled=room.host!==me;
 $('plist').innerHTML=room.players.map(p=>`<div class="pl ${p.ready?'rdy':''} ${p.connected?'':'off'}">${p.id===room.host?'👑 ':''}${p.name} · ${CHARS[p.char].name}${p.ready?' ✔':''}</div>`).join('');
 $('bReady').textContent=m.ready?'CANCEL READY':'READY';$('bReady').disabled=room.state!=='lobby'&&room.state!=='countdown'||room.players.length<2&&!m.ready&&false}
// ---------- game ----------
function beginGame(arena){G={arena,snaps:[],bg:buildArena(arena),fx:new Fx(),vis:{},fireT:{},cam:{x:CFG.W/2,y:CFG.H/2,s:1},self:null,shake:0,latest:null,time:CFG.MATCH};selW=0;buildWbar();show('hud');lastIn=''}
function buildWbar(){$('wbar').innerHTML=WEAPONS.map((w,i)=>`<div class="w" data-i="${i}"><s>${i+1}</s><br>${w.name.split(' ').pop()}<i></i></div>`).join('');for(const e of $('wbar').children)e.onclick=()=>selW=+e.dataset.i}
const infoOf=id=>room&&room.players.find(p=>p.id===id);
function near(x,y){const m=G.self;return m?Math.hypot(m.x-x,m.y-y)<650:true}
function onSnap(s){if(!G)return;const now=performance.now(),snap={t:now,p:new Map(s.p.map(a=>[a[0],a])),r:new Map(s.r.map(a=>[a[0],a])),c:s.c};G.snaps.push(snap);if(G.snaps.length>8)G.snaps.shift();G.latest=snap;G.time=s.t;
 for(const e of s.e||[]){const f=e[0];
  if(f==='fire'){G.fireT[e[1]]=now;const w=e[2];if(near(e[3],e[4]))A.sfx[['glove','hammer','gas','spring','energy'][w]]();if(w===4)G.fx.burst(e[3]+Math.cos(e[5])*30,e[4]+Math.sin(e[5])*30,['#4df3ff','#ff4dd2'],5,160,.2,4);if(w===2)G.fx.burst(e[3]+Math.cos(e[5])*40,e[4]+Math.sin(e[5])*40,['#9cff57','#c77dff'],10,180,.5,9)}
  else if(f==='hit'){G.fx.hit(e[3],e[1],e[2]);if(near(e[1],e[2])){A.sfx[['gloveHit','hammerHit','gloveHit','springHit','energyHit','hammerHit'][e[3]]]();G.shake=Math.max(G.shake,e[3]===0||e[3]===1?12:6)}}
  else if(f==='land'){G.fx.dust(e[1],e[2],e[3]?14:6);if(near(e[1],e[2]))A.sfx.land();if(e[3])G.shake=Math.max(G.shake,6)}
  else if(f==='kill'){G.fx.kill(e[3],e[4]);A.sfx.ko();G.shake=Math.max(G.shake,near(e[3],e[4])?20:8)}}}
function lerpA(a,b,f){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*f}
function view(now,dt){const S=G.snaps;if(!S.length)return null;const rt=now-100;let i=S.length-1;while(i>0&&S[i].t>rt)i--;const a=S[i],b=S[i+1]||a,f=b===a?0:Math.min(1,Math.max(0,(rt-a.t)/(b.t-a.t)));
 const players=[];
 for(const[id,pb]of b.p){const pa=a.p.get(id)||pb,o=G.vis[id]||(G.vis[id]={id,phase:0}),inf=infoOf(id)||{name:'?',char:0};
  o.x=pa[1]+(pb[1]-pa[1])*f;o.y=pa[2]+(pb[2]-pa[2])*f;o.a=lerpA(pa[3],pb[3],f);o.hp=pb[4];o.z=pa[5]+(pb[5]-pa[5])*f;o.f=pb[6];o.w=pb[7];o.score=pb[9];o.name=inf.name;o.char=inf.char;
  if(o.f&2)o.phase+=dt*16;
  if(id===me){const l=G.latest.p.get(me);if(!G.self||Math.hypot(G.self.x-l[1],G.self.y-l[2])>150)G.self={x:l[1],y:l[2]};const k=1-Math.exp(-22*dt);G.self.x+=(l[1]-G.self.x)*k;G.self.y+=(l[2]-G.self.y)*k;o.x=G.self.x;o.y=G.self.y;o.z=l[5];if(!(l[6]&1))o.a=aim(o)}
  players.push(o)}
 const proj=[];for(const[id,q]of b.r){const p0=a.r.get(id)||q;proj.push([id,q[1],p0[2]+(q[2]-p0[2])*f,p0[3]+(q[3]-p0[3])*f,q[4]]);if(q[1]!==0&&Math.random()<.9)G.fx.trail(proj.at(-1)[2],proj.at(-1)[3],q[1]===1?'#fff36b':q[1]===3?'#9cff57':'#4df3ff',q[1]===4?5:7)}
 return{players,proj,clouds:b.c,me}}
const sc=()=>Math.max(.6,Math.min(cv.width/1000,cv.height/700));
function aim(p){const s=G.cam.s,wx=G.cam.x+(mouse.x-cv.width/2)/s,wy=G.cam.y+(mouse.y-cv.height/2)/s;return Math.atan2(wy-p.y,wx-p.x)}
// ---------- input ----------
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();keys[k]=true;
 if(screen==='hud'||screen==='pause'){if(k>='1'&&k<='5')selW=+k-1;if(k==='escape')show(screen==='hud'?'pause':'hud')}if(k==='m')A.toggle();if(['arrowup','arrowdown',' '].includes(k)&&G)e.preventDefault()});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false});
cv.addEventListener('mousemove',e=>{mouse.x=e.clientX*dpr;mouse.y=e.clientY*dpr});
cv.addEventListener('mousedown',e=>{if(e.button===0){mouse.down=true;A.init()}});addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false});cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('mousemove',e=>{mouse.x=e.clientX*dpr;mouse.y=e.clientY*dpr});
document.addEventListener('mousedown',e=>{if(e.button===0&&screen==='hud')mouse.down=true});
setInterval(()=>{if(!G||screen==='end'||!sock||!sock.connected)return;const self=G.vis[me];if(!self)return;
 const x=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),y=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
 sock.volatile.emit('in',{x,y,a:+aim(self).toFixed(2),att:mouse.down&&screen==='hud',w:selW})},33);
function onEnd(d){if(!G)return;mouse.down=false;const win=d.winner===me;A.sfx[win?'win':'lose']();show('end');
 $('etitle').textContent=d.winner===null?'DRAW!':win?'VICTORY!':'DEFEAT';$('etitle').style.color=win?'#ffd23f':'#9aa4ff';
 $('escores').innerHTML=d.scores.map((s,i)=>`<div>${i+1}. ${s.name}${s.id===me?' (you)':''} — ${s.score} KO · ${s.deaths} deaths</div>`).join('');$('bAgain').textContent='Back to Lobby'}
// ---------- loop ----------
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 const W=innerWidth,H=innerHeight;dpr=Math.min(2,devicePixelRatio||1);if(cv.width!==W*dpr|0||cv.height!==H*dpr|0){cv.width=W*dpr;cv.height=H*dpr}
 if(screen==='lobby'){const cs=document.querySelectorAll('#chars canvas');cs.forEach((c,i)=>drawPreview(c,i,t))}
 if(!G||screen==='menu'||screen==='lobby'){if(screen==='menu'||screen==='lobby'){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height)}return}
 const v=view(now,dt);if(!v)return;
 const s=G.cam.s=sc(),me_=G.vis[me],hw=cv.width/s/2,hh=cv.height/s/2;
 if(me_){const tx=hw*2>=CFG.W?CFG.W/2:Math.max(hw,Math.min(CFG.W-hw,me_.x)),ty=hh*2>=CFG.H?CFG.H/2:Math.max(hh,Math.min(CFG.H-hh,me_.y)),k=1-Math.exp(-8*dt);G.cam.x+=(tx-G.cam.x)*k;G.cam.y+=(ty-G.cam.y)*k}
 G.shake=Math.max(0,G.shake-dt*40);v.shx=(Math.random()-.5)*G.shake*s;v.shy=(Math.random()-.5)*G.shake*s;v.cam=G.cam;
 G.fx.update(dt);drawGame(ctx,cv,G,v,t);hud(v)}
function hud(v){const m=G.latest&&G.latest.p.get(me);$('timer').textContent=Math.floor(G.time/60)+':'+String(G.time%60).padStart(2,'0');
 const sorted=[...v.players].sort((a,b)=>b.score-a.score);$('score').innerHTML=`<div style="color:#ffd23f">First to ${CFG.WIN} KOs</div>`+sorted.map(p=>`<div style="${p.id===me?'color:#ffd23f':''}"><span>${p.name}</span><span>${p.score}</span></div>`).join('');
 if(!m)return;const max=CHARS[(infoOf(me)||{char:0}).char].hp;$('hpbar').style.width=m[4]/max*100+'%';$('hptxt').textContent=m[4]+' / '+max;$('dead').style.display=m[6]&1?'block':'none';
 [...$('wbar').children].forEach((e,i)=>{e.classList.toggle('sel',i===selW);e.lastChild.style.height=Math.min(100,m[8][i]/WEAPONS[i].cd*100)+'%'})}
requestAnimationFrame(frame);connect().catch(()=>{});
