// Modern laptop (2020s), detailed teardown: 19 parts, heat-flow animation.
import * as THREE from 'three';
import { BX, CY, G, M, ctex, die, mesh, part, ring, rnd, screenPlane, setFlowFx, setLidRig, slab, spinners, sprinkle, vslab } from '../kit';

function pcbTex(){return ctex(1024,430,(x,w,h)=>{x.fillStyle='#1d5c3a';x.fillRect(0,0,w,h);
 x.lineWidth=2.2;x.strokeStyle='rgba(120,205,140,.38)';for(let i=0;i<170;i++){let px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);for(let k=0;k<4;k++){const d=Math.floor(rnd()*4),L=20+rnd()*90;
  if(d===0)px+=L;else if(d===1)py+=L*.6;else if(d===2){px+=L*.6;py+=L*.6}else{px-=L*.5;py+=L*.5}x.lineTo(px,py)}x.stroke()}
 for(let i=0;i<160;i++){x.fillStyle='#c9a24a';x.beginPath();x.arc(rnd()*w,rnd()*h,2.4,0,7);x.fill()}
 x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.5;for(let i=0;i<40;i++){x.strokeRect(rnd()*w,rnd()*h,10+rnd()*40,8+rnd()*26)}
 x.fillStyle='rgba(255,255,255,.75)';x.font='bold 16px monospace';x.fillText('MB-2026  REV 1.0',w*.62,h-18);x.fillText('CPU',w*.27,h*.22);x.fillText('DIMM A / B',w*.72,h*.08);
 x.strokeStyle='#d4b25a';x.lineWidth=5;[[14,14],[w-14,14],[14,h-14],[w-14,h-14],[w*.45,h-14]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,8,0,7);x.stroke()})})}
function cellTex(){return ctex(400,580,(x,w,h)=>{x.fillStyle='#2b2e34';x.fillRect(0,0,w,h);x.fillStyle='#3a3e46';x.fillRect(18,18,w-36,h-36);
 x.fillStyle='#e9edf3';x.font='bold 34px Inter,sans-serif';x.fillText('Li-ion Polymer',36,80);x.font='24px Inter,sans-serif';x.fillText('Rechargeable cell',36,118);
 x.font='bold 30px monospace';x.fillText('3.85V  4500mAh',36,190);x.fillStyle='#f2c14e';x.font='22px Inter,sans-serif';x.fillText('⚠ Do not puncture or heat',36,250);
 x.fillStyle='#e9edf3';for(let i=0;i<46;i++){const bw=1+Math.floor(rnd()*4);x.fillRect(40+i*6.5,h-130,bw,70)}})}
function dotTex(){const t=ctex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#0d0e10';for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.beginPath();x.arc(8+i*16,8+j*16,4.2,0,7);x.fill()}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const KB_ROWS:{h:number;k:[string,number][]}[]=[{h:.62,k:['Esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Del'].map((l):[string,number]=>[l,15/14])},
 {h:1,k:[['`',1],...'1234567890-='.split('').map((c):[string,number]=>[c,1]),['⌫',2]]},
 {h:1,k:[['Tab',1.5],...'QWERTYUIOP[]'.split('').map((c):[string,number]=>[c,1]),['\\',1.5]]},
 {h:1,k:[['Caps',1.75],...'ASDFGHJKL;\''.split('').map((c):[string,number]=>[c,1]),['Enter',2.25]]},
 {h:1,k:[['Shift',2.25],...'ZXCVBNM,./'.split('').map((c):[string,number]=>[c,1]),['Shift',2.75]]},
 {h:1,k:[['Ctrl',1],['Fn',1],['◆',1],['Alt',1],['',6],['Alt',1],['Ctrl',1],['ARROWS',3]]}];
