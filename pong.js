let anchoCanvas = 800;
let altoCanvas = 400;

let jugadorX = 15;
let jugadorY;
let anchoRaqueta = 10;
let altoRaqueta = 100;

let computadoraX = anchoCanvas - 25;
let computadoraY;

let pelotaX, pelotaY;
let diametroPelota = 20;
let velocidadPelotaX = 5;
let velocidadPelotaY = 5;
let anguloPelota = 0;

let grosorMarco = 10;

let jugadorScore = 0;
let computadoraScore = 0;

let fondo;
let barraJugador;
let barraComputadora;
let bola;
let sonidoRebote;
let sonidoGol;

let dificultad = 2; // 1: Fácil, 2: Normal, 3: Difícil
let velocidadMaximaPelota = 15; 
let puntosParaGanar = 10;
let juegoIniciado = false; 

function preload() {
  fondo = loadImage('fondo1.jpg');
  barraJugador = loadImage('barra2.png');
  barraComputadora = loadImage('barra1.png');
  bola = loadImage('bola1.png');
  sonidoRebote = loadSound('rebote.wav');
  sonidoGol = loadSound('point.wav');
}

function setup() {
  createCanvas(anchoCanvas, altoCanvas);
  jugadorY = height / 2 - altoRaqueta / 2;
  computadoraY = height / 2 - altoRaqueta / 2;
  mostrarMenu(); 
}

function draw() {
  if (juegoIniciado) {
    background(fondo);
    dibujarMarcos();
    dibujarRaquetas();
    dibujarPelota();
    mostrarPuntaje();
    moverPelota();
    moverComputadora();
    verificarColisiones();
    if (jugadorScore >= puntosParaGanar || computadoraScore >= puntosParaGanar) {
      juegoIniciado = false;
      mostrarMenuFinJuego(); // Mostrar menú de fin de juego
    }
  }
}

function dibujarMarcos() {
  fill(color("#ffffff"));
  rect(0, 0, width, grosorMarco); 
  rect(0, height - grosorMarco, width, grosorMarco); 
}

function dibujarRaquetas() {
  image(barraJugador, jugadorX, jugadorY, anchoRaqueta, altoRaqueta);
  image(barraComputadora, computadoraX, computadoraY, anchoRaqueta, altoRaqueta);
}

function dibujarPelota() {
  push();
  translate(pelotaX, pelotaY);
  rotate(anguloPelota);
  imageMode(CENTER);
  image(bola, 0, 0, diametroPelota, diametroPelota);
  pop();
}

function mostrarPuntaje() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(color("#ffffff"));
  text(jugadorScore, width / 4, grosorMarco * 3);
  text(computadoraScore, 3 * width / 4, grosorMarco * 3);
}

function moverPelota() {
  pelotaX += velocidadPelotaX;
  pelotaY += velocidadPelotaY;

  let velocidadTotal = sqrt(velocidadPelotaX * velocidadPelotaX + velocidadPelotaY * velocidadPelotaY);
  anguloPelota += velocidadTotal * 0.05;

  if (pelotaY - diametroPelota / 2 < grosorMarco || 
      pelotaY + diametroPelota / 2 > height - grosorMarco) {
      velocidadPelotaY *= -1;
  }

  let velocidadActual = Math.sqrt(velocidadPelotaX * velocidadPelotaX + velocidadPelotaY * velocidadPelotaY);
  if (velocidadActual < velocidadMaximaPelota) {
    velocidadPelotaX *= 1.005; 
    velocidadPelotaY *= 1.005;
  }
}

function moverComputadora() {
  let velocidadComputadora = 3 + dificultad; 
  let objetivoY = pelotaY - altoRaqueta / 2;
  if (velocidadPelotaX > 0) {
    let tiempoEstimado = (computadoraX - pelotaX) / velocidadPelotaX; 
    objetivoY = pelotaY + velocidadPelotaY * tiempoEstimado + random(-10, 10); 
  }
  computadoraY = lerp(computadoraY, objetivoY, 0.1); 
  computadoraY = constrain(computadoraY, grosorMarco, height - grosorMarco - altoRaqueta);
}


