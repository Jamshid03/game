import {CFG,CHARS,WEAPONS,ARENAS} from '../shared/config.js';
const R=CFG.R,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),WI=Object.fromEntries(WEAPONS.map((w,i)=>[w.id,i]));
const SPAWNS=[[200,200],[1400,1000],[1400,200],[200,1000]];
export function newPlayer(id,token,name){const p={id,token,name,char:0,ready:false,connected:true,sid:null,in:{x:0,y:0,a:0,att:false,w:0}};resetPlayer(p,0);return p}
export function resetPlayer(p,si){const s=SPAWNS[si%4];Object.assign(p,{x:s[0],y:s[1],vx:0,vy:0,z:0,vz:0,bounce:0,hp:CHARS[p.char].hp,cd:[0,0,0,0,0],stun:0,slow:0,conf:0,hurt:0,atk:0,inv:0,dead:false,respawn:0,score:0,deaths:0,w:0,a:0,mv:false})}
export function startMatch(room){room.proj=[];room.clouds=[];room.ev=[];room.time=CFG.MATCH;let i=0;for(const p of room.players.values())resetPlayer(p,i++);room.state='playing'}
function respawn(room,p){let best=SPAWNS[0],bd=-1;for(const s of SPAWNS){let m=1e9;for(const o of room.players.values())if(o!==p&&!o.dead)m=Math.min(m,Math.hypot(o.x-s[0],o.y-s[1]));if(m>bd){bd=m;best=s}}
 Object.assign(p,{x:best[0],y:best[1],vx:0,vy:0,z:0,vz:0,hp:CHARS[p.char].hp,dead:false,stun:0,slow:0,conf:0,cd:[0,0,0,0,0],inv:1.6})}
function pushOut(o,x,y,r){const cx=clamp(x,o[0],o[0]+o[2]),cy=clamp(y,o[1],o[1]+o[3]),dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy);
 if(d>=r)return null;if(d===0){const l=x-o[0],rr=o[0]+o[2]-x,t=y-o[1],b=o[1]+o[3]-y,m=Math.min(l,rr,t,b);
  return m===l?[o[0]-r,y]:m===rr?[o[0]+o[2]+r,y]:m===t?[x,o[1]-r]:[x,o[1]+o[3]+r]}return[cx+dx/d*r,cy+dy/d*r]}
const blocked=(A,x,y,r)=>A.obs.some(o=>pushOut(o,x,y,r));
export function step(room,dt){const A=ARENAS[room.arena],ps=[...room.players.values()];room.time-=dt;
 for(const p of ps)upd(room,p,dt,A);
 for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(a.dead||b.dead||a.z>30||b.z>30)continue;
  let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<R*1.8){if(!d){dx=1;d=1}const o=(R*1.8-d)/2;a.x-=dx/d*o;a.y-=dy/d*o;b.x+=dx/d*o;b.y+=dy/d*o}}
 projs(room,dt,A,ps);clouds(room,dt,ps);
 let top=0;for(const p of ps)top=Math.max(top,p.score);return room.time<=0||top>=CFG.WIN}
function upd(room,p,dt,A){
 if(p.dead){p.respawn-=dt;if(p.respawn<=0)respawn(room,p);return}
 p.cd=p.cd.map(c=>Math.max(0,c-dt));for(const k of['stun','slow','conf','hurt','atk','inv'])p[k]=Math.max(0,p[k]-dt);
 const i=p.connected?p.in:{x:0,y:0,a:p.a,att:false,w:p.w},ch=CHARS[p.char];p.w=i.w;p.a=i.a;
 let mx=0,my=0;if(p.stun<=0&&p.z===0){mx=i.x;my=i.y;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}if(p.conf>0){mx=-mx;my=-my}}
 p.mv=!!(mx||my);const sp=ch.speed*(p.slow>0?.55:1);
 p.x+=(mx*sp+p.vx)*dt;p.y+=(my*sp+p.vy)*dt;const f=Math.exp(-(p.z>0?1.2:5)*dt);p.vx*=f;p.vy*=f;
 if(p.z>0||p.vz>0){p.vz-=1500*dt;p.z+=p.vz*dt;if(p.z<=0&&p.vz<0){const imp=-p.vz;p.z=0;
  if(p.bounce>0&&imp>220){p.vz=imp*.58;p.bounce--;room.ev.push(['land',p.x|0,p.y|0,1])}else{p.vz=0;p.bounce=0;room.ev.push(['land',p.x|0,p.y|0,imp>300?1:0])}}}
 if(p.z<40)for(const o of A.obs){const r=pushOut(o,p.x,p.y,R*.9);if(r){p.x=r[0];p.y=r[1];p.vx*=.4;p.vy*=.4}}
 p.x=clamp(p.x,R,CFG.W-R);p.y=clamp(p.y,R,CFG.H-R);
 if(i.att&&p.cd[p.w]<=0&&p.stun<=0&&p.z===0)fire(room,p,A)}
