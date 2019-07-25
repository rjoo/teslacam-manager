<template>
  <v-list dense two-line>
    <v-list-tile v-if="!hasVideos">
      <v-list-tile-content>
        <v-list-tile-title>No {{ type }} videos. Try refreshing to scan again.</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile
      v-else
      v-for="video in videos"
      :key="video.id"
      :class="{ 'is-active': current.type === type && current.id === video.id}"
      :disabled="disableItem === video.id"
      :id="video.id"
      active-class="default-class is-active"
      avatar
      ripple
      @click="onListItemClick(video)"
    >
      <v-list-tile-content>
        <v-list-tile-title>{{ formatDate(video.timestamp) }}</v-list-tile-title>
        <v-list-tile-sub-title>
          <span v-if="video.duration">{{ formatDuration(video.duration) }},</span> {{ video.sizeInMegabytes }} MB
        </v-list-tile-sub-title>
      </v-list-tile-content>

      <v-list-tile-avatar v-if="isTagged(video.id)">
        <v-icon color="primary" small>bookmark</v-icon>
      </v-list-tile-avatar>

      <v-list-tile-action>
        <v-btn
          icon
          ripple
          @click.stop="onListItemDeleteClick(video)"
        >
          <v-icon small>delete</v-icon>
        </v-btn>
      </v-list-tile-action>
    </v-list-tile>

    <v-dialog
      v-model="confirmDelete"
      max-width="340"
      persistent
    >
      <v-card>
        <v-card-title>Are you sure?</v-card-title>
        <v-card-text>
          <div>
            Confirm that you want to delete these videos:
            <ul>
              <li v-for="video in videoToDelete.videos.map(vid => vid.filepath)" :key="video">{{ video }}</li>
            </ul>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!!disableItem"
            color="warning"
            @click="onDeleteConfirm"
          >Delete</v-btn>
          <v-btn @click="confirmDelete = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
import { addSeconds, format } from 'date-fns'

export default {
  data() {
    return {
      confirmDelete: false,
      videoToDelete: {
        videos: []
      }
    }
  },

  computed: {
    current() {
      return this.$store.state.current
    },

    hasVideos() {
      return this.videos && Object.keys(this.videos).length
    }
  },

  watch: {
    'current.id': {
      handler(id) {
        if (!id)
          return

        const target = document.getElementById(id)
        const drawer = document.getElementById('nav-drawer')
        const targetTop = target.offsetTop + 140
        const viewable = drawer.scrollTop + drawer.offsetHeight

        if (targetTop >= viewable || targetTop < drawer.scrollTop + 60)
          this.$vuetify.goTo(`#${id}`, { container: '#nav-drawer', offset: 120 })
      }
    }
  },

  props: {
    disableItem: {
      type: String,
      default: ''
    },

    videos: {
      type: Array,
      default() {
        return [
          /**
           * {
           *    timestamp: '2019-06-03_14-23-03',
           *    sizeInMegabytes: 0
           *    videos: []
           * }, { ... }
           */
        ]
      }
    },

    type: {
      type: String,
      default: ''
    }
  },

  methods: {
    formatDate(date) {
      return format(date, 'ddd, MM/DD h:mm A')
    },

    formatDuration(seconds) {
      return format(addSeconds(new Date(null), parseInt(seconds)), 'mm:ss')
    },

    onListItemClick(video) {
      this.$store.commit(
        'SET_CURRENTLY_PLAYING',
        video
      )
    },

    onListItemDeleteClick(video) {
      this.videoToDelete = video
      this.confirmDelete = true
    },

    onDeleteConfirm() {
      this.$emit('delete', this.videoToDelete)
    },

    isTagged(id) {
      return this.$store.state.taggedVideoIds.includes(id)
    }
  }
}
</script>

<style>
.is-active {
  background: darkgray;
}
</style>
