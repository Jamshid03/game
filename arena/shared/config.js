export const CFG={W:1600,H:1200,TICK:30,R:22,MATCH:120,WIN:5,MAXP:4,RESPAWN:2.5};
export const CHARS=[
 {id:'bolt',name:'Bolt',desc:'Balanced scrapper',speed:235,hp:100,kb:1,body:'#ffc83d',hair:'#ff7a00',shoe:'#d63',style:'spikes'},
 {id:'tank',name:'Tank',desc:'Slow, tough, heavy',speed:190,hp:140,kb:.65,body:'#e4453b',hair:'#4a4e69',shoe:'#333',style:'helmet'},
 {id:'zip',name:'Zip',desc:'Fast but fragile',speed:275,hp:80,kb:1.3,body:'#33d1c1',hair:'#ff6fb5',shoe:'#fff',style:'ears'}];
export const WEAPONS=[
 {id:'glove',name:'Boxing Glove',dmg:18,range:82,cd:.55,kb:760,stun:.5},
 {id:'hammer',name:"Thor's Hammer",dmg:24,range:430,cd:1.5,speed:620,kb:520,stun:.7,r:20},
 {id:'gas',name:'Gas Blaster',dmg:5,range:140,cd:2.2,kb:0,cloud:{r:80,life:3.2,dps:10}},
 {id:'spring',name:'Spring Launcher',dmg:12,range:520,cd:1.1,speed:520,kb:380,stun:.5,r:16,launch:680},
 {id:'energy',name:'Energy Blaster',dmg:11,range:720,cd:.32,speed:860,kb:230,stun:.15,r:10}];
// obstacles: [x,y,w,h,kind] axis-aligned collision boxes
export const ARENAS=[
 {id:'nature',name:'Nature Arena',obs:[[700,250,80,80,'tree'],[820,870,80,80,'tree'],[300,540,80,80,'tree'],[1220,580,80,80,'tree'],[740,530,120,120,'rock'],[450,260,90,60,'bush'],[1060,880,90,60,'bush'],[1050,300,90,80,'rock'],[460,820,90,80,'rock']]},
 {id:'desert',name:'Desert Arena',obs:[[400,300,40,90,'cactus'],[1160,820,40,90,'cactus'],[1160,300,40,90,'cactus'],[400,810,40,90,'cactus'],[720,520,160,160,'rock'],[250,560,100,100,'rock'],[1250,540,100,100,'rock'],[740,170,120,60,'dune'],[740,970,120,60,'dune']]},
 {id:'future',name:'Futuristic Arena',obs:[[500,380,260,24,'wall'],[840,796,260,24,'wall'],[770,550,90,90,'pillar'],[300,540,70,70,'crate'],[1230,590,70,70,'crate'],[1100,380,24,200,'wall'],[476,640,24,200,'wall']]}];
