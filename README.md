# TeslaCam Manager
Quickly and easily skim through TeslaCam recordings and manage the USB drive.

![Screen](https://i.imgur.com/B2d4MTY.png)

## Features
* Auto-detects USB drive (any drive with a root TeslaCam folder)
* Plays all three camera recordings in synchronization
* Keyboard shortcuts to quickly skim through recordings and tag any interesting recordings
* Quickly delete individual recordings or everything not tagged
* Displays how much space is used/remaining on the USB drive
* Dark/light themes

## Installation
[Download Release for Windows](https://github.com/rjoo/teslacam-manager/releases)

### HW3 Support
Due to Electron's usage of Chromium, and Chromium's lack of support for HEVC (h.265) playback, recordings from Teslas equipped with HW3 will not work. I'm open to some suggestions for workarounds!

### Defender SmartScreen
If you have Defender SmartScreen enabled on Windows 10, you may get a warning about an "unrecognized app" when trying to install. You can click "More Info" then "Run anyway" to get around the warning.

The reason you get this is because I'm not distributing this behind an established software company, which would require paying hundreds to get a code signed certificate. This is simply a personal project that I'm sharing.

## Developing
At its core, this project uses [Electron](https://electronjs.org/), [Express](https://expressjs.com/), [Vue](https://vuejs.org/), and [Vuetify](https://vuetifyjs.com/en/). To run this locally, simply clone the repo and run `yarn install` or `npm run install`.

Available tasks
```
electron:serve // Runs development mode
electron:build // Bundles/packages executable into dist_electron
electron:generate-icons // Generates build/icons/** from public/icon.png
```

This project is built on top of [Electron Builder](https://www.electron.build/) and [vue-cli-plugin-electron-builder](https://github.com/nklayman/vue-cli-plugin-electron-builder). Electron Builder configuration, like build targets, is managed in `vue.config.js`.

## License
MIT
