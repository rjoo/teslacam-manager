<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        class="control-btn"
        dark
        icon
        v-on="on"
        @click="isTagged ? untag() : tag()"
      >
        <v-icon
          :color="isTagged ? 'primary' : 'default'"
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
  computed: {
    isTagged() {
      const id = this.$store.state.current.id
      return this.$store.state.taggedVideoIds.includes(id)
    }
  },

  methods: {
    tag() {
      this.$store.commit('ADD_TAGGED_CURRENT')
      this.$emit('click')
    },

    untag() {
      this.$store.commit('REMOVE_TAGGED_CURRENT')
      this.$emit('click')
    }
  }
}
</script>
