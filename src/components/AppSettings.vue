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

      <v-layout>
        <v-flex xs4 offset-xs1>
          <v-list three-line subheader>
            <v-subheader>General</v-subheader>
            <v-list-item>
              <v-list-item-action>
                <v-switch v-model="settings.themeDark"></v-switch>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Dark theme</v-list-item-title>
                <v-list-item-subtitle>Switch between dark and light themes</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-action>
                <v-switch v-model="settings.savedFolders"></v-switch>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>SavedClips Folders</v-list-item-title>
                <v-list-item-subtitle>Enable expandable and collapsible folders view for SavedClips</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Default Tab</v-list-item-title>
                <v-list-item-subtitle>Show Recent or Saved / Sentry by default</v-list-item-subtitle>

                <v-radio-group v-model="settings.defaultTab" class="pl-3">
                  <v-radio
                    v-for="tab in tabItems"
                    :key="tab.value"
                    :label="tab.label"
                    :value="tab.value"
                  ></v-radio>
                </v-radio-group>
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
        </v-flex>

        <v-flex xs3 offset-xs2>
          <v-subheader>Shortcuts</v-subheader>
          <shortcuts-table></shortcuts-table>
        </v-flex>
      </v-layout>
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
import ShortcutsTable from '@/components/ShortcutsTable'
import defaultSettings from '@/store/defaultSettings'
import deepmerge from 'deepmerge'

export default {
  components: {
    ShortcutsTable
  },

  data() {
    return {
      settings: defaultSettings,
      showSettings: false,
      tabItems: [
        { label: 'Recent', value: 'recent' },
        { label: 'Saved / Sentry', value: 'saved' }
      ]
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
