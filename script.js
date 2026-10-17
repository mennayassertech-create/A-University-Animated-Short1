const $=i=>document.getElementById(i),g=$('c').getContext('2d'),W=1280,H=720;
// ---------- Characters (v = voice slot, p = pitch, r = rate) ----------
const C={
glu:{n:'Mr. Glucose',c:'#ffb703',p:1.8,r:1.15,v:0,a:''},
ins:{n:'Insulin',c:'#e63946',p:.7,r:.95,v:1,a:'cape'},
hex:{n:'Hexokinase',c:'#2a9d8f',p:.4,r:.9,v:2,a:'helm'},
nar:{n:'Prof. ATP',c:'#f4d35e',p:1.2,r:1,v:3,a:'bolt'},
ace:{n:'Acetyl-CoA',c:'#ff7b00',p:1.5,r:1.15,v:0,a:''},
cit:{n:'Citrate',c:'#9bdb3c',p:.6,r:.95,v:1,a:'cap'},
akg:{n:'α-Ketoglutarate',c:'#4cc9f0',p:1.9,r:1.2,v:2,a:''},
suc:{n:'Succinate',c:'#f72585',p:.3,r:.85,v:3,a:'cape'},
trn:{n:'Glucose Train',c:'#ffb703',p:1.3,r:1.1,v:0,a:'cap'},
sto:{n:'Glycogenesis Station',c:'#52b788',p:.8,r:.9,v:1,a:'helm'},
bre:{n:'Glycogenolysis Route',c:'#ff8c42',p:1.6,r:1.05,v:2,a:''},
eme:{n:'Gluconeogenesis Station',c:'#b392f0',p:.5,r:.95,v:4,a:'cape'}};
// ---------- Script: [speaker, text, top-panel flow, (scene3: active tracks)] ----------
const S=[
{t:'SCENE 1<br>The Cellular Factory',l:[
['glu','Whoa! Where am I? This place is HUGE!',['Insulin binds its receptor','GLUT4 moves to the membrane','Glucose enters the cell']],
['ins','Welcome, Mr. Glucose! I can help you enter insulin-sensitive cells. Your energy adventure starts now!',['Insulin binds its receptor','GLUT4 moves to the membrane','Glucose enters the cell']],
['hex','Hold on! Before glycolysis gets going, we need to phosphorylate glucose!',['Glucose + ATP','Hexokinase','Glucose-6-phosphate + ADP']],
['hex','Listen up! Glycolysis happens in the cytoplasm. One glucose makes two pyruvate, with a net gain of two ATP and two NADH.',['Glucose (6C)','2 Pyruvate (3C)','Net: +2 ATP, +2 NADH']],
['ins','With suitable aerobic conditions, pyruvate becomes acetyl-CoA, releasing carbon dioxide and making NADH, and then it enters the citric acid cycle!',['O₂ available','Pyruvate → Acetyl-CoA','Citric acid cycle']],
['hex','But when oxygen is unavailable or limited, fermentation regenerates NAD plus, so glycolysis can keep going!',['Low O₂','Pyruvate → Lactate','NADH → NAD⁺, glycolysis continues']],
['glu','Two roads, one very happy glucose! Let us race to the mitochondrion!',['Aerobic: acetyl-CoA + citric acid cycle','Low O₂: fermentation'] ]]},
{t:'SCENE 2<br>The Krebs Cycle Grand Prix',l:[
['nar','Welcome to the Krebs Cycle Grand Prix, inside the mitochondrial matrix! One lap is one turn of the citric acid cycle!',['Mitochondrial matrix','Citric acid cycle','8 steps per lap']],
['ace','I am Acetyl-CoA, carrying two carbons! I join oxaloacetate to start the race as citrate!',['Acetyl-CoA (2C)','+ Oxaloacetate (4C)','→ Citrate (6C)']],
['cit','Citrate here! I become isocitrate, then lose a carbon as carbon dioxide and make NADH on the way to alpha-ketoglutarate!',['Isocitrate → α-Ketoglutarate','−CO₂','+NADH']],
['akg','Alpha-ketoglutarate speeding through! Another carbon dioxide leaves, another NADH is made, and I become succinyl-CoA!',['α-Ketoglutarate → Succinyl-CoA','−CO₂','+NADH']],
['suc','Succinate in the pit lane! Succinyl-CoA makes GTP or ATP, and then I become fumarate and make FADH2!',['Succinyl-CoA → Succinate: +GTP/ATP','Succinate → Fumarate: +FADH₂']],
['nar','Fumarate, malate, and finally oxaloacetate, which makes one more NADH. Lap complete!',['Fumarate → Malate','Malate → Oxaloacetate','+NADH']],
['ace','Each turn releases two carbon dioxide molecules, and makes three NADH, one FADH2, and one GTP or ATP!',['Per turn: 2 CO₂','3 NADH · 1 FADH₂ · 1 GTP/ATP']],
['nar','NADH and FADH2 carry high-energy electrons to the electron transport chain, where oxidative phosphorylation makes most of the ATP during aerobic respiration!',['NADH + FADH₂','Electron transport chain','Oxidative phosphorylation: most ATP']]]},
{t:'SCENE 3<br>The Metabolic Subway Map',l:[
['nar','Welcome to the Metabolic Subway! Every track is a pathway that keeps blood glucose steady.',['Fed: store glucose','Fasting: release glucose','Long fast: make new glucose'],[0,1,2,3]],
['trn','Glucose Train here! After a meal, insulin sends me toward storage. Next stop, glycogen!',['Blood glucose rises','Glucose → glucose-6-phosphate'],[0]],
['sto','Glycogenesis Station! I build glycogen from glucose, mainly in the liver and the muscles.',['Glucose-6-P → Glucose-1-P → UDP-glucose','Glycogen (liver & muscle)'],[0]],
['bre','Glycogenolysis Route! During fasting, I break glycogen back down into glucose phosphates!',['Glycogen','Glycogenolysis','Glucose-1-P → Glucose-6-P'],[1]],
['trn','Careful! Only the liver has glucose-6-phosphatase, so only liver can release free glucose into the blood.',['Liver: glucose-6-phosphatase','Free glucose → blood'],[1,2]],
['eme','Gluconeogenesis Emergency Station! In longer fasting, the liver makes new glucose from lactate, glycerol and amino acids!',['Lactate · glycerol · amino acids','Gluconeogenesis','New glucose'],[3,2]],
['nar','Together, glycogenolysis and gluconeogenesis in the liver help maintain blood glucose during fasting. All aboard!',['Fasting: glycogenolysis + gluconeogenesis','Blood glucose maintained'],[0,1,2,3]]]}];

