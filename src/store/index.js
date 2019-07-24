import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    current: {
      id: '',
      timestamp: '',
      type: '',
      videos: []
    },

    taggedVideoIds: []
  },

  mutations: {
    'SET_CURRENTLY_PLAYING': (state, { id, timestamp, type, videos }) => {
      state.current.id = id
      state.current.timestamp = timestamp
      state.current.type = type
      state.current.videos = videos
    },

    'UNSET_CURRENTLY_PLAYING': (state) => {
      state.current = {
        id: '',
        timestamp: '',
        type: '',
        videos: []
      };
    },

    'ADD_TAGGED': (state, id) => {
      state.taggedVideoIds.push(id)
    },
    
    'REMOVE_TAGGED': (state, id) => {
      const idx = state.taggedVideoIds.indexOf(id)

      if (idx >= 0)
        state.taggedVideoIds.splice(idx)
    },

    'ADD_TAGGED_CURRENT': (state) => {
      if (!state.current.id)
        return

      state.taggedVideoIds.push(state.current.id)
    },
    
    'REMOVE_TAGGED_CURRENT': (state) => {
      const idx = state.taggedVideoIds.indexOf(state.current.id)

      if (idx >= 0)
        state.taggedVideoIds.splice(idx)
    }
  }
})