<template>
  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <v-btn
        dark
        icon
        v-on="on"
        @click="$emit('click')"
      >
        <v-icon disabled medium>cloud_upload</v-icon>
      </v-btn>
    </template>
    <span>Upload coming soon</span> 
  </v-tooltip>
</template>
