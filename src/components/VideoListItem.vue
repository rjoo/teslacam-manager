<template>
  <div>
    <v-subheader
      v-if="subheader"
      class="pt-2"
    >
      <v-icon class="pr-2">folder</v-icon>
      {{ subheader }}
    </v-subheader>

    <v-list-item
      :class="{
        'video-list-item': true,
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

      <v-list-item-action>
        <v-item-group>
          <v-btn
            icon
            small
            @click.stop="$emit('toggle-tag')"
          >
            <v-icon :color="tagged ? 'secondary' : 'default'" small>bookmark</v-icon>
          </v-btn>
          
          <v-btn
            icon
            small
            @click.stop="$emit('delete')"
          >
            <v-icon small>delete</v-icon>
          </v-btn>
        </v-item-group>
      </v-list-item-action>
    </v-list-item>

    <v-divider></v-divider>
  </div>
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

    subheader: {
      type: String,
      default: ''
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
    }

  }
}
</script>

<style>
.video-list-item {
  height: 64px;
}
</style>
