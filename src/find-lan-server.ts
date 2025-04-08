import net from "node:net";
import os from "node:os";

export async function findLanServer(port: number): Promise<string | null> {
	const interfaces = os.networkInterfaces();
	let subnetBase: string | null = null;

	for (const name of Object.keys(interfaces)) {
		for (const net of interfaces[name] || []) {
			if (net.family === "IPv4" && !net.internal && net.address) {
				const parts = net.address.split(".");
				if (parts.length === 4) {
					subnetBase = `${parts[0]}.${parts[1]}.${parts[2]}`;
					break;
				}
			}
		}
		if (subnetBase) break;
	}

	if (!subnetBase) return null;

	const tryConnect = (ip: string) =>
		new Promise<boolean>((resolve) => {
			const socket = new net.Socket();
			socket.setTimeout(30);
			socket.once("connect", () => {
				socket.destroy();
				resolve(true);
			});
			socket.once("timeout", () => {
				socket.destroy();
				resolve(false);
			});
			socket.once("error", () => resolve(false));
			socket.connect(port, ip);
		});

	for (let i = 1; i <= 254; i++) {
		const ip = `${subnetBase}.${i}`;
		const isAlive = await tryConnect(ip);
		if (isAlive) return ip;
	}

	return null;
}
