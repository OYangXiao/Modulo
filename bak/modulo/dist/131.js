import { cac } from "cac";
import node_fs, { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import node_path, { dirname, extname, join, relative, resolve } from "node:path";
import picocolors from "picocolors";
const logFile = join(process.cwd(), "modulo.debug.log");
let index = 0;
function debug_log(hint, ...params) {
    const argv_debug = process.env.DEBUG || process.argv.includes("--debug");
    const argv_verbose = process.argv.includes("--verbose") || process.argv.includes("-v");
    if (!argv_debug && !argv_verbose) return;
    const timestamp = new Date().toISOString();
    const sn = String(index++).padStart(3, "0");
    const logEntry = `--------------\n${sn} [${timestamp}] ${hint}\n${params.map((p)=>"object" == typeof p ? JSON.stringify(p, null, 2) : String(p)).join("\n")}\n---------------\n\n`;
    if (argv_verbose) console.log(logEntry);
    if (argv_debug) {
        console.log(picocolors.blue(`\ndebug log ${sn}`));
        appendFileSync(logFile, logEntry);
    }
}
const logger = {
    info: (msg)=>console.log(picocolors.cyan(msg)),
    success: (msg)=>console.log(picocolors.green(msg)),
    warn: (msg)=>console.log(picocolors.yellow(msg)),
    error: (msg)=>console.log(picocolors.red(msg)),
    debug: (msg)=>{
        if (process.env.DEBUG) console.log(picocolors.gray(`[DEBUG] ${msg}`));
    }
};
var package_namespaceObject = {
    rE: "0.3.8"
};
const cli = cac("modulo");
cli.command("init <target>", "Initialize modulo configuration or scripts").option("-f, --force", "Force overwrite existing files").option("--path <path>", "Specify the path to initialize").option("--preset <preset>", "Specify the preset to use").action((target, options)=>{
    import("./54.js").then((mod)=>({
            init_tool: mod.init_tool
        })).then(({ init_tool })=>{
        init_tool({
            cmd: "init",
            target: target,
            init: {
                path: options.path,
                force: options.force,
                preset: options.preset
            }
        });
    });
});
cli.command("build <target>", "Build the project for production").option("-c, --config <file>", "Use specified config file").option("-w, --watch", "Watch for changes").option("--env <env>", "Specify the environment (dev/prd)").action((target, options)=>{
    import("./839.js").then((mod)=>({
            pack_code: mod.pack_code
        })).then(({ pack_code })=>{
        pack_code({
            cmd: "build",
            target: target,
            pack: {
                config: options.config,
                env: options.env || "prd",
                watch: options.watch,
                esm: true
            }
        });
    });
});
cli.command("dev <target>", "Start development server").option("-c, --config <file>", "Use specified config file").option("--env <env>", "Specify the environment (dev/prd)").option("--debug", "Enable debug mode").action((target, options)=>{
    if (options.debug) process.env.DEBUG = "true";
    import("./839.js").then((mod)=>({
            pack_code: mod.pack_code
        })).then(({ pack_code })=>{
        pack_code({
            cmd: "dev",
            target: target,
            pack: {
                config: options.config,
                env: options.env || "dev",
                watch: true,
                esm: true
            }
        });
    });
});
cli.command("preview <target>", "Preview the production build").option("-c, --config <file>", "Use specified config file").action((target, options)=>{
    import("./839.js").then((mod)=>({
            pack_code: mod.pack_code
        })).then(({ pack_code })=>{
        pack_code({
            cmd: "preview",
            target: target,
            pack: {
                config: options.config,
                env: "prd",
                watch: false,
                esm: true
            }
        });
    });
});
cli.help();
cli.version(package_namespaceObject.rE);
function exec() {
    try {
        cli.parse();
    } catch (error) {
        logger.error(`Error: ${error.message}`);
        cli.outputHelp();
        process.exit(1);
    }
}
export { debug_log, dirname, exec, existsSync, extname, join, mkdirSync, node_fs, node_path, picocolors, readFileSync, readdirSync, relative, resolve, statSync, writeFileSync };
