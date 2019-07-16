<template>
  <v-list dense>
    <v-list-tile
      v-for="(value, key) in videos"
      :key="key"
      @click="onListItemClick(key, value)"
    >
      <template v-if="value.error">
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
      </template>

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
