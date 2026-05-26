<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import RSVPForm from '../components/RSVPForm.vue'

const canvas = ref(null)
let ctx, width, height, animationId
let particles = []

// Generamos 500 destellos (sparkles) para la animación de escritura
const magicSparkles = ref([])
const generateSparkles = () => {
  const sparkles = []
  for (let i = 0; i < 250; i++) {
    // Distribuir mayoritariamente en el centro donde está el texto (20% a 80% ancho, 20% a 80% alto del contenedor MÁX)
    const left = -20 + Math.random() * 120 // 15% - 85%
    const top = 0 + Math.random() * 60 // 20% - 80%
    // El delay debería ser proporcional a su posición horizontal (X/left) para aparecer a medida que se "escribe"
    // Animación total de escritura: 4.5s
    // Left va de 15 a 85 = ancho 70. 
    const baseDelay = ((left - 15) / 70) * 4.0; 
    // Añadimos una ligera variación caótica
    const finalDelay = Math.max(0, baseDelay + (Math.random() - 0.5) * 0.5)
    
    // Variar tamaños y duraciones del destello para que no se vean homogéneos
    const duration = 0 + Math.random() * 0.5 // Entre 0.5s y 2.0s
    const scale = 0.5 + Math.random() * 2.5 // Escala de 0.5 a 2.0
    
    sparkles.push({
      id: i,
      left: `${left}%`,
      top: `${top}%`,
      delay: `${finalDelay}s`,
      duration: `${duration}s`,
      scale: `${scale}`
    })
  }
  magicSparkles.value = sparkles
}


const initCanvas = () => {
if (!canvas.value) return
ctx = canvas.value.getContext('2d')
resize()
createParticles()
animate()
}

const resize = () => {
width = canvas.value.width = window.innerWidth
height = canvas.value.height = window.innerHeight
}

class Particle {
constructor() {
this.reset()
}

reset() {
this.x = Math.random() * width
this.y = Math.random() * height
this.size = Math.random() * 2 + 0.5
this.speedX = (Math.random() - 0.5) * 0.1
this.speedY = Math.random() * 0.5 + 0.5 // Falling velocity
this.opacity = Math.random() * 0.5 + 0.2
this.blinkSpeed = Math.random() * 0.02
}

update() {
this.x += this.speedX
this.y += this.speedY
this.opacity += this.blinkSpeed

if (this.opacity > 1 || this.opacity < 0.2) {
this.blinkSpeed *= -1
}

if (this.x < 0) this.x = width
if (this.x > width) this.x = 0
if (this.y > height) {
this.y = -10
this.x = Math.random() * width
}
}

draw() {
ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
ctx.beginPath()
ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
ctx.fill()
}
}

const createParticles = () => {
particles = []
// Regular small particles
for (let i = 0; i < 150; i++) {
const p = new Particle()
particles.push(p)
}
// Larger Bokeh circles
for (let i = 0; i < 20; i++) {
const p = new Particle()
p.size = Math.random() * 15 + 10
p.opacity = Math.random() * 0.1 + 0.05
p.isBokeh = true
particles.push(p)
}
}

const animate = () => {
ctx.clearRect(0, 0, width, height)
particles.forEach(p => {
p.update()
if (p.isBokeh) {
 ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
 ctx.filter = 'blur(4px)'
 ctx.beginPath()
 ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
 ctx.fill()
 ctx.filter = 'none'
} else {
 p.draw()
}
})
animationId = requestAnimationFrame(animate)
}

onMounted(() => {
initCanvas()
//generateSparkles()
window.addEventListener('resize', resize)
})

onUnmounted(() => {
cancelAnimationFrame(animationId)
window.removeEventListener('resize', resize)
})
</script>

<template>
<div class="glitter-negro">
<video class="bg-video" autoplay loop muted playsinline>
  <source src="../assets/Video_Generado_Con_Mejor_Calidad.mp4" type="video/mp4" />
</video>

<div class="background-overlay"></div>


