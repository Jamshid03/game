import crypto from 'crypto';
import {CFG} from '../shared/config.js';
import * as G from './gameManager.js';
export const rooms=new Map();let io;
const rid=n=>crypto.randomBytes(n).toString('hex');
export function init(i){io=i;setInterval(tick,1000/CFG.TICK);setInterval(()=>{for(const[c,r]of rooms)if(!r.players.size)rooms.delete(c)},10000)}
export const info=r=>({code:r.code,pub:r.pub,host:r.host,state:r.state,arena:r.arena,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,char:p.char,ready:p.ready,connected:p.connected,score:p.score}))});
export const emitRoom=r=>io.to(r.code).emit('room',info(r));
export function makeRoom(pub){let code;do{code=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random()*24|0]).join('')}while(rooms.has(code));
 const r={code,pub,players:new Map(),state:'lobby',host:null,arena:Math.random()*3|0,proj:[],clouds:[],ev:[],time:0,pid:0,cd:null};rooms.set(code,r);return r}
export function publicRoom(){for(const r of rooms.values())if(r.pub&&r.state==='lobby'&&r.players.size<CFG.MAXP)return r;return makeRoom(true)}
const clean=n=>String(n||'').replace(/[^\w \-]/g,'').trim().slice(0,12)||'Player'+(Math.random()*900+100|0);
export function addPlayer(r,sid,name){if(r.state!=='lobby')return{err:'Match already in progress'};if(r.players.size>=CFG.MAXP)return{err:'Room is full'};
 const p=G.newPlayer(rid(3),rid(12),clean(name));p.sid=sid;p.char=r.players.size%3;r.players.set(p.id,p);if(!r.host)r.host=p.id;return{p}}
function cancelCd(r){if(r.cd){clearTimeout(r.cd);r.cd=null}if(r.state==='countdown')r.state='lobby'}
export function removePlayer(r,pid){const p=r.players.get(pid);if(!p)return;clearTimeout(p.dc);r.players.delete(pid);
 if(r.host===pid)r.host=r.players.keys().next().value||null;
 if(!r.players.size){cancelCd(r);rooms.delete(r.code);return}
 if(r.state==='countdown')cancelCd(r);
 emitRoom(r);if(r.state==='playing'&&r.players.size<2)endMatch(r);else checkStart(r)}
export function dropped(r,p){if(r.state==='lobby'||r.state==='countdown'){removePlayer(r,p.id);return}
 p.connected=false;p.in.att=false;emitRoom(r);p.dc=setTimeout(()=>removePlayer(r,p.id),20000)}
export function rejoin(code,token,sid){const r=rooms.get(String(code).toUpperCase());if(!r)return null;for(const p of r.players.values())if(p.token===token){clearTimeout(p.dc);p.connected=true;p.sid=sid;return{r,p}}return null}
export function checkStart(r){if(r.state!=='lobby')return;const ps=[...r.players.values()].filter(p=>p.connected);
 if(ps.length>=2&&ps.every(p=>p.ready)){r.state='countdown';io.to(r.code).emit('countdown',3);emitRoom(r);r.cd=setTimeout(()=>{r.cd=null;if(r.players.size>=2)startMatch(r);else{r.state='lobby';emitRoom(r)}},3000)}}
export function setReady(r,p,v){if(r.state==='countdown'&&!v){p.ready=false;cancelCd(r);emitRoom(r);return}if(r.state!=='lobby')return;p.ready=!!v;emitRoom(r);checkStart(r)}
function startMatch(r){G.startMatch(r);for(const p of r.players.values())p.ready=false;emitRoom(r);io.to(r.code).emit('start',{arena:r.arena,dur:CFG.MATCH})}
function endMatch(r){if(r.state!=='playing')return;r.state='ended';const sc=[...r.players.values()].map(p=>({id:p.id,name:p.name,score:p.score,deaths:p.deaths})).sort((a,b)=>b.score-a.score||a.deaths-b.deaths);
 const win=sc.length&&(sc.length===1||sc[0].score!==sc[1].score||sc[0].deaths!==sc[1].deaths)?sc[0].id:null;
 io.to(r.code).emit('end',{winner:win,scores:sc});
 setTimeout(()=>{if(!rooms.has(r.code)||r.state!=='ended')return;for(const p of [...r.players.values()]){p.ready=false;if(!p.connected)removePlayer(r,p.id)}
  if(rooms.has(r.code)){r.state='lobby';r.arena=Math.random()*3|0;emitRoom(r)}},8000)}
function tick(){for(const r of rooms.values()){if(r.state!=='playing')continue;const over=G.step(r,1/CFG.TICK);io.to(r.code).volatile.emit('s',G.snapshot(r));if(over)endMatch(r)}}
