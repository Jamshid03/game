import express from 'express';import http from 'http';import {Server} from 'socket.io';import path from 'path';import {fileURLToPath} from 'url';
import * as RM from './roomManager.js';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=express(),srv=http.createServer(app);
const io=new Server(srv,{cors:{origin:process.env.CORS_ORIGIN||'*'}});
app.use(express.static(path.join(root,'client')));app.use('/shared',express.static(path.join(root,'shared')));
app.get('/health',(q,r)=>r.json({ok:true,rooms:RM.rooms.size}));
RM.init(io);
const num=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:0));
io.on('connection',s=>{
 const attach=(r,p)=>{s.data={r,p};s.join(r.code)};
 const join=(r,d,ack)=>{const res=RM.addPlayer(r,s.id,d&&d.name);if(res.err){if(!r.players.size)RM.rooms.delete(r.code);return ack&&ack({ok:false,err:res.err})}
  attach(r,res.p);ack&&ack({ok:true,id:res.p.id,token:res.p.token,code:r.code});RM.emitRoom(r)};
 const leave=()=>{const{r,p}=s.data||{};if(r&&p){s.leave(r.code);s.data={};RM.removePlayer(r,p.id)}};
 s.on('create',(d,ack)=>{leave();join(RM.makeRoom(false),d,ack)});
 s.on('quick',(d,ack)=>{leave();join(RM.publicRoom(),d,ack)});
 s.on('join',(d,ack)=>{leave();const r=RM.rooms.get(String(d&&d.code||'').toUpperCase().trim());if(!r)return ack&&ack({ok:false,err:'Room not found'});join(r,d,ack)});
 s.on('rejoin',(d,ack)=>{const f=d&&RM.rejoin(d.code,d.token,s.id);if(!f)return ack&&ack({ok:false});attach(f.r,f.p);
  ack&&ack({ok:true,id:f.p.id,playing:f.r.state==='playing',arena:f.r.arena,room:RM.info(f.r)});RM.emitRoom(f.r)});
 s.on('char',i=>{const{r,p}=s.data||{};if(!p||r.state!=='lobby'||p.ready)return;p.char=num(i,0,2)|0;RM.emitRoom(r)});
 s.on('arena',i=>{const{r,p}=s.data||{};if(!p||r.state!=='lobby'||r.host!==p.id)return;r.arena=num(i,0,2)|0;RM.emitRoom(r)});
 s.on('ready',v=>{const{r,p}=s.data||{};if(p)RM.setReady(r,p,v)});
 s.on('in',d=>{const{r,p}=s.data||{};if(!p||r.state!=='playing'||!d)return;p.in={x:num(d.x,-1,1),y:num(d.y,-1,1),a:num(d.a,-7,7),att:!!d.att,w:num(d.w,0,4)|0}});
 s.on('leave',leave);
 s.on('disconnect',()=>{const{r,p}=s.data||{};if(r&&p&&p.sid===s.id)RM.dropped(r,p)});
});
const PORT=process.env.PORT||3000;
srv.listen(PORT,'0.0.0.0',()=>console.log('Arena server on :'+PORT));