<!--
<section class="invite-text" style="padding: 0px 20px;">
<p>Hay momentos en la vida que son especiales por sí solos, pero compartirlos con las personas que más queremos los hace inolvidables.</p>
</section>-->

<section class="details">
<div class="detail-card">
<h2 class="time date-title"> Reserva la fecha </h2>
<h2 class="time date-subtitle">19 de Septiembre 21:00 HS</h2>
</div>
</section>
 
<!-- Animación de Escritura XV Alma -->
<section class="writing-section date-large animated-text-section">
<div class="writing-animation-container">

<!-- SVG del texto escrito a mano. Usamos un dasharray para revelarlo -->
<svg class="handwritten-svg" viewBox="0 0 400 150" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="rainbowBorder" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stop-color="#ff0000" />
<stop offset="15%" stop-color="#AB6337" />
<stop offset="40%" stop-color="#ffcc00" />
<stop offset="55%" stop-color="#37AB72" />

<stop offset="80%" stop-color="#4141E0" />
<stop offset="100%" stop-color="#A986B5" />
</linearGradient>
</defs>
<!-- Texto base: ALMA XV -->
<!-- stroke-dasharray y stroke-dashoffset son la clave para el efecto de dibujado -->
<!--<text x="50%" y="60%" text-anchor="middle" class="svg-text-bg " >A L M A  &nbsp;&nbsp;  X V</text>-->
<text x="50%" y="60%" text-anchor="middle" class="svg-text-writing ">A L M A &nbsp;&nbsp;  X V</text> 
</svg>

<!-- Imagen de la pluma animada -->
<!--<img class="writing-pen" src="C:/Users/matia/.gemini/antigravity/brain/5a2003a5-d4e7-47cd-9777-3eb36e2e9f77/silver_feather_pen_1773703527285.png" alt="Pluma de escritura">
-->
<!-- Chispas esparcidas dinámicamente -->
<div 
  v-for="sparkle in magicSparkles" 
  :key="sparkle.id" 
  class="sparkle"
  :style="{
    left: sparkle.left,
    top: sparkle.top,
    '--delay': sparkle.delay,
    '--duration': sparkle.duration,
    '--scale': sparkle.scale
  }">
</div>
</div>
</section>
<!--<div class="">
<p class="pre-title">XV ALMA</p>
<h1 class="main-name">Alma</h1>

 
</div>--> 


<!--
<section class="location">
<div class="circle-img">
<img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" alt="Salon">
</div>
<h3>Salón de Eventos</h3>
<p>Av. Libertador 1234, CABA</p>
<a href="https://maps.google.com" target="_blank" class="btn-outline">¿CÓMO LLEGAR?</a>
</section>
-->
<section class="rsvp-section">
  <p class="time msg-prox">próximamente te envio la invitación</p>
<h3 class="time title-confirm">YA PODÉS CONFIRMAR TU ASISTENCIA</h3> 
<RSVPForm theme="dark" />
</section>
<!--
<section class="playlist">
<h3>MÚSICA</h3>
<p>¿Qué canciones no pueden faltar?</p>
<button class="btn-outline">SUGERIR CANCIÓN</button>
</section>

<section class="gift">
<div class="gift-container">
<div class="gift-label">REGALO</div>
<div class="gift-info">
<p>Mi mayor regalo es tu presencia, pero si deseas realizar uno:</p>
<div class="bank-details">
<p><strong>CBU:</strong> 0000003100012345678901</p>
<p><strong>ALIAS:</strong> alma.mis.15</p>
</div>
</div>
</div>
</section>

<footer class="footer">
<p>¡Te espero para celebrar juntos!</p>
</footer>-->
</div> 
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Roboto:wght@300;400;500;700&display=swap');

.glitter-negro {
background: #fff;
color: #fff;
min-height: 100vh;
position: relative;
}

.bg-video {
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
object-fit: cover;
z-index: 0;
pointer-events: none;
}

