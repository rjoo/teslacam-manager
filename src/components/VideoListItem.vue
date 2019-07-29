<template>
  <v-list-item
    :class="{
      'grey darken-2': active
    }"
    :dark="active"
    :disabled="disabled"
    ripple
    @click="$emit('click')"
  >
    <v-list-item-content>
      <v-list-item-title>{{ title }}</v-list-item-title>
      <v-list-item-subtitle>
        {{ subtitle }}
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-avatar>
      <v-icon v-if="tagged" color="secondary" small>bookmark</v-icon>
    </v-list-item-avatar>

    <v-list-item-action>
      <v-btn
        icon
        small
        ripple
        @click.stop="$emit('delete')"
      >
        <v-icon small>delete</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    subtitle: {
      type: String,
      default: ''
    },

    tagged: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: ''
    },

  }
}
</script>
