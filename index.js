'use strict';
require('dotenv').config();
const Boom = require('boom');

const {startScanning, startQueryingPromise} = require('./db');

const Hapi = require('hapi');

const server = Hapi.server({port: 3001, host: 'localhost'});

const init = async () => {

  /*
  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: true,
      logEvents: ['response']
    }
  });
  */

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    let data = {
      ciao: 'pippo'
    };
    return data;
  }
});

server.route({
  method: 'GET',
  path: '/all',
  handler: async (request, h) => {
    const params = request.query
    console.log(params)

    const now = Date.now();
    const yesterday = now - 4 * 60 * 60 * 1000;

    console.log(now, yesterday);
    let items = [];
    try {
      items = await startQueryingPromise(yesterday, now);
      console.log('DONE ', items.length);
    } catch (e) {
      console.log(e);
      throw Boom.teapot(e.message);
    }

    return items;
  }
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
