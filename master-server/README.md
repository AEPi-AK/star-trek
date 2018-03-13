# master-server

## Client Listeners

Clients may listen for the following messages: 

### 'connect'

This message is sent to all clients when the master server goes up. Usually, you'll want
to identify yourself to the server here (see [identification](#identification)).

The callback function takes no arguments and returns `void`.

Example:

```typescript
socket.on('connect', () =>
  console.log('The server is up!')
);
```

### 'disconnect'

This message is sent to all clients when the master server goes down.

The callback function takes no arguments and returns `void`.

Example:

```typescript
socket.on('disconnect', () =>
  console.log('The server is down!')
);
```

### 'clients-updated'

This message is sent to all clients when the list of clients is updated.

The callback function takes a `string[]` of clients and returns `void`.

Example:

```typescript
socket.on('clients-updated', (clients: string[]) =>
  console.log('There are ' + clients.length + ' clients connected');
);
```

## Client Emitters

The clients may emit the following messages:

### 'identification'

This message should be sent to the master server to tell it the name of
the client.

There is only one argument, and it is a `string`.

Example:

```typescript
socket.emit('identification', 'admin-console');
```
