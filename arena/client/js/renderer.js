import {CFG,CHARS,WEAPONS,ARENAS} from '../shared/config.js';
const TAU=Math.PI*2,OUT='#1b1b2f';
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const blob=(c,x,y,rx,ry,f,lw=3,rot=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.fillStyle=f;c.fill();if(lw){c.lineWidth=lw;c.strokeStyle=OUT;c.stroke()}};
const shadow=(c,x,y,rx,ry)=>{c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill()};
export class Fx{constructor(){this.p=[]}
 add(o){if(this.p.length>500)this.p.shift();this.p.push(o)}
 burst(x,y,cols,n,sp,life,size,g=0){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=sp*(.3+Math.random()*.7);this.add({k:0,x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:life,L:life,sz:size*(.6+Math.random()*.8),c:cols[i%cols.length],g})}}
 ring(x,y,c,r,life=.35){this.add({k:1,x,y,l:life,L:life,sz:r,c})}
 text(x,y,t,c='#ffd23f',sz=28){this.add({k:2,x,y,vx:0,vy:-50,l:.75,L:.75,t,c,sz})}
 trail(x,y,c,sz=8){this.add({k:0,x,y,vx:0,vy:0,l:.3,L:.3,sz,c,g:0})}
 hit(wi,x,y){const F=this;
  if(wi===0){F.burst(x,y,['#fff','#ffd23f','#ff7a00'],14,380,.45,7);F.ring(x,y,'#fff',60);F.text(x,y-20,['POW!','BAM!','WHAM!'][Math.random()*3|0])}
  else if(wi===1||wi===5){F.burst(x,y,['#fff','#fff36b','#7fd4ff'],22,520,.4,5);F.ring(x,y,'#fff36b',80,.4);F.text(x,y-20,'ZAP!','#fff36b')}
  else if(wi===2)F.burst(x,y,['#9cff57','#c77dff'],6,80,.5,10);
  else if(wi===3){F.burst(x,y,['#9cff57','#fff','#ff6fb5'],16,380,.5,6);F.ring(x,y,'#9cff57',60);F.text(x,y-20,'BOING!','#9cff57')}
  else{F.burst(x,y,['#4df3ff','#ff4dd2','#fff'],14,420,.35,5);F.ring(x,y,'#4df3ff',45,.25)}}
 kill(x,y){this.burst(x,y,['#ff7a00','#ffd23f','#fff','#e4453b'],40,560,.7,11);this.ring(x,y,'#ffd23f',140,.5);this.ring(x,y,'#fff',90,.35);this.text(x,y-30,'KO!','#ff4d4d',44)}
 dust(x,y,n=8){this.burst(x,y+8,['#d9c9a3','#bfae88'],n,160,.5,8)}
 update(dt){const a=this.p;for(let i=a.length-1;i>=0;i--){const p=a[i];p.l-=dt;if(p.l<=0){a[i]=a[a.length-1];a.pop();continue}p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;if(p.k===0){p.vx*=.95;p.vy=p.vy*.95+(p.g||0)*dt}}}
 draw(c){for(const p of this.p){const t=p.l/p.L;c.globalAlpha=Math.min(1,t*1.6);
  if(p.k===0){c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,p.sz*t+1,0,TAU);c.fill()}
  else if(p.k===1){c.strokeStyle=p.c;c.lineWidth=7*t;c.beginPath();c.arc(p.x,p.y,p.sz*(1-t)+8,0,TAU);c.stroke()}
  else{c.font='900 '+p.sz*(1.3-t*.3)+'px "Trebuchet MS",sans-serif';c.textAlign='center';c.lineWidth=7;c.strokeStyle=OUT;c.strokeText(p.t,p.x,p.y);c.fillStyle=p.c;c.fillText(p.t,p.x,p.y)}}c.globalAlpha=1}}
