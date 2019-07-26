<template>
  <v-btn
    :disabled="disabled"
    dark
    icon
    @click="$emit('click')"
  >
    <v-icon medium>skip_next</v-icon>
  </v-btn>
</template>

<script>
export default {
  props: ['disabled']
}
</script>
