<template>
  <v-list dense>
    <v-list-item v-if="!hasVideos">
      <v-list-item-content>
        <v-list-item-title>No {{ type }} videos. Try refreshing to scan again.</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <template
      v-else
      v-for="(video, i) in videos"
    >
      <v-subheader
        v-if="(video.groupId && i === 0) || (videos[i - 1] && video.groupId !== videos[i - 1].groupId)"
        class="pt-2"
        :key="video.groupId"
      >
        <v-icon class="pr-2">folder</v-icon>
        {{ video.groupId }}
      </v-subheader>
      <v-list-item
        :key="video.id"
        :class="{
          'is-active': current.type === type && current.id === video.id
        }"
        :disabled="disableItem === video.id"
        :id="video.id"
        active-class="default-class is-active"
        ripple
        @click="onListItemClick(video)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ formatDate(video.timestamp) }}</v-list-item-title>
          <v-list-item-subtitle>
            <span v-if="video.duration">{{ formatDuration(video.duration) }},</span> {{ sizeToMB(video.size) }} MB
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-avatar>
          <v-icon v-if="isTagged(video.id)" color="primary" small>bookmark</v-icon>
        </v-list-item-avatar>

        <v-list-item-action>
          <v-btn
            icon
            small
            ripple
            @click.stop="onListItemDeleteClick(video)"
          >
            <v-icon small>delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-divider :key="i"></v-divider>
    </template>

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
import goTo from 'vuetify/es5/services/goto'

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
      return this.videos.length
    }
  },

  watch: {
    'current.id': {
      handler(id) {
        if (!id)
          return

        const target = document.getElementById(id)
        const drawer = document.querySelector('#nav-drawer > .v-navigation-drawer__content')
        const targetTop = target.offsetTop + 140
        const viewable = drawer.scrollTop + drawer.offsetHeight

        if (targetTop >= viewable || targetTop < drawer.scrollTop + 60) {
          goTo(target, { container: drawer, duration: 300, offset: 120 })
        }
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
    },

    sizeToMB(size) {
      const rnd = parseInt(size / 1000000)
      return size > 0 && rnd === 0
        ? (size / 1000000).toFixed(2)
        : rnd
    }
  }
}
</script>

<style>
.is-active {
  background: darkgray;
}
</style>
