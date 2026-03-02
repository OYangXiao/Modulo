#! /usr/bin/env node

const requiredVersion = 24;
const currentVersion = process.version.match(/^v(\d+)/)?.[1];

if (!currentVersion || parseInt(currentVersion) < requiredVersion) {
	console.error(
		`\x1b[31mError: Node.js version ${process.version} is not supported. Please use Node.js v${requiredVersion} or higher.\x1b[0m`,
	);
	process.exit(1);
}

import("../src/index.ts")
	.then((module) => {
		// console.log("\nsupport ts, use Typescript code\n");
		try {
			module.exec();
		} catch (e) {
			console.error(e);
			process.exit(1);
		}
	})
	.catch((e) => {
		console.error(
			"\x1b[31mError: Failed to load TypeScript source code.\x1b[0m",
		);
		console.error(e);
		console.error(
			`\x1b[33mTip: Ensure you are running with Node.js v${requiredVersion}+ which supports TypeScript natively (experimental).\x1b[0m`,
		);
		process.exit(1);
	});
