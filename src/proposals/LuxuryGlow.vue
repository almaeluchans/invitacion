<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import RSVPForm from '../components/RSVPForm.vue'

const canvas = ref(null)
let ctx, width, height, animationId
let particles = []

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
  constructor(isBokeh = false) {
    this.isBokeh = isBokeh
    this.reset()
  }

  reset() {
    this.x = Math.random() * width
    this.y = Math.random() * height
    
    if (this.isBokeh) {
      this.size = Math.random() * 30 + 20
      this.speedX = (Math.random() - 0.5) * 0.1
      this.speedY = (Math.random() - 0.5) * 0.1
      this.opacity = Math.random() * 0.1 + 0.02
    } else {
      this.size = Math.random() * 1.5 + 0.5
      this.speedX = (Math.random() - 0.5) * 0.05
      this.speedY = (Math.random() - 0.5) * 0.05
      this.opacity = Math.random() * 0.8 + 0.2
      this.blinkSpeed = Math.random() * 0.02
    }
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY

    if (!this.isBokeh) {
      this.opacity += this.blinkSpeed
      if (this.opacity > 1 || this.opacity < 0.2) {
        this.blinkSpeed *= -1
      }
    }

    if (this.x < -50) this.x = width + 50
    if (this.x > width + 50) this.x = -50
    if (this.y < -50) this.y = height + 50
    if (this.y > height + 50) this.y = -50
  }

  draw() {
    if (this.isBokeh) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const createParticles = () => {
  particles = []
  // Bokeh circles
  for (let i = 0; i < 25; i++) {
    particles.push(new Particle(true))
  }
  // Twinkling stars
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle(false))
  }
}

const animate = () => {
  ctx.clearRect(0, 0, width, height)
  particles.forEach(p => {
    p.update()
    p.draw()
  })
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <div class="luxury-glow">
    <canvas ref="canvas" class="background-canvas"></canvas>
    
    <div class="main-content">
      <header class="header">
        <h1 class="main-title">Alma</h1>
        <p class="quince-text">mis quince</p>
      </header>
      
      <div class="divider"></div>
      
      <footer class="footer">
        <p class="date-text">19 de Septiembre</p>
      </footer>

      <section class="rsvp-area">
        <RSVPForm theme="dark" />
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Imperial+Script&display=swap');

/* 
  TIP: Si tienes el archivo 'Tropical Harmony Regular', 
  puedes subirlo a /src/assets/fonts/ y usar este código:
  
  @font-face {
    font-family: 'Tropical Harmony';
    src: url('../assets/fonts/TropicalHarmony.woff2') format('woff2');
  }
*/

.luxury-glow {
  background: #000;
  color: #fff;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.main-content {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  max-width: 500px;
  padding: 40px 20px;
}

.header {
  margin-bottom: 20px;
}

.main-title {
  font-family: 'Imperial Script', cursive; /* Alternativa cercana a Tropical Harmony */
  font-size: 8rem;
  font-weight: 400;
  line-height: 1.1;
  color: #fff;
  display: inline-block;
  position: relative;
  
  /* Efecto de Escritura (Handwriting) */
  clip-path: inset(0 100% 0 0);
  animation: write 4s cubic-bezier(0.4, 0, 0.2, 1) forwards,
             logoGlow 3s ease-in-out infinite alternate 4s;
}

@keyframes write {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

@keyframes logoGlow {
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

.quince-text {
  font-family: var(--font-title);
  font-size: 1.2rem;
  letter-spacing: 8px;
  text-transform: lowercase;
  opacity: 0.9;
  margin-top: -10px;
}

.divider {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 30px auto;
}

.footer {
  margin-bottom: 40px;
  animation: fadeIn 3s ease-out;
}

.date-text {
  font-family: var(--font-title);
  font-size: 1.5rem;
  letter-spacing: 4px;
}

.rsvp-area {
  margin-top: 40px;
  opacity: 0;
  animation: fadeIn 4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 5rem;
  }
  .quince-text {
    font-size: 1rem;
    letter-spacing: 5px;
  }
}
</style>
