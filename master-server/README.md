# master-server

## Client Messages

Clients may listen on the following messages. 

### 'connect'

This message is sent to all clients when the server spins up. Usually, you'll want
to identify yourself to the server here (see [emit](#emit))

Example:

```typescript
socket.on('connect', () =>
  console.log('The server is up!')
);
```