// ---------- Arena background (cached) ----------
export function buildArena(idx){const A=ARENAS[idx],cv=document.createElement('canvas');cv.width=CFG.W;cv.height=CFG.H;const c=cv.getContext('2d'),r=rng(idx*77+5),W=CFG.W,H=CFG.H;
 const pal=[{a:'#6dbb4f',b:'#64b048',edge:'#2f7a34'},{a:'#e9c57a',b:'#e0ba6c',edge:'#a8742f'},{a:'#141a38',b:'#18204a',edge:'#ff2fd0'}][idx];
 for(let y=0;y<H;y+=80)for(let x=0;x<W;x+=80){c.fillStyle=((x+y)/80)%2?pal.a:pal.b;c.fillRect(x,y,80,80)}
 for(let i=0;i<260;i++){const x=r()*W,y=r()*H;
  if(idx===0){c.strokeStyle='#3f8f3a';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y-9);c.moveTo(x,y);c.lineTo(x+4,y-8);c.stroke();if(i%9===0){blob(c,x,y,4,4,['#fff','#ff6fb5','#ffd23f'][i%3],1)}}
  else if(idx===1){c.strokeStyle='rgba(168,116,47,.45)';c.lineWidth=2;c.beginPath();c.arc(x,y,10+r()*14,.2,2.4);c.stroke();if(i%7===0)blob(c,x,y,4,3,'#b08a5a',1.5)}
  else{if(i%6===0){c.strokeStyle='rgba(77,243,255,.5)';c.lineWidth=2;c.strokeRect(x-15,y-15,30,30)}}}
 if(idx===2){c.strokeStyle='rgba(77,243,255,.18)';c.lineWidth=1;for(let x=0;x<=W;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<=H;y+=80){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  for(const[x,y]of[[200,200],[1400,1000],[1400,200],[200,1000],[800,600]]){const g=c.createRadialGradient(x,y,5,x,y,70);g.addColorStop(0,'rgba(255,47,208,.55)');g.addColorStop(1,'rgba(255,47,208,0)');c.fillStyle=g;c.fillRect(x-70,y-70,140,140);c.strokeStyle='#4df3ff';c.lineWidth=3;c.beginPath();c.arc(x,y,34,0,TAU);c.stroke()}}
 for(const o of A.obs)drawObs(c,o,idx);
 c.lineWidth=40;c.strokeStyle=pal.edge;c.strokeRect(-4,-4,W+8,H+8);c.lineWidth=5;c.strokeStyle=idx===2?'#4df3ff':OUT;c.strokeRect(20,20,W-40,H-40);
 return cv}
