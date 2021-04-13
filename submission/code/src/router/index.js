import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import NotFound from '../views/NotFound.vue'

Vue.use(VueRouter);

  const routes = [
  { 
    path: '/', 
    redirect: { name: 'Login' }
  },

  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import(/* webpackChunkName: "welcome" */ '../views/Welcome.vue')
  },
  {
    path: '/welcome/:postId',
    component: () => import(/* webpackChunkName: "welcome" */ '../views/PostDetails.vue')
  },
  {
    path: '*',
    name: '404page',
    component: NotFound
  }
]

const router = new VueRouter({
  mode:'history',
  routes
})

export default router
