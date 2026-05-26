<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import config from './invitacion_config.js'

// Destructure configuration
const theme = config.theme
const welcome = config.welcome
const hero = config.hero
const dateSection = config.dateSection
const locationSection = config.locationSection
const middleBanner = config.middleBanner
const albumSection = config.albumSection
const giftsSection = config.giftsSection
const dressCodeSection = config.dressCodeSection
const rsvpSection = config.rsvpSection
const footer = config.footer

// Reactive states
const showWelcome = ref(true)
const isMusicPlaying = ref(false)
const showMapModal = ref(false)
const showGiftModal = ref(false)
const showStatusModal = ref(false)
const statusTitle = ref('')
const statusMessage = ref('')
const isSuccessStatus = ref(true)

// Form states
const rsvpName = ref('')
const rsvpAttendance = ref('yes')
const rsvpGuests = ref(1)
const rsvpDiet = ref('none')
const rsvpDietCustom = ref('')
const isSubmitting = ref(false)

// Welcome text animation state
const welcomeTitleShow = ref(false)
const welcomeMsgShow = ref(false)
const welcomeBtnShow = ref(false)

// Countdown states
const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
const isCountdownOver = ref(false)

// YouTube player reference
let player = null
let countdownInterval = null

// Countdown calculations
const updateCountdown = () => {
  const target = new Date(hero.countdownTargetDate).getTime()
  const now = new Date().getTime()
  const diff = target - now

  if (diff <= 0) {
    isCountdownOver.value = true
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    if (countdownInterval) clearInterval(countdownInterval)
    return
  }

  days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
}

// Youtube API Setup
const initYoutubeAPI = () => {
  // Check if YT script is already loaded
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady()
    return
  }

  // Bind callback
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady

  // Load script
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  const firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
}

function onYouTubeIframeAPIReady() {
  player = new window.YT.Player('youtube-audio-player', {
    height: '1',
    width: '1',
    videoId: welcome.youtubeVideoId,
    playerVars: {
      start: welcome.audioStartTime,
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      loop: 1,
      playlist: welcome.youtubeVideoId,
    },
    events: {
      onReady: (event) => {
        // Pre-mute and prepare
        event.target.setVolume(100)
      },
      onStateChange: (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
          isMusicPlaying.value = true
        } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
          isMusicPlaying.value = false
        }
      }
    }
  })
}

// Enter button handler
const enterInvitation = () => {
  showWelcome.value = false
  document.body.style.overflow = 'auto'
  
  if (player && typeof player.playVideo === 'function') {
    player.playVideo()
    isMusicPlaying.value = true
  }
}

// Toggle Play/Pause
const toggleMusic = () => {
  if (!player || typeof player.getPlayerState !== 'function') return

  const state = player.getPlayerState()
  if (state === window.YT.PlayerState.PLAYING) {
    player.pauseVideo()
    isMusicPlaying.value = false
  } else {
    player.playVideo()
    isMusicPlaying.value = true
  }
}

