import 'socket.io';
import { ButtonState } from './HardwareTypes';

declare module 'socket.io' {
    interface Namespace extends NodeJS.EventEmitter {
        emit(event: 'clients-updated', data: string[]): boolean;
    }
  
    interface Socket extends NodeJS.EventEmitter {
        on(event: 'identification', fn: (data: string) => void): this;
        on(event: 'disconnect', fn: () => void): this;
        on(event: 'button-pressed', fn: (obj: ButtonState) => void): this;
    }
}