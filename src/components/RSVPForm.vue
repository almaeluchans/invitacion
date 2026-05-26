<script setup>
import { ref } from 'vue'

const props = defineProps(['theme'])
const name = ref('')
const attending = ref('yes')
const guests = ref(1)
const isSubmitting = ref(false)
const calendarLink = ref('')

const showModal = ref(false)
const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')

const closeModal = () => {
  showModal.value = false
}

const generateCalendarLink = () => {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isiOS = /iPhone|iPad|iPod/i.test(ua);
  
  // Para iOS y web normal usamos 'r/eventedit' que es más moderno y mejor detectado
  const baseUrl = isiOS ? 'https://calendar.google.com/calendar/r/eventedit?action=TEMPLATE' : 'https://www.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent('Fiesta de 15 Alma');
  const dates = '20260919T210000/20260920T050000';
  const details = encodeURIComponent('¡Te espero para festejar mis 15 años! \n\nRecuerda: Fiesta de 15 Alma \nHorario: 21:00 hs \n\n(Recordatorio: ¡Falta una semana!)');
  const location = encodeURIComponent('A confirmar');
  
  const webUrl = `${baseUrl}&text=${text}&dates=${dates}&details=${details}&location=${location}`;

  if (isAndroid) {
    // Android Intent: Intenta abrir la app directamente
    return `intent://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}#Intent;scheme=https;package=com.google.android.calendar;end`;
  }
  
  if (isiOS) {
    // iOS: El enlace https:// funciona como Universal Link si la app está instalada.
    // No hay un esquema 'com.google.calendar' público y fiable para pre-llenar eventos vía URL.
    return webUrl;
  }
  
  calendarLink.value = webUrl;
  return calendarLink.value;
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  // URL from environment, or fallback warning if not set
  const scriptURL = import.meta.env.VITE_GOOGLE_SHEET_URL || ''
  
  if (!scriptURL) {
    modalType.value = 'error'
    modalTitle.value = '¡Uy, falta algo!'
    modalMessage.value = 'No se ha configurado la URL de Google Sheets para guardar los datos.'
    showModal.value = true
    isSubmitting.value = false
    return
  }

  try {
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('attending', attending.value)
    formData.append('guests', attending.value === 'yes' ? guests.value.toString() : '0')
    // Agregamos la fecha local
    formData.append('date', new Date().toLocaleString())

    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors' // Google Script requires no-cors for simple form submissions
    })

    if (attending.value === 'yes') {
      const link = generateCalendarLink()
      const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      
      if (isiOS) {
        window.location.assign(link)
      } else {
        window.open(link, '_blank')
      }
      
      modalTitle.value = '¡Excelente '+name.value+'!'
      modalMessage.value = `¡Gracias! Tu lugar ya está reservado. 🎉 ¡Preparate para una noche increíble!`
    } else {
      modalTitle.value = '¡Qué lástima!'
      modalMessage.value = `Gracias por avisar, ${name.value}. Te extrañaremos mucho en la fiesta. 🤍`
    }
    modalType.value = 'success'
    showModal.value = true

    name.value = ''
    attending.value = 'yes'
    guests.value = 1
  } catch (error) {
    console.error('Error!', error.message)
    modalType.value = 'error'
    modalTitle.value = '¡Hubo un error!'
    modalMessage.value = 'No pudimos enviar tu respuesta. Por favor, intenta de nuevo en unos minutos.'
    showModal.value = true
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="rsvp-form" :class="theme">
    <div class="form-group">
      <label>Nombre y Apellido</label>
      <input v-model="name" type="text" required placeholder="Ingresa tu nombre">
    </div>
    
    <div class="form-row">
        <div class="form-group">
            <label>¿Asistirás?</label>
            <select v-model="attending">
                <option value="yes">Sí, asistiré</option>
                <option value="no">No podré asistir</option>
            </select>
        </div>
        
        <div class="form-group" v-if="attending === 'yes'">
            <label>Cantidad</label>
            <input v-model="guests" type="number" min="1" max="10">
        </div>
    </div>

    <button type="submit" class="submit-btn" :disabled="isSubmitting">
      {{ isSubmitting ? 'ENVIANDO...' : 'CONFIRMAR ASISTENCIA' }}
    </button>
  </form>

  <!-- Modal Personalizado -->
  <Transition name="fade">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" :class="[theme, modalType]">
        <h3 class="modal-title" :class="{'neon-text': modalType === 'success'}">{{ modalTitle }}</h3>
        <p class="modal-body">{{ modalMessage }}</p>
        <div class="modal-actions">
          <button class="modal-btn" @click="closeModal">Aceptar</button>
          <!--<a v-if="modalType === 'success' && attending === 'yes' && calendarLink" 
             :href="calendarLink" 
             target="_blank" 
             class="calendar-btn">
            AGENDAR EN MI CALENDARIO
          </a>-->
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.rsvp-form {
  max-width: 400px;
  margin: 30px auto;
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 2px;
  margin-bottom: 8px;
  opacity: 0.7;
}

input, select {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(135, 135, 135, 0.443);
  color: inherit;
  font-family: var(--font-body);
}

.form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 15px;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #9c9c9c;
  color: #d0d0d0;
  border: none;
  letter-spacing: 2px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background: #ccc;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Theme variations */
.dark input, .dark select {
  border: 1px solid #e3e4e5;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0, 243, 255, 0.2);
  color: #fff;
  transition: all 0.3s ease;
}
.dark input:focus, .dark select:focus {
  outline: none;
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.6);
  border-color: #fff;
}
.dark .submit-btn {
  /*background: transparent;*/
  color: #fff;
  border: 2px solid #e3e4e5;
  border-radius: 50px;
  font-family: 'Anton', sans-serif;
  letter-spacing: 2px;
  box-shadow: 0 0 10px rgba(255, 0, 127, 0.3);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}