function drawObs(c,[x,y,w,h,k],idx){const cx=x+w/2,cy=y+h/2;
 if(k==='tree'){shadow(c,cx+14,cy+22,70,40);blob(c,cx,cy+6,14,14,'#7a4a21');for(const[dx,dy,r,f]of[[-26,6,38,'#2f9a3d'],[26,6,38,'#2f9a3d'],[0,-20,42,'#3dbb4a'],[0,14,38,'#35a844'],[-8,-26,22,'#5ad666']])blob(c,cx+dx,cy+dy,r,r,f,4)}
 else if(k==='bush'){shadow(c,cx+6,cy+16,w*.6,h*.4);blob(c,cx,cy,w*.55,h*.6,'#2f9a3d',4);blob(c,cx-12,cy-8,w*.3,h*.3,'#5ad666',2);for(let i=0;i<4;i++)blob(c,cx-20+i*14,cy+4+(i%2)*6,4,4,'#e4453b',1.5)}
 else if(k==='rock'){shadow(c,cx+10,cy+h*.45,w*.6,h*.35);const f=idx===1?['#b5654a','#d98b6a']:['#8e949c','#b7bdc6'];c.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,rr=(i%2?.46:.54);c.lineTo(cx+Math.cos(a)*w*rr*1.05,cy+Math.sin(a)*h*rr*1.05)}c.closePath();c.fillStyle=f[0];c.fill();c.lineWidth=4;c.strokeStyle=OUT;c.stroke();blob(c,cx-w*.12,cy-h*.14,w*.2,h*.14,f[1],0)}
 else if(k==='cactus'){shadow(c,cx+10,cy+h*.45,24,16);const g='#3aa655';c.lineWidth=4;c.strokeStyle=OUT;for(const[ax,ay,aw,ah]of[[cx-22,cy-14,12,26],[cx+10,cy-26,12,30]]){c.fillStyle=g;c.beginPath();c.roundRect(ax,ay,aw,ah,6);c.fill();c.stroke()}c.fillStyle=g;c.beginPath();c.roundRect(cx-14,y,28,h,14);c.fill();c.stroke();c.strokeStyle='#bfffc9';c.lineWidth=2;c.beginPath();c.moveTo(cx-4,y+8);c.lineTo(cx-4,y+h-8);c.stroke();blob(c,cx,y+3,5,4,'#ff6fb5',1.5)}
 else if(k==='dune'){shadow(c,cx+8,cy+10,w*.6,h*.5);blob(c,cx,cy,w*.55,h*.55,'#f4d68a',4);blob(c,cx-10,cy-6,w*.3,h*.22,'#fbe7ae',0)}
 else if(k==='wall'){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x+8,y+10,w,h);const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#6b7390');g.addColorStop(1,'#343a55');c.fillStyle=g;c.beginPath();c.roundRect(x,y,w,h,5);c.fill();c.lineWidth=4;c.strokeStyle=OUT;c.stroke();c.strokeStyle='#4df3ff';c.lineWidth=3;c.strokeRect(x+4,y+4,w-8,h-8)}
 else if(k==='pillar'){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.arc(cx+10,cy+12,w*.55,0,TAU);c.fill();blob(c,cx,cy,w*.52,h*.52,'#3b4268',4);blob(c,cx,cy,w*.3,h*.3,'#ff2fd0',3);blob(c,cx,cy,w*.14,h*.14,'#fff',0)}
 else if(k==='crate'){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x+7,y+9,w,h);c.fillStyle='#7d86a8';c.fillRect(x,y,w,h);c.lineWidth=4;c.strokeStyle=OUT;c.strokeRect(x,y,w,h);c.strokeStyle='#ffd23f';c.lineWidth=5;c.beginPath();c.moveTo(x+6,y+h-6);c.lineTo(x+w-6,y+6);c.stroke();c.strokeStyle='#4df3ff';c.lineWidth=2;c.strokeRect(x+8,y+8,w-16,h-16)}}
// ---------- Characters ----------
function weaponSprite(c,wi,t){
 if(wi===0){blob(c,-8,0,6,9,'#fff');blob(c,2,0,11,10,'#e4453b',3)}
 else if(wi===1){c.fillStyle='#8a5a2b';c.fillRect(-6,-2.5,26,5);c.strokeStyle=OUT;c.lineWidth=2;c.strokeRect(-6,-2.5,26,5);c.fillStyle='#aab';c.fillRect(14,-9,14,18);c.strokeRect(14,-9,14,18);c.fillStyle='#fff36b';c.fillRect(18,-3,6,6)}
 else if(wi===2){c.fillStyle='#2bc15a';c.beginPath();c.roundRect(-6,-6,22,12,5);c.fill();c.lineWidth=3;c.strokeStyle=OUT;c.stroke();c.fillStyle='#bbb';c.fillRect(16,-4,9,8);c.strokeRect(16,-4,9,8);blob(c,-1,-9,4,4,'#c77dff',1.5)}
 else if(wi===3){c.strokeStyle=OUT;c.lineWidth=7;c.beginPath();c.moveTo(-4,0);for(let i=0;i<5;i++)c.lineTo(i*5+2,i%2?7:-7);c.lineTo(24,0);c.stroke();c.strokeStyle='#ff6fb5';c.lineWidth=3.5;c.stroke();blob(c,26,0,6,6,'#9cff57')}
 else{c.fillStyle='#2e86ff';c.beginPath();c.roundRect(-6,-7,24,14,5);c.fill();c.lineWidth=3;c.strokeStyle=OUT;c.stroke();blob(c,20,0,6,5,'#ff4dd2',2);blob(c,4,0,3,3,'#4df3ff',0)}}
