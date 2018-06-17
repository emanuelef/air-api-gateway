'use strict';
require('dotenv').config();
const Boom = require('boom');
const {startQueryingPromise} = require('./mysql');
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
    /*
    const now = Math.round(Date.now() / 1000);
    const yesterday = now - 4 * 60 * 60;
    console.log(now, yesterday);
    */

    try {
      let items = await startQueryingPromise(params.from, params.to);
      console.log('DONE ', items.length);
      return items;
    } catch (e) {
      console.log(e);
      throw Boom.teapot(e.message);
    }
  }
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
