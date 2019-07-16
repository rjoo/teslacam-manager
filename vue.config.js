// const nodeExternals = require('webpack-node-externals')

module.exports = {
    // chainWebpack: config => {
    //     config.externals(nodeExternals())
    // },

    pluginOptions: {
        electronBuilder: {
            mainProcessWatch: ['src/server/server.js', 'src/server/teslacam.js']
        }
    }
}