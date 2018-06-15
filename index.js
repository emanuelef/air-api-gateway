'use strict';
require('dotenv').config();

const { startScanning } = require('./db');

const Hapi = require('hapi');

const server = Hapi.server({port: 3001, host: 'localhost'});

const init = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        let data = {ciao: 'pippo'};
        return data;
    }
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

startScanning();
