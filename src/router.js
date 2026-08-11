import { createRouter, createWebHashHistory } from 'vue-router'
 
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
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
