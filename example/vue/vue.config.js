// vue.config.js
module.exports = {
    configureWebpack: (config) => {
        config.module.rules.push({
            test: /\.vue$/,
            use: [{
                loader: '../../index.js',
                options: {
                    prefix: false
                }
            }]
        })
    }
}