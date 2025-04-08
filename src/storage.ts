import type net from "node:net";

export type Session = {
	username: string;
	socket: net.Socket;
};

export const storage = new Map<string, Session>();