export function drawChar(c,p,t,ext=0,flash=false){const ch=CHARS[p.char],fl=p.f||0,air=p.z||0,col=x=>flash?'#fff':x;
 shadow(c,p.x,p.y+10,20*(1-Math.min(.4,air/400)),9);
 c.save();c.translate(p.x,p.y-air*.7);const sc=1+air/220;c.scale(sc,sc);
 if(fl&16)c.rotate(t*9);else c.translate(0,Math.sin(t*3+p.x)*1);c.rotate(p.a);
 const st=(fl&2)?Math.sin(p.phase||0)*8:0;
 blob(c,-2+st,-9,7,5,col(ch.shoe));blob(c,-2-st,9,7,5,col(ch.shoe));
 blob(c,0,0,11,19,col(ch.body),3.5);
 blob(c,15,-15,6,6,col('#ffd9b3'));
 c.save();c.translate(14+ext,14);weaponSprite(c,p.w,t);c.restore();blob(c,14+ext,14,5,5,col('#ffd9b3'),2);
 const hr=col(ch.hair),sk=col('#ffd9b3');
 blob(c,0,0,13,13,sk,3.5);
 if(ch.style==='spikes'){for(let i=-2;i<=2;i++){const a=Math.PI+i*.5;c.beginPath();c.moveTo(Math.cos(a-.25)*8,Math.sin(a-.25)*8);c.lineTo(Math.cos(a)*23,Math.sin(a)*23);c.lineTo(Math.cos(a+.25)*8,Math.sin(a+.25)*8);c.fillStyle=hr;c.fill();c.lineWidth=3;c.strokeStyle=OUT;c.stroke()}blob(c,-3,0,10,12,hr,0)}
 else if(ch.style==='helmet'){blob(c,-1,0,14.5,14.5,hr,3.5);c.fillStyle=col('#ffd23f');c.fillRect(-14,-3,28,6);c.strokeStyle=OUT;c.lineWidth=2;c.strokeRect(-14,-3,28,6);blob(c,8,0,6,9,sk,0)}
 else{blob(c,-2,-13,6,6,hr);blob(c,-2,13,6,6,hr);blob(c,-2,-13,3,3,col('#ffd'),0);blob(c,-2,13,3,3,col('#ffd'),0);blob(c,-3,0,11.5,12.5,hr,3);blob(c,6,0,5,7,sk,0)}
 for(const s of[-1,1]){blob(c,8,s*5,3.4,3.4,'#fff',1.5);blob(c,9.3,s*5,1.7,1.7,'#111',0)}
 c.restore();
 if(fl&4){c.font='16px sans-serif';c.textAlign='center';c.fillStyle='#ffd23f';for(let i=0;i<3;i++){const a=t*6+i*2.1;c.fillText('★',p.x+Math.cos(a)*18,p.y-air*.7-30+Math.sin(a)*5)}}
 if(fl&64){c.fillStyle='rgba(156,255,87,.6)';for(let i=0;i<3;i++)blob(c,p.x+Math.cos(t*4+i*2)*20,p.y-18-Math.abs(Math.sin(t*3+i))*14,4,4,'#9cff57',0)}}