type Key=[string,number,number,number,number];
function modernKeyboard(g:THREE.Object3D,W:number,Dp:number,y:number,kh:number,km:THREE.Material){const ux=W/15,uz=Dp/5.62,gap=.018,list:Key[]=[];let z=-Dp/2;
 KB_ROWS.forEach(row=>{let x=-W/2;const rh=row.h*uz;row.k.forEach(([l,wu])=>{const kw=wu*ux;
  if(l==='ARROWS'){const a=ux,hh=rh/2;list.push(['←',x+a/2,z+rh*.75,a-gap,hh-gap]);list.push(['↑',x+a*1.5,z+rh*.25,a-gap,hh-gap]);list.push(['↓',x+a*1.5,z+rh*.75,a-gap,hh-gap]);list.push(['→',x+a*2.5,z+rh*.75,a-gap,hh-gap])}
  else list.push([l,x+kw/2,z+rh/2,kw-gap,rh-gap]);x+=kw});z+=rh});
 const im=new THREE.InstancedMesh(BX(1,kh,1),km,list.length),o=new THREE.Object3D();
 list.forEach(([,cx,cz,kw,kd],i)=>{o.position.set(cx,y,cz);o.scale.set(kw,1,kd);o.updateMatrix();im.setMatrixAt(i,o.matrix)});g.add(im);
 const CW=2048,CH=Math.round(CW*Dp/W),t=ctex(CW,CH,(x)=>{x.clearRect(0,0,CW,CH);x.fillStyle='rgba(236,242,255,1)';x.textAlign='center';x.textBaseline='middle';
  list.forEach(([l,cx,cz])=>{if(!l)return;const px=(cx+W/2)/W*CW,pz=(cz+Dp/2)/Dp*CH;x.font=`600 ${l.length>2?28:l.length>1?32:40}px Inter,sans-serif`;x.fillText(l,px,pz)})});
 const lm=M(0xffffff,{map:t,alphaTest:.4,emissiveMap:t,emissive:new THREE.Color(0x8fa6d8),roughness:.6});lm.userData.screen=true;
 const lp=mesh(new THREE.PlaneGeometry(W,Dp),lm,0,y+kh/2+.0008,0);lp.rotation.x=-Math.PI/2;g.add(lp)}
function tube(pts:[number,number,number][],r:number,m:THREE.Material,seg=64){return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p)=>new THREE.Vector3(...p))),seg,r,10),m)}

