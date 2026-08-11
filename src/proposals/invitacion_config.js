// Import local assets
import bgImage from '../assets/invitacion/7.jpg'
import bgMis15 from '../assets/invitacion/3.jpg'
import bgImageTeEspero from '../assets/invitacion/6.jpg'
import iconCalendar from '../assets/invitacion/ffffff-blanco-icono-3.gif'
import iconLocation from '../assets/invitacion/2e2e2e-gris-oscuro-icono-25.gif'
import iconCamera from '../assets/invitacion/2e2e2e-gris-oscuro-icono-6.gif'
import iconGift from '../assets/invitacion/ffffff-blanco-icono-12.gif'
import iconDressCode from '../assets/invitacion/2e2e2e-gris-oscuro-icono-20.gif'
import iconRSVP from '../assets/invitacion/ffffff-blanco-icono-8.gif'
import logo from '../assets/invitacion/logo.png'

export default {
  // Theme colors and styling configurations
  theme: {
    bgMain: '#ffffff',           // Main background color for sections
    bgDark: '#2e2e2e',           // Dark background color for sections
    colorTextMain: '#2e2e2e',    // Main dark text color
    colorTextLight: '#ffffff',   // Main light text color
    colorGold: '#c2a990',        // Accent gold color (original site color)
    heroOverlayOpacity: 0.35,    // Opacity of the dark overlay on the hero image
    bannerOverlayOpacity: 0.40,  // Opacity of the dark overlay on the banner image
  },

  // Welcome / Entrance Screen
  welcome: {
    title: 'MIS 15 ALMA',
    message: 'QUIERO QUE SEAS PARTE DE ESTE MOMENTO TAN IMPORTANTE PARA MÍ',
    enterBtnText: 'INGRESAR',
    // Background Music (YouTube Video in 1x1 size, plays audio)
    youtubeVideoId: 'v9T_MGfzq7I', // Original video ID
    audioStartTime: 83,            // Starts at 83 seconds
  },

  // Hero Section
  hero: {
    titlePrefix: 'MIS',
    titleMain: '15',
    titleSuffix: 'ALMA',
    bgImage: bgImage,
    // Target date for countdown (formatted as YYYY-MM-DDTHH:mm:ssZ in UTC)
    // 2026-09-05T00:30:00.000Z matches 4 Sept 21:30 in Argentina (UTC-3)
    countdownTargetDate: '2026-09-19T00:00:00Z', 
  },

  // Intro text section
  introText: 'Un día lleno de sueños, risas y recuerdos está por llegar. Por esa razon te invito a celebrar mis 15 años con mucho amor.',

  // Date and Time (¿CUÁNDO?)
  dateSection: {
    title: '¿CUÁNDO?',
    description: '19 DE SEPTIEMBRE 2026 <br> | 21:00 HS |',
    iconUrl: iconCalendar,
  },

  // Location (¿DÓNDE?)
  locationSection: {
    title: '¿DÓNDE?',
    placeName: "Eventos Marc", // Name of the venue
    address: 'Av. Pres. Peron 1160, Villa Sarmiento',
    iconUrl: iconLocation,
    btnText: 'COMO LLEGAR',
    // Maps Embed url
    mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.6511983223395!2d-58.58388608814937!3d-34.63825377282908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcc78b5a185811%3A0x90f972dc92c3c7be!2sEventos%20Marc!5e0!3m2!1ses-419!2sar!4v1779834958730!5m2!1ses-419!2sar',
    // Target link for map button click
    gpsLink: 'https://maps.app.goo.gl/bMPzcoT8BbEHxVhd8'
  },

  // Middle Banner
  middleBanner: {
    bgImage: bgMis15,
    bgImageTeEspero:bgImageTeEspero,
    titlePrefix: 'MIS',
    titleMain: '15',
    titleSuffix: 'ALMA',
  },

  // Shared Album (QUIERO VER TUS FOTOS)
  albumSection: {
    title: 'QUIERO VER TUS FOTOS',
    description: 'PUEDEN SUBIR TODAS SUS FOTOS del evento A MI ÁLBUM COMPARTIDO',
    btnText: 'IR AL ÁLBUM',
    albumUrl: 'https://drive.google.com/drive/folders/1AkLhMxV_8Xewa300LEpTOMb38O6QBIR3?usp=sharing', // Editable URL
    iconUrl: iconCamera,
  },

  // Gifts Section (REGALOS)
  giftsSection: {
    title: 'REGALOS',
    description: 'Nada es más importante que tu presencia, pero si deseas hacerme un presente puedes DEJARLO en la siguiente cuenta:',
    btnText: 'VER CUENTA',
    iconUrl: iconGift,
    // Modal gift info details
    accountDetails: {
      ownerName: 'ALMA Perez',
      bankName: 'Banco Provincia',
      cbu: '0140094601503605238085',
      alias: 'REGALOALMA15',
    }
  },

  // Dress Code (DRESS CODE)
  dressCodeSection: {
    prefix: 'DRESS CODE',
    title: 'ELEGANTE',
    description: 'EVITAR COLOR PLATEADO Y AZUL',
    iconUrl: iconDressCode,
  },

  // Transition banner
  transitionBannerText: 'Te invito a festejar esta noche ¡inolvidable!',

  // RSVP Form (CONFIRMÁ TU ASISTENCIA)
  rsvpSection: {
    title: 'CONFIRMÁ TU ASISTENCIA',
    limitDateText: 'ANTES DEL 20 DE AGOSTO 2026',
    iconUrl: iconRSVP,
    // RSVP Method configuration: 'whatsapp' or 'sheet' or 'both'
    method: 'sheet', 
    // If method is 'whatsapp'
    whatsappNumber: '5491165896096', // Destination phone number with country code
    // If method is 'sheet'
    googleSheetUrl: 'https://script.google.com/macros/s/AKfycbyuDDStWJr1Ri6gOyHRu-z-YoxmV0XYutHWTu13Z_yf4srqn0UcbyDpCFr4qyODIVLWeg/exec',
  },

  // Te Espero banner
  teEsperoText: 'TE ESPERO',

  // Footer & Social Links
  footer: {
    logoUrl: logo,
    logoTargetUrl: 'https://latarjetadigital.com.ar/',
    instagramUrl: 'https://www.instagram.com/latarjetadigital_',
    whatsappUrl: 'https://wa.me/message/3JPD7Z523T4VF1',
  }
}
