import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentlyPlaying: '',
    currentlyPlayingType: '',
    currentlyPlayingVideos: [],
    taggedVideos: []
  },

  mutations: {
    'SET_CURRENTLY_PLAYING': (state, payload) => {
      state.currentlyPlaying = payload.timestamp
      state.currentlyPlayingType = payload.type
      state.currentlyPlayingVideos = payload.videos
    },

    'ADD_TAGGED': (state, timestamp) => {
      state.taggedVideos.push(timestamp)
    },
    
    'REMOVE_TAGGED': (state, timestamp) => {
      const idx = state.taggedVideos.indexOf(timestamp)

      if (idx >= 0)
        state.taggedVideos.splice(idx)
    }
  }
})