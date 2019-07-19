<template>
  <v-container>
    <v-layout
      row
      justify-center
      align-center
    >
      <v-flex xs1>
        <v-btn
          class="control-btn"
          flat
          icon
          large
          @click="$emit('rewind')"
        >
          <v-icon medium>replay_10</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs1>
        <v-btn
          class="control-btn"
          flat
          icon
          fab
          @click="$emit('play-pause')"
        >
          <v-icon v-if="playing" size="52">pause</v-icon>
          <v-icon v-else size="52">play_arrow</v-icon>
        </v-btn>
      </v-flex>
      <v-flex xs1>
        <v-btn
          class="control-btn"
          flat
          icon
          large
          @click="$emit('forward')"
        >
          <v-icon medium>forward_10</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
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

<style scoped>
.control-btn {
  display: block;
  margin: 0 auto;
}

.seekbar {
  width: 100%;
}
</style>
