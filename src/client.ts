import type net from "node:net";
import readline from "node:readline";
import chalk from "chalk";

export function startClient(client: net.Socket) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: chalk.cyanBright("↪: "),
	});

	let nick = "";

	client.on("data", (data) => {
		const msg = data.toString().trim();
		if (msg === "NICK?") {
			rl.question(chalk.yellowBright("🟢 Nickname kiriting: "), (n) => {
				nick = n;
				client.write(n);
			});
		} else {
			if (msg.startsWith(`@${nick}`)) {
				// shaxsiy xabar
				console.log(chalk.bgMagentaBright.black(` 📩 PM: ${msg}`));
			} else {
				console.log(chalk.greenBright(`💬 ${msg}`));
			}
			rl.prompt();
		}
	});

	rl.on("line", (line) => {
		if (line.trim()) {
			client.write(line.trim());
		}
		rl.prompt();
	});

	rl.on("SIGINT", () => {
		console.log(chalk.redBright("\n🚪 Chiqyapsiz..."));
		client.end();
		process.exit(0);
	});

	rl.prompt();
}
