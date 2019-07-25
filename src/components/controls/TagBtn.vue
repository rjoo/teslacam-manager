<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        class="control-btn"
        dark
        icon
        v-on="on"
        @click="$emit('click')"
      >
        <v-icon
          v-if="isTagged"
          color="primary"
          medium
        >
          bookmark
        </v-icon>
        <v-icon
          v-else
          medium
        >
          bookmark_border
        </v-icon>
      </v-btn>
    </template>
    <span v-if="isTagged">Untag this recording</span>
    <span v-else>Tag this recording</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    isTagged: {
      type: Boolean,
      default: false
    }
  }
}
</script>
