// Pocket music player (c. 2002) with a tiny spinning hard drive.
import * as THREE from 'three';
import { BX, CY, M, die, mesh, part, screenPlane, spinners, sprinkle, vslab , screenState } from '../kit';

export function buildPlayer(R: THREE.Group) {
 const W=1.25,H=2.0,r=.17;
 let g=part(R,'front',[0,1,.1],[0,0,1.0],{shell:true});
 g.add(mesh(vslab(W,.04,H,r,[{w:.98,d:.78,y:.45,r:.04},{w:.8,d:.8,y:-.4,r:.12}]),M(0xe0683a,{roughness:.35})));
 g=part(R,'screen',[0,1.45,.07],[0,0,.7]);g.add(mesh(BX(.96,.76,.02),M(0x20242a)));screenPlane(g,.92,.72,.0106,'player');
 g=part(R,'controls',[0,.6,.09],[0,0,1.45]);
 g.add(mesh(vslab(.74,.02,.74,.1),M(0x2a2d33,{roughness:.6})));
 const bm=M(0xf3efe6,{roughness:.45}),dm=M(0xb9c0c8,{metalness:.8});
 [[0,.24],[0,-.24],[.24,0],[-.24,0]].forEach(([x,y])=>{g.add(mesh(BX(.2,.2,.045),bm,x,y,.03));const d=mesh(CY(.04,.02,16),dm,x,y,-.02);d.rotation.x=Math.PI/2;g.add(d)});
 const c=mesh(CY(.1,.045,28),bm,0,0,.03);c.rotation.x=Math.PI/2;g.add(c);const cd=mesh(CY(.04,.02,16),dm,0,0,-.02);cd.rotation.x=Math.PI/2;g.add(cd);
 g=part(R,'board',[0,1,.035],[0,0,.38]);
 g.add(mesh(BX(1.1,1.84,.014),M(0x1f6b3f,{roughness:.6})));
 const sub=new THREE.Group();sub.rotation.x=Math.PI/2;g.add(sub);sprinkle(sub,1.0,1.7,.007,26);
 const ch=M(0x141416);g.add(mesh(BX(.28,.28,.014),ch,-.2,-.05,.014));die(g,.26,'player',-.2,-.05,.0215,0);g.add(mesh(BX(.22,.14,.014),ch,.25,0,.014));
 g=part(R,'drive',[0,1.42,-.03],[0,.3,-.65]);
 g.add(mesh(BX(.95,.68,.07),M(0x9aa3ad,{metalness:.6,roughness:.4})));
 const pp=new THREE.Group();pp.rotation.x=Math.PI/2;pp.position.set(0,.02,0);g.add(pp);
 pp.add(mesh(CY(.27,.006,48),M(0xdfe5ec,{metalness:.95,roughness:.12})));pp.add(mesh(CY(.045,.02,16),M(0x777f88,{metalness:.8})));
 pp.add(mesh(BX(.18,.003,.012),M(0x3a3f46),.13,.004,0));spinners.push({obj:pp,axis:'y',speed:30,when:()=>screenState.phase==='spin'});
 g=part(R,'battery',[0,.55,-.035],[0,-.3,-.6]);
 g.add(mesh(BX(.98,.64,.05),M(0x7f93ad,{roughness:.45,metalness:.3})));g.add(mesh(BX(.5,.2,.002),M(0xe8e8e8),0,0,.026));
 g=part(R,'back',[0,1,-.1],[0,0,-1.05],{shell:true});
 const al=M(0x8d939b,{metalness:.8,roughness:.38});g.add(mesh(vslab(W,.04,H,r),al));g.add(mesh(vslab(W,.18,H,r,[{w:W-.06,d:H-.06,r:r-.03}]),al,0,0,.08));
 g=part(R,'jack',[.35,2.0,0],[0,.65,0]);
 g.add(mesh(CY(.05,.14,20),M(0xb9c0c8,{metalness:.85,roughness:.25}),0,-.05,0));
 g.add(mesh(BX(.16,.05,.06),M(0x2a2d33),-.7,-.01,0));g.add(mesh(BX(.05,.03,.04),M(0xe0683a),-.73,.025,0));
 g=part(R,'dock',[0,0,0],[0,-.6,0]);
 g.add(mesh(BX(.6,.07,.08),M(0x1b1d21),0,.03,0));const gp=M(0xd4a64a,{metalness:.85});for(let i=0;i<12;i++)g.add(mesh(BX(.02,.006,.04),gp,-.24+i*.044,-.006,0));
}

