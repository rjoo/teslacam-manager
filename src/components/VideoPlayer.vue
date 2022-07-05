<template>
  <v-container class="pa-0" fluid>
    <v-layout v-if="hasCurrentlyPlaying" wrap>
      <v-flex
        v-for="cam in ['left', 'front', 'right']"
        :key="cam"
        :class="['video-holder', `video-holder-${cam}`]"
        xs4
      >
        <div v-if="!videoCameraExists(cam)" class="fill-height video-wrapper video-corrupted-wrapper">
          <v-card flat class="video-overlay">
            <v-layout column fill-height justify-space-between>
              <v-card-title>
                <v-chip
                  class="camera-label"
                  color="error"
                  small
                >
                  <v-icon left>error</v-icon>no {{ cam }} recording
                </v-chip>
              </v-card-title>
            </v-layout>
          </v-card>
        </div>

        <div v-else-if="videoCameraHasError(cam)" class="fill-height video-wrapper video-corrupted-wrapper">
          <v-card flat class="video-overlay">
            <v-layout column fill-height justify-space-between>
              <v-card-title>
                <v-chip
                  class="camera-label"
                  color="error"
                  small
                >
                  <v-icon left>error</v-icon>{{ cam }} corrupted
                </v-chip>
              </v-card-title>
            </v-layout>
          </v-card>
        </div>

        <div
          v-else
          :class="['video-wrapper', expandedCamera === cam ? 'expanded' : '']"
          @click="expandedCamera = expandedCamera === cam ? null : cam"
        >
          <video-element
            ref="videos"
            :autoplay="autoplay"
            :camera="cam"
            :class="['video', `video-${cam}`]"
            :src="getVideoSrc(cam)"
            @ended="onEnded($event, cam)"
            @loaded="onLoaded($event, cam)"
            @pause="isPlaying = false"
            @play="isPlaying = true"
            @timeupdate="onTimeUpdate($event, cam)" />

          <v-card class="video-overlay" dark>
            <v-layout column fill-height justify-space-between>
              <v-card-title>
                <v-chip
                  class="camera-label"
                  color="info"
                  small
                >
                  <v-icon left small>camera_alt</v-icon>{{ cam }}
                </v-chip>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  small
                  @click.stop="openVideoFile(cam)"
                ><v-icon>open_in_new</v-icon></v-btn>
                <v-btn
                  v-if="expandedCamera === cam"
                  icon
                  small
                  @click.stop="expandedCamera = null"
                ><v-icon>unfold_less</v-icon></v-btn>
                <v-btn
                  v-else
                  icon
                  small
                  @click.stop="expandedCamera = cam"
                ><v-icon>unfold_more</v-icon></v-btn>
                <v-btn
                  icon
                  small
                  @click.stop="fullscreen(cam)"
                ><v-icon>fullscreen</v-icon></v-btn>
              </v-card-actions>
            </v-layout>
          </v-card>
        </div>
      </v-flex>
    </v-layout>

    <v-layout
      class="toolbar"
      justify-center
      wrap
    >
      <!-- Info / Seekbar -->
      <v-flex class="pa-4" xs12>
        <v-card
          class="py-3 px-2"
          flat
        >
          <v-list-item>
            <v-list-item-content v-if="hasCurrentlyPlaying">
              <v-list-item-title class="headline-1">Recorded {{ formatDate(videoInfo.timestamp) }}</v-list-item-title>
              <v-list-item-subtitle>{{ videoInfo.type }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-content v-else>
              <v-list-item-title class="headline-1">Select a recording</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-flex>
      <v-flex class="px-4 pt-4" xs12>
        <v-slider
          v-if="hasCurrentlyPlaying"
          :value="currentTime.toFixed(4)"
          :max="maxDuration"
          color="blue darken-1"
          track-color="grey lighten-2"
          track-fill-color="blue darken-3"
          step="0"
          @start="onStartSeek"
          @end="onEndSeek"
          @input="onInput"
          @change="onChange"
        >
          <template v-slot:prepend>
            <v-chip small>{{ formatDuration(currentTime) }}</v-chip>
          </template>

          <template v-slot:append>
            <v-chip small>{{ formatDuration(maxDuration) }}</v-chip>
          </template>
        </v-slider>
      </v-flex>

      <!-- Controls -->
      <v-flex class="pa-0" xs12>
        <v-container class="controls px-8 py-4" fluid>
          <v-layout
            justify-space-between
            align-center
          >
            <v-flex xs2>
              <tag-btn
                :disabled="!hasCurrentlyPlaying"
                :is-tagged="isTagged"
                @click="isTagged ? onUntag() : onTag()"
              ></tag-btn>
              <upload-btn></upload-btn>
            </v-flex>
            <v-flex xs4>
              <v-layout align-center justify-center>
                <play-prev-btn :disabled="!hasCurrentlyPlaying" @click="$emit('prev')"></play-prev-btn>
                <rewind-btn :disabled="!hasCurrentlyPlaying" @click="rewind"></rewind-btn>
                <play-pause-btn :disabled="!hasCurrentlyPlaying" :playing="isPlaying" @click="playPause"></play-pause-btn>
                <forward-btn :disabled="!hasCurrentlyPlaying" @click="forward"></forward-btn>
                <play-next-btn :disabled="!hasCurrentlyPlaying" @click="$emit('next')"></play-next-btn>
              </v-layout>
            </v-flex>

            <v-flex xs2>
              <v-layout align-center justify-end>
                <v-btn
                  dark
                  icon
                  @click="$root.$emit('show-settings')"
                ><v-icon>settings</v-icon></v-btn>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ForwardBtn from './controls/ForwardBtn'
import PlayNextBtn from './controls/PlayNextBtn'
import PlayPauseBtn from './controls/PlayPauseBtn'
import PlayPrevBtn from './controls/PlayPrevBtn'
import RewindBtn from './controls/RewindBtn'
import TagBtn from './controls/TagBtn'
import UploadBtn from './controls/UploadBtn'
import VideoElement from './VideoElement'
import { getEndpointUrl } from '@/api'
import { addSeconds, format } from 'date-fns'
import { shell } from 'electron'

const debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);

    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}