// RSVP Submit
const handleRSVPSubmit = async () => {
  isSubmitting.value = true

  const dietText = rsvpDiet.value === 'custom' ? rsvpDietCustom.value : rsvpDiet.value
  let dietFormatted = 'Ninguna'
  if (dietText === 'celiac') dietFormatted = 'Celíaco/a'
  else if (dietText === 'vegetarian') dietFormatted = 'Vegetariano/a'
  else if (dietText === 'vegan') dietFormatted = 'Vegano/a'
  else if (dietText && dietText !== 'none') dietFormatted = dietText

  if (rsvpSection.method === 'whatsapp') {
    // Generate WhatsApp link
    const message = `¡Hola! Confirmo mi asistencia a tu fiesta de 15:
- Nombre: ${rsvpName.value}
- ¿Asistiré?: ${rsvpAttendance.value === 'yes' ? 'Sí, asistiré 🎉' : 'No podré asistir 😔'}
- Acompañantes: ${rsvpAttendance.value === 'yes' ? rsvpGuests.value : 0}
- Restricciones alimenticias: ${dietFormatted}`

    const encodedText = encodeURIComponent(message)
    const url = `https://wa.me/${rsvpSection.whatsappNumber}?text=${encodedText}`
    
    // Open WhatsApp
    window.open(url, '_blank')
    
    // Show success dialog
    isSuccessStatus.value = true
    statusTitle.value = '¡Excelente!'
    statusMessage.value = 'Se ha generado tu mensaje de WhatsApp para enviar la confirmación.'
    showStatusModal.value = true
    
    // Reset form
    rsvpName.value = ''
    rsvpAttendance.value = 'yes'
    rsvpGuests.value = 1
    rsvpDiet.value = 'none'
    rsvpDietCustom.value = ''
    isSubmitting.value = false
  } else if (rsvpSection.method === 'sheet') {
    // Post to Google Sheet URL
    try {
      const formData = new FormData()
      formData.append('name', rsvpName.value)
      formData.append('attending', rsvpAttendance.value)
      formData.append('guests', rsvpAttendance.value === 'yes' ? rsvpGuests.value.toString() : '0')
      formData.append('diet', dietFormatted)
      formData.append('date', new Date().toLocaleString())

      await fetch(rsvpSection.googleSheetUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })

      isSuccessStatus.value = true
      statusTitle.value = rsvpAttendance.value === 'yes' ? '¡Excelente!' : '¡Qué lástima!'
      statusMessage.value = rsvpAttendance.value === 'yes' 
        ? 'Tu asistencia ha sido confirmada con éxito. ¡Te esperamos!' 
        : 'Gracias por avisarnos. Te extrañaremos.'
      showStatusModal.value = true

      rsvpName.value = ''
      rsvpAttendance.value = 'yes'
      rsvpGuests.value = 1
      rsvpDiet.value = 'none'
      rsvpDietCustom.value = ''
    } catch (error) {
      isSuccessStatus.value = false
      statusTitle.value = '¡Hubo un error!'
      statusMessage.value = 'No pudimos registrar tu confirmación en este momento. Por favor, intenta más tarde.'
      showStatusModal.value = true
      console.error(error)
    } finally {
      isSubmitting.value = false
    }
  }
}

// Clipboard copying utility
const copyToClipboard = (text, label) => {
  navigator.clipboard.writeText(text).then(() => {
    alert(`¡${label} copiado al portapapeles!`)
  }).catch(err => {
    console.error('Error al copiar: ', err)
  })
}

