#!/usr/bin/env node

import net from "node:net";
import os from "node:os";
import chalk from "chalk";
import minimist from "minimist";
import ora from "ora";
import { startClient } from "./client";
import { findLanServer } from "./find-lan-server";
import { startServer } from "./server";

const args = minimist(process.argv.slice(2));
const showHelp = args.help || args.h;

if (showHelp) {
	console.log(`
Choyxona - Local Chat (LAN)

Usage:
  pnpx choyxona [--port 12211]

Options:
  --port, -p   Use specific port (default: 12211)
  --help, -h   Show this help message
`);
	process.exit(0);
}

export function getLocalIpAddress(): string {
	const interfaces = os.networkInterfaces();

	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name] || []) {
			if (iface.family === "IPv4" && !iface.internal && iface.address) {
				return iface.address;
			}
		}
	}

	return "127.0.0.1";
}

(async () => {
	const PORT =
		typeof args.port === "number"
			? args.port
			: typeof args.p === "number"
				? args.p
				: 12211;

	const spinner = ora("🔍 LAN ichida server qidirilmoqda...").start();

	const foundHost = await findLanServer(PORT);
	const localIp = getLocalIpAddress();

	if (!localIp) {
		throw new Error("Local IP address not found");
	}

	const host = foundHost ?? localIp;

	spinner.stop();

	if (!foundHost) {
		chalk.yellow("🚫 Server topilmadi. Yangi server ishga tushyapti...");
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
