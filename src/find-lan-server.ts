import net from "node:net";
import os from "node:os";

export async function findLanServer(port: number): Promise<string | null> {
	const interfaces = os.networkInterfaces();

	let subnetBase = "192.168.0";
	for (const name of Object.keys(interfaces)) {
		for (const net of interfaces[name] || []) {
			if (
				net.family === "IPv4" &&
				!net.internal &&
				net.address.startsWith("192.168")
			) {
				const parts = net.address.split(".");
				subnetBase = `${parts[0]}.${parts[1]}.${parts[2]}`;
			}
		}
	}

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
