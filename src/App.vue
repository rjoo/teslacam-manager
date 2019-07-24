<template>
  <v-app dark>
    <v-navigation-drawer
      app
      permanent
    >
      <v-toolbar flat dense>
        <disk-usage
          v-if="teslaCamMnt && Object.keys(diskUsageData).length > 0"
          :info="{ ...diskUsageData, mnt: teslaCamMnt }">
        </disk-usage>
        <v-spacer v-else></v-spacer>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="refresh-btn"
              icon
              v-on="on"
              @click="getData(tab, true)"
            >
              <v-icon small>refresh</v-icon>
            </v-btn>
          </template>
          <span>Refresh list</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="delete-all-btn"
              icon
              v-on="on"
              :disabled="isLoading"
              @click="confirmDeleteAll = true"
            >
              <v-icon small>delete_sweep</v-icon>
            </v-btn>
          </template>
          <span>Delete all {{ currentType }} (except any tagged)</span>
        </v-tooltip>

        <v-dialog
          v-model="confirmDeleteAll"
          max-width="340"
        >
          <v-card>
            <v-card-title>Are you sure?</v-card-title>
            <v-card-text>Confirm that you want to delete all videos in the {{ currentType === 'recent' ? 'RecentClips' : 'SavedClips' }} folder except for those that were tagged.</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="warning" @click.prevent>Delete</v-btn>
              <v-btn @click="confirmDeleteAll = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>

      <v-tabs
        v-model="tab"
        @change="onTabChange"
      >
        <v-tab ripple>
          Recent
        </v-tab>
        <v-tab ripple>
          Saved / Sentry
        </v-tab>

        <!-- @todo Refactor this into a v-for -->
        <v-tab-item>
          <v-layout
            v-if="isLoading"
            justify-center
          >
            <v-progress-circular
              class="progress-loader"
              color="primary"
              indeterminate />
          </v-layout>
          <video-list
            v-else
            type="recent"
            :disable-item="deletingVideo"
            :videos="recentVideosData"
            @delete="onDelete">
          </video-list>
        </v-tab-item>

        <v-tab-item>
          <v-layout
            v-if="isLoading"
            justify-center
          >
            <v-progress-circular
              class="progress-loader"
              color="primary"
              indeterminate />
          </v-layout>
          <video-list
            v-else
            type="saved"
            :disable-item="deletingVideo"
            :videos="savedVideosData"
            @delete="onDelete">
          </video-list>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>

    <v-content>
      <video-player />
    </v-content>

    <v-dialog
      v-model="isSettingUp"
      persistent
      width="400"
    >
      <v-card
        color="secondary"
        dark
      >
        <v-card-text>
          Initializing
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          />
        </v-card-text>
      </v-card>
    </v-dialog>    

    <v-dialog
      v-model="errors.binaries"
      max-width="340"
      persistent
    >
      <v-card>
        <v-card-title>There was an error</v-card-title>
        <v-card-text>Unable to download some required binaries for video handling. Check your internet connection and try again.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="doSetup">Retry</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="errors.drive"
      max-width="340"
      persistent
    >
      <v-card>
        <v-card-title>Can't locate USB drive</v-card-title>
        <v-card-text>Unable to detect a drive on your computer that contains the root <em>TeslaCam</em> directory</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="getData(tab, true)">Try again</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="errors.delete"
      max-width="340"
    >
      <v-card>
        <v-card-title>There was an error</v-card-title>
        <v-card-text>Unable to delete the video(s). Try again</v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import DiskUsage from '@/components/DiskUsage.vue'
import VideoList from '@/components/VideoList.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'

export default {
  name: 'App',
  components: {
    DiskUsage,
    VideoList,
    VideoPlayer
  },
  data() {
    return {
      isLoading: false,
      isSettingUp: false,
      ffPaths: {},
      teslaCamDir: '', // eg. D:/TeslaCam
      teslaCamMnt: '', // eg. D:/
      recentVideosData: {},
      savedVideosData: {},
      diskUsageData: {},
      confirmDeleteAll: false,
      deletingVideo: '',
      errors: {
        binaries: false,
        delete: false,
        drive: false,
        data: false
      },
      tab: null
    }
  },
  computed: {
    currentType() {
      return this.tab === 0
        ? 'recent'
        : 'saved';
    }
  },
  created() {
    this.doSetup().then(this.getData)
  },
  methods: {
    async doSetup() {
      let response
      this.isSettingUp = true
      this.errors.binaries = false

      try {
        response = await this.$http.get('http://localhost:8002/ffbinaries')
        this.ffPaths = response.data
      } catch(e) {
        console.error(e)
        this.errors.binaries = true
        return
      }

      this.isSettingUp = false
    },

    async getDiskUsage() {
      let response
      try {
        response = await this.$http.post('http://localhost:8002/teslacam/checkdisk', {
          path: this.teslaCamMnt
        })

        this.diskUsageData = response.data
      } catch (e) {
        console.error(e)
        return
      }
    },

    async getData(tab = 0, refresh = false) {
      if (this.isSettingUp)
        return

      this.errors.drive = false

      // Use existing dir if not manually refreshed
      if (!this.teslaCamDir || refresh) {
        try {
          const response = await this.$http.get('http://localhost:8002/teslacam/scandrives')
          this.teslaCamDir = response.data.dir
          this.teslaCamMnt = response.data.mnt

          if (!this.teslaCamDir)
            this.errors.drive = true
        } catch(e) {
          console.error(e)
          this.errors.drive = true
        }
      }

      const type = tab === 0 ? 'recent' : 'saved'
      const hasData = tab === 0
        ? Object.keys(this.recentVideosData).length !== 0
        : Object.keys(this.savedVideosData).length !== 0

      // Skip retrieving the same list if not manually refreshed
      if (hasData && !refresh)
        return

      this.isLoading = true

      try {
        const response = await this.$http.post(
          'http://localhost:8002/teslacam/data',
          { paths: { ...this.ffPaths, teslaCamDir: this.teslaCamDir }, type }
        )
        if (type === 'recent')
          this.recentVideosData = response.data
        else if (type === 'saved')
          this.savedVideosData = response.data
      } catch(e) {
        console.error(e)
      }

      this.isLoading = false

      this.getDiskUsage()
    },

    async onDelete(key, videos) {
      const shouldUnsetStore = key === this.$store.state.currentlyPlaying
      this.deletingVideo = key

      try {
        const response = await this.$http.post(
          'http://localhost:8002/teslacam/delete',
          { videos: videos.map(vid => vid.filepath) }
        )

        if (response.data.success) {
          if (shouldUnsetStore)
            this.$store.commit('UNSET_CURRENTLY_PLAYING')

          if (this.currentType === 'recent')
            this.recentVideosData = {}
          else if (this.currentType === 'saved')
            this.savedVideosData = {}

          /** 
           * Add a slight delay because getData fails in trying to read the files that were just deleted
           */
          setTimeout(() => this.getData(), 200)
        } else {
          this.errors.delete = true
        }

      } catch(e) {
        console.error(e)
        this.errors.delete = true
      }

      this.deletingVideo = ''
    },

    onTabChange(tab) {
      setTimeout(() => {
        this.getData(tab)
      }, 200)
    }
  },
}
</script>

<style>
.progress-loader {
  margin-top: 20px;
}
</style>
