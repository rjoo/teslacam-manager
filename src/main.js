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

  mounted() {
    this.bindKeys()
  },
  beforeDestroy() {
    this.unbindKeys()
  },
  methods: {
    bindKeys() {
      document.addEventListener('keyup', this.onKeyUp)
    },

    unbindKeys() {
      document.removeEventListener('keyup', this.onKeyUp)
    },

    onKeyUp(e) {
      switch (e.key) {
        case ' ':
          this.$root.$emit('key-space')
          break;
        case 'ArrowRight':
        case 'Right':
          this.$root.$emit(`key${e.ctrlKey ? '-ctrl-' : '-'}right`)
          break;
        case 'ArrowLeft':
        case 'Left':
          this.$root.$emit(`key${e.ctrlKey ? '-ctrl-' : '-'}left`)
          break;
        case 't':
        case 'T':
          this.$root.$emit('key-t')
          break;
      }
    }
  },

  render: h => h(App),
}).$mount('#app')
