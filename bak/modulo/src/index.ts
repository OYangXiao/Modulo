import { cac } from "cac";
import { logger } from "./tools/log.ts";
export type { USER_CONFIG as UserConfig } from "./config/type.ts";

// Create CLI instance
const cli = cac("modulo");

// Define 'init' command
cli
	.command("init <target>", "Initialize modulo configuration or scripts")
	.option("-f, --force", "Force overwrite existing files")
	.option("--path <path>", "Specify the path to initialize")
	.option("--preset <preset>", "Specify the preset to use")
	.action((target, options) => {
		// We will dynamically import the action handler to keep startup fast
		import("./cli/init.ts").then(({ init_tool }) => {
			init_tool({
				cmd: "init",
				target: target as any,
				init: {
					path: options.path,
					force: options.force,
					preset: options.preset,
				},
			});
		});
	});

// Define 'build' command
cli
	.command("build <target>", "Build the project for production")
	.option("-c, --config <file>", "Use specified config file")
	.option("-w, --watch", "Watch for changes")
	.option("--env <env>", "Specify the environment (dev/prd)")
	.action((target, options) => {
		import("./cli/pack-code.ts").then(({ pack_code }) => {
			pack_code({
				cmd: "build",
				target: target as any,
				pack: {
					config: options.config,
					env: options.env || "prd",
					watch: options.watch,
					esm: true,
				},
			});
		});
	});

// Define 'dev' command
cli
	.command("dev <target>", "Start development server")
	.option("-c, --config <file>", "Use specified config file")
	.option("--env <env>", "Specify the environment (dev/prd)")
	.option("--debug", "Enable debug mode")
	.action((target, options) => {
		if (options.debug) {
			process.env.DEBUG = "true";
		}
		import("./cli/pack-code.ts").then(({ pack_code }) => {
			pack_code({
				cmd: "dev",
				target: target as any,
				pack: {
					config: options.config,
					env: options.env || "dev",
					watch: true, // dev always watches
					esm: true,
				},
			});
		});
	});

// Define 'preview' command
cli
	.command("preview <target>", "Preview the production build")
	.option("-c, --config <file>", "Use specified config file")
	.action((target, options) => {
		import("./cli/pack-code.ts").then(({ pack_code }) => {
			pack_code({
				cmd: "preview",
				target: target as any,
				pack: {
					config: options.config,
					env: "prd",
					watch: false,
					esm: true,
				},
			});
		});
	});

import packagejson from "../package.json" with { type: "json" };

cli.help();
cli.version(packagejson.version);

export function exec() {
	try {
		// Parse arguments
		cli.parse();
	} catch (error) {
		logger.error(`Error: ${(error as Error).message}`);
		cli.outputHelp();
		process.exit(1);
	}
}