export default {
  components: {
    ForwardBtn,
    PlayNextBtn,
    PlayPauseBtn,
    PlayPrevBtn,
    RewindBtn,
    TagBtn,
    UploadBtn,
    VideoElement
  },

  data() {
    return {
      currentTime: 0,
      expandedCamera: null,
      isPlaying: true,
      maxDuration: 0,
      maxDurationCam: '',
    }
  },

  created() {
    this.isPlaying = this.autoplay
  },

  computed: {
    autoplay() {
      return this.$store.state.settings.video.autoplay
    },

    hasCurrentlyPlaying() {
      return !!this.$store.state.current.id
    },

    isTagged() {
      const id = this.$store.state.current.id
      return this.$store.state.taggedVideoIds.includes(id)
    },

    videos() {
      return this.$store.state.current.videos
    },

    videoInfo() {
      return {
        timestamp: this.$store.state.current.timestamp,
        type: this.$store.state.current.type === 'recent'
          ? 'Recent Clip'
          : 'Saved Clip'
      }
    },
  },

  mounted() {
    // When fullscreen is exited, time gets out of sync between the different video elements
    document.addEventListener('webkitfullscreenchange', this.resyncTime)

    this.$root.$on('key-space', this.playPause)
    this.$root.$on('key-left', this.rewind)
    this.$root.$on('key-right', this.forward)
    this.$root.$on('key-shift-left', this.rewind.bind(this, 5))
    this.$root.$on('key-shift-right', this.forward.bind(this, 5))
    this.$root.$on('key-ctrl-left', () => this.$emit('prev'))
    this.$root.$on('key-ctrl-right', () => this.$emit('next'))
    this.$root.$on('key-t', () => {
      this.isTagged ? this.onUntag() : this.onTag()
    })
  },

  beforeDestroy() {
    document.removeEventListener('webkitfullscreenchange', this.resyncTime)
  },

  watch: {
    videos: {
      handler() {
        this.currentTime = 0

        this.maxDuration = 0
        this.maxDurationCam = ''
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    formatDate(date, fmt = 'dddd, MM/DD [@] h:mm A') {
      return format(date, fmt)
    },

    formatDuration(seconds) {
      return format(addSeconds(new Date(null), parseInt(seconds)), 'mm:ss')
    },

    getVideoSrc(camera) {
      const vid = this.getVideoData(camera)
      let src;

      if (vid && vid.filepath)
        src = getEndpointUrl(`video?filepath=${vid.filepath}`)

      return src
    },

    getVideoData(camera) {
      return this.videos.find(vid => vid.camera === camera)
    },

    getVideoElement(camera) {
      return this.$refs.videos.find(vid =>
        vid.$el.classList.contains(`video-${camera}`)
      ).$el
    },

    fullscreen(camera) {
      const vidEl = this.getVideoElement(camera)
      vidEl.webkitRequestFullscreen()
    },

    /**
     * Opens a video in the OS' default video player
     */
    openVideoFile(camera) {
      const vid = this.getVideoData(camera)
      this.pause()
      shell.openExternal(`file://${vid.filepath}`)
    },

    playPause() {
      const action = this.isPlaying ? 'pause' : 'play'
      this[action]()
    },

    play() {
      this.$refs.videos.forEach(vid => vid.$el.play())
      this.isPlaying = true
    },

    pause() {
      this.$refs.videos.forEach(vid => vid.$el.pause())
      this.isPlaying = false
    },

    forward(t = 10) {
      this.$refs.videos.forEach(vid => vid.$el.currentTime += t)
    },

    rewind(t = 10) {
      this.$refs.videos.forEach(vid => vid.$el.currentTime -= t)
    },

    resyncTime() {
      this.$refs.videos.forEach(vid => vid.$el.currentTime = this.currentTime)
    },

    playNext: debounce(function() {
      this.$emit('next')
    }, 500),

    onEnded(e, cam) {
      // Set pause state only if the camera's video with the max duration has ended
      if (this.maxDurationCam === cam) {
        if (this.$store.state.settings.video.autoplayNext) {
          this.playNext()
        } else {
          this.pause()
        }
      }
    },

    onLoaded(e, cam) {
      const duration = e.target.duration

      // Set the max duration
      if (duration > this.maxDuration) {
        this.maxDuration = duration
        this.maxDurationCam = cam
      }
    },

    onTimeUpdate(e, cam) {
      // Track time based on the camera with the max duration
      if (this.maxDurationCam === cam) {
        this.currentTime = e.target.currentTime
      }
    },

    onChange(value) {
      this.$refs.videos.forEach(vid => vid.$el.currentTime = +value)
    },

    onInput(value) {
      if (this.doSeekChange)
        this.onChange(value)
    },

    onStartSeek() {
      this.doSeekChange = true
      this.pause()
    },

    onEndSeek() {
      this.doSeekChange = false
      this.play()
    },

    onTag() {
      this.hasCurrentlyPlaying && this.$store.commit('ADD_TAGGED_CURRENT')
    },

    onUntag() {
      this.hasCurrentlyPlaying && this.$store.commit('REMOVE_TAGGED_CURRENT')
    },

    videoCameraExists(camera) {
      return !!this.getVideoData(camera)
    },

    videoCameraHasError(camera) {
      const vid = this.getVideoData(camera)
      return vid.size === 0
    },
  }
}
</script>

<style scoped>
.camera-label {
  opacity: 0.7
}

.controls {
  background: #000;
}

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

.video-wrapper:hover .video-overlay,
.video-corrupted-wrapper .video-overlay {
  z-index: 1;
  opacity: 1;
}

.video-corrupted-wrapper .video-overlay.v-card {
  background: transparent;
  cursor: default;
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
}
</style>