onMounted(() => {
  // Prevent scroll during welcome screen
  document.body.style.overflow = 'hidden'

  // Animate welcome screen elements sequentially
  setTimeout(() => welcomeTitleShow.value = true, 500)
  setTimeout(() => welcomeMsgShow.value = true, 1300)
  setTimeout(() => welcomeBtnShow.value = true, 2100)

  // Start countdown timer
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)

  // Initialize YT API
  initYoutubeAPI()
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="candela-invitation-container" :style="{ '--gold-accent': theme.colorGold }">
    
    <!-- Welcome Overlay -->
    <div v-if="showWelcome" class="welcome-overlay" :style="{ backgroundColor: theme.bgMain }">
      <div class="welcome-content">
        <h1 :class="{ show: welcomeTitleShow }" :style="{ color: theme.colorTextMain }">{{ welcome.title }}</h1>
        <p :class="{ show: welcomeMsgShow }" :style="{ color: theme.colorTextMain }">{{ welcome.message }}</p>
        <button 
          :class="{ show: welcomeBtnShow }" 
          @click="enterInvitation"
          :style="{ backgroundColor: theme.colorTextMain, color: theme.bgMain }"
        >
          {{ welcome.enterBtnText }}
        </button>
      </div>
    </div>

    <!-- Hidden Div for YT Player API -->
    <div class="hidden-player-container">
      <div id="youtube-audio-player"></div>
    </div>

    <!-- Floating Play/Pause Music Button -->
    <button 
      class="music-toggle-btn" 
      @click="toggleMusic"
      :style="{ backgroundColor: theme.colorTextMain, color: theme.bgMain }"
      aria-label="Toggle Background Music"
    >
      <!-- Pause Icon -->
      <svg v-if="isMusicPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
        <path d="M182.4 112.5c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.8 45.3 0L128 213.3V416c0 17.7 14.3 32 32 32s32-14.3 32-32V112.5zM265.6 112.5c-17.7 0-32 14.3-32 32v303.5c0 17.7 14.3 32 32 32s32-14.3 32-32V213.3l41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0z"/>
      </svg>
      <svg v-if="isMusicPlaying" class="pause-bars-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor">
        <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/>
      </svg>
      <!-- Play Icon -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
        <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
      </svg>
    </button>

    <!-- Main Content Wrapper -->
    <div class="main-wrapper" :style="{ backgroundColor: theme.bgMain }">
      
      <!-- Section 1: Hero & Countdown (bg image, dark overlay) -->
      <header 
        class="hero-section" 
        :style="{ backgroundImage: `url(${hero.bgImage})` }"
      >
        <div class="hero-overlay" :style="{ opacity: theme.heroOverlayOpacity }"></div>
        <div class="hero-content">
          <div class="hero-heading">
            <h3>{{ hero.titlePrefix }} <strong>{{ hero.titleMain }}</strong><br>{{ hero.titleSuffix }}</h3>
          </div>

          <!-- Countdown Timer -->
          <div class="countdown-container">
            <div class="countdown-box">
              <span class="countdown-number">{{ days }}</span>
              <span class="countdown-label">DÍAS</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-box">
              <span class="countdown-number">{{ hours }}</span>
              <span class="countdown-label">HORAS</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-box">
              <span class="countdown-number">{{ minutes }}</span>
              <span class="countdown-label">MINUTOS</span>
            </div>
            <div class="countdown-separator">:</div>
            <div class="countdown-box">
              <span class="countdown-number">{{ seconds }}</span>
              <span class="countdown-label">SEGUNDOS</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Section 2: Intro text message (White Background) -->
      <section class="intro-section" :style="{ backgroundColor: theme.bgMain }">
        <div class="section-container medium-width">
          <hr class="gold-divider">
          <p class="intro-paragraph" :style="{ color: theme.colorTextMain }">
            {{ config.introText }}
          </p>
          <hr class="gold-divider">
        </div>
      </section>

      <!-- Section 3: ¿CUÁNDO? (Dark Background) -->
      <section class="info-section dark-bg" :style="{ backgroundColor: theme.bgDark }">
        <div class="section-container">
          <div class="info-card">
            <div class="info-icon-wrap">
              <img :src="dateSection.iconUrl" alt="Icono Calendario" width="60" height="60" loading="lazy">
            </div>
            <h4 class="info-title" :style="{ color: theme.colorTextLight }">{{ dateSection.title }}</h4>
            <p class="info-description" :style="{ color: theme.colorTextLight }" v-html="dateSection.description"></p>
          </div>
        </div>
      </section>

      <!-- Section 4: ¿DÓNDE? (White Background) -->
      <section class="info-section white-bg" :style="{ backgroundColor: theme.bgMain }">
        <div class="section-container">
          <div class="info-card">
            <div class="info-icon-wrap">
              <img :src="locationSection.iconUrl" alt="Icono Ubicación" width="70" height="70" loading="lazy">
            </div>
            <h4 class="info-title" :style="{ color: theme.colorTextMain }">{{ locationSection.title }}</h4>
            <h5 class="info-subtitle" :style="{ color: theme.colorTextMain }">{{ locationSection.placeName }}</h5>
            <p class="info-description uppercase" :style="{ color: theme.colorTextMain }">{{ locationSection.address }}</p>
            <button 
              class="action-btn-outline dark-border" 
              @click="showMapModal = true"
              :style="{ color: theme.colorTextMain, borderColor: theme.colorTextMain }"
            >
              {{ locationSection.btnText }}
            </button>
          </div>
        </div>
      </section>

      <!-- Section 5: Middle Banner (bg image, scrolling effect, parallax-like) -->
      <section 
        class="banner-section" 
        :style="{ backgroundImage: `url(${middleBanner.bgImage})` }"
      >
        <div class="banner-overlay" :style="{ opacity: theme.bannerOverlayOpacity }"></div>
        <div class="banner-content">
          <h3>{{ middleBanner.titlePrefix }} <strong>{{ middleBanner.titleMain }}</strong><br>{{ middleBanner.titleSuffix }}</h3>
        </div>
      </section>

      <!-- Section 6: QUIERO VER TUS FOTOS (White Background) -->
      <section class="info-section white-bg" :style="{ backgroundColor: theme.bgMain }">
        <div class="section-container">
          <div class="info-card">
            <div class="info-icon-wrap">
              <img :src="albumSection.iconUrl" alt="Icono Cámara" width="70" height="70" loading="lazy">
            </div>
            <h4 class="info-title" :style="{ color: theme.colorTextMain }">{{ albumSection.title }}</h4>
            <p class="info-description uppercase" :style="{ color: theme.colorTextMain }">{{ albumSection.description }}</p>
            <a 
              :href="albumSection.albumUrl" 
              target="_blank" 
              class="action-btn-filled dark-bg"
              :style="{ backgroundColor: theme.bgDark, color: theme.colorTextLight }"
            >
              {{ albumSection.btnText }}
            </a>
          </div>
        </div>
      </section>

      <!-- Section 7: REGALOS (Dark Background) -->
      <section class="info-section dark-bg" :style="{ backgroundColor: theme.bgDark }">
        <div class="section-container">
          <div class="info-card">
            <div class="info-icon-wrap">
              <img :src="giftsSection.iconUrl" alt="Icono Regalo" width="70" height="70" loading="lazy">
            </div>
            <h4 class="info-title" :style="{ color: theme.colorTextLight }">{{ giftsSection.title }}</h4>
            <p class="info-description" :style="{ color: theme.colorTextLight }">{{ giftsSection.description }}</p>
            <button 
              class="action-btn-outline white-border" 
              @click="showGiftModal = true"
              :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight }"
            >
              {{ giftsSection.btnText }}
            </button>
          </div>
        </div>
      </section>

      <!-- Section 8: DRESS CODE (White Background) -->
      <section class="info-section white-bg" :style="{ backgroundColor: theme.bgMain }">
        <div class="section-container">
          <div class="info-card">
            <div class="info-icon-wrap">
              <img :src="dressCodeSection.iconUrl" alt="Icono Percha" width="70" height="70" loading="lazy">
            </div>
            <span class="info-prefix" :style="{ color: theme.colorGold }">{{ dressCodeSection.prefix }}</span>
            <h4 class="info-title" :style="{ color: theme.colorTextMain }">{{ dressCodeSection.title }}</h4>
            <div class="divider-line"></div>
            <p class="info-description uppercase bold-text" :style="{ color: theme.colorTextMain }">{{ dressCodeSection.description }}</p>
          </div>
        </div>
      </section>

      <!-- Section 9: Transition Banner (Dark Background) -->
      <section class="intro-section dark-bg" :style="{ backgroundColor: theme.bgDark }">
        <div class="section-container medium-width">
          <hr class="white-divider">
          <p class="intro-paragraph large-text" :style="{ color: theme.colorTextLight }">
            {{ config.transitionBannerText }}
          </p>
          <hr class="white-divider">
        </div>
      </section>

      <!-- Section 10: CONFIRMÁ TU ASISTENCIA & RSVP FORM (Dark Background) -->
      <section class="info-section dark-bg" :style="{ backgroundColor: theme.bgDark }">
        <div class="section-container form-width">
          <div class="info-card no-margin">
            <div class="info-icon-wrap">
              <img :src="rsvpSection.iconUrl" alt="Icono Sobre" width="70" height="70" loading="lazy">
            </div>
            <h4 class="info-title" :style="{ color: theme.colorTextLight }">{{ rsvpSection.title }}</h4>
            <p class="info-description uppercase bold-text" :style="{ color: theme.colorTextLight }">{{ rsvpSection.limitDateText }}</p>
          </div>

          <!-- RSVP Form -->
          <form @submit.prevent="handleRSVPSubmit" class="rsvp-form-body">
            <div class="form-group">
              <label :style="{ color: theme.colorTextLight }">Nombre y Apellido</label>
              <input 
                v-model="rsvpName" 
                type="text" 
                required 
                placeholder="Ingresa tu nombre"
                class="form-input"
                :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight }"
              >
            </div>
            
            <div class="form-row-grid">
              <div class="form-group">
                <label :style="{ color: theme.colorTextLight }">¿Asistirás?</label>
                <select 
                  v-model="rsvpAttendance"
                  class="form-select"
                  :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight, backgroundColor: theme.bgDark }"
                >
                  <option value="yes">Sí, asistiré 🎉</option>
                  <option value="no">No podré asistir 😔</option>
                </select>
              </div>
              
              <div class="form-group" v-if="rsvpAttendance === 'yes'">
                <label :style="{ color: theme.colorTextLight }">Acompañantes</label>
                <input 
                  v-model="rsvpGuests" 
                  type="number" 
                  min="1" 
                  max="10"
                  class="form-input text-center"
                  :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight }"
                >
              </div>
            </div>

            <!-- Dietary Restrictions -->
            <div class="form-group" v-if="rsvpAttendance === 'yes'">
              <label :style="{ color: theme.colorTextLight }">Restricciones Alimenticias</label>
              <select 
                v-model="rsvpDiet"
                class="form-select"
                :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight, backgroundColor: theme.bgDark }"
              >
                <option value="none">Ninguna</option>
                <option value="celiac">Celíaco/a</option>
                <option value="vegetarian">Vegetariano/a</option>
                <option value="vegan">Vegano/a</option>
                <option value="custom">Otra (Especificar)</option>
              </select>
            </div>

            <div class="form-group" v-if="rsvpAttendance === 'yes' && rsvpDiet === 'custom'">
              <label :style="{ color: theme.colorTextLight }">Especificar Restricción</label>
              <input 
                v-model="rsvpDietCustom" 
                type="text" 
                required 
                placeholder="Ej. Sin mariscos, Alergia a nueces"
                class="form-input"
                :style="{ color: theme.colorTextLight, borderColor: theme.colorTextLight }"
              >
            </div>

            <button 
              type="submit" 
              class="action-btn-filled full-width" 
              :disabled="isSubmitting"
              :style="{ backgroundColor: theme.bgMain, color: theme.colorTextMain }"
            >
              {{ isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR' }}
            </button>
          </form>
        </div>
      </section>

      <!-- Section 11: TE ESPERO Banner (bg image, scrolling overlay) -->
      <section 
        class="banner-section height-small" 
        :style="{ backgroundImage: `url(${middleBanner.bgImage})` }"
      >
        <div class="banner-overlay" :style="{ opacity: theme.bannerOverlayOpacity }"></div>
        <div class="banner-content">
          <h3>{{ config.teEsperoText }}</h3>
        </div>
      </section>

      <!-- Section 12: Footer (Dark Background) -->
      <footer class="footer-section" :style="{ backgroundColor: theme.bgDark }">
        <div class="footer-container">
          <!--<div class="footer-logo">
            <a :href="footer.logoTargetUrl" target="_blank">
              <img :src="footer.logoUrl" alt="La Tarjeta Digital Logo" width="120" loading="lazy">
            </a>
          </div>
          <div class="footer-socials">
   
            <a :href="footer.instagramUrl" target="_blank" class="social-circle" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
              </svg>
            </a>
          
            <a :href="footer.whatsappUrl" target="_blank" class="social-circle" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
              </svg>
            </a>
          </div>-->
        </div>
      </footer>

    </div>

    <!-- Map Modal -->
    <Transition name="modal-fade">
      <div v-if="showMapModal" class="modal-backdrop" @click.self="showMapModal = false">
        <div class="modal-dialog map-dialog">
          <button class="modal-close-btn" @click="showMapModal = false" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="20">
              <path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/>
            </svg>
          </button>
          <div class="modal-body-content">
            <div class="map-embed-wrapper">
              <iframe 
                :src="locationSection.mapsEmbedUrl" 
                width="100%" 
                height="400" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div class="modal-actions-bar text-center">
              <a :href="locationSection.gpsLink" target="_blank" class="action-btn-filled dark-bg w-auto display-inline-block">
                ABRIR EN GOOGLE MAPS
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Gift Modal -->
    <Transition name="modal-fade">
      <div v-if="showGiftModal" class="modal-backdrop" @click.self="showGiftModal = false">
        <div class="modal-dialog gift-dialog" :style="{ backgroundColor: theme.bgDark }">
          <button class="modal-close-btn white-theme" @click="showGiftModal = false" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="20">
              <path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/>
            </svg>
          </button>
          <div class="modal-body-content text-center">
            <div class="info-icon-wrap">
              <img :src="giftsSection.iconUrl" alt="Icono Regalo" width="70" height="70">
            </div>
            <h4 class="info-title white-text">{{ giftsSection.title }}</h4>
            
            <div class="bank-details-modal">
              <p><strong>Titular:</strong> {{ giftsSection.accountDetails.ownerName }}</p>
              <p><strong>Banco:</strong> {{ giftsSection.accountDetails.bankName }}</p>
              
              <div class="copyable-field-row">
                <p><strong>CBU:</strong> <code class="code-font">{{ giftsSection.accountDetails.cbu }}</code></p>
                <button class="copy-small-btn" @click="copyToClipboard(giftsSection.accountDetails.cbu, 'CBU')">Copiar</button>
              </div>

              <div class="copyable-field-row">
                <p><strong>Alias:</strong> <code class="code-font">{{ giftsSection.accountDetails.alias }}</code></p>
                <button class="copy-small-btn" @click="copyToClipboard(giftsSection.accountDetails.alias, 'Alias')">Copiar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Form Submission Status Modal -->
    <Transition name="modal-fade">
      <div v-if="showStatusModal" class="modal-backdrop" @click.self="showStatusModal = false">
        <div class="modal-dialog status-dialog" :class="{ error: !isSuccessStatus }">
          <div class="modal-body-content text-center">
            <h3 class="status-title">{{ statusTitle }}</h3>
            <p class="status-message">{{ statusMessage }}</p>
            <button class="action-btn-filled dark-bg w-auto" @click="showStatusModal = false">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Load Google Fonts directly in the component style tag */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&family=Cardo:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');

/* CSS Variables and General reset rules */
.candela-invitation-container {
  --font-main: 'Montserrat', sans-serif;
  --font-serif: 'Cardo', serif;
  --font-body: 'Inter', sans-serif;
  
  font-family: var(--font-main);
  background-color: #2e2e2e;
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Welcome Overlay Styles */
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.welcome-content h1 {
  font-size: 2.2rem;
  font-weight: 400;
  letter-spacing: 2px;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1s ease, transform 1s ease;
}

.welcome-content p {
  font-size: 1rem;
  letter-spacing: 3px;
  margin-bottom: 40px;
  line-height: 1.6;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1s ease, transform 1s ease;
}

.welcome-content button {
  border: none;
  padding: 14px 40px;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: opacity 1s ease, transform 1s ease, background-color 0.3s ease, color 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.welcome-content button:hover {
  filter: invert(1);
}

.welcome-content h1.show,
.welcome-content p.show,
.welcome-content button.show {
  opacity: 1;
  transform: translateY(0);
}

/* Floating Music Player */
.hidden-player-container {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.music-toggle-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, opacity 0.3s ease;
}

.music-toggle-btn:hover {
  transform: scale(1.08);
}

.music-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.music-toggle-btn .pause-bars-icon {
  width: 16px;
  height: 16px;
}

/* Main Layout Styles */
.main-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* Section Containers */
.hero-section,
.intro-section,
.info-section,
.banner-section,
.footer-section {
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

.section-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.section-container.medium-width {
  max-width: 800px;
  padding: 40px 20px;
}

.section-container.form-width {
  max-width: 500px;
  padding: 60px 24px;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  background-size: cover;
  background-position: 54% 44%;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  animation: fadeInUp 1.2s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-heading h3 {
  color: #ffffff;
  font-family: var(--font-main);
  font-size: 3.5rem;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 2px;
  margin-bottom: 40px;
  text-transform: uppercase;
}

.hero-heading h3 strong {
  font-weight: 700;
}

/* Countdown Timer */
.countdown-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.countdown-box {
  width: 85px;
  height: 85px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.countdown-number {
  font-family: var(--font-main);
  font-size: 1.8rem;
  font-weight: 400;
  color: #ffffff;
}

.countdown-label {
  font-family: var(--font-main);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.countdown-separator {
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 400;
  line-height: 1;
  align-self: center;
  margin-top: -15px;
}

/* Intro Paragraph Styling */
.intro-section {
  padding: 40px 0;
}

.gold-divider {
  border: 0;
  height: 1px;
  background-color: #2e2e2e;
  width: 100px;
  margin: 15px auto;
  opacity: 0.6;
}

.white-divider {
  border: 0;
  height: 1px;
  background-color: #ffffff;
  width: 100px;
  margin: 15px auto;
  opacity: 0.3;
}

.intro-paragraph {
  font-family: var(--font-main);
  font-size: 1.15rem;
  line-height: 1.7;
  text-align: center;
  font-weight: 400;
  letter-spacing: 1px;
  padding: 10px 0;
}

.intro-paragraph.large-text {
  font-size: 1.4rem;
  font-weight: 400;
  letter-spacing: 2px;
}

/* Info Cards / Sections general styling */
.info-section {
  width: 100%;
}

.info-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.info-card.no-margin {
  margin: 0;
}

.info-icon-wrap {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-icon-wrap img {
  object-fit: contain;
}

.info-title {
  font-family: var(--font-main);
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.info-subtitle {
  font-family: var(--font-main);
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.info-prefix {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.info-description {
  font-family: var(--font-main);
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 24px;
  font-weight: 400;
  letter-spacing: 1px;
}

.divider-line {
  width: 40px;
  height: 1px;
  background-color: var(--gold-accent);
  margin: 10px auto 20px;
}

.uppercase {
  text-transform: uppercase;
}

.bold-text {
  font-weight: 700;
}

/* Middle Banner Sections */
.banner-section {
  width: 100%;
  height: 350px;
  background-size: cover;
  background-position: 50% 50%;
  background-attachment: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-section.height-small {
  height: 250px;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.banner-content h3 {
  color: #ffffff;
  font-family: var(--font-main);
  font-size: 3rem;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.banner-content h3 strong {
  font-weight: 700;
}

/* Buttons Styling */
.action-btn-outline {
  background-color: transparent;
  border-width: 1px;
  border-style: solid;
  padding: 12px 36px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-main);
  text-transform: uppercase;
  margin-top: 10px;
}

.action-btn-outline.dark-border {
  border-color: #2e2e2e;
}

.action-btn-outline.white-border {
  border-color: #ffffff;
}

.action-btn-outline:hover {
  background-color: #2e2e2e;
  border-color: #2e2e2e;
  color: #ffffff !important;
}

.action-btn-outline.white-border:hover {
  background-color: #ffffff;
  border-color: #ffffff;
  color: #2e2e2e !important;
}

.action-btn-filled {
  display: inline-block;
  padding: 12px 36px;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-main);
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  margin-top: 10px;
}

.action-btn-filled:hover {
  filter: opacity(0.85);
}

.action-btn-filled.full-width {
  width: 100%;
  text-align: center;
  padding: 15px;
  font-weight: 700;
}

.action-btn-filled.full-width:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* RSVP Form styling */
.rsvp-form-body {
  width: 100%;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.75rem;
  letter-spacing: 2px;
  margin-bottom: 8px;
  text-transform: uppercase;
  opacity: 0.8;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-family: var(--font-main);
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: #ffffff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.form-row-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
}

.text-center {
  text-align: center;
}

.display-inline-block {
  display: inline-block;
}

.w-auto {
  width: auto;
}

/* Footer Section */
.footer-section {
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-logo img {
  display: block;
}

.footer-socials {
  display: flex;
  gap: 15px;
}

.social-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #f0ebe7;
  color: #2e2e2e;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.social-circle:hover {
  transform: scale(1.1);
  background-color: var(--gold-accent);
  color: #ffffff;
}

.social-circle svg {
  width: 18px;
  height: 18px;
}

/* Modal Overlay & Transitions */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10001;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-dialog {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  max-width: 600px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.4s ease-out;
}

.modal-dialog.map-dialog {
  max-width: 800px;
  padding: 40px 20px 20px;
}

.modal-dialog.gift-dialog {
  max-width: 450px;
  padding: 40px 30px;
}

.modal-dialog.status-dialog {
  max-width: 400px;
  padding: 40px 30px;
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #2e2e2e;
  transition: color 0.2s ease;
  z-index: 10;
}

.modal-close-btn.white-theme {
  color: #ffffff;
}

.modal-close-btn:hover {
  opacity: 0.7;
}

.map-embed-wrapper {
  width: 100%;
  height: auto;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-actions-bar {
  display: flex;
  justify-content: center;
}

.white-text {
  color: #ffffff !important;
}

/* Copy Bank Details Modal Layout */
.bank-details-modal {
  margin-top: 25px;
  text-align: left;
  background-color: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 20px;
}

.bank-details-modal p {
  color: #dddddd;
  font-size: 0.95rem;
  margin-bottom: 12px;
  font-family: var(--font-body);
}

.bank-details-modal p strong {
  color: #ffffff;
  display: inline-block;
  width: 70px;
  font-family: var(--font-main);
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.copyable-field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.code-font {
  font-family: monospace, sans-serif;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 3px 8px;
  border-radius: 4px;
  color: var(--gold-accent);
  font-size: 0.9rem;
}

.copy-small-btn {
  background-color: transparent;
  border: 1px solid var(--gold-accent);
  color: var(--gold-accent);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-family: var(--font-main);
  transition: all 0.2s ease;
}

.copy-small-btn:hover {
  background-color: var(--gold-accent);
  color: #2e2e2e;
}

/* Status Modal Content */
.status-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.status-message {
  font-size: 1.05rem;
  line-height: 1.5;
  margin-bottom: 25px;
  color: #555555;
}

.status-dialog.error .status-title {
  color: #d8613c;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-heading h3 {
    font-size: 2.2rem;
  }
  
  .countdown-box {
    width: 68px;
    height: 68px;
  }

  .countdown-number {
    font-size: 1.35rem;
  }

  .countdown-label {
    font-size: 0.55rem;
  }

  .countdown-separator {
    font-size: 1.35rem;
    margin-top: -10px;
  }

  .intro-paragraph {
    font-size: 0.95rem;
  }

  .intro-paragraph.large-text {
    font-size: 1.15rem;
  }

  .info-title {
    font-size: 1.15rem;
  }

  .info-subtitle {
    font-size: 1.05rem;
  }

  .info-description {
    font-size: 0.95rem;
  }

  .banner-section {
    height: 250px;
  }

  .banner-content h3 {
    font-size: 2rem;
  }

  .form-row-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 20px;
  }

  .modal-dialog {
    padding: 20px;
  }
}
</style>
