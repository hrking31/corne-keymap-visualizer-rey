// Palabras y frases para practicar escribiendo de corrido, en el idioma del teclado. Van
// dentro de la app para que funcione sin conexión. Solo letras, espacios, comas y puntos:
// lo que casi cualquier teclado tiene en su capa Base. Las palabras, en minúscula; las
// frases, con mayúscula al principio y punto al final

export type Lengua = "es" | "en";

const lista = (texto: string) => [...new Set(texto.trim().split(/\s+/))];

export const PALABRAS: Record<Lengua, string[]> = {
  es: lista(`
    casa perro gato mesa silla puerta ventana libro papel lápiz agua fuego tierra aire cielo
    nube lluvia viento sol luna estrella mar río lago monte campo árbol flor hoja rama raíz
    piedra arena camino calle ciudad pueblo plaza parque jardín huerto granja escuela clase
    maestro alumno amigo vecino padre madre hijo hija hermano abuelo abuela familia niño niña
    mañana tarde noche día semana mes año hora minuto tiempo reloj fecha verano invierno otoño
    pan leche queso huevo fruta manzana naranja limón uva pera melón sandía carne pescado arroz
    sopa sal azúcar café té vaso plato taza cuchara tenedor cuchillo cocina horno nevera
    cama sofá lámpara espejo cuadro alfombra techo suelo pared escalera llave caja bolsa
    zapato camisa pantalón falda abrigo gorro guante bufanda ropa botón hilo aguja tela
    coche tren avión barco bici moto camión puente túnel viaje mapa maleta billete puerto
    música canción guitarra piano tambor baile fiesta juego pelota equipo partido carrera
    teclado ratón pantalla mensaje correo red código prueba error dato archivo carpeta
    rojo azul verde amarillo negro blanco gris marrón rosa morado claro oscuro
    grande pequeño alto bajo largo corto ancho nuevo viejo joven rápido lento fuerte suave
    feliz triste bueno malo bonito limpio sucio lleno vacío caliente frío dulce salado
    correr saltar nadar volar comer beber dormir soñar leer escribir hablar cantar jugar
    mirar escuchar pensar saber querer poder tener hacer decir venir salir entrar subir
    bajar abrir cerrar buscar encontrar perder ganar pagar comprar vender llevar traer
    mover parar seguir volver llegar pasar quedar dejar tomar poner sacar usar cambiar
    ayudar trabajar estudiar aprender enseñar contar medir pesar cortar pintar dibujar
    caballo vaca oveja cerdo gallina pato conejo ratón león tigre oso lobo zorro águila
    abeja hormiga mariposa pájaro pez ballena delfín tortuga serpiente rana araña
    cuerpo cabeza cara ojo nariz boca diente oreja mano dedo brazo pierna pie rodilla
    corazón sangre hueso piel pelo voz risa llanto sueño idea palabra nombre número letra
    historia cuento noticia pregunta respuesta problema solución razón verdad mentira
    paz guerra amor miedo valor fuerza calma prisa suerte sorpresa regalo premio
    lunes martes jueves viernes sábado domingo enero febrero marzo abril mayo junio julio
    uno dos tres cuatro cinco seis siete ocho nueve diez cien mil primero último mitad
    siempre nunca hoy ayer pronto tarde cerca lejos arriba abajo dentro fuera antes después
  `),
  en: lista(`
    house dog cat table chair door window book paper pencil water fire earth air sky
    cloud rain wind sun moon star sea river lake mountain field tree flower leaf branch root
    stone sand road street city town square park garden farm school class teacher student
    friend neighbor father mother son daughter brother sister family child baby people
    morning evening night day week month year hour minute time clock date summer winter
    bread milk cheese egg fruit apple orange lemon grape pear melon meat fish rice soup
    salt sugar coffee tea glass plate cup spoon fork knife kitchen oven fridge
    bed sofa lamp mirror picture carpet roof floor wall stairs key box bag
    shoe shirt pants skirt coat hat glove scarf clothes button thread needle cloth
    car train plane boat bike truck bridge tunnel trip map suitcase ticket port
    music song guitar piano drum dance party game ball team match race
    keyboard mouse screen message mail network code test error data file folder
    red blue green yellow black white gray brown pink purple light dark
    big small tall short long wide new old young fast slow strong soft
    happy sad good bad pretty clean dirty full empty hot cold sweet salty
    run jump swim fly eat drink sleep dream read write speak sing play
    look listen think know want can have make say come leave enter climb
    open close search find lose win pay buy sell carry bring
    move stop follow return arrive pass stay let take put pull use change
    help work study learn teach count measure weigh cut paint draw
    horse cow sheep pig chicken duck rabbit lion tiger bear wolf fox eagle
    bee ant butterfly bird whale dolphin turtle snake frog spider
    body head face eye nose mouth tooth ear hand finger arm leg foot knee
    heart blood bone skin hair voice laugh tears sleep idea word name number letter
    story tale news question answer problem solution reason truth
    peace war love fear courage strength calm hurry luck surprise gift prize
    monday tuesday wednesday thursday friday saturday sunday january march april june july
    one two three four five six seven eight nine ten hundred thousand first last half
    always never today yesterday soon late near far above below inside outside before after
  `),
};

