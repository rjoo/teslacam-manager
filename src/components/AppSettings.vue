<template>
  <v-dialog
    v-model="showSettings"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar flat>
        <v-toolbar-title>TeslaCam Manager Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn color="primary" text @click="onSave">Save</v-btn>
          <v-btn text @click="onCancel">Cancel</v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-list three-line subheader>
        <v-subheader>General</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="settings.themeDark"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dark theme</v-list-item-title>
            <v-list-item-subtitle>Switch between dark and light themes</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="settings.trash"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Use OS Trash</v-list-item-title>
            <v-list-item-subtitle>When deleting videos, use Trash for macOS and Recycle Bin for Windows.</v-list-item-subtitle>

            <v-sheet
              v-if="!settings.trash"
              class="pa-2 mt-2 subtitle-2"
              color="warning"
              max-width="500"
            >Videos will be permanently deleted</v-sheet>
          </v-list-item-content>
        </v-list-item>

        <v-subheader>Video</v-subheader>
        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="settings.video.autoplay"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Autoplay</v-list-item-title>
            <v-list-item-subtitle>Autoplay videos when they are loaded</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-action>
            <v-checkbox v-model="settings.video.autoplayNext"></v-checkbox>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Autoplay Next</v-list-item-title>
            <v-list-item-subtitle>Autoplay the next video in the list when the current video is finished</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * This component is triggered using this.$root as the EventBus
 * 
 * @example
 * this.$root.$emit('show-settings')
 */
import defaultSettings from '@/store/defaultSettings'
import deepmerge from 'deepmerge'

export default {
  data() {
    return {
      settings: defaultSettings,
      showSettings: false
    }
  },

  created() {
    this.reset()
  },

  mounted() {
    this.$root.$on('show-settings', () => this.showSettings = true)
  },

  methods: {
    onCancel() {
      // @todo Reset local state to store
      this.showSettings = false
    },

    onSave() {
      // @todo Commit local state to store
      this.$store.commit('UPDATE_SETTINGS', deepmerge({}, this.settings))
      this.showSettings = false
    },

    reset() {
      this.settings = deepmerge({}, this.$store.state.settings)
    }
  }
}
</script>
