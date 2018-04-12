import * as _ from 'socket.io-client';

declare module 'socket.io-client' {
    interface Socket extends Emitter {
		// Add custom emitters and listeners here
		emit( event: 'identification', arg: string):Socket;
		emit( event: 'button-pressed', arg: {pressed: boolean, label: string, lit : boolean}):Socket;
		on( event: 'button-listen', fn: (label : string) => void):Socket;
		on( event: 'connect', fn: () => void):Socket;
		on( event: 'disconnect', fn: () => void):Socket;
		on( event: 'clients-updated', fn: (clients: string[]) => void):Socket;
        on( event: 'update-countdown', fn: (time: number) => void):Socket;
    }
}