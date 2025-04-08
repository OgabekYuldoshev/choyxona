import type net from "node:net";
import readline from "node:readline";
import { AlignmentEnum, AsciiTable3 } from "ascii-table3";
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
				console.log(chalk.bgMagentaBright.black(` 📩 PM: ${msg}`));
			} else if (msg.startsWith("/")) {
				const [command, ...values] = msg.split(" ");
				switch (command) {
					case "/list":
						{
							const result = JSON.parse(values[0] || "[]");
							const table = new AsciiTable3("Online foydalanuvchilar!")
								.setHeading("Username", "IP")
								.setAlign(3, AlignmentEnum.CENTER);

							for (const res of result) {
								table.addRow(res.username, res.remoteAddress);
							}

							console.log(`\n${table.toString()}`);
						}
						break;

					default:
						break;
				}
			} else {
				console.log(chalk.greenBright(`\n💬 ${msg}`));
			}
			rl.prompt();
		}
	});

	rl.on("line", (line) => {
		const msg = line.trim();
		if (msg) {
			socket.write(`${msg}`);
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
