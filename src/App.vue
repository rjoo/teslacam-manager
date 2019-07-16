<template>
  <v-app>
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

    <v-navigation-drawer
      app
      permanent
    >
      <v-tabs>
        <v-tab ripple>
          Recent
        </v-tab>
        <v-tab ripple>
          Saved / Sentry
        </v-tab>

        <v-tab-item>
          <v-progress-circular
            v-if="isLoading"
            color="primary"
            indeterminate/>
          <recent-list
            v-else
            :videos="recentVideosData">
          </recent-list>
        </v-tab-item>

        <v-tab-item>
          <recent-list></recent-list>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>

    <v-content>
      <video-player />
    </v-content>
  </v-app>
</template>

<script>
import RecentList from '@/components/RecentList.vue'
import VideoPlayer from '@/components/VideoPlayer.vue'

export default {
  name: 'App',
  components: {
    RecentList,
    VideoPlayer
  },
  data() {
    return {
      isLoading: false,
      isSettingUp: false,
      ffPaths: {},
      teslaCamDir: '',
      recentVideosData: {}
    }
  },
  created() {
    this.doSetup().then(this.getData)
  },
  methods: {
    async doSetup() {
      let response
      this.isSettingUp = true

      try {
        response = await this.$http.get('http://localhost:8002/ffbinaries')
        this.ffPaths = response.data
      } catch(e) {
        console.error(e)
        // handle error
      }

      try {
        response = await this.$http.get('http://localhost:8002/teslacam/scandrives')
        this.teslaCamDir = response.data.dir
      } catch(e) {
        console.error(e)
        // handle error
      }

      this.isSettingUp = false
    },

    async getData() {
      const teslaCamDir = this.teslaCamDir
      this.isLoading = true

      try {
        const response = await this.$http.post(
          'http://localhost:8002/teslacam/data',
          { paths: { ...this.ffPaths, teslaCamDir }, type: 'recent' }
        )
        this.recentVideosData = response.data
      } catch(e) {
        console.error(e)
      }
      this.isLoading = false
    }
  },
}
</script>