function fire(room,p,A){const w=WEAPONS[p.w],c=Math.cos(p.a),s=Math.sin(p.a);p.cd[p.w]=w.cd;p.atk=.25;room.ev.push(['fire',p.id,p.w,p.x|0,p.y|0,+p.a.toFixed(2)]);
 if(w.id==='glove'){for(const t of room.players.values()){if(t===p||t.dead)continue;const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy);
   if(d<w.range+R&&(dx*c+dy*s)/(d||1)>.3)hit(room,t,p,w,c,s,WI.glove)}}
 else if(w.id==='gas'){let x=p.x+c*w.range,y=p.y+s*w.range;if(blocked(A,x,y,30)){x=p.x;y=p.y}room.clouds.push({x:clamp(x,40,CFG.W-40),y:clamp(y,40,CFG.H-40),r:w.cloud.r,life:w.cloud.life,L:w.cloud.life,o:p.id,t:0})}
 else room.proj.push({id:++room.pid,t:WI[w.id],o:p.id,x:p.x+c*28,y:p.y+s*28,vx:c*w.speed,vy:s*w.speed,d:0,ph:0,hit:new Set(),a:p.a})}
function hit(room,t,att,w,c,s,wi,o={}){if(t.dead||t.inv>0)return;const ch=CHARS[t.char],k=(o.kb??w.kb)*ch.kb;
 t.hp-=o.dmg??w.dmg;t.vx+=c*k;t.vy+=s*k;if(w.stun){t.stun=Math.max(t.stun,w.stun)}t.hurt=.2;
 if(w.launch){t.vz=w.launch;t.z=1;t.bounce=2}
 if(!o.quiet)room.ev.push(['hit',t.x|0,t.y|0,wi]);
 if(t.hp<=0){t.hp=0;t.dead=true;t.respawn=CFG.RESPAWN;t.deaths++;t.z=0;t.vz=0;if(att&&att!==t)att.score++;room.ev.push(['kill',att?att.id:'',t.id,t.x|0,t.y|0])}}
function projs(room,dt,A,ps){for(let k=room.proj.length-1;k>=0;k--){const q=room.proj[k],w=WEAPONS[q.t],own=room.players.get(q.o);let rm=false;
 if(q.t===1&&q.ph===1){if(!own||own.dead){room.proj.splice(k,1);continue}const dx=own.x-q.x,dy=own.y-q.y,d=Math.hypot(dx,dy);
  if(d<34){room.proj.splice(k,1);continue}q.vx=dx/d*w.speed*1.15;q.vy=dy/d*w.speed*1.15}
 const sx=q.vx*dt,sy=q.vy*dt;q.x+=sx;q.y+=sy;q.a=Math.atan2(q.vy,q.vx);
 const turn=()=>{if(q.ph===0){q.ph=1;q.hit.clear()}else rm=true};
 if(q.ph===0){q.d+=Math.hypot(sx,sy);if(q.d>=w.range){if(q.t===1)turn();else rm=true}}
 if(!rm&&(q.x<0||q.y<0||q.x>CFG.W||q.y>CFG.H||blocked(A,q.x,q.y,w.r*.7))){room.ev.push(['hit',q.x|0,q.y|0,q.t===1?5:q.t]);if(q.t===1){q.x=clamp(q.x,0,CFG.W);q.y=clamp(q.y,0,CFG.H);turn()}else rm=true}
 if(!rm)for(const t of ps){if(t.dead||t.id===q.o||q.hit.has(t.id))continue;if(Math.hypot(t.x-q.x,t.y-q.y)<R+w.r){q.hit.add(t.id);
   const l=Math.hypot(q.vx,q.vy)||1;hit(room,t,own,w,q.vx/l,q.vy/l,q.t);if(q.t!==1){rm=true;break}}}
 if(rm)room.proj.splice(k,1)}}
function clouds(room,dt,ps){for(let k=room.clouds.length-1;k>=0;k--){const c=room.clouds[k];c.life-=dt;c.t-=dt;if(c.life<=0){room.clouds.splice(k,1);continue}
 const tick=c.t<=0;if(tick)c.t=.5;const own=room.players.get(c.o),w=WEAPONS[2];
 for(const p of ps){if(p.dead||p.id===c.o||p.z>20)continue;if(Math.hypot(p.x-c.x,p.y-c.y)<c.r+R*.5){p.slow=.6;p.conf=.6;if(tick)hit(room,p,own,w,0,0,2,{dmg:w.cloud.dps*.5,kb:0,quiet:true})}}}}
const r1=n=>Math.round(n);
export function snapshot(room){const ps=[...room.players.values()].map(p=>[p.id,r1(p.x),r1(p.y),+p.a.toFixed(2),Math.ceil(p.hp),r1(p.z),(p.dead?1:0)|(p.mv?2:0)|(p.stun>0?4:0)|(p.hurt>0?8:0)|(p.z>0||p.vz>0?16:0)|(p.atk>0?32:0)|(p.slow>0?64:0)|(p.connected?0:128)|(p.inv>0?256:0),p.w,p.cd.map(c=>+c.toFixed(1)),p.score]);
 const s={t:Math.max(0,Math.ceil(room.time)),p:ps,r:room.proj.map(q=>[q.id,q.t,r1(q.x),r1(q.y),+q.a.toFixed(2)]),c:room.clouds.map(c=>[r1(c.x),r1(c.y),c.r,+(c.life/c.L).toFixed(2)])};
 if(room.ev.length)s.e=room.ev.splice(0);return s}
