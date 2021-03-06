import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import deepmerge from 'deepmerge'
import defaultSettings from './defaultSettings';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: ['settings', 'taggedVideoIds']
  })],

  state: {
    current: {
      id: '',
      groupId: '',
      timestamp: '',
      type: '',
      videos: []
    },
    settings: deepmerge({}, defaultSettings),
    taggedVideoIds: []
  },

  getters: {
    settings(state) {
      return state.settings
    }
  },

  mutations: {
    'SET_CURRENTLY_PLAYING': (state, { id, groupId, timestamp, type, videos }) => {
      state.current.id = id
      state.current.groupId = groupId || ''
      state.current.timestamp = timestamp
      state.current.type = type
      state.current.videos = videos
    },

    'UNSET_CURRENTLY_PLAYING': (state) => {
      state.current = {
        id: '',
        groupId: '',
        timestamp: '',
        type: '',
        videos: []
      };
    },

    'ADD_TAGGED': (state, id) => {
      !state.taggedVideoIds.includes(id) && state.taggedVideoIds.push(id)
    },
    
    'REMOVE_TAGGED': (state, id) => {
      const idx = state.taggedVideoIds.indexOf(id)

      if (idx >= 0)
        state.taggedVideoIds.splice(idx, 1)
    },

    'ADD_TAGGED_CURRENT': (state) => {
      if (!state.current.id || state.taggedVideoIds.includes(state.current.id))
        return

      state.taggedVideoIds.push(state.current.id)
    },
    
    'REMOVE_TAGGED_CURRENT': (state) => {
      const idx = state.taggedVideoIds.indexOf(state.current.id)

      if (idx >= 0)
        state.taggedVideoIds.splice(idx, 1)
    },

    'UPDATE_SETTINGS': (state, payload) => {
      state.settings = payload
    },

    'SET_TCAM_FOLDER': (state, { path, drive }) => {
      state.settings.tcam.folder = path
      state.settings.tcam.drive = drive
    },

    'UNSET_TCAM_FOLDER': (state) => {
      state.settings.tcam.folder = ''
      state.settings.tcam.drive = ''
    }
  }
})