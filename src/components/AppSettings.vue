<template>
  <v-dialog
    v-model="showSettings"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar>
        <v-toolbar-title>TeslaCam Manager Settings</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn color="primary" text @click="onSave">Save</v-btn>
          <v-btn text @click="showSettings = false">Cancel</v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-list three-line subheader>
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
export default {
  data() {
    return {
      showSettings: false
    }
  },

  mounted() {
    this.$root.$on('show-settings', () => this.showSettings = true)
  },

  methods: {
    onSave() {
      // @todo Commit local state to store
      this.showSettings = false
    }
  }
}
</script>
