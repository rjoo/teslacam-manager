import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'md'
  },

  theme: {
    themes: {
      // primary: '#1976D2',
      // secondary: '#424242',
      // accent: '#82B1FF',
      // error: '#FF5252',
      // info: '#2196F3',
      // success: '#4CAF50',
      // warning: '#FFC107',

      light: {
        primary: colors.red.darken4,
        secondary: colors.blue.darken1,
        accent: colors.blue.accent2,
        warning: colors.orange.darken2,
        info: colors.grey.lighten1
      },

      dark: {
        primary: colors.blue.darken1,
        secondary: colors.red.darken2,
        accent: colors.red.lighten1,
        info: colors.grey.darken1
      }
    }
  }
})