let ac,master,muted=false,started=false;
export function init(){if(ac){if(ac.state==='suspended')ac.resume();return}ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=muted?0:.5;master.connect(ac.destination);music()}
export function toggle(){muted=!muted;if(master)master.gain.value=muted?0:.5;return muted}
function tone(f,d,type='sine',v=.25,slide=0,delay=0){if(!ac)return;const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+slide),t+d);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02)}
function noise(d,v=.3,f=1200,delay=0){if(!ac)return;const t=ac.currentTime+delay,n=ac.sampleRate*d|0,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;fl.type='lowpass';fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(master);s.start(t)}
export const sfx={
 click(){tone(520,.08,'square',.12)},
 glove(){noise(.12,.2,600);tone(220,.1,'triangle',.2,-120)},
 gloveHit(){noise(.25,.5,900);tone(110,.25,'square',.35,-70)},
 hammer(){tone(300,.3,'sawtooth',.15,200)},
 hammerHit(){noise(.35,.45,3000);tone(60,.4,'sawtooth',.3,-30);for(let i=0;i<4;i++)tone(900+Math.random()*1500,.06,'square',.12,-500,i*.04)},
 gas(){noise(.5,.25,500);tone(160,.4,'sine',.15,-60)},
 spring(){tone(200,.25,'sine',.3,600);tone(800,.2,'triangle',.2,-500,.12)},
 springHit(){tone(300,.3,'sine',.3,500)},
 energy(){tone(900,.14,'sawtooth',.14,-600)},
 energyHit(){noise(.12,.25,4000);tone(500,.12,'square',.15,-300)},
 land(){noise(.15,.3,300);tone(70,.15,'sine',.3)},
 ko(){tone(400,.5,'sawtooth',.3,-350);noise(.5,.5,800)},
 win(){[523,659,784,1046].forEach((f,i)=>tone(f,.25,'square',.2,0,i*.12))},
 lose(){[392,330,262].forEach((f,i)=>tone(f,.3,'triangle',.25,0,i*.18))}};
function music(){const bass=[110,110,147,131],lead=[440,523,587,523,659,587,523,392];let i=0;
 setInterval(()=>{if(!ac||muted)return;const b=bass[(i>>3)%4];if(i%2===0)tone(b,.22,'triangle',.1);tone(lead[(i*3+(i>>4))%8]*(i%16<8?1:1.5),.12,'square',.03);i++},220)}
