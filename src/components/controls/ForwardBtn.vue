<template>
  <v-btn
    :disabled="disabled"
    dark
    icon
    @click="$emit('click')"
  >
    <v-icon medium>forward_10</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: ['disabled']
}
</script>
