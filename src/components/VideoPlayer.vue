<template>
  <v-layout wrap>
    <template v-if="isPlaying">
      <v-flex
        v-for="cam in ['left', 'front', 'right']"
        :key="cam"
        :class="['video-holder', `video-holder-${cam}`]"
        xs4
      >
        <video
          ref="video"
          autoplay
          :class="{ 'expanded': expandedCamera === cam }"
          :src="getVideoSrc(cam)"
          @click="expandedCamera = expandedCamera === cam ? '' : cam" />
      </v-flex>
    </template>

    <v-flex xs12>
      TOOLBAR
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {
      expandedCamera: ''
    }
  },

  computed: {
    videos() {
      return this.$store.state.currentlyPlayingVideos
    },

    isPlaying() {
      return !!this.$store.state.currentlyPlaying
    }
  },

  methods: {
    getVideoSrc(camera) {
      const vid = this.videos.find(vid => vid.camera === camera)
      let src;

      if (vid && vid.filepath)
        src = `http://localhost:8002/video?filepath=${vid.filepath}`

      return src
    }
  }
}
</script>

<style>
.video-holder {
  position: relative;
}

video {
  /* position: absolute;
  left: 50%;
  transform: translateX(-50%); */
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  transition: transform 0.12s ease;
  cursor: pointer;
}

.video-holder-left video {
  transform-origin: top left;
}
.video-holder-front video {
  transform-origin: top center;
}
.video-holder-right video {
  transform-origin: top right;
}

.expanded {
  transform: scale(1.4);
  z-index: 1;
}
</style>

