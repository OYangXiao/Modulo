import readline from "node:readline";
import picocolors from "picocolors";

/**
 * CLI 交互式确认
 * @param message 提示信息
 * @returns Promise<boolean> 用户是否确认 (Y/y 为 true)
 */
export async function confirm(message: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(`${picocolors.yellow(message)} (Y/n) `, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === "y" || answer === "");
		});
	});
}
