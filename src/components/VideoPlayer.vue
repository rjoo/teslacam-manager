<template>
  <v-layout wrap>
    <template v-if="hasCurrentlyPlaying">
      <v-flex
        v-for="cam in ['left', 'front', 'right']"
        :key="cam"
        :class="['video-holder', `video-holder-${cam}`]"
        xs4
      >
        <v-card
          v-if="videoCameraHasError(cam)"
          flat
        >
          <v-card-title>Corrupted</v-card-title>
        </v-card>
        <div
          v-else
          :class="['video-wrapper', expandedCamera === cam ? 'expanded' : '']"
          @click="expandedCamera = expandedCamera === cam ? null : cam"
        >
          <video-element
            ref="video"
            :class="['video', `video-${cam}`]"
            :src="getVideoSrc(cam)"
            autoplay
            @ended="isPlaying = false"
            @pause="isPlaying = false"
            @play="isPlaying = true"
            @timeupdate="onTimeUpdate" />
  
          <v-card class="video-overlay">
            <v-layout column fill-height justify-space-between>
              <v-card-title>
                <v-chip>{{ cam }}</v-chip>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="expandedCamera === cam" icon @click.stop="expandedCamera = null"><v-icon>unfold_less</v-icon></v-btn>
                <v-btn v-else icon @click.stop="expandedCamera = cam"><v-icon>unfold_more</v-icon></v-btn>
                <v-btn icon @click.stop="fullscreen(cam)"><v-icon>fullscreen</v-icon></v-btn>
              </v-card-actions>
            </v-layout>
          </v-card>
        </div>
      </v-flex>

      <v-flex class="toolbar" xs12>
        <v-layout
          row
          justify-center
          wrap
        >
          <v-flex xs12>
            <v-card
              flat
            >
              <v-card-title>
                <div>
                  <h3>Recorded {{ formatDate(videoInfo.timestamp) }}</h3>
                  <p>{{ videoInfo.type }}</p>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs12>
            <v-layout align-center>
              <v-flex shrink><v-chip small>{{ formatDuration(currentTime) }}</v-chip></v-flex>
              <v-flex>
                <v-slider
                  :value="currentTime.toFixed(4)"
                  :max="getMaxDuration()"
                  thumb-size="48"
                  step="0.1"
                  @mousedown="onMouseDown"
                  @mouseup="onMouseUp"
                  @change="onChange"
                ></v-slider>
              </v-flex>
              <v-flex shrink><v-chip small>{{ formatDuration(getMaxDuration()) }}</v-chip></v-flex>
            </v-layout>
          </v-flex>
        </v-layout>

        <video-controls
          :playing="isPlaying"
          @play-pause="playPause"
          @forward="forward"
          @rewind="rewind"
        ></video-controls>
      </v-flex>
    </template>
  </v-layout>
</template>

<script>
import VideoControls from './VideoControls'
import VideoElement from './VideoElement'
import { addSeconds, format } from 'date-fns'

export default {
  components: {
    VideoControls,
    VideoElement
  },

  data() {
    return {
      expandedCamera: null,
      currentTime: 0,
      isPlaying: true
    } 
  },

  computed: {
    videos() {
      return this.$store.state.currentlyPlayingVideos
    },

    videoInfo() {
      return {
        timestamp: this.$store.state.currentlyPlaying,
        type: this.$store.state.currentlyPlayingType === 'recent'
          ? 'Recent Clip'
          : 'Saved Clip'
      }
    },

    hasCurrentlyPlaying() {
      return !!this.$store.state.currentlyPlaying
    }
  },

  mounted() {
    document.addEventListener('webkitfullscreenchange', this.resyncTime)
  },

  beforeDestroy() {
    document.removeEventListener('webkitfullscreenchange', this.resyncTime)
  },

  watch: {
    // videos: {
    //   handler() {
    //     this.videos.forEach(vid => {
          
    //     })
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },

  methods: {
    formatDate(date, fmt = 'dddd, MM/DD [@] h:mm A') {
      return format(date, fmt)
    },

    formatDuration(seconds) {
      return format(addSeconds(new Date(null), parseInt(seconds)), 'mm:ss')
    },

    /**
     * Some cameras may have more recorded time than others
     * @todo Make this a property of the instance with a watcher
     */
    getMaxDuration() {
      return this.$refs.video && this.$refs.video.length
        ? Math.max(...this.$refs.video.map(vid => 
          (vid.$el && vid.$el.duration) ? vid.$el.duration : 0)
        ) : 0
    },

    getVideoSrc(camera) {
      const vid = this.videos.find(vid => vid.camera === camera)
      let src;

      if (vid && vid.filepath)
        src = `http://localhost:8002/video?filepath=${vid.filepath}`

      return src
    },

    fullscreen(camera) {
      const vidEl = this.$refs.video.find(vid => 
        vid.$el.classList.contains(`video-${camera}`
      )).$el

      vidEl.webkitRequestFullscreen()
    },

    playPause() {
      const action = this.isPlaying ? 'pause' : 'play'
      this[action]()
    },

    play() {
      this.$refs.video.forEach(vid => vid.$el.play())
    },

    pause() {
      this.$refs.video.forEach(vid => vid.$el.pause())
    },

    forward() {
      this.$refs.video.forEach(vid => vid.$el.currentTime += 10)
    },

    rewind() {
      this.$refs.video.forEach(vid => vid.$el.currentTime -= 10)
    },

    resyncTime() {
      this.$refs.video.forEach(vid => vid.$el.currentTime = this.currentTime)
    },

    onTimeUpdate(e) {
      this.currentTime = e.target.currentTime
    },

    videoCameraHasError(camera) {
      const vid = this.videos.find(vid => vid.camera === camera)
      return vid.error
    },

    // Refactor to seekbar component
    onChange(value) {
      this.$refs.video.forEach(vid => vid.$el.currentTime = +value)
    },

    onMouseDown() {
      this.pause()
    },

    onMouseUp() {
      this.play()
    }
  }
}
</script>

<style>
.video-holder {
  position: relative;
}

.video-wrapper {
  position: relative;
  transition: transform 0.12s ease, z-index 0.12s step-end;
  cursor: pointer;
  z-index: 1;
}

.video {
  /* position: absolute;
  left: 50%;
  transform: translateX(-50%); */
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
}

.video-wrapper.expanded {
  transform: scale(1.4);
  z-index: 2;
  transition: transform 0.12s ease, z-index 0.12s step-start;
}

.video-overlay.v-card {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 0;
  transition: all 0.2s ease-out;
}

.video-wrapper:hover .video-overlay {
  z-index: 1;
  opacity: 1;
}

.video-holder-left .video-wrapper {
  transform-origin: top left;
}
.video-holder-front .video-wrapper {
  transform-origin: top center;
}
.video-holder-right .video-wrapper {
  transform-origin: top right;
}

.toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  padding: 0 20px;
}
</style>

