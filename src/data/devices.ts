// Device metadata: names, intros, camera framing and scale-ladder levels.
import type { DeviceGroup, DeviceId, DeviceMeta } from './types';

export const GROUPS: DeviceGroup[] = [{id:'laptops',name:{en:'Laptops',pt:'Notebooks'},items:['retro-laptop','modern-laptop']},{id:'audio',name:{en:'Portable audio',pt:'Áudio portátil'},items:['music-player']}];
export const DEV: Record<DeviceId, DeviceMeta> = {
 'retro-laptop':{group:{en:'Laptops',pt:'Notebooks'},name:{en:'The retro laptop',pt:'O notebook retrô'},tile:{en:'Retro laptop',pt:'Notebook retrô'},
  intro:{en:'A late-90s portable: chunky, plastic and easy to upgrade. The battery, RAM and drives are separate modules you could swap yourself.',
         pt:'Um portátil do fim dos anos 90: robusto, de plástico e fácil de fazer upgrade. Bateria, RAM e discos são módulos separados que dava para trocar em casa.'},
  tip:{en:'The hard disk spins about 70 times a second, and its read head flies just nanometres above the platter.',pt:'O disco rígido gira cerca de 70 vezes por segundo, e a cabeça de leitura voa a poucos nanômetros do prato.'},
  levels:[{v:'33 cm'},{v:'7 cm',part:'hdd'},{v:'1 cm',part:'cpu',chip:true}],
  cam:[5.4,4.3,6.4],target:[0,.75,-.15],floor:-1.32,cut:2.75,cv:{s:[5.6,5],c:[.6,0]}},
 'modern-laptop':{group:{en:'Laptops',pt:'Notebooks'},name:{en:'The modern laptop',pt:'O notebook moderno'},tile:{en:'Modern laptop',pt:'Notebook moderno'},
  intro:{en:'The 2020s version. Spinning disks are gone, one chip does the work of a whole motherboard, and nearly all the spare space is battery.',
         pt:'A versão dos anos 2020. Os discos giratórios sumiram, um único chip faz o trabalho de uma placa-mãe inteira e quase todo o espaço livre virou bateria.'},
  tip:{en:'A laptop uses heat pipes and a fan to move heat away from the CPU. Select the CPU, heat pipes or fan and press play to watch the heat flow.',pt:'Um notebook usa heat pipes e uma ventoinha para tirar o calor da CPU. Selecione a CPU, os heat pipes ou a ventoinha e aperte play para ver o calor fluir.'},
  levels:[{v:'31 cm'},{v:'8 cm',part:'ssd'},{v:'1 cm',part:'soc',chip:true}],
  cam:[4.8,3.6,5.6],target:[0,.6,-.2],floor:-1.08,cut:2.3,cv:{s:[5,4.4],c:[.5,0]}},
 'music-player':{group:{en:'Portable audio',pt:'Áudio portátil'},name:{en:'The pocket music player',pt:'O tocador de bolso'},tile:{en:'Pocket player',pt:'Tocador de bolso'},
  intro:{en:'An early-2000s player that held thousands of songs on a tiny spinning hard drive. Watch the drive spin up, fill the memory buffer, then stop while the music plays from RAM.',
         pt:'Um tocador do início dos anos 2000 que guardava milhares de músicas num disco rígido minúsculo. Veja o disco girar, encher o buffer de memória e parar enquanto a música toca a partir da RAM.'},
  tip:{en:'The hard drive only spins for a few seconds at a time. The rest of the time, music plays from memory to save battery.',pt:'O disco só gira alguns segundos por vez. No resto do tempo, a música toca da memória para poupar bateria.'},
  levels:[{v:'10 cm'},{v:'5 cm',part:'drive'},{v:'8 mm',part:'board',chip:true}],
  cam:[2.1,2.1,4.7],target:[0,1,0],floor:-.01,cut:.8,cv:{s:[3.4,3.2],c:[1,0]}}
};
export const ORDER: DeviceId[] = ['retro-laptop','modern-laptop','music-player'];

