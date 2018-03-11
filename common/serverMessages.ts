export function onIdentification(socket: SocketIO.Socket, fn: (data: string) => void) {
    socket.on('identification', function (data: string) {
        fn(data);
    });
}

export function emitIdentification(socket: SocketIOClient.Socket, ident: string) {
    socket.emit('identification', ident);
}

export function onConnect(socket: SocketIO.Server, fn: (socket: SocketIO.Socket) => void) {
    socket.on('connect', fn);
}

export function onDisconnect(socket: SocketIO.Socket, fn: () => void) {
    socket.on('disconnect', fn);
}