#!/usr/bin/env node

import net from "node:net";
import os from "node:os";
import chalk from "chalk";
import ora from "ora";
import { startClient } from "./client";
import { findLanServer } from "./find-lan-server";
import { startServer } from "./server";

const PORT = 12211;

function getLocalIpAddress(): string {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name] || []) {
			if (
				iface.family === "IPv4" &&
				!iface.internal &&
				iface.address.startsWith("192.")
			) {
				return iface.address;
			}
		}
	}
	return "";
}

(async () => {
	const spinner = ora("🔍 Server qidirilmoqda LAN ichida...").start();

	const foundHost = await findLanServer(PORT);
	const localIp = getLocalIpAddress();

	if (!localIp) {
		throw new Error("Local IP address not found");
	}

	const host = foundHost ?? localIp;

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