export const FRASES: Record<Lengua, string[]> = {
  es: [
    "Hoy practico sin mirar las manos.",
    "El teclado nuevo ya no me parece raro.",
    "Cada día escribo un poco más rápido.",
    "La práctica hace al maestro.",
    "Despacio se llega lejos.",
    "El gato duerme junto a la ventana.",
    "Mañana saldremos temprano al campo.",
    "La lluvia cae suave sobre el tejado.",
    "Mi perro corre feliz por el parque.",
    "El café de la mañana está caliente.",
    "Escribo con calma y sin errores.",
    "Las manos ya saben dónde está cada letra.",
    "Una capa nueva, un atajo nuevo.",
    "El niño lee un cuento antes de dormir.",
    "El sol se esconde detrás del monte.",
    "Vamos a cenar pescado con arroz.",
    "La música suena desde la cocina.",
    "Aprender algo nuevo siempre cuesta al principio.",
    "El tren llega a la estación a las ocho.",
    "Hace frío, ponte el abrigo.",
    "Las flores del jardín ya abrieron.",
    "Mi hermana pinta un cuadro azul.",
    "El viento mueve las hojas del árbol.",
    "Quien busca, encuentra.",
    "Más vale tarde que nunca.",
    "No dejes para mañana lo que puedes hacer hoy.",
    "El que madruga encuentra el pan caliente.",
    "Poco a poco se hace el camino.",
    "La luna brilla sobre el mar en calma.",
    "Abre la puerta, que ya llegaron.",
    "El código funciona a la primera.",
    "Guardo una copia antes de cambiar nada.",
    "Las pruebas pasan, puedo seguir.",
    "Mi teclado tiene dos mitades.",
    "Los pulgares hacen gran parte del trabajo.",
    "El viaje fue largo pero tranquilo.",
    "La abuela cuenta historias de su pueblo.",
    "El partido termina en empate.",
    "Compré pan, leche y fruta.",
    "La biblioteca abre los sábados.",
    "El río baja lleno después de la tormenta.",
    "Me gusta caminar por la playa al amanecer.",
    "El pájaro canta en la rama más alta.",
    "La cena está lista, ven a la mesa.",
    "Cierra la ventana, que entra el viento.",
    "El tiempo vuela cuando te diviertes.",
    "Un paso cada vez, sin prisa.",
    "Hoy escribo mejor que ayer.",
    "La tortuga gana la carrera.",
    "El sueño de anoche fue muy raro.",
    "Los amigos llegan con una sorpresa.",
    "La montaña se ve blanca en invierno.",
    "Escucho la lluvia mientras leo.",
    "El equipo trabaja junto y gana.",
    "Una buena idea cambia el día.",
    "La clase empieza en cinco minutos.",
    "Pinto la pared de color verde.",
    "El barco sale del puerto al alba.",
    "El reloj marca las doce en punto.",
    "Escribir sin mirar ya es costumbre.",
  ],
  en: [
    "Today I practice without looking at my hands.",
    "The new keyboard no longer feels strange.",
    "Every day I type a little faster.",
    "Practice makes perfect.",
    "Slow and steady wins the race.",
    "The cat sleeps by the window.",
    "Tomorrow we will leave early for the field.",
    "The rain falls softly on the roof.",
    "My dog runs happily in the park.",
    "The morning coffee is hot.",
    "I type calmly and without errors.",
    "My hands already know where each letter is.",
    "A new layer, a new shortcut.",
    "The child reads a story before bed.",
    "The sun hides behind the mountain.",
    "We are having fish and rice for dinner.",
    "Music plays from the kitchen.",
    "Learning something new is always hard at first.",
    "The train arrives at eight.",
    "It is cold, put on your coat.",
    "The garden flowers are already open.",
    "My sister paints a blue picture.",
    "The wind moves the leaves of the tree.",
    "Seek and you shall find.",
    "Better late than never.",
    "Do not leave for tomorrow what you can do today.",
    "The early bird catches the worm.",
    "Little by little the road is made.",
    "The moon shines over a calm sea.",
    "Open the door, they are here.",
    "The code works on the first try.",
    "I save a copy before changing anything.",
    "The tests pass, I can move on.",
    "My keyboard has two halves.",
    "The thumbs do a lot of the work.",
    "The trip was long but quiet.",
    "Grandma tells stories about her town.",
    "The match ends in a draw.",
    "I bought bread, milk and fruit.",
    "The library opens on Saturdays.",
    "The river runs full after the storm.",
    "I like to walk on the beach at dawn.",
    "The bird sings on the highest branch.",
    "Dinner is ready, come to the table.",
    "Close the window, the wind is coming in.",
    "Time flies when you are having fun.",
    "One step at a time, no rush.",
    "Today I type better than yesterday.",
    "The turtle wins the race.",
    "Last night I had a strange dream.",
    "The friends arrive with a surprise.",
    "The mountain looks white in winter.",
    "I listen to the rain while I read.",
    "The team works together and wins.",
    "A good idea changes the day.",
    "The class starts in five minutes.",
    "I paint the wall green.",
    "The boat leaves the port at dawn.",
    "The clock strikes twelve.",
    "Typing without looking is now a habit.",
  ],
};
