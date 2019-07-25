<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-progress-linear
        height="30"
        v-on="on"
        :color="color"
        :value="usedSpacePct"
      >
        <v-layout fill-height align-center>
          <span v-on="on" class="label">
            {{ convertToGb(usedSpace) }}GB/<strong>{{ convertToGb(info.total) }}GB</strong>
          </span>
        </v-layout>
      </v-progress-linear>
    </template>
    <span>{{ convertToGb(info.free) }}GB available</span>
  </v-tooltip>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {
          mnt: '',
          free: 0,
          total: 0
        }
      }
    }
  },

  computed: {
    color() {
      const used = this.usedSpacePct

      if (used >= 90) {
        return 'error'
      }

      if (used >= 70) {
        return 'warning'
      }

      if (used >= 50) {
        return 'primary'
      }

      return 'success'
    },

    usedSpace() {
      return this.info.total - this.info.free
    },

    usedSpacePct() {
      return parseInt((this.usedSpace / this.info.total) * 100)
    }
  },

  methods: {
    convertToGb(bytes) {
      const gb = bytes / 1000000000

      if (gb > 1 && gb !== 0)
        return parseInt(gb)

      return gb.toFixed(2)
    }
  }
}
</script>

<style scoped>
.label {
  cursor: default;
  font-size: 12px;
  padding: 0 10px;
}
</style>