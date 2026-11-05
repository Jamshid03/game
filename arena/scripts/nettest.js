// Two real socket.io clients against a running server (npm start). Needs devDependency socket.io-client.
import {io} from 'socket.io-client';
const URL=process.env.URL||'http://localhost:3000',ok=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)process.exitCode=1},sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mk=()=>io(URL,{transports:['websocket']}),emit=(s,e,d)=>new Promise(r=>s.emit(e,d,r));
const A=mk(),B=mk(),C=mk(),D=mk(),E=mk();await Promise.all([A,B,C,D,E].map(s=>new Promise(r=>s.on('connect',r))));
const ra=await emit(A,'create',{name:'Alice'});ok(ra.ok&&ra.code.length===4,'private room created '+ra.code);
const rb=await emit(B,'join',{code:ra.code,name:'Bob'});ok(rb.ok,'Bob joined by code');
const bad=await emit(C,'join',{code:'ZZZZ',name:'X'});ok(!bad.ok,'bad code rejected');
await emit(C,'join',{code:ra.code,name:'Cy'});await emit(D,'join',{code:ra.code,name:'Di'});const full=await emit(E,'join',{code:ra.code,name:'Ed'});ok(!full.ok&&/full/i.test(full.err),'5th player rejected (full)');
let snaps=0,last,ended;A.on('s',s=>{snaps++;last=s});A.on('end',d=>ended=d);
C.emit('leave');D.emit('leave');B.emit('ready',true);A.emit('ready',true);await sleep(3600);ok(snaps>0,'match started, snapshots received ('+snaps+')');
A.emit('in',{x:1,y:0,a:0,att:false,w:0});await sleep(500);const pa=last.p.find(p=>p[0]===ra.id);ok(pa[1]>200,'A moved (x='+pa[1]+')');
// walk A toward B and punch (server positions: A spawns 200,200; B 1400,1000)
const qd=await emit(E,'quick',{name:'Quick'});ok(qd.ok,'public matchmaking joined room '+qd.code);
B.disconnect();await sleep(500);ok(last.p.find(p=>p[0]===rb.id)[6]&128,'disconnected player flagged');
const B2=mk();await new Promise(r=>B2.on('connect',r));const rj=await emit(B2,'rejoin',{code:ra.code,token:rb.token});ok(rj.ok&&rj.playing,'reconnect restores player');
[A,B2,E].forEach(s=>s.close());console.log('done');process.exit(process.exitCode||0);
