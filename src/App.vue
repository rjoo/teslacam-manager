<template>
  <manager></manager>
</template>

<script>
import Manager from '@/components/Manager.vue'

export default {
  components: {
    Manager
  },

  data() {
    return {
      doKeyEmits: true
    }
  },

  computed: {
    themeDark() {
      return this.$store.state.settings.themeDark
    }
  },

  watch: {
    themeDark: {
      handler(themeDark) {
        this.$nextTick(() => {
          this.$vuetify.theme.dark = themeDark
        })
      },
      immediate: true
    }
  },

  mounted() {
    this.bindKeys()
    
    /**
     * Control short keys emitting
     */
    this.$root.$on('app-keys', doEmits => this.doKeyEmits = doEmits)
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
      if (!this.doKeyEmits)
        return

      let modifier = '-'

      if (e.ctrlKey)
        modifier = '-ctrl-'
      else if (e.shiftKey)
        modifier = '-shift-'

      switch (e.key) {
        case ' ':
          this.$root.$emit('key-space')
          break;
        case 'ArrowRight':
        case 'Right':
          this.$root.$emit(`key${modifier}right`)
          break;
        case 'ArrowLeft':
        case 'Left':
          this.$root.$emit(`key${modifier}left`)
          break;
        case 't':
        case 'T':
          this.$root.$emit('key-t')
          break;
      }
    }
  },
}
</script>
