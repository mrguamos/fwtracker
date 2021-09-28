import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/transfer',
    name: 'Transfer',

    component: () =>
      import(/* webpackChunkName: "transfer" */ '../views/Transfer.vue'),
  },
  {
    path: '/combat-history/:address',
    name: 'CombatHistory',

    component: () =>
      import(
        /* webpackChunkName: "combat-history" */ '../views/CombatHistory.vue'
      ),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
