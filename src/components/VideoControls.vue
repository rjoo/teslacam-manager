<template>
  <v-container>
    <v-layout
      row
      justify-space-between
      align-center
    >
      <v-flex xs1>
        <v-tooltip right>
          <template v-slot:activator="{ on }">
            <v-btn
              class="control-btn"
              flat
              icon
              large
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
      </v-flex> 
      <v-flex xs4>
        <v-layout align-center>
          <v-btn
            class="control-btn"
            flat
            icon
            large
            @click="$emit('forward')"
          >
            <v-icon medium>skip_previous</v-icon>
          </v-btn>

          <v-btn
            class="control-btn"
            flat
            icon
            large
            @click="$emit('rewind')"
          >
            <v-icon medium>replay_10</v-icon>
          </v-btn>
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
          <v-btn
            class="control-btn"
            flat
            icon
            large
            @click="$emit('forward')"
          >
            <v-icon medium>forward_10</v-icon>
          </v-btn>
          <v-btn
            class="control-btn"
            flat
            icon
            large
            @click="$emit('forward')"
          >
            <v-icon medium>skip_next</v-icon>
          </v-btn>
          
        </v-layout>
      </v-flex>

      <v-flex xs1>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-btn
              class="control-btn"
              flat
              icon
              large
              v-on="on"
            >
              <v-icon disabled medium>cloud_upload</v-icon>
            </v-btn>
          </template>
          <span>Upload coming soon</span> 
        </v-tooltip>
      </v-flex> 
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    isTagged() {
      return this.$store.state.taggedVideos.includes(this.timestamp)
    },

    timestamp() {
      return this.$store.state.currentlyPlaying
    }
  },

  props: {
    playing: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    tag() {
      if (this.timestamp)
        this.$store.commit('ADD_TAGGED', this.timestamp)
    },

    untag() {
      if (this.timestamp)
        this.$store.commit('REMOVE_TAGGED', this.timestamp)
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
