<template>
  <v-btn
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
    playing: {
      type: Boolean,
      default: false
    }
  }
}
</script>
