<template>
  <v-app dark>
    <v-navigation-drawer
      app
      permanent
    >
      <v-toolbar flat dense>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="refresh-btn"
              icon
              v-on="on"
              @click="getData(tab)"
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
            >
              <v-icon small>delete_sweep</v-icon>
            </v-btn>
          </template>
          <span>Delete all {{ currentType }}</span>
        </v-tooltip>

        <v-spacer></v-spacer>
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
          <recent-list
            v-else
            :videos="recentVideosData">
          </recent-list>
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
          <recent-list
            v-else
            :videos="savedVideosData">
          </recent-list>
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
      persistent>
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
      persistent>
      <v-card>
        <v-card-title>Can't locate USB drive</v-card-title>
        <v-card-text>Unable to detect a drive on your computer that contains the root <em>TeslaCam</em> directory</v-card-text>
        <v-card-actions>
          <v-form>
            <v-text-field
              v-model="teslaCamDir"
              label="TeslaCam Location"
              placeholder="E:\TeslaCam"
              required
            />
            <v-btn @click="doSetup">Manually Provide</v-btn>
          </v-form>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      recentVideosData: {},
      savedVideosData: {},
      errors: {
        binaries: false,
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
      this.errors.binaries = this.errors.drive = false

      try {
        response = await this.$http.get('http://localhost:8002/ffbinaries')
        this.ffPaths = response.data
      } catch(e) {
        console.error(e)
        this.errors.binaries = true
        return
      }

      try {
        response = await this.$http.get('http://localhost:8002/teslacam/scandrives')
        this.teslaCamDir = response.data.dir
      } catch(e) {
        console.error(e)
        this.errors.drive = true
      }

      this.isSettingUp = false
    },

    async getData(tab = 0) {
      if (this.isSettingUp)
        return

      const type = tab === 0 ? 'recent' : 'saved'
      const teslaCamDir = this.teslaCamDir
      this.isLoading = true

      try {
        const response = await this.$http.post(
          'http://localhost:8002/teslacam/data',
          { paths: { ...this.ffPaths, teslaCamDir }, type }
        )
        if (type === 'recent')
          this.recentVideosData = response.data
        else if (type === 'saved')
          this.savedVideosData = response.data
      } catch(e) {
        console.error(e)
      }
      this.isLoading = false
    },

    onTabChange(tab) {
      setTimeout(() => {
        this.getData(tab)
      }, 400)
    }
  },
}
</script>

<style>
.progress-loader {
  margin-top: 20px;
}
</style>
