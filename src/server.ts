import net from "node:net";

type Client = {
	socket: net.Socket;
	nickname: string;
};

export function startServer(port: number) {
	const clients: Client[] = [];

	const server = net.createServer((socket) => {
		let nickname = "";
		socket.write("NICK?\n");

		socket.on("data", (data) => {
			const message = data.toString().trim();
			if (!nickname) {
				nickname = message;
				clients.push({ socket, nickname });
				broadcast(`🟢 ${nickname} qo‘shildi`, nickname);
				return;
			}

			if (message.startsWith("@")) {
				const [rawNick, ...rest] = message.split(" ");
				const targetNick = rawNick?.slice(1);
				const msg = rest.join(" ");
				const target = clients.find((c) => c.nickname === targetNick);
				if (target) {
					target.socket.write(`[PM] ${nickname} > ${msg}\n`);
				} else {
					socket.write(`❌ ${targetNick} topilmadi\n`);
				}
				return;
			}

			broadcast(`${nickname}: ${message}`, nickname);
		});

		socket.on("end", () => {
			const idx = clients.findIndex((c) => c.socket === socket);
			if (idx !== -1) {
				const leftNick = clients[idx]?.nickname || "";
				clients.splice(idx, 1);
				broadcast(`🔴 ${leftNick} chiqdi`, leftNick);
			}
		});

		socket.on("error", () => {});
	});

	function broadcast(msg: string, from: string) {
		for (const c of clients) {
			if (c.nickname !== from) {
				c.socket.write(`${msg}\n`);
			}
		}
	}

	server.listen(port, () => {
		console.log(`🚀 [LANChat] Server ishga tushdi: ${port} portda`);
	});
}
