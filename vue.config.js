module.exports = {
    chainWebpack: config => {

        // @see https://vuetifyjs.com/en/customization/sass-variables
        // ["vue-modules", "vue", "normal-modules", "normal"].forEach((match) => {
        //     config.module.rule('scss').oneOf(match).use('sass-loader')
        //         .tap(opt => Object.assign(opt, { data: `@import '~@/sass/main.scss';` }))
        // })
        config.resolve.alias.set('fs', false);
        config.resolve.alias.set('path', false);
        config.optimization.minimize(process.env.NODE_ENV === 'production')
    },


    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                appId: "com.tcmanager.app",
                win: {
                    target: ["msi"]
                },
                mac: {
                    target: ["dmg"]
                },
                productName: 'TeslaCam Manager'
            },

            files: [

            ],

            mainProcessWatch: ['src/server/']
        }
    }
}