// Headless test of the authoritative simulation (no sockets needed).
import * as G from '../server/gameManager.js';import {CFG,WEAPONS} from '../shared/config.js';
const room={players:new Map(),arena:0,state:'lobby',pid:0};
const a=G.newPlayer('a','t','A'),b=G.newPlayer('b','t','B');room.players.set('a',a);room.players.set('b',b);G.startMatch(room);
const ok=(c,m)=>{console.log(c?'PASS':'FAIL',m);if(!c)process.exitCode=1};
const run=(s,f)=>{for(let i=0;i<s*CFG.TICK;i++){f&&f(i);G.step(room,1/CFG.TICK)}};
// place players near each other in open ground
a.x=300;a.y=150;b.x=360;b.y=150;
a.in={x:0,y:0,a:0,att:true,w:0};run(.2);ok(b.hp<100,'glove damages (hp '+b.hp+')');ok(b.vx>0||b.x>360,'glove knockback');
a.in.att=false;run(1);
b.hp=100;b.x=700;b.y=100;b.stun=0;b.vx=0;a.x=300;a.y=100;a.cd=[0,0,0,0,0];a.in={x:0,y:0,a:0,att:true,w:4};run(.8);ok(b.hp<100,'energy blaster hits (hp '+b.hp+')');
b.hp=100;a.in={x:0,y:0,a:0,att:true,w:3};a.cd=[0,0,0,0,0];b.x=600;b.y=100;let air=false;run(1.5,()=>{if(b.z>0)air=true});ok(air,'spring launcher launches target airborne');run(3);ok(b.z===0,'target lands');
a.in={x:0,y:0,a:0,att:true,w:1};a.cd=[0,0,0,0,0];a.x=300;a.y=100;b.x=1200;b.y=700;run(.1);a.in.att=false;ok(room.proj.some(q=>q.t===1),'hammer thrown');run(2.5);ok(!room.proj.some(q=>q.t===1),'hammer returned to owner');
a.in={x:0,y:0,a:0,att:true,w:2};a.cd=[0,0,0,0,0];a.x=300;a.y=100;b.x=440;b.y=100;b.hp=100;run(.1);a.in.att=false;run(2);ok(b.hp<100&&b.slow>=0,'gas cloud damages (hp '+b.hp+')');
b.hp=1;b.inv=0;a.score=0;b.x=a.x+50;b.y=a.y;a.in={x:0,y:0,a:0,att:true,w:0};a.cd=[0,0,0,0,0];run(.2);ok(b.dead&&a.score===1,'kill scores for attacker');run(3);ok(!b.dead,'victim respawns');
// movement validated server-side: speed cap
a.in={x:50,y:50,a:0,att:false,w:0};a.x=150;a.y=500;a.vx=a.vy=0;b.x=1400;b.y=1100;const x0=a.x;run(1);ok(Math.hypot(a.x-x0,a.y-500)<=240,'speed capped (moved '+Math.round(Math.hypot(a.x-x0,a.y-500))+')');
const snap=G.snapshot(room);ok(snap.p.length===2&&JSON.stringify(snap).length<1500,'snapshot compact ('+JSON.stringify(snap).length+' bytes)');
