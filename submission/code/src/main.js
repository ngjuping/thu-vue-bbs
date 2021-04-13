import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import vuetify from './plugins/vuetify';


Vue.prototype.$axios = axios
Vue.prototype.favPost = [];
Vue.prototype.histPost = [];
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
