<template>
  <v-dialog v-model="dialog" max-width="340">
    <v-card>
      <v-card-title>There was an error</v-card-title>
      <v-card-text>{{ error }}</v-card-text>
      <v-card-actions>
        <slot name="actions"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false
    }
  },

  props: {
    error: {
      type: String,
      default: ''
    }
  }
}
</script>
