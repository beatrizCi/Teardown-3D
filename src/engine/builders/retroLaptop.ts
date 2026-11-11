// Retro laptop (c. 1999): chunky plastic, swappable modules, spinning disks.
import * as THREE from 'three';
import { BX, CY, G, M, cover, die, fanBlades, keys, mesh, part, ring, screenPlane, slab, spinners, sprinkle, vslab } from '../kit';

export function buildRetro(R: THREE.Group) {
 const W=3.2,D=2.4,r=.28,shC=0x3a3f47,topC=0x4d535c;
 let g=part(R,'bottom',[0,0,0],[0,-1.2,0],{shell:true});
 const mb=M(shC,{roughness:.75});
 g.add(mesh(slab(W,.05,D,r),mb,0,.025,0));g.add(mesh(ring(W,D,.32,r,.05),mb,0,.21,0));
 const ft=M(0x15171a,{roughness:.95});[[-1.3,.9],[1.3,.9],[-1.3,-.9],[1.3,-.9]].forEach(([x,z])=>g.add(mesh(CY(.09,.03),ft,x,-.012,z)));
 const vm=M(0x0f1114);for(let i=0;i<9;i++)g.add(mesh(BX(.05,.13,.07),vm,-1.42+i*.1,.21,-D/2+.025));

 g=part(R,'battery',[-.25,.13,.58],[0,-.72,.95]);
 g.add(mesh(BX(.96,.14,.86),M(0x272b31,{roughness:.6})));g.add(mesh(BX(.5,.004,.22),M(0xe0a63a),0,.072,.2));
 const cell=M(0x3d7fd6,{roughness:.35,metalness:.3});for(let i=0;i<6;i++){const c=mesh(CY(.06,.78,20),cell,-.375+i*.15,0,0);c.rotation.x=Math.PI/2;g.add(c)}

 g=part(R,'hdd',[-1.12,.13,.6],[-.9,.55,.5]);
 g.add(mesh(BX(.68,.1,.92),M(0x9aa3ad,{metalness:.6,roughness:.4})));g.add(mesh(BX(.5,.003,.38),M(0xe9edf2,{roughness:.7}),0,.051,.22));
 let pl=new THREE.Group();pl.position.set(0,0,-.12);g.add(pl);
 pl.add(mesh(CY(.27,.012,48),M(0xdfe5ec,{metalness:.95,roughness:.12})));pl.add(mesh(CY(.05,.03,20),M(0x777f88,{metalness:.8,roughness:.3})));
 pl.add(mesh(BX(.2,.003,.012),M(0x3a3f46),.13,.007,0));spinners.push({obj:pl,axis:'y',speed:30});
 const arm=mesh(BX(.3,.01,.035),M(0x5b6168,{metalness:.7}),.15,.014,.12);arm.rotation.y=.6;g.add(arm);

 g=part(R,'optical',[.88,.14,.6],[1.1,.5,.6]);
 g.add(mesh(BX(1.28,.11,.96),M(0x2b2f35,{metalness:.35,roughness:.5})));g.add(mesh(BX(1.26,.07,.02),M(0x1b1d21),0,0,.48));
 const ds=new THREE.Group();ds.position.set(0,.012,-.02);g.add(ds);
 ds.add(mesh(CY(.44,.006,64),M(0xcfd8e6,{metalness:.9,roughness:.08})));ds.add(mesh(CY(.08,.008,24),M(0x8e98a6,{metalness:.5})));
 ds.add(mesh(BX(.3,.002,.05),M(0x6b5bd6,{metalness:.6}),.24,.004,0));spinners.push({obj:ds,axis:'y',speed:18});
 g.add(mesh(BX(.12,.03,.1),M(0x444a52,{metalness:.6}),0,-.025,.3));

 g=part(R,'board',[0,.235,-.52],[0,.15,0]);
 g.add(mesh(BX(2.9,.025,.98),M(0x1f6b3f,{roughness:.6})));sprinkle(g,2.8,.9,.013,46);

 g=part(R,'cpu',[-.35,.26,-.52],[0,.78,0]);
 g.add(mesh(BX(.3,.02,.3),M(0x2a2d31)));die(g,.17,'retro',0,.0115,0,-Math.PI/2);
 const cu=M(0xc77b3c,{metalness:.85,roughness:.3});cover(g,mesh(BX(.46,.02,.46),cu,0,.026,0));
 for(let i=0;i<9;i++)cover(g,mesh(BX(.46,.06,.012),cu,0,.066,-.2+i*.05));

 g=part(R,'ram',[.75,.26,-.52],[0,.5,0]);
 [-.18,.18].forEach(z=>{g.add(mesh(BX(1.0,.012,.28),M(0x217a46),0,0,z));g.add(mesh(BX(1.0,.004,.03),M(0xd4a64a,{metalness:.8}),0,.004,z-.125));
  for(let i=0;i<4;i++)g.add(mesh(BX(.18,.012,.12),M(0x141416),-.36+i*.24,.012,z+.02))});

 g=part(R,'fan',[-1.12,.29,-.6],[-.6,.62,-.4]);
 g.add(mesh(new THREE.CylinderGeometry(.24,.24,.1,32,1,true),M(0x202328)));
 const bl=fanBlades(7,.14,.15,.06,M(0x2c3036),M(0x3a3f46));g.add(bl);spinners.push({obj:bl,axis:'y',speed:16});
 const hp=mesh(CY(.025,.36,14),M(0xc77b3c,{metalness:.85,roughness:.3}),.42,0,0);hp.rotation.z=Math.PI/2;g.add(hp);

 g=part(R,'keyboard',[0,.385,-.45],[0,1.3,0]);
 g.add(mesh(BX(2.82,.02,1.0),M(0x202327)));keys(g,15,6,.185,.16,.165,.14,.045,M(0x30343a,{roughness:.55}),.032);

 g=part(R,'topcase',[0,.39,0],[0,1.85,0],{shell:true});
 g.add(mesh(slab(W,.04,D,r,[{w:2.86,d:1.04,z:-.45,r:.03}]),M(topC,{roughness:.7})));
 g.add(mesh(BX(.86,.006,.56),M(0x343a41,{roughness:.35}),0,.022,.6));g.add(mesh(BX(.86,.01,.12),M(0x2a2f35),0,.022,1.0));

 g=part(R,'hinge',[0,.43,-1.12],[0,.35,-.9]);
 const hm=M(0x23262b,{metalness:.4});[-1.05,1.05].forEach(x=>{const h=mesh(CY(.07,.5,20),hm,x,0,0);h.rotation.z=Math.PI/2;g.add(h)});

 const L=new THREE.Group();L.position.set(0,.43,-1.12);L.rotation.x=-.22;R.add(L);const Hl=2.25;
 g=part(L,'lidback',[0,0,0],[0,0,-.95],{shell:true});g.add(mesh(vslab(W,.1,Hl,r),M(shC,{roughness:.75}),0,Hl/2,-.06));
 g=part(L,'backlight',[0,Hl/2+.06,.015],[0,0,.4]);
 g.add(mesh(BX(W-.36,Hl-.42,.02),G(0xdfe7f2,0x9fbfff,{roughness:.9})));
 const tube=mesh(CY(.018,W-.42,12),G(0xf0f4fa,0xeaf4ff),0,-(Hl-.42)/2+.03,.02);tube.rotation.z=Math.PI/2;g.add(tube);
 g=part(L,'lcd',[0,Hl/2+.06,.045],[0,0,.85]);g.add(mesh(BX(W-.36,Hl-.42,.02),M(0x15181c,{roughness:.3,metalness:.2})));screenPlane(g,W-.42,Hl-.48,.0106,'retro');
 g=part(L,'bezel',[0,Hl/2,.07],[0,0,1.3],{shell:true});g.add(mesh(vslab(W,.04,Hl,r,[{w:W-.44,d:Hl-.5,y:.06,r:.03}]),M(shC,{roughness:.75})));
}