// ---------- State ----------
let sc=0,li=-1,T=0,ST=0,lineT=0,gapT=0,est=3,cur=null,talk=false,paused=false,started=false,busy=true,spDone=false,boost=0,lid=0,ct,born={},parts=[],pos={},zb=0,n2=0,tot={co2:0,nadh:0,fadh:0,gtp:0},ac,V=[],mus=0;
// ---------- Helpers ----------
function tx(s,x,y,z,c,a){g.font=`bold ${z}px "Segoe UI",Arial`;g.textAlign=a||'center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(s,x,y);g.fillStyle=c||'#fff';g.fillText(s,x,y)}
function rr(x,y,w,h,r){g.beginPath();g.roundRect(x,y,w,h,r)}
function pop(k){if(!(k in born))born[k]=T;const p=Math.min(1,(T-born[k])*2);return 1+2.7*Math.pow(p-1,3)+1.7*Math.pow(p-1,2)}
function ch(k,x,y,s){const o=C[k],sp=cur==k&&talk,m=sp?Math.abs(Math.sin(T*13))*(.5+.5*boost)+.1:0,look=cur&&cur!=k&&pos[cur]!=null?Math.sign(pos[cur]-x):0;pos[k]=x;
g.save();g.translate(x,y+Math.sin(T*3+x)*5-(sp?10*Math.abs(Math.sin(T*8)):0));s*=1+(sp?.06:0);g.scale(s,s);if(sp){g.shadowColor=o.c;g.shadowBlur=45}
if(o.a=='cape'){g.fillStyle='#b5179e';g.beginPath();g.moveTo(-50,-30);g.lineTo(-95,85+Math.sin(T*5)*10);g.lineTo(95,85+Math.sin(T*5+1)*10);g.lineTo(50,-30);g.fill()}
g.strokeStyle=o.c;g.lineWidth=14;g.lineCap='round';const w=Math.abs(sp?Math.sin(T*9)*.6:Math.sin(T*2)*.2);
for(const d of[-1,1]){g.beginPath();g.moveTo(d*55,10);g.lineTo(d*(88+10*w),10-45*w-(sp&&d>0?25:0));g.stroke()}
g.fillStyle='#333';for(const d of[-1,1]){g.beginPath();g.ellipse(d*25,72,18,10,0,0,7);g.fill()}
g.fillStyle=o.c;g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=5;g.beginPath();g.ellipse(0,0,62,68,0,0,7);g.fill();g.stroke();g.shadowBlur=0;
g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-25,-38,16,9,-.6,0,7);g.fill();
if(o.a=='cape'){g.fillStyle='#1d1d4a';rr(-46,-32,92,30,14);g.fill()}
const bl=(T%3.2)<.12?.1:1;
for(const d of[-1,1]){g.fillStyle='#fff';g.beginPath();g.ellipse(d*22,-16,15,17*bl,0,0,7);g.fill();if(bl>.5){g.fillStyle='#111';g.beginPath();g.arc(d*22+look*6,-14,7,0,7);g.fill()}}
g.strokeStyle='#222';g.lineWidth=4;g.beginPath();g.moveTo(-36,-40-(sp?6:0));g.lineTo(-10,-36);g.moveTo(36,-40-(sp?6:0));g.lineTo(10,-36);g.stroke();
g.fillStyle='#5a0f1b';g.beginPath();g.ellipse(0,28,16+m*4,4+m*16,0,0,7);g.fill();
if(m>.2){g.fillStyle='#ff8fa3';g.beginPath();g.ellipse(0,36+m*6,9,4+m*3,0,0,7);g.fill()}
if(o.a=='helm'){g.fillStyle='#ffd60a';g.beginPath();g.ellipse(0,-50,50,30,0,Math.PI,0);g.fill();g.fillRect(-58,-52,116,10)}
if(o.a=='cap'){g.fillStyle='#1d3557';g.beginPath();g.ellipse(0,-56,44,22,0,Math.PI,0);g.fill();g.fillStyle='#e63946';g.fillRect(-52,-58,104,8)}
if(o.a=='bolt'){g.fillStyle='#fff';g.beginPath();g.moveTo(-8,-100);g.lineTo(14,-100);g.lineTo(2,-72);g.lineTo(16,-72);g.lineTo(-10,-40);g.lineTo(-4,-66);g.lineTo(-16,-66);g.fill()}
g.restore();tx(o.n,x,y+100*s,Math.max(13,16*s),sp?'#ffd60a':'#fff')}
function flow(a){if(!a)return;const n=a.length,bw=(960-(n-1)*50)/n;g.save();g.globalAlpha=Math.min(1,lineT*3);
a.forEach((s,i)=>{const x=160+i*(bw+50);g.fillStyle='rgba(255,255,255,.94)';rr(x,60,bw,76,16);g.fill();let z=22;g.font=`bold ${z}px "Segoe UI"`;while(g.measureText(s).width>bw-16&&z>10)g.font=`bold ${--z}px "Segoe UI"`;g.fillStyle='#1d1d3a';g.textAlign='center';g.fillText(s,x+bw/2,105);
if(i<n-1){g.fillStyle='#ffd60a';g.beginPath();g.moveTo(x+bw+8,86);g.lineTo(x+bw+42,98);g.lineTo(x+bw+8,110);g.fill()}});
g.shadowColor='#ffd60a';g.shadowBlur=20;g.fillStyle='#ffd60a';g.beginPath();g.arc(160+((T*.3)%1)*960,150,7,0,7);g.fill();g.restore()}
function poly(x,y,r,n,c,l){g.fillStyle=c;g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();for(let i=0;i<n;i++){const a=i/n*6.283-1.57;g.lineTo(x+r*Math.cos(a),y+r*Math.sin(a))}g.closePath();g.fill();g.stroke();tx(l,x,y+6,15)}
function sp(x,y,s,c){parts.push({x,y,s,c,l:1,vx:(Math.random()-.5)*60,vy:-70-Math.random()*40});sfx(c)}
function drawParts(){parts=parts.filter(p=>p.l>0);for(const p of parts){if(!paused){p.x+=p.vx/60;p.y+=p.vy/60;p.l-=.012}g.globalAlpha=Math.max(0,p.l);g.shadowColor=p.c;g.shadowBlur=18;tx(p.s,p.x,p.y,26,p.c);g.shadowBlur=0}g.globalAlpha=1}
// ---------- Scene 1: Cellular Factory ----------
function s1(){let b=g.createLinearGradient(0,0,0,H);b.addColorStop(0,'#2b1055');b.addColorStop(1,'#0b6e8a');g.fillStyle=b;g.fillRect(0,0,W,H);
for(let i=0;i<16;i++){g.fillStyle=`hsla(${i*40},80%,70%,.18)`;g.beginPath();g.arc((i*173+T*12*(1+i%3))%1300,230+((i*97)%380)+Math.sin(T+i)*20,18+i%5*9,0,7);g.fill()}
for(let y=0;y<H;y+=34)for(const x of[24,92]){g.fillStyle='#ff9ec4';g.beginPath();g.arc(x+Math.sin(T*2+y)*3,y,15,0,7);g.fill()}
g.fillStyle='#06d6a0';rr(28,400,74,70,10);g.fill();tx('GLUT4',65,442,14,'#003');
g.strokeStyle='#ffd60a';g.lineWidth=7;g.beginPath();g.moveTo(130,250);g.lineTo(150,220);g.moveTo(130,250);g.lineTo(110,220);g.moveTo(130,250);g.lineTo(130,285);g.stroke();tx('Insulin receptor',210,270,14,'#ffd60a');
g.fillStyle='#e76f51';g.strokeStyle='#ffb703';g.lineWidth=8;g.beginPath();g.ellipse(1110,600,150,80,0,0,7);g.fill();g.stroke();g.strokeStyle='#9d0208';g.lineWidth=5;g.beginPath();for(let i=0;i<9;i++)g.lineTo(1000+i*28,i%2?560:640);g.stroke();tx('Mitochondrion',1110,700,16,'#ffd60a');
tx('CYTOPLASM · glycolysis',640,700,16,'#9bf6ff');
const gx=li<1?90+230*Math.min(1,lineT/3.5):320;ch('glu',gx,470,1.25*(li>=3?.9:1));
if(li>=1){const p=pop('ins');ch('ins',640,470-(1-p)*300,1.25*p)}
if(li>=2){const p=pop('hex');ch('hex',860,490,1.25*p)}
if(li==2){poly(530,300,36,6,'#ff9e00','G6P');g.fillStyle='#e63946';g.beginPath();g.arc(572,266+Math.sin(T*4)*4,14,0,7);g.fill();tx('P',572,272,14)}
if(li==3){const d=Math.min(1,lineT/2)*60;poly(500-d,300,30,3,'#ff6d00','Pyr');poly(560+d,300,30,3,'#ff6d00','Pyr')}
if(li==4){const u=Math.min(1,lineT/5);poly(520+u*520,300+u*250,28,3,'#ff6d00','Pyr');poly(580+u*460,320+u*230,28,3,'#ff6d00','Pyr');tx('→ Acetyl-CoA',900,380,20,'#ffd60a')}
if(li>=5){const k=Math.sin(T*3)*10;poly(500,300+k,30,3,'#06d6a0','Lac');g.fillStyle='#4cc9f0';g.beginPath();g.arc(600,300-k,16,0,7);g.fill();tx('NAD⁺',600,305-k,12)}
}
// ---------- Scene 2: Krebs Cycle Grand Prix ----------
const NM=['Citrate','Isocitrate','α-Ketoglutarate','Succinyl-CoA','Succinate','Fumarate','Malate','Oxaloacetate'];
const EV={2:[['CO₂','#ccc'],['NADH','#4cc9f0']],3:[['CO₂','#ccc'],['NADH','#4cc9f0']],4:[['GTP/ATP','#ffd60a']],5:[['FADH₂','#f72585']],7:[['NADH','#4cc9f0']]},KEY={'CO₂':'co2','NADH':'nadh','FADH₂':'fadh','GTP/ATP':'gtp'};
const st=k=>{const a=k/8*6.283-1.57;return[640+430*Math.cos(a),430+190*Math.sin(a)]};
function fire(n){for(const k in EV){const[x,y]=st(+k);EV[k].forEach(([s,c],i)=>{sp(x+(x>640?60:-60),y-i*30,'+'+s.replace('CO₂','CO₂ ↑'),c);tot[KEY[s]]++})}zb=.07;if(n%8==0){const[x,y]=st(0);sp(x,y-40,'Acetyl-CoA joins!','#ff7b00')}}
function s2(){let b=g.createRadialGradient(640,430,100,640,430,800);b.addColorStop(0,'#5a189a');b.addColorStop(1,'#10002b');g.fillStyle=b;g.fillRect(0,0,W,H);
g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=3;for(let i=0;i<24;i++){const x=((T*(300+i*30)+i*210)%1500)-150,y=(i*61)%H;g.beginPath();g.moveTo(x,y);g.lineTo(x+130,y);g.stroke()}
g.strokeStyle='#ff9e00';g.lineWidth=14;g.beginPath();g.ellipse(640,430,610,290,0,0,7);g.stroke();
g.strokeStyle='rgba(255,158,0,.35)';g.lineWidth=6;for(let i=0;i<14;i++){const a=i/14*6.283;g.beginPath();g.moveTo(640+600*Math.cos(a),430+280*Math.sin(a));g.lineTo(640+540*Math.cos(a+.1),430+250*Math.sin(a+.1));g.stroke()}
tx('MITOCHONDRIAL MATRIX',1030,680,16,'#ffb700');
const u=ST/1.9,n=Math.floor(u),f=u-n,e=f*f*(3-2*f);
if(started&&!busy&&n!=n2){n2=n;fire(n)}
g.save();g.translate(640,430);const z=1+.06*Math.sin(ST*.5)+zb;zb*=.94;g.scale(z,z);g.rotate(.025*Math.sin(ST*.35));g.translate(-640,-430);
g.beginPath();g.ellipse(640,430,430,190,0,0,7);g.strokeStyle='#e63946';g.lineWidth=84;g.setLineDash([22,22]);g.stroke();g.setLineDash([]);g.strokeStyle='#2b2d42';g.lineWidth=70;g.stroke();g.strokeStyle='#fff';g.lineWidth=3;g.setLineDash([16,16]);g.lineDashOffset=-T*30;g.stroke();g.setLineDash([]);
for(let k=0;k<8;k++){const[x,y]=st(k),dx=(x-640)/430,dy=(y-430)/190;g.fillStyle=EV[k]?'#ffd60a':'#fff';g.beginPath();g.arc(x,y,7,0,7);g.fill();if(EV[k])tx(EV[k].map(q=>q[0]).join(' + '),x+dx*78,y+dy*58,14,'#ffd60a')}
const s4=4*e*(1-e);
for(let i=0;i<8;i++){const p=i+n+e,a=p/8*6.283-1.57,x=640+430*Math.cos(a),y=430+190*Math.sin(a),ang=Math.atan2(190*Math.cos(a),-430*Math.sin(a));
g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=`hsla(${i*45},90%,60%,.4)`;g.fillRect(-34-70*s4,-9,70*s4,18);
g.fillStyle='#111';g.fillRect(-24,-19,14,6);g.fillRect(10,-19,14,6);g.fillRect(-24,13,14,6);g.fillRect(10,13,14,6);
g.fillStyle=`hsl(${i*45},85%,55%)`;rr(-32,-15,64,30,10);g.fill();g.fillStyle='#e0fbfc';rr(2,-10,18,20,5);g.fill();g.fillStyle='#000';g.beginPath();g.arc(12,-4,2.6,0,7);g.arc(12,5,2.6,0,7);g.fill();g.restore();
tx(NM[((Math.round(p)%8)+8)%8],x,y-27,13)}
g.restore();
tx('CITRIC ACID CYCLE',640,415,28);tx(`CO₂ ${tot.co2}   NADH ${tot.nadh}   FADH₂ ${tot.fadh}   GTP/ATP ${tot.gtp}`,640,452,18,'#ffd60a');tx('NADH & FADH₂ → electron transport chain',640,484,15,'#9bf6ff')}
// ---------- Scene 3: Metabolic Subway ----------
function smooth(p){for(let k=0;k<3;k++){const q=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];q.push([.75*a[0]+.25*b[0],.75*a[1]+.25*b[1]],[.25*a[0]+.75*b[0],.25*a[1]+.75*b[1]])}q.push(p[p.length-1]);p=q}return p}
const P=[[[150,290],[330,250],[450,380],[560,430],[780,430],[880,300],[1000,300]],[[1000,300],[930,520],[760,540],[600,470],[560,430]],[[560,430],[470,480],[300,370],[150,290]],[[250,590],[420,590],[520,530],[560,430]]].map(smooth);
const COL=['#52b788','#ff8c42','#4cc9f0','#b392f0'],PN=['Glycogenesis (fed)','Glycogenolysis (fasting)','Liver: glucose-6-phosphatase → blood','Gluconeogenesis (liver)'],LB=['G','G-P','Glc','Lac'];
const N3=[[150,290,'Blood glucose'],[560,430,'Glucose-6-phosphate'],[1000,300,'Glycogen (liver & muscle)'],[250,590,'Lactate · glycerol · amino acids']];
function pt(p,u){const f=u*(p.length-1),i=Math.min(p.length-2,Math.floor(f)),w=f-i;return[p[i][0]+(p[i+1][0]-p[i][0])*w,p[i][1]+(p[i+1][1]-p[i][1])*w]}
function s3(){let b=g.createLinearGradient(0,0,0,H);b.addColorStop(0,'#0d1b2a');b.addColorStop(1,'#274060');g.fillStyle=b;g.fillRect(0,0,W,H);
g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let i=0;i<W;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}for(let i=0;i<H;i+=40){g.beginPath();g.moveTo(0,i);g.lineTo(W,i);g.stroke()}
const r=Math.min(1,ST/3),act=(started&&S[2].l[li]&&S[2].l[li][3])||[0,1,2,3];g.lineJoin=g.lineCap='round';
P.forEach((p,i)=>{const on=act.includes(i),len=Math.floor((p.length-1)*r),pp=new Path2D();p.slice(0,len+1).forEach((q,j)=>j?pp.lineTo(q[0],q[1]):pp.moveTo(q[0],q[1]));
g.strokeStyle='#161c2b';g.lineWidth=28;g.stroke(pp);g.strokeStyle=on?COL[i]:COL[i]+'55';g.lineWidth=8;g.stroke(pp);g.setLineDash([3,13]);g.lineDashOffset=on?-T*30:0;g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=22;g.stroke(pp);g.setLineDash([]);
if(on&&r>=1){const q=pt(p,.5);tx(PN[i],q[0],q[1]-26,15,COL[i]);for(let j=0;j<4;j++){const u=(((ST*.2-j*.035)%1)+1)%1,a=pt(p,u),b2=pt(p,Math.min(1,u+.01)),ang=Math.atan2(b2[1]-a[1],b2[0]-a[0]);g.save();g.translate(a[0],a[1]);g.rotate(ang);g.fillStyle=j?COL[i]:'#fff';g.strokeStyle='#000';g.lineWidth=3;rr(-20,-12,40,24,7);g.fill();g.stroke();if(!j){g.fillStyle='#000';g.beginPath();g.arc(10,-4,2.5,0,7);g.arc(10,5,2.5,0,7);g.fill()}g.restore();if(j==1)tx(LB[i],a[0],a[1]+5,12,'#000')}}});
N3.forEach(([x,y,s],i)=>{g.fillStyle='#fff';g.beginPath();g.arc(x,y,24,0,7);g.fill();g.strokeStyle='#ffd60a';g.lineWidth=6;g.stroke();tx(s,x,i==3?y+52:y-38,16)});
ch('trn',110,470,.75);ch('sto',1140,420,.75);ch('bre',850,610,.75);ch('eme',100,610,.75)}
// ---------- Audio: music + sfx (WebAudio, no files needed) ----------
function tone(f,d,ty,v){if(!ac)return;const o=ac.createOscillator(),n=ac.createGain(),t=ac.currentTime;o.type=ty;o.frequency.value=f;n.gain.setValueAtTime(.0001,t);n.gain.linearRampToValueAtTime(v,t+.03);n.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(n);n.connect(ac.destination);o.start();o.stop(t+d)}
function sfx(c){if(!paused)tone(c=='#ccc'?330:700+Math.random()*300,.2,'sine',.02)}
function music(){if(!paused&&started&&$('mu').checked){const sc5=[0,2,4,7,9,12,9,7],b=[196,164,220][sc];mus++;tone(b*2**(sc5[mus%8]/12)*2,.35,'sine',.025)}setTimeout(music,[300,170,230][sc])}
// ---------- Voices (Web Speech API) ----------
function lv(){V=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)).sort((a,b)=>/natural|online/i.test(b.name)-/natural|online/i.test(a.name))}
if(window.speechSynthesis){lv();speechSynthesis.onvoiceschanged=lv}
let voiceOn=false;
function speak(k,t){const o=C[k];est=t.length*.07+.8;voiceOn=$('vo').checked&&window.speechSynthesis&&V.length>0;if(!voiceOn)return;
const u=new SpeechSynthesisUtterance(t),id=lid;u.voice=V[o.v%V.length];u.pitch=o.p;u.rate=Math.min(1.6,o.r*1.1);u.lang='en-US';u.onboundary=()=>boost=1;u.onend=u.onerror=()=>{if(id==lid)spDone=true};speechSynthesis.speak(u)}
// ---------- Engine ----------
function next(){li++;const L=S[sc].l;
if(li>=L.length){busy=true;cur=null;talk=false;if(sc<2)return go(sc+1);$('sub').innerHTML='';$('fade').innerHTML='THE END<br><small>Use the buttons below to replay a scene</small>';$('fade').classList.add('on');return}
const[w,t]=L[li];cur=w;lineT=0;gapT=0;spDone=false;talk=true;lid++;$('sub').innerHTML=`<b style="color:${C[w].c}">${C[w].n}:</b> ${t}`;speak(w,t)}
function card(h,cb){clearTimeout(ct);const f=$('fade');f.innerHTML=h;f.classList.add('on');ct=setTimeout(()=>{cb();f.classList.remove('on')},1800)}
function go(i){sc=i;busy=true;lid++;if(window.speechSynthesis)speechSynthesis.cancel();cur=null;talk=false;paused=false;$('pp').textContent='⏸ Pause';ac&&ac.resume();$('sub').innerHTML='';
card(S[i].t,()=>{li=-1;ST=0;lineT=0;born={};parts=[];n2=0;tot={co2:0,nadh:0,fadh:0,gtp:0};busy=false;next()})}
let last=0;
function loop(ts){const dt=Math.min(.05,(ts-last)/1000);last=ts;
if(!paused){T+=dt;if(started){ST+=dt;lineT+=dt;boost*=.9;if(!busy&&cur){if(!voiceOn&&lineT>est)spDone=true;if(lineT>est*3+4)spDone=true;if(spDone){talk=false;gapT+=dt;if(gapT>.3)next()}}}}
g.clearRect(0,0,W,H);[s1,s2,s3][sc]();if(sc>0)ch('nar',75,125,.6);
if(started&&!busy&&cur)flow(S[sc].l[li][2]);if(sc==1&&cur&&cur!='nar'&&!busy)ch(cur,120,585,.95);drawParts();requestAnimationFrame(loop)}
// ---------- Controls ----------
$('start').onclick=()=>{started=true;ac=new(window.AudioContext||window.webkitAudioContext)();music();$('title').classList.add('hide');go(0)};
$('pp').onclick=()=>{if(!started)return;paused=!paused;$('pp').textContent=paused?'▶ Play':'⏸ Pause';if(paused){window.speechSynthesis&&speechSynthesis.pause();ac&&ac.suspend()}else{window.speechSynthesis&&speechSynthesis.resume();ac&&ac.resume()}};
$('rs').onclick=()=>started&&go(sc);$('ra').onclick=()=>started&&go(0);
document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>started&&go(+b.dataset.s));
$('fade').onclick=()=>{if(!busy)return;if(li>=S[sc].l.length)$('fade').classList.remove('on')};
requestAnimationFrame(loop);
