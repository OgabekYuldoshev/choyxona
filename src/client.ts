import type net from "node:net";
import readline from "node:readline";
import chalk from "chalk";

export function startClient(socket: net.Socket) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: chalk.cyanBright("↪: "),
	});

	let nick = "";

	socket.on("data", (data) => {
		const msg = data.toString().trim();
		if (msg === "username?") {
			rl.question(chalk.yellowBright("🟢 Nickname kiriting: "), (n) => {
				nick = n;
				socket.write(n);
			});
		} else {
			if (msg.startsWith(`@${nick}`)) {
				// shaxsiy xabar
				console.log(chalk.bgMagentaBright.black(` 📩 PM: ${msg}`));
			} else {
				console.log(chalk.greenBright(`\n💬 ${msg}`));
			}
			rl.prompt();
		}
	});

	rl.on("line", (line) => {
		if (line.trim()) {
			socket.write(`${line.trim()}`);
		}
		rl.prompt();
	});

	rl.on("SIGINT", () => {
		console.log(chalk.redBright("\n🚪 Chiqyapsiz..."));
		socket.end();
		process.exit(0);
	});

	rl.prompt();
}