function verificarColisiones() {
  // Colisión con la raqueta del jugador
  if (pelotaX - diametroPelota / 2 < jugadorX + anchoRaqueta && 
      pelotaY > jugadorY && pelotaY < jugadorY + altoRaqueta) {
      let puntoImpacto = pelotaY - (jugadorY + altoRaqueta / 2);
      let factorAngulo = (puntoImpacto / (altoRaqueta / 2)) * PI / 3; 
      velocidadPelotaY = 10 * sin(factorAngulo);
      velocidadPelotaX *= -1;
      sonidoRebote.play(); 
  }

  // Colisión con la raqueta de la computadora
if (pelotaX + diametroPelota / 2 > computadoraX && 
      pelotaY > computadoraY && pelotaY < computadoraY + altoRaqueta) {
      let puntoImpacto = pelotaY - (computadoraY + altoRaqueta / 2);
      let factorAngulo = (puntoImpacto / (altoRaqueta / 2)) * PI / 3; 
      velocidadPelotaY = 10 * sin(factorAngulo);
      velocidadPelotaX *= -1;
      sonidoRebote.play();
  }

  // Colisión con los bordes izquierdo y derecho (anotación y reinicio)
  if (pelotaX < 0) {
      computadoraScore++;
      sonidoGol.play(); 
      narrarMarcador(); 
      resetPelota();
  } else if (pelotaX > width) {
      jugadorScore++;
      sonidoGol.play(); 
      narrarMarcador(); 
      resetPelota();
  }
}

function narrarMarcador() {
  let narrador = new SpeechSynthesisUtterance(`${jugadorScore} a ${computadoraScore}`);

  // Obtener las voces disponibles
  let vocesDisponibles = window.speechSynthesis.getVoices();
  if (vocesDisponibles.length >= 5) {
    narrador.voice = vocesDisponibles[4];
  }

  window.speechSynthesis.speak(narrador);
}

function resetPelota() {
  pelotaX = width / 2;
  pelotaY = height / 2;
  velocidadPelotaX = 5 * (Math.random() > 0.5 ? 1 : -1);
  velocidadPelotaY = 5 * (Math.random() > 0.5 ? 1 : -1);
  anguloPelota = 0;
}

function keyPressed() {
  if (!juegoIniciado && (key === '1' || key === '2' || key === '3')) {
    dificultad = parseInt(key);
    juegoIniciado = true;
    resetPelota(); 
  } else {
    if (keyCode === UP_ARROW) {
        jugadorY -= 50;
    } else if (keyCode === DOWN_ARROW) {
        jugadorY += 50;
    }
    jugadorY = constrain(jugadorY, grosorMarco, height - grosorMarco - altoRaqueta);
  }
  if (!juegoIniciado) {
    jugadorScore = 0;
    computadoraScore = 0;
    mostrarMenu();
  }
}

function mostrarMenu() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Pong", anchoCanvas / 2, altoCanvas / 2 - 50);
  textSize(24);
  text("Presiona 1, 2 o 3 para seleccionar la dificultad:", anchoCanvas / 2, altoCanvas / 2);
  text("1: Fácil", anchoCanvas / 2, altoCanvas / 2 + 50);
  text("2: Normal", anchoCanvas / 2, altoCanvas / 2 + 80);
  text("3: Difícil", anchoCanvas / 2, altoCanvas / 2 + 110);
}

function mostrarMenuFinJuego() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);

  if (jugadorScore >= puntosParaGanar) {
    text("¡Ganaste!", anchoCanvas / 2, altoCanvas / 2 - 50);
  } else {
    text("¡Perdiste!", anchoCanvas / 2, altoCanvas / 2 - 50);
  }

  textSize(24);
  text(`Marcador final: ${jugadorScore} - ${computadoraScore}`, anchoCanvas / 2, altoCanvas / 2);
  text("Presiona cualquier tecla para volver al menú", anchoCanvas / 2, altoCanvas / 2 + 50);
}