section {
position: relative;
z-index: 1;
padding: 40px 20px;
text-align: center;
max-width: 600px;
margin: 0 auto;
}

.hero {
height: 100vh;
display: flex;
align-items: center;
justify-content: center;
padding: 0;
}

.pre-title {
letter-spacing: 5px;
font-size: 0.9rem;
margin-bottom: 20px;
opacity: 0.8;
}

.main-name {
font-family: 'Roboto', sans-serif;
font-size: 6rem;
font-weight: 600;
margin-bottom: 0px;
color: #fff;
display: inline-block;
clip-path: inset(0 100% 0 0);
animation: write 4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
 glow 3s ease-in-out infinite alternate 4s;
}

@keyframes write {
from { clip-path: inset(0 100% 0 0); }
to { clip-path: inset(0 0 0 0); }
}

@keyframes glow {
from {
text-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
 0 0 20px rgba(255, 255, 255, 0.4),
 0 0 30px rgba(255, 255, 255, 0.2);
}
to {
text-shadow: 0 0 20px rgba(255, 255, 255, 1),
 0 0 40px rgba(255, 255, 255, 0.6),
 0 0 60px rgba(255, 255, 255, 0.4),
 0 0 80px rgba(255, 255, 255, 0.2);
}
}

.scroll-indicator {
position: absolute;
bottom: 40px;
left: 50%;
transform: translateX(-50%);
animation: bounce 2s infinite;
}

@keyframes bounce {
0%, 20%, 50%, 80%, 100% {transform: translateY(0) translateX(-50%);}
40% {transform: translateY(-10px) translateX(-50%);}
60% {transform: translateY(-5px) translateX(-50%);}
}

.section{

padding: 20px 20px;
}
.invite-text p {
font-size: 1.2rem;
line-height: 1.8;
font-weight: 300;
font-style: italic;
}

.date-large {
/*font-family: var(--font-title);*/
font-size: 3rem;
border-top: 1px solid rgba(255,255,255,0.2);
border-bottom: 1px solid rgba(255,255,255,0.2);
padding: 20px 0;
margin-bottom: 10px;
}

.time {
letter-spacing: 3px;
font-size: 1.2rem;
}

.circle-img {
width: 200px;
height: 200px;
border-radius: 50%;
overflow: hidden;
margin: 0 auto 30px;
border: 2px solid #fff;
}

.circle-img img {
width: 100%;
height: 100%;
object-fit: cover;
}

/* --- Animación de Escritura A Mano --- */

.writing-section {
padding: 10px 20px;
display: flex;
justify-content: center;
align-items: center;
}

.writing-animation-container {
position: relative;
width: 100%;
max-width: 400px;
height: 150px;
display: flex;
justify-content: center;
align-items: center;
}

.handwritten-svg {
width: 100%;
height: 100%;
overflow: visible;
filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
}

