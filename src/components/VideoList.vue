<template>
  <v-list
    ref="list"
    dense
    v-resize="onResize"
  >
    <v-list-item
      v-if="!hasVideos"
    >
      <v-list-item-content>
        <v-list-item-title>No {{ type }} videos. Refresh to scan again.</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <!-- Folders View -->
    <virtual-list
      v-else-if="type === 'saved' && $store.state.settings.savedFolders"
      v-for="group in videosByGroup"
      :key="group.groupId"
      :size="scrollItemSize"
      :remain="scrollItemRemain"
      :scrollelement="scrollParent"
    >
      <v-list-group
        v-model="group.active"
        :key="group.groupId"
        prepend-icon="folder"
      >
        <template v-slot:activator>
          <v-list-item-title>{{ group.groupId }}</v-list-item-title>
        </template>
        <video-list-item
          v-for="video in group.list"
          :key="video.id"
          :id="video.id"
          :active="current.type === type && current.id === video.id"
          :disabled="disableItem === video.id"
          :tagged="isTagged(video.id)"
          :title="formatDate(video.timestamp)"
          :subtitle="`${sizeToMB(video.size)} MB`"
          @click.native.stop="onListItemClick(video, group)"
          @delete="onListItemDeleteClick(video)"
          @toggle-tag="onToggleTag(video)"
        ></video-list-item>
      </v-list-group>
    </virtual-list>
    
    <!-- Flat View -->
    <virtual-list
      v-else
      :size="scrollItemSize"
      :remain="scrollItemRemain"
      :scrollelement="scrollParent"

      :item="videoListItem"
      :itemcount="videos.length"
      :itemprops="getVideoListItemProps"
    >
    </virtual-list>

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
            color="primary"
            @click="onDeleteConfirm"
          >Delete</v-btn>
          <v-btn @click="confirmDelete = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list>
</template>

<script>
import VirtualList from 'vue-virtual-scroll-list'
import VideoListItem from './VideoListItem';
import { addSeconds, format } from 'date-fns'
import goTo from 'vuetify/es5/services/goto'

export default {
  components: {
    VideoListItem,
    VirtualList
  },

  data() {
    return {
      confirmDelete: false,
      scrollItemSize: 64,
      scrollItemRemain: 24,
      scrollParent: null,
      videoListItem: VideoListItem,
      videoToDelete: {
        videos: []
      }
    }
  },

  created() {
    this.scrollParent = document.querySelector('#nav-drawer .v-navigation-drawer__content')
  },

  computed: {
    current() {
      return this.$store.state.current
    },

    hasVideos() {
      return this.videos.length
    },

    videosByGroup() {
      if (this.type !== 'saved' && !this.$store.state.settings.savedFolders)
        return []

      const byGroup = []

      for (let i = 0, l = this.videos.length; i < l; i++) {
        const idx = byGroup.findIndex(group => group.groupId === this.videos[i].groupId)

        if (idx === -1) {
          byGroup.push({
            active: i === 0,
            groupId: this.videos[i].groupId,
            list: [this.videos[i]]
          })
        } else {
          byGroup[idx].list.push(this.videos[i])
        }
      }

      return byGroup
    }
  },

  watch: {
    'current.id': {
      handler(id) {
        if (!id)
          return

        let timeout = 0

        if (this.type === 'saved') {
          const group = this.videosByGroup.find(g => g.groupId === this.$store.state.current.groupId) 
          if (group && !group.active) {
            this.videosByGroup.forEach(g => g.active = false)
            group.active = true
            // Allow time for the collapsing/expanding of a group before scrolling
            timeout = 400
          }
        }

        setTimeout(() => {
          const target = document.getElementById(id)
          const drawer = document.querySelector('#nav-drawer > .v-navigation-drawer__content')

          if (!target)
            return

          const targetTop = target.offsetTop + 140
          const viewable = drawer.scrollTop + drawer.offsetHeight

          if (targetTop >= viewable || targetTop < drawer.scrollTop + 60) {
            goTo(target, { container: drawer, duration: 300, offset: 120 })
          }
        }, timeout)
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

    getVideoListItemProps(idx) {
      const vid = this.videos[idx]
      const needsSubheader = (vid.groupId && idx === 0) || 
        (this.videos[idx - 1] && vid.groupId !== this.videos[idx - 1].groupId)

      return {
        key: vid.id,
        attrs: {
          id: vid.id
        },
        props: {
          active: this.current.type === this.type && this.current.id === vid.id,
          disabled: this.disableItem == vid.id,
          tagged: this.isTagged(vid.id),
          title: this.formatDate(vid.timestamp),
          subheader: needsSubheader ? vid.groupId : '',
          subtitle: `${this.sizeToMB(vid.size)} MB`,
        },
        on: {
          click: this.onListItemClick.bind(this, vid),
          delete: this.onListItemDeleteClick.bind(this, vid),
          'toggle-tag': this.onToggleTag.bind(this, vid)
        },
      }
    },

    onListItemClick(video, group) {
      this.$store.commit(
        'SET_CURRENTLY_PLAYING',
        video
      )

      if (group) {
        group.active = !group.active
      }
    },

    onListItemDeleteClick(video) {
      this.videoToDelete = video
      this.confirmDelete = true
    },

    onDeleteConfirm() {
      this.$emit('delete', this.videoToDelete)
    },

    onResize() {
      const h = document.getElementById('nav-drawer').offsetHeight

      if (h) {
        this.scrollItemRemain = parseInt(h / this.scrollItemSize) + 1
      }
    },

    onToggleTag(video) {
      if (this.$store.state.taggedVideoIds.includes(video.id)) {
        this.$store.commit('REMOVE_TAGGED', video.id)
      } else {
        this.$store.commit('ADD_TAGGED', video.id)
      }
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
</style>
