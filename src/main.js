import Vue from 'vue'
import store from './store'
import axios from 'axios';
import vuetify from './plugins/vuetify'
import App from './App.vue'

Vue.config.productionTip = false
Vue.prototype.$http = axios

new Vue({
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')