function drawTag(c,p,name,max,mine){const x=p.x,y=p.y-(p.z||0)*.7-38,w=46,r=Math.max(0,p.hp/max);
 c.fillStyle=OUT;c.beginPath();c.roundRect(x-w/2-2,y-2,w+4,9,4);c.fill();c.fillStyle=r>.5?'#4cd964':r>.25?'#ffc83d':'#ff4d4d';c.beginPath();c.roundRect(x-w/2,y,w*r,5,3);c.fill();
 c.font='900 12px "Trebuchet MS",sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle=OUT;const n=name+((p.f&128)?' (offline)':'');c.strokeText(n,x,y-5);c.fillStyle=mine?'#ffd23f':'#fff';c.fillText(n,x,y-5)}
// ---------- Projectiles & clouds ----------
function drawProj(c,q,t){const[,ti,x,y,a]=q;c.save();c.translate(x,y);
 if(ti===1){c.rotate(t*16);weaponSprite(c,1,t);c.restore();c.save();c.translate(x,y);c.globalCompositeOperation='lighter';c.strokeStyle='#fff7a0';c.lineWidth=3;for(let k=0;k<3;k++){c.beginPath();let px=0,py=0;const ba=Math.random()*TAU;c.moveTo(0,0);for(let i=1;i<5;i++){px=Math.cos(ba)*i*9+(Math.random()-.5)*12;py=Math.sin(ba)*i*9+(Math.random()-.5)*12;c.lineTo(px,py)}c.stroke()}const g=c.createRadialGradient(0,0,2,0,0,36);g.addColorStop(0,'rgba(255,255,160,.6)');g.addColorStop(1,'rgba(255,255,160,0)');c.fillStyle=g;c.fillRect(-36,-36,72,72)}
 else if(ti===3){c.rotate(a);const s=1+.25*Math.sin(t*22);c.scale(s,1/s);weaponSprite(c,3,t)}
 else{c.rotate(a);c.globalCompositeOperation='lighter';const g=c.createRadialGradient(0,0,1,0,0,18);g.addColorStop(0,'#fff');g.addColorStop(.35,'#4df3ff');g.addColorStop(1,'rgba(255,77,210,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,18,0,TAU);c.fill()}
 c.restore()}
function drawCloud(c,[x,y,r,l],t){c.save();c.globalAlpha=Math.min(.6,l*1.2);const cols=['#9cff57','#c77dff','#ff6fb5','#7fe9ff'];
 for(let i=0;i<9;i++){const a=i/9*TAU+t*.6,d=r*.5*(.7+.3*Math.sin(t*2+i));c.fillStyle=cols[i%4];c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,r*.45,0,TAU);c.fill()}
 c.globalAlpha=Math.min(.8,l*2);c.strokeStyle=OUT;c.lineWidth=3;c.setLineDash([10,8]);c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.restore()}
// ---------- Scene ----------
export function drawGame(c,cv,G,v,t){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.fillStyle='#111';c.fillRect(0,0,cv.width,cv.height);
 const s=v.cam.s;c.translate(cv.width/2+v.shx,cv.height/2+v.shy);c.scale(s,s);c.translate(-v.cam.x,-v.cam.y);
 c.drawImage(G.bg,0,0);for(const q of v.clouds)drawCloud(c,q,t);G.fx.draw(c);
 for(const p of v.players.sort((a,b)=>a.y-b.y)){if(p.f&1)continue;const ft=G.fireT[p.id],pr=ft?(performance.now()-ft)/250:1;let ext=0;if(pr<1)ext=p.w===0?Math.sin(pr*Math.PI)*22:-Math.sin(pr*Math.PI)*4;
  c.globalAlpha=(p.f&256)&&Math.floor(t*14)%2?.45:1;drawChar(c,p,t,ext,!!(p.f&8));c.globalAlpha=1;drawTag(c,p,p.name,CHARS[p.char].hp,p.id===v.me)}
 for(const q of v.proj)drawProj(c,q,t);
 c.setTransform(1,0,0,1,0,0);const g=c.createRadialGradient(cv.width/2,cv.height/2,cv.height*.35,cv.width/2,cv.height/2,cv.height*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.4)');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height)}
export function drawPreview(cv,ci,t){const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.translate(cv.width/2,cv.height/2);c.scale(2.2,2.2);
 drawChar(c,{x:0,y:0,a:Math.sin(t*1.5)*.5,char:ci,w:ci,f:0,phase:0,z:0},t,0,false)}
