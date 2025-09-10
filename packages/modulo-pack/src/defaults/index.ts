export const defaults = {
    args: {
        cms: 'build',
        config_file: './modulo.config.json'
    },
    externals: {
        common: {
            jquery: 'jQuery',
            moment: 'moment',
        },
        vue: {
            vue: 'Vue',
        },
        react: {
            react: 'React',
            React: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'ReactJsxRuntime',
        },
    }
}