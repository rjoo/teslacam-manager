import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentlyPlaying: '',
    currentlyPlayingType: '',
    currentlyPlayingVideos: []
  },

  mutations: {
    'SET_CURRENTLY_PLAYING': (state, payload) => {
      state.currentlyPlaying = payload.timestamp
      state.currentlyPlayingType = payload.type
      state.currentlyPlayingVideos = payload.videos
    }
  }
})