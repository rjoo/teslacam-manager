// const nodeExternals = require('webpack-node-externals')

module.exports = {
    chainWebpack: config => {
        // config.externals(nodeExternals())
    },

    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: "com.tcmanager.app",
                win: {
                    target: ["portable"]
                }
            },

            files: [

            ],

            mainProcessWatch: ['src/server/index.js', 'src/server/teslacam.js']
        }
    }
}