<template>
  <v-btn
    :disabled="disabled"
    dark
    icon
    large
    @click="$emit('click')"
  >
    <v-icon v-if="playing" size="52">pause</v-icon>
    <v-icon v-else size="52">play_arrow</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    playing: {
      type: Boolean,
      default: false
    }
  }
}
</script>
