import net from "node:net";
import { storage } from "./storage";

export function startServer(port: number) {
	const server = net.createServer((socket) => {
		let username = "";
		socket.write("username?\n");

		socket.on("data", async (data) => {
			const message = data.toString().trim();
			if (!username) {
				username = message;
				if (storage.has(username)) {
					socket.write("🚫 Bu nickdan foydalanuvchi bor\n");
					socket.write("username?\n");
					username = "";
					return;
				}
				storage.set(username, { username, socket });
				broadcast(`🟢 ${username} qo‘shildi`, username);
				return;
			}

			if (message.startsWith("@")) {
				const [rawUsername, ...rest] = message.split(" ");
				const targetUsername = rawUsername?.slice(1) || "";
				const msg = rest.join(" ");
				const target = storage.get(targetUsername);
				if (target) {
					target.socket.write(`[PM] ${username} > ${msg}\n`);
				} else {
					socket.write(`❌ ${targetUsername} topilmadi\n`);
				}
				return;
			}

			if (message.startsWith("/")) {
				const [command] = message.split(" ");
				switch (command) {
					case "/list":
						{
							const clients = Array.from(storage.values());
							const list = clients.map((c) => ({
								username: c.username,
								localAddress: c.socket.localAddress,
							}));
							socket.write(`/list ${JSON.stringify(list)}\n`);
						}
						break;

					default:
						socket.write("❌ Bunday command mavjud emas\n");
						break;
				}

				return;
			}

			broadcast(`${username}: ${message}`, username);
		});

		socket.on("end", () => {
			const session = Array.from(storage.values()).find(
				(c) => c.socket === socket,
			);
			if (session) {
				storage.delete(session.username);

				broadcast(`🔴 ${session.username} chiqdi`, session.username);
			}
		});

		socket.on("error", () => {});
	});

	function broadcast(msg: string, from: string) {
		for (const c of Array.from(storage.values())) {
			if (c.username !== from) {
				c.socket.write(`${msg}\n`);
			}
		}
	}

	server.listen(port, () => {
		console.log(`🚀 [LANChat] Server ishga tushdi: ${port} portda`);
	});
}
