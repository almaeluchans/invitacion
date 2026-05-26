import { createRouter, createWebHistory } from 'vue-router'
import GlitterNegro from './proposals/GlitterNegro.vue'
import GlitterBlanco from './proposals/GlitterBlanco.vue'
import GlitterNegroCopy from './proposals/GlitterNegro copy.vue'
import Invitacion from './proposals/Invitacion.vue'

const routes = [
  { path: '/', component: Invitacion }/*
  { path: '/', component: GlitterNegro },
  { path: '/1', component: GlitterBlanco },
  { path: '/2', component: GlitterNegroCopy },
  { path: '/3', component: Invitacion },
  { path: '/', component: Invitacion }*/
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
