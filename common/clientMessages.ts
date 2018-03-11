export function emitIdentification(socket: SocketIOClient.Socket, ident: string) {
    socket.emit('identification', ident);
}

export function onConnect(socket: SocketIOClient.Socket, fn: () => void) {
    socket.on('connect', () => fn());
}

export function onDisconnect(socket: SocketIOClient.Socket, fn: () => void) {
    socket.on('disconnect', () => fn());
}

export function onClientsUpdated(socket: SocketIOClient.Socket, fn: (data: string[]) => void) {
    socket.on('clients-updated', (data: string[]) => fn(data));
}