.svg-text-bg {

font-family: 'Anton', sans-serif;
font-size: 5rem; /* adjusted for Anton */
font-weight: 400;
fill: transparent;
stroke: url(#rainbowBorder);
stroke-width: 1px;
opacity: 0.2;
}

.svg-text-writing {
font-family: 'Anton', sans-serif;
font-size: 5rem;
font-weight: 400;
/*fill: url(#rainbowBorder);*/
fill: #ffffff20;
fill-opacity: 1;
stroke: url(#rainbowBorder);
stroke-width: 3px;
stroke-dasharray: 800;
stroke-dashoffset: 800;
animation: draw-text 4s ease-in-out forwards, smoke-pulse 4s infinite alternate 4s;
}

@keyframes draw-text {
0% {
stroke-dashoffset: 800;
fill-opacity: 0;
}
80% {
stroke-dashoffset: 0;
fill-opacity: 0;
}
100% {
stroke-dashoffset: 0;
fill-opacity: 1; /* Transición para mostrar el relleno con el mismo gradiente */
}
}

@keyframes smoke-pulse {
0% { 
    filter: drop-shadow(0 0 5px rgba(255,0,127,0.5)); 
    transform: translateY(0); 
}
100% { 
    filter: drop-shadow(0 -10px 20px rgba(0,243,255,0.8)) blur(1px); 
    transform: translateY(-4px); 
}
}

/* Pluma animada siguiendo el texto */
.writing-pen {
position: absolute;
width: 80px; /* Tamaño de la pluma */
opacity: 0;
pointer-events: none;
/* Animación compleja para seguir (aproximadamente) la ruta del SVG text */
animation: pen-write 4s ease-in-out forwards;
z-index: 10;
filter: drop-shadow(2px 4px 6px rgba(255,255,255,0.8));
}

@keyframes pen-write {
0% {
opacity: 1;
transform: translate(-120px, 10px) rotate(-10deg);
}
20% {
transform: translate(-60px, -15px) rotate(-5deg);
}
40% {
transform: translate(0px, 15px) rotate(-8deg);
}
60% {
transform: translate(60px, -10px) rotate(-3deg);
}
80% {
opacity: 1;
transform: translate(130px, 10px) rotate(-5deg);
}
100% {
opacity: 0;
transform: translate(150px, 30px) rotate(5deg);
}
}

/* Destellos de estrellas que aparecen durante la escritura */
.sparkle {
position: absolute;
width: 2px; /* Las hacemos un poquitito más chicas al haber tantas */
height: 2px;
background: white;
border-radius: 50%;
box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.9);
opacity: 0;
animation: twinkle var(--duration) ease-in-out var(--delay) 2;
pointer-events: none;
}

@keyframes twinkle {
0% { opacity: 0; transform: scale(0.1); }
50% { opacity: 1; transform: scale(var(--scale)); }
100% { opacity: 0; transform: scale(0.1); }
}

.btn-outline {
display: inline-block;
padding: 12px 30px;
border: 1px solid #fff;
color: #fff;
text-decoration: none;
letter-spacing: 2px;
font-size: 0.8rem;
margin-top: 20px;
transition: all 0.3s ease;
background: transparent;
cursor: pointer;
}

.btn-outline:hover {
background: #fff;
color: #000;
}

.gift-container {
display: flex;
align-items: center;
border: 1px solid rgba(255,255,255,0.2);
padding: 30px;
text-align: left;
}

.gift-label {
writing-mode: vertical-rl;
transform: rotate(180deg);
font-size: 1.5rem;
letter-spacing: 10px;
padding-left: 20px;
border-left: 1px solid rgba(255,255,255,0.2);
}

.gift-info {
padding-left: 30px;
}

.bank-details {
margin-top: 15px;
font-family: monospace;
font-size: 0.9rem;
opacity: 0.8;
}

.footer {
padding: 100px 20px;
font-family: 'Roboto', sans-serif;
font-weight: 300;
font-size: 1.5rem;
}

.date-title { font-size: 2rem; font-weight: 700; margin-bottom: 5px; }
.date-subtitle { font-size: 1.5rem; }
.msg-prox { padding-top: 10px; margin-bottom: 15px; font-style: italic; opacity: 0.8; }
.title-confirm { font-size: 1.2rem; margin-bottom: 20px; }
.animated-text-section { padding: 20px 0; margin: 20px 0; }

@media (max-width: 768px) {
  section { padding: 30px 15px; }
  .date-title { font-size: 1.6rem; }
  .date-subtitle { font-size: 1.2rem; }
  .msg-prox { font-size: 1rem; margin-bottom: 10px; }
  .title-confirm { font-size: 1.1rem; }
  .main-name { font-size: 3rem; }
  .date-large { font-size: 2rem; padding: 10px 0; margin: 10px 0; }
  .svg-text-bg, .svg-text-writing { font-size: 3.5rem; }
  .writing-animation-container { height: 100px; }
  .invite-text p { font-size: 1rem; }
  .time { font-size: 0.9rem; }
}
</style>

