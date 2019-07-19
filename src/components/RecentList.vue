<template>
  <v-list dense two-line>
    <v-list-tile v-if="!hasVideos">
      <v-list-tile-content>
        <v-list-tile-title>No recent videos</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile
      v-else
      v-for="(value, key) in videos"
      :key="key"
      :class="{ 'is-active': current.type === 'recent' && current.timestamp === key}"
      active-class="default-class is-active"
      ripple
      @click="onListItemClick(key, value)"
    >
      <!-- <template v-if="value.error">
        <v-list-tile-avatar>
          <v-icon color="error">error</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ formatDate(key) }}</v-list-tile-title>
          <v-list-tile-sub-title>Video is corrupted</v-list-tile-sub-title>
        </v-list-tile-content>
      </template>

      <template v-else>
        <v-list-tile-avatar>
          <v-icon>play_circle_filled</v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ formatDate(key) }}</v-list-tile-title>
          <v-list-tile-sub-title>{{ formatDuration(value.duration) }}, {{ value.sizeInMegabytes }} MB</v-list-tile-sub-title>
        </v-list-tile-content>
      </template> -->

      <v-list-tile-content>
        <v-list-tile-title>{{ formatDate(key) }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ formatDuration(value.duration) }}, {{ value.sizeInMegabytes }} MB</v-list-tile-sub-title>

        <v-divider></v-divider>
      </v-list-tile-content>

      <v-list-tile-action>
        <v-btn
          icon
          ripple
          @click.stop="onListItemDeleteClick"
        >
          <v-icon small>delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>
  </v-list>
</template>

<script>
import { addSeconds, format } from 'date-fns'

export default {
  computed: {
    current() {
      return {
        timestamp: this.$store.state.currentlyPlaying,
        type: this.$store.state.currentlyPlayingType
      }
    },

    hasVideos() {
      return this.videos && Object.keys(this.videos).length
    }
  },

  props: {
    videos: {
      type: Object,
      default() {
        return {
          /**
           * '2019-06-03_14-23-03': {
           *  videos: [],
           *  duration: '',
           *  sizeInMegabytes: 0
           * }
           */
        }
      }
    }
  },

  methods: {
    formatDate(date) {
      return format(date, 'ddd, MM/DD h:mm A')
    },

    formatDuration(seconds) {
      return format(addSeconds(new Date(null), parseInt(seconds)), 'mm:ss')
    },

    onListItemClick(timestamp, { videos }) {
      this.$store.commit(
        'SET_CURRENTLY_PLAYING',
        { type: 'recent', timestamp, videos }
      )
    },

    onListItemDeleteClick() {

    }
  }
}
</script>

<style>
.is-active {
  background: gray;
}
</style>