.dark .submit-btn:hover:not(:disabled) {
  background: #e3e4e5;
  color: #fff;
  box-shadow: 0 0 20px e3e4e5(255, 0, 127, 0.6);
  text-shadow: none;
}

.watercolor input, .watercolor select {
  border-color: rgba(0,0,0,0.1);
  background: #fff;
}

.watercolor .submit-btn {
  background: #5a4b41;
  color: #fff;
}

/* Modal Estilos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: #111;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 90%;
  width: 400px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  transform: scale(1);
}

.modal-title {
  font-family: 'Anton', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #fff;
  letter-spacing: 2px;
}

.neon-text {
  text-transform: uppercase;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #e3e4e5,
    0 0 20px #e3e4e5;
}

.modal-content.error .modal-title {
  color: #ff3333;
  text-shadow: 0 0 10px #ff3333;
}

.modal-body {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 25px;
  color: #ddd;
}

.modal-btn {
  background: transparent;
  color: #fff;
  border: 2px solid #e3e4e5;
  padding: 10px 30px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(0,243,255,0.3);
}

.modal-btn:hover {
  background: #e3e4e5;
  color: #000;
  box-shadow: 0 0 20px rgba(0,243,255,0.6);
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.calendar-btn {
  display: inline-block;
  background: #fff;
  color: #000;
  padding: 12px 25px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 50px;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.calendar-btn:hover {
  background: transparent;
  color: #fff;
  border-color: #fff;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}

.dark .calendar-btn {
  background: #fff;
  color: #000;
}

.watercolor .calendar-btn {
  background: #5a4b41;
  color: #fff;
}

/* Modal theme adaptations */
.modal-content.watercolor {
  background: #fff;
  border: none;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.modal-content.watercolor .modal-title {
  color: #5a4b41;
  text-shadow: none;
}

.modal-content.watercolor .modal-body {
  color: #666;
}

.modal-content.watercolor .modal-btn {
  border-color: #5a4b41;
  color: #5a4b41;
  box-shadow: none;
}

.modal-content.watercolor .modal-btn:hover {
  background: #5a4b41;
  color: #fff;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
