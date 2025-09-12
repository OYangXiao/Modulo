import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import minimist from "minimist";
import { exit } from "node:process";
import picocolors from "picocolors";
const panic_alert = '! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !';
function PANIC_IF(status = false, msg = "SOMETHING'S WRONG", halt = true) {
    if (status) {
        console.log(picocolors.bgRed(picocolors.white(`\n${panic_alert}\n\n${msg}\n\n${panic_alert}`)), '\n');
        halt && exit(1);
    }
}
const default_config_file_name = 'modulo.config.json';
const argv = minimist(process.argv.slice(2));
const cmd = argv._[0];
PANIC_IF(![
    'build',
    'dev'
].includes(cmd), 'modulo-pack必须执行build或者dev命令');
const args = {
    cmd,
    config_file: argv.config || default_config_file_name,
    debug: 'true' === argv.debug
};
args.debug;
if (args.debug) console.log('args: ', args);
const default_config = {
    analyze: false,
    define: {},
    dev_server: {
        open: void 0,
        port: 8080,
        proxy: {}
    },
    externals: {
        jquery: 'jQuery',
        react: 'React',
        'react-dom': 'ReactDOM',
        vue: 'Vue',
        'vue-router': 'VueRouter'
    },
    html: {
        meta: {
            viewport: 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover'
        },
        root: 'app',
        template: '',
        title: ''
    },
    input: {
        modules: 'modules',
        pages: 'pages',
        src: 'src'
    },
    minify: void 0,
    output: {
        dist: 'dist',
        modules: 'modules',
        pages: ''
    },
    ui_lib: {
        react: '17.0.2',
        vue: '2.7.16'
    },
    url: {
        base: '',
        cdn: ''
    }
};
function create_config_file(name = default_config_file_name) {
    console.log('即将创建配置文件', name);
    writeFileSync(resolve(process.cwd(), name), JSON.stringify(default_config));
}
export { create_config_file };
