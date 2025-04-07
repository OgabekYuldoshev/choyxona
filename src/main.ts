#!/usr/bin/env node

import net from "node:net";
import chalk from "chalk";
import ora from "ora";
import { startClient } from "./client";
import { findLanServer } from "./find-lan-server";
import { startServer } from "./server";

const PORT = 12211;

(async () => {
	const spinner = ora("🔍 Server qidirilmoqda LAN ichida...").start();

	const foundHost = await findLanServer(PORT);
	const host = foundHost ?? "127.0.0.1";

	spinner.stop();

	if (!foundHost) {
		console.log(
			chalk.yellow("🚫 Server topilmadi. Yangi server ishga tushyapti..."),
		);
		startServer(PORT);
		await new Promise((r) => setTimeout(r, 500));
	} else {
		console.log(chalk.green(`✅ Server topildi: ${host}`));
	}

	const client = net.createConnection({ host, port: PORT }, () => {
		console.log(chalk.greenBright(`🔌 Ulandi: ${host}:${PORT}`));
		startClient(client);
	});
})();
