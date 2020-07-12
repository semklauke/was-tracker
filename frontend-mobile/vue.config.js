// vue.config.js
module.exports = {
    pages: {
        index: {
            entry: 'src/main.ts',
            template: 'public/index.html',
            filename: 'index.html',
            title: 'WaS-Tracker'
        }
    },
    
    outputDir: 'dist',
    assetsDir: 'assets',
    indexPath: 'index.html',
    filenameHashing: true,
    lintOnSave: false,
    runtimeCompiler: true,
    parallel: 4
}