export function buildModern(R: THREE.Group) {
 const W=3.1,D=2.15,r=.17;const A=()=>M(0x8d939b,{metalness:.8,roughness:.3});
 const pcbM=()=>{const t=pcbTex(),s=M(0x1d5c3a,{roughness:.6}),top=M(0xffffff,{map:t,roughness:.55,metalness:.1});return[s,s,top,s,s,s]};
 // ---- bottom case with vents
 let g=part(R,'bottom',[0,0,0],[0,-.95,0],{shell:true});const a=A(),holes=[];
 for(let c=0;c<9;c++)for(let rw=0;rw<3;rw++)holes.push({w:.034,d:.15,x:-1.32+c*.075,z:-.8+rw*.2,r:.016});
 g.add(mesh(slab(W,.022,D,r,holes),a,0,.011,0));g.add(mesh(ring(W,D,.11,r,.03),a,0,.077,0));
 const rub=M(0x16171a,{roughness:.95});[-.86,.86].forEach(z=>g.add(mesh(BX(2.5,.014,.07),rub,0,-.007,z)));
 const sc=M(0x6b7078,{metalness:.9,roughness:.25});[[-1.42,-.96],[0,-.96],[1.42,-.96],[-1.42,.96],[0,.96],[1.42,.96],[-1.45,0],[1.45,0]].forEach(([x,z])=>g.add(mesh(CY(.024,.006,12),sc,x,-.003,z)));
 // ---- battery
 g=part(R,'battery',[0,.052,.42],[0,-.45,.15]);
 const ct=cellTex(),cs=M(0x2b2e34,{roughness:.5}),cl=M(0xffffff,{map:ct,roughness:.45});
 [-.86,-.29,.29,.86].forEach(x=>g.add(mesh(BX(.54,.05,.78),[cs,cs,cl,cs,cs,cs],x,0,0)));
 g.add(mesh(BX(2.1,.012,.1),M(0x1d5c3a),0,0,-.45));sprinkle(g,2.0,.06,.006,10);
 g.add(mesh(BX(.12,.03,.08),M(0x1a1b1e),0,.01,-.5));g.add(mesh(BX(.1,.004,.24),M(0xd09a3a,{metalness:.4}),0,.02,-.62));
 // ---- motherboard
 g=part(R,'board',[.42,.058,-.55],[0,.5,0]);
 g.add(mesh(BX(2.05,.014,.86),pcbM()));
 const ch=M(0x5a5e66,{metalness:.5,roughness:.4}),cap=M(0x2a2c30,{metalness:.4}),capT=M(0xb9c0c8,{metalness:.9});
 for(let i=0;i<5;i++)g.add(mesh(BX(.07,.045,.07),ch,-.74,.03,-.25+i*.11));
 for(let i=0;i<6;i++){g.add(mesh(CY(.018,.04,12),cap,-.62,.027,-.26+i*.09));g.add(mesh(CY(.018,.002,12),capT,-.62,.048,-.26+i*.09))}
 const blk=M(0x141416,{roughness:.4});g.add(mesh(BX(.18,.012,.18),blk,-.05,.013,.15));g.add(mesh(BX(.09,.01,.06),blk,-.86,.012,.3));g.add(mesh(BX(.12,.01,.12),blk,.25,.012,.32));
 const slot=M(0x111214);[-.3,-.03].forEach(z=>g.add(mesh(BX(.66,.03,.05),slot,.54,.022,z-.1)));
 g.add(mesh(BX(.05,.025,.12),slot,.0,.02,.33));
 [[-.42,.4],[.28,-.4],[-.95,-.3]].forEach(([x,z])=>g.add(mesh(BX(.12,.03,.05),M(0xe6e2d8),x,.022,z)));
 sprinkle(g,1.9,.8,.007,28);
 // ---- CPU
 g=part(R,'soc',[.05,.072,-.6],[0,.85,0]);
 g.add(mesh(BX(.42,.012,.42),M(0x2c4a33,{roughness:.5})));die(g,.2,'modern',0,.0066,0,-Math.PI/2);
 const gc=M(0xc9a24a,{metalness:.7});for(let i=0;i<10;i++){const s=i<5?-1:1;g.add(mesh(BX(.02,.006,.012),gc,(i%5-2)*.04,.008,s*.15))}
 // ---- RAM
 g=part(R,'ram',[.96,.075,-.6],[.3,.75,0]);
 const rp=M(0x217a46,{roughness:.55}),rc=M(0x141416,{roughness:.4}),gold=M(0xd4a64a,{metalness:.85,roughness:.3}),stk=M(0xeef0f3);
 [-.25,.02].forEach(z=>{g.add(mesh(BX(.62,.012,.2),rp,0,0,z));g.add(mesh(BX(.6,.004,.025),gold,0,.006,z-.085));
  for(let i=0;i<4;i++)g.add(mesh(BX(.12,.012,.09),rc,-.22+i*.145,.012,z+.02));g.add(mesh(BX(.26,.002,.05),stk,0,.0195,z+.02))});
 // ---- SSD
 g=part(R,'ssd',[.75,.072,-.22],[.25,.75,.25]);
 g.add(mesh(BX(.6,.01,.16),M(0x1a2a20,{roughness:.5})));g.add(mesh(BX(.03,.004,.14),gold,-.29,.006,0));
 g.add(mesh(BX(.1,.012,.1),rc,-.18,.011,0));[-.02,.16].forEach(x=>g.add(mesh(BX(.15,.012,.12),rc,x,.011,0)));
 g.add(mesh(BX(.36,.002,.13),M(0xd8dde4),.07,.018,0));g.add(mesh(CY(.022,.014,16),sc,.29,.002,0));
 // ---- Wi-Fi card + antenna cables
 g=part(R,'wifi',[-.38,.072,-.28],[-.2,.65,.2]);
 g.add(mesh(BX(.18,.01,.24),M(0x1d5c3a)));g.add(mesh(BX(.14,.018,.14),M(0xc5cad1,{metalness:.85,roughness:.25}),0,.013,.03));
 ([[.04,M(0x222326)],[-.04,M(0x9aa0a8)]] as [number,THREE.Material][]).forEach(([x,m])=>{g.add(mesh(CY(.014,.01,12),gold,x,.012,-.09));g.add(tube([[x,.016,-.09],[x*.5,.03,-.35],[-.4,.06,-.58],[-.72+x,.085,-.72]],.0065,m,40))});
 // ---- cooling fan + fin stack
 g=part(R,'cooling',[-1.0,.075,-.52],[-.35,.15,.1]);
 const fh=M(0x2a2d31,{metalness:.4,roughness:.5});g.add(mesh(CY(.3,.006,40),fh,0,-.026,0));
 g.add(mesh(new THREE.CylinderGeometry(.3,.3,.05,40,1,true,Math.PI+.62,Math.PI*2-1.24),fh));
 const top=mesh(new THREE.RingGeometry(.11,.3,40),M(0x34383e,{metalness:.5,roughness:.4}),0,.026,0);top.rotation.x=-Math.PI/2;g.add(top);
 [-.27,.27].forEach(x=>g.add(mesh(BX(.012,.05,.17),fh,x,0,-.33)));g.add(mesh(BX(.55,.004,.17),M(0x34383e,{metalness:.5}),0,.026,-.33));
 const bl=new THREE.Group();bl.add(mesh(CY(.09,.046,24),M(0x1d1f23)));bl.add(mesh(CY(.06,.002,24),M(0xb9c0c8,{metalness:.8}),0,.024,0));
 const bm=M(0x26282c,{roughness:.6});for(let i=0;i<30;i++){const an=i/30*Math.PI*2,b=mesh(BX(.13,.04,.007),bm,Math.cos(an)*.17,0,Math.sin(an)*.17);b.rotation.y=-an+.55;bl.add(b)}
 g.add(bl);spinners.push({obj:bl,axis:'y',speed:22});
 const fin=M(0xb8bec6,{metalness:.85,roughness:.3});for(let i=0;i<24;i++)g.add(mesh(BX(.008,.06,.14),fin,-.25+i*.0217,0,-.46));
 // ---- heat pipes (+ heat-flow particles)
 g=part(R,'heatpipe',[0,.108,0],[0,.32,0]);
 const cu=M(0xc8783e,{metalness:.9,roughness:.28});
 const P1:[number,number,number][]=[[.05,0,-.6],[-.2,0,-.66],[-.5,0,-.86],[-.8,0,-.98],[-1.27,0,-.98]],P2:[number,number,number][]=[[.05,0,-.55],[-.22,0,-.6],[-.52,0,-.8],[-.8,0,-.93],[-1.27,0,-.93]];
 [P1,P2].forEach(P=>{const t=tube(P,.022,cu);t.scale.y=.55;g.add(t)});
 g.add(mesh(BX(.36,.012,.36),cu,.05,-.016,-.58));
 const br=M(0xb9c0c8,{metalness:.85,roughness:.3});[.785,-.785].forEach(ry=>{const b=mesh(BX(.62,.006,.05),br,.05,-.004,-.58);b.rotation.y=ry;g.add(b)});
 [[-.17,-.8],[.27,-.8],[-.17,-.36],[.27,-.36]].forEach(([x,z])=>g.add(mesh(CY(.022,.012,12),sc,x,.002,z)));
 const flow=new THREE.CatmullRomCurve3([...P1.map(p=>new THREE.Vector3(...p)),new THREE.Vector3(-1.0,0,-1.05),new THREE.Vector3(-1.0,0,-1.5)]);
 const N=36,pm=new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false,transparent:true,opacity:.95}),pim=new THREE.InstancedMesh(new THREE.SphereGeometry(.024,10,8),pm,N);
 pim.renderOrder=10;pim.visible=false;pim.userData.noPick=true;g.add(pim);
 const cHot=new THREE.Color(0xff4d2e),cWarm=new THREE.Color(0xffb347),cCool=new THREE.Color(0x4da3ff),cc=new THREE.Color(),oo=new THREE.Object3D();
 for(let i=0;i<N;i++)pim.setColorAt(i,cHot);
 setFlowFx({update(t:number,on:boolean){pim.visible=on;if(!on)return;for(let i=0;i<N;i++){const u=((i/N)+t*.12)%1,p=flow.getPointAt(u);oo.position.copy(p);const s=.6+.5*Math.sin(i*1.7);oo.scale.setScalar(u>.8?1.4:s);oo.updateMatrix();pim.setMatrixAt(i,oo.matrix);
  if(u<.55)cc.copy(cHot).lerp(cWarm,u/.55);else cc.copy(cWarm).lerp(cCool,Math.min(1,(u-.55)/.25));pim.setColorAt(i,cc)}pim.instanceMatrix.needsUpdate=true;pim.instanceColor!.needsUpdate=true}});
 // ---- speakers
 g=part(R,'speakers',[0,.08,.5],[0,.32,0]);const dt=dotTex();dt.repeat.set(2,6);
 const grl=M(0xffffff,{map:dt,alphaTest:.5,roughness:.6});
 [-1.38,1.38].forEach(x=>{g.add(mesh(BX(.18,.06,.48),M(0x26282c,{roughness:.6}),x,0,0));const gp=mesh(new THREE.PlaneGeometry(.14,.42),grl,x,.0305,0);gp.rotation.x=-Math.PI/2;g.add(gp);
  g.add(mesh(BX(.012,.012,.3),M(0xd03a3a),x+(x<0?.1:-.1),0,-.3))});
 // ---- charging port
 g=part(R,'ports',[-1.47,.075,.12],[-.6,0,0]);
 const pt=M(0xc5cad1,{metalness:.9,roughness:.2});[-.1,.12].forEach(z=>{g.add(mesh(BX(.08,.035,.12),pt,0,0,z));g.add(mesh(BX(.06,.012,.08),M(0x111214),-.012,0,z))});
 g.add(mesh(BX(.2,.01,.48),M(0x1d5c3a),.13,-.02,0));g.add(mesh(BX(.36,.004,.06),M(0xd09a3a,{metalness:.4}),.38,-.012,-.2));
 // ---- keyboard
 g=part(R,'keyboard',[0,.145,-.42],[0,1.32,0]);
 g.add(mesh(BX(2.64,.008,.92),G(0x18191c,0x36415e)));modernKeyboard(g,2.6,.9,.016,.022,M(0x1c1d21,{roughness:.55}));
 // ---- trackpad
 g=part(R,'trackpad',[0,.145,.56],[0,1.02,.28]);
 g.add(mesh(BX(1.3,.012,.74),M(0xa7adb5,{roughness:.22,metalness:.5})));g.add(mesh(BX(1.2,.008,.64),pcbM(),0,-.011,0));
 g.add(mesh(BX(.5,.02,.08),M(0x8a9098,{metalness:.6}),0,-.024,0));g.add(mesh(BX(.08,.004,.3),M(0xd09a3a,{metalness:.4}),.3,-.016,-.45));
 const fs=M(0xd09a3a,{metalness:.5});[[-.56,-.3],[.56,-.3],[-.56,.3],[.56,.3]].forEach(([x,z])=>g.add(mesh(CY(.03,.012,16),fs,x,-.018,z)));
 // ---- top case
 g=part(R,'topcase',[0,.145,0],[0,1.75,0],{shell:true});
 g.add(mesh(slab(W,.024,D,r,[{w:2.66,d:.94,z:-.42,r:.02},{w:1.32,d:.76,z:.56,r:.03}]),A()));
 const dt2=dotTex();dt2.repeat.set(2,7);const gm=M(0xffffff,{map:dt2,alphaTest:.5});[-1.38,1.38].forEach(x=>{const p=mesh(new THREE.PlaneGeometry(.14,.46),gm,x,.0125,.5);p.rotation.x=-Math.PI/2;g.add(p)});
 // ---- hinges
 g=part(R,'hinge',[0,.16,-1.0],[0,.22,-.6]);const hm=M(0x3a3e45,{metalness:.8,roughness:.3});
 [-1.05,1.05].forEach(x=>{const b=mesh(CY(.05,.34,20),hm,x,0,0);b.rotation.z=Math.PI/2;g.add(b);g.add(mesh(BX(.3,.008,.2),hm,x,-.045,.1));
  [-.09,.09].forEach(dx=>g.add(mesh(CY(.016,.012,10),sc,x+dx,-.038,.14)))});
 // ---- lid
 const L=new THREE.Group();L.position.set(0,.16,-1.02);L.rotation.x=-.3;R.add(L);const Hl=2.0;setLidRig({g:L,base:L.position.clone(),off:new THREE.Vector3(0,2.15,-.75)});
 g=part(L,'lidback',[0,0,0],[0,0,-.28],{shell:true});g.add(mesh(vslab(W,.035,Hl,r),A(),0,Hl/2,-.03));
 g.add(mesh(BX(.5,.06,.004),M(0x2a2c30),-.8,.12,-.01));g.add(mesh(BX(.5,.06,.004),M(0x2a2c30),.8,.12,-.01));
 g=part(L,'backlight',[0,Hl/2+.02,0],[0,0,.14]);
 g.add(mesh(BX(W-.16,Hl-.2,.01),G(0xdfe7f2,0xbdd3ff,{roughness:.9})));
 const led=G(0xffffff,0xffffff);for(let i=0;i<28;i++)g.add(mesh(BX(.05,.02,.012),led,-1.35+i*.1,-(Hl-.2)/2+.012,.004));
 g=part(L,'lcd',[0,Hl/2+.02,.016],[0,0,.32]);g.add(mesh(BX(W-.16,Hl-.2,.012),M(0x0e1013,{roughness:.3})));screenPlane(g,W-.2,Hl-.24,.0065,'modern');
 g.add(mesh(BX(.6,.08,.004),M(0xd09a3a,{metalness:.4}),0,-(Hl-.2)/2-.02,-.004));
 g=part(L,'bezel',[0,Hl/2,.028],[0,0,.5],{shell:true});
 g.add(mesh(vslab(W,.012,Hl,r,[{w:W-.16,d:Hl-.2,y:.02,r:.02}]),M(0x0c0d0f,{roughness:.3})));
 const cam=mesh(CY(.026,.01,20),M(0x1a2440,{metalness:.5,roughness:.08}),0,Hl/2-.04,.007);cam.rotation.x=Math.PI/2;g.add(cam);
 const cr=mesh(new THREE.RingGeometry(.026,.036,24),M(0x3a3e45,{metalness:.7}),0,Hl/2-.04,.0072);g.add(cr);
 g.add(mesh(CY(.007,.004,8),G(0x2a3a2a,0x3cff7a),.07,Hl/2-.04,.006).rotateX(Math.PI/2));
 [-.2,.2].forEach(x=>g.add(mesh(CY(.006,.004,8),M(0x000000),x,Hl/2-.04,.006).rotateX(Math.PI/2)));
}
