import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'app-restaurant',
    component: () => import(/* webpackChunkName: "restaurant" */ '../views/restaurant')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
