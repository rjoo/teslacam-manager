<template>
  <video
    ref="video"
    :src="src"
    autoplay
  ></video>
</template>

<script>
export default {
  props: [
    'src'
  ],

  mounted() {
    this.$refs.video.addEventListener('ended', this.onEnded)
    this.$refs.video.addEventListener('loadedmetadata', this.onLoaded)
    this.$refs.video.addEventListener('pause', this.onPause)
    this.$refs.video.addEventListener('play', this.onPlay)
    this.$refs.video.addEventListener('timeupdate', this.onTimeUpdate)
  },

  beforeDestroy() {
    this.$refs.video.removeEventListener('ended', this.onEnded)
    this.$refs.video.removeEventListener('loadedmetadata', this.onLoaded)
    this.$refs.video.removeEventListener('pause', this.onPause)
    this.$refs.video.removeEventListener('play', this.onPlay)
    this.$refs.video.removeEventListener('timeupdate', this.onTimeUpdate)
  },

  methods: {
    onEnded(e) {
      console.log('ended DOM event triggered')
      this.$emit('ended', e)
    },
    onLoaded(e) {
      this.$emit('loaded', e)
    },
    onPause(e) {
      // Don't emit pause when it's because it's ended
      if (!e.target.ended)
        this.$emit('pause', e)
    },
    onPlay(e) {
      this.$emit('play', e)
    },
    onTimeUpdate(e) {
      this.$emit('timeupdate', e)
    }
  }
}
</script>

