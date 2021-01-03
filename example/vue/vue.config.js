// vue.config.js
module.exports = {
    configureWebpack: (config) => {
        config.module.rules.push({
            test: /\.vue$/,
            use: [{
                loader: '../../src/index.js',
                options: {
                    compile: true, // false: interpretation mode; true: compilation mode
                    globalPreflight: true,  // preflight style is global or scoped
                    globalUtility: true,  // utility style is global or scoped
                    // prefix: 'windi-',
                }
            }]
        })
    }
}