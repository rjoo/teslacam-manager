// const nodeExternals = require('webpack-node-externals')

module.exports = {
    chainWebpack: config => {
        // config.externals(nodeExternals())

        // @see https://vuetifyjs.com/en/customization/sass-variables
        // ["vue-modules", "vue", "normal-modules", "normal"].forEach((match) => {
        //     config.module.rule('scss').oneOf(match).use('sass-loader')
        //         .tap(opt => Object.assign(opt, { data: `@import '~@/sass/main.scss';` }))
        // })
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

            mainProcessWatch: ['src/server/']
        }
    }
}