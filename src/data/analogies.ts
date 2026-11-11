// Analogy view: every part re-explained as something familiar.
import type { AnalogySet, DeviceId } from './types';

export const ANA: Record<DeviceId, AnalogySet> = {
'retro-laptop':{intro:{en:'Think of the laptop as a restaurant kitchen: a chef, a counter, a pantry and a serving window.',pt:'Pense no notebook como a cozinha de um restaurante: um chef, uma bancada, uma despensa e uma janela de serviço.'},p:{
 topcase:{en:['Restaurant front','What customers see and touch. The kitchen stays hidden behind it.'],pt:['Fachada do restaurante','O que o cliente vê e toca. A cozinha fica escondida atrás.']},
 keyboard:{en:['Order pad','Every key press is an order slip handed to the kitchen.'],pt:['Bloco de pedidos','Cada tecla é um pedido entregue à cozinha.']},
 board:{en:['Kitchen floor + wiring','Every station stands on it and is connected through it.'],pt:['Piso e fiação da cozinha','Todas as estações ficam em cima dela e se conectam por ela.']},
 cpu:{en:['The chef','Does the actual cooking, one dish at a time but very fast, and gets hot doing it.'],pt:['O chef','Faz a comida de verdade, um prato por vez mas muito rápido, e esquenta fazendo isso.']},
 fan:{en:['Extractor hood','Pulls heat and steam away from the chef so the kitchen doesn\'t overheat.'],pt:['Coifa','Puxa o calor e o vapor para longe do chef para a cozinha não superaquecer.']},
 ram:{en:['Counter space','The ingredients the chef is using right now: small but within reach, and cleared at closing time.'],pt:['Espaço na bancada','Os ingredientes que o chef está usando agora: pouco espaço, mas ao alcance, e tudo é limpo quando fecha.']},
 hdd:{en:['Rotating pantry','Holds everything long-term, but the chef has to wait for the shelf to spin to the right spot.'],pt:['Despensa giratória','Guarda tudo a longo prazo, mas o chef precisa esperar a prateleira girar até o lugar certo.']},
 optical:{en:['Recipe-book delivery','New recipes arrive on a disc you can read but not easily change.'],pt:['Entrega de livro de receitas','Receitas novas chegam num disco que você lê mas não altera facilmente.']},
 battery:{en:['Gas canister','Portable energy for the whole kitchen. Swap it when it runs out.'],pt:['Botijão de gás','Energia portátil para a cozinha inteira. Quando acaba, é só trocar.']},
 bottom:{en:['Building walls','Hold the whole kitchen together and keep it standing.'],pt:['Paredes do prédio','Mantêm a cozinha inteira unida e de pé.']},
 hinge:{en:['Door hinges','Let the serving window open and close without falling off.'],pt:['Dobradiças da porta','Deixam a janela de serviço abrir e fechar sem cair.']},
 bezel:{en:['Window frame','Frames what the customers see.'],pt:['Moldura da janela','Emoldura o que o cliente vê.']},
 lcd:{en:['Serving window','Where finished dishes are shown to the customer.'],pt:['Janela de serviço','Onde os pratos prontos são mostrados ao cliente.']},
 backlight:{en:['Display-case light','Without it, the dishes would sit in the dark.'],pt:['Luz da vitrine','Sem ela, os pratos ficariam no escuro.']},
 lidback:{en:['Window shutter','Closes over the window to protect it.'],pt:['Persiana','Fecha por cima da janela para protegê-la.']}}},
'modern-laptop':{intro:{en:'Think of the laptop as a modern restaurant: a chef, counter space, an instant fridge, an extractor fan and a serving window.',pt:'Pense no notebook como um restaurante moderno: um chef, espaço na bancada, uma geladeira instantânea, uma coifa e uma janela de serviço.'},p:{
 lcd:{en:['HD serving window','Where the finished dishes are shown to the customer, so sharp they look real.'],pt:['Janela de serviço HD','Onde os pratos prontos são mostrados ao cliente, tão nítida que parecem de verdade.']},
 keyboard:{en:['Order pad','Every key press is an order slip handed to the kitchen.'],pt:['Bloco de pedidos','Cada tecla é um pedido entregue à cozinha.']},
 trackpad:{en:['Order kiosk','Tap or press to order, and a little buzz confirms it.'],pt:['Totem de pedidos','Toque ou pressione para pedir, e uma vibração confirma.']},
 board:{en:['Kitchen floor + wiring','Every station stands on it and is wired together through it.'],pt:['Piso e fiação da cozinha','Todas as estações ficam em cima dela e se conectam por ela.']},
 soc:{en:['The chef','Does all the cooking, billions of tiny steps a second, and gets hot doing it.'],pt:['O chef','Faz toda a comida, bilhões de pequenos passos por segundo, e esquenta fazendo isso.']},
 ram:{en:['Counter space','The ingredients the chef is using right now: within reach, but wiped clean at closing time.'],pt:['Espaço na bancada','Os ingredientes que o chef está usando agora: ao alcance, mas limpos na hora de fechar.']},
 speakers:{en:['Dining-room speakers','Background music for the customers.'],pt:['Som ambiente','Música ambiente para os clientes.']},
 ssd:{en:['Instant fridge','Stores every ingredient long-term, and you can grab anything immediately.'],pt:['Geladeira instantânea','Guarda todos os ingredientes a longo prazo, e dá para pegar qualquer coisa na hora.']},
 cooling:{en:['Extractor fan','Blows the hot air out of the building so the kitchen stays cool.'],pt:['Exaustor','Joga o ar quente para fora do prédio para a cozinha ficar fresca.']},
 heatpipe:{en:['Heat ducts','Carry heat from the stove to the extractor fan.'],pt:['Dutos de calor','Levam o calor do fogão até o exaustor.']},
 battery:{en:['Fuel tanks','Built-in tanks that power the whole restaurant all day.'],pt:['Tanques de combustível','Tanques embutidos que abastecem o restaurante o dia inteiro.']},
 wifi:{en:['Phone line','Takes orders from outside through the antenna on the roof.'],pt:['Linha telefônica','Recebe pedidos de fora pela antena no telhado.']},
 ports:{en:['Delivery door','Where fuel and supplies come in.'],pt:['Porta de entregas','Por onde entram combustível e suprimentos.']},
 hinge:{en:['Door hinges','Let the serving window open and close smoothly.'],pt:['Dobradiças da porta','Deixam a janela de serviço abrir e fechar suavemente.']},
 bezel:{en:['Frame + doorbell camera','Frames the view and shows who\'s outside.'],pt:['Moldura + câmera','Emoldura a vista e mostra quem está do lado de fora.']},
 backlight:{en:['Display-case light','Without it, the dishes would sit in the dark.'],pt:['Luz da vitrine','Sem ela, os pratos ficariam no escuro.']},
 lidback:{en:['Window shutter','Thin metal that closes over the window to protect it.'],pt:['Persiana','Metal fino que fecha por cima da janela para protegê-la.']},
 topcase:{en:['Restaurant front','What customers see and touch. The kitchen stays hidden behind it.'],pt:['Fachada do restaurante','O que o cliente vê e toca. A cozinha fica escondida atrás.']},
 bottom:{en:['Building foundation','The floor of the building, with air vents underneath.'],pt:['Fundação do prédio','O piso do prédio, com saídas de ar por baixo.']}}},
'music-player':{intro:{en:'Think of the player as a tiny library with a librarian who reads songs out loud.',pt:'Pense no tocador como uma pequena biblioteca com um bibliotecário que lê as músicas em voz alta.'},p:{
 front:{en:['Library façade','The colourful entrance everyone recognizes.'],pt:['Fachada da biblioteca','A entrada colorida que todo mundo reconhece.']},
 screen:{en:['Notice board','Shows what\'s playing and where to go next.'],pt:['Quadro de avisos','Mostra o que está tocando e para onde ir.']},
 controls:{en:['Front desk','Where you ask for a song.'],pt:['Balcão de atendimento','É aqui que você pede uma música.']},
 board:{en:['Librarian + book cart','Brings about 20 minutes of songs up from the archive on a cart (RAM) and reads them out loud.'],pt:['Bibliotecário + carrinho','Traz uns 20 minutos de músicas do arquivo num carrinho (RAM) e as lê em voz alta.']},
 drive:{en:['Basement archive','Huge but slow. The librarian only goes down every now and then.'],pt:['Arquivo no porão','Enorme mas lento. O bibliotecário só desce de vez em quando.']},
 battery:{en:['Lunchbox','Energy packed for the whole day.'],pt:['Marmita','Energia embalada para o dia inteiro.']},
 back:{en:['Building structure','Keeps everything rigid and protected.'],pt:['Estrutura do prédio','Mantém tudo firme e protegido.']},
 jack:{en:['Loudspeaker + lock','Where the sound goes out, plus a lock so nobody fiddles with the desk.'],pt:['Alto-falante + tranca','Por onde o som sai, e uma tranca para ninguém mexer no balcão.']},
 dock:{en:['Loading dock','Where new books (songs) arrive and the lunchbox gets refilled.'],pt:['Doca de carga','Onde chegam livros novos (músicas) e a marmita é reabastecida.']}}}
};

