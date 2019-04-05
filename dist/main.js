"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server/server");
const server = new server_1.Server;
server.bootstrap().then(server => {
    //server rodando normalmente
    console.log('Server is listening on:', server.application.address());
}).catch(error => {
    //erro ao rodar o server
    console.log('Serve failed to start');
    console.error(error);
    process.exit(1);
});
