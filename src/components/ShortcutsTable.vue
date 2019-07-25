<template>
  <v-simple-table class="table">
    <thead>
      <tr>
        <th>Keys</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="shortcut in shortcuts" :key="shortcut.key">
        <td>
          {{ shortcut.key }}
        </td>
        <td>
          {{ shortcut.action }}
        </td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
export default {
  data() {
    return {
      shortcuts: [
        { key: 'Space', action: 'Play/Pause' },
        { key: 'Left Arrow', action: 'Replay 10 seconds' },
        { key: 'Shift + Left Arrow', action: 'Replay 5 seconds' },
        { key: 'Ctrl + Left Arrow', action: 'Previous' },
        { key: 'Right Arrow', action: 'Skip 10 seconds' },
        { key: 'Shift + Right Arrow', action: 'Skip 5 seconds' },
        { key: 'Ctrl + Right Arrow', action: 'Next' },
        { key: 'T', action: 'Tag Recording' }
      ]
    }
  }
}
</script>

<style scoped>

</style>
