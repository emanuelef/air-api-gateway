'use strict';
require('dotenv').config();
const Boom = require('boom');
const {
  startQueryingPromise,
  startQueryingFlightsPromise,
  startQueryingAllFilteredPromise
} = require('air-commons').mysql;
const Hapi = require('hapi');
const server = Hapi.server({
  port: process.env.PORT
});

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
    const params = request.query;
    console.log(params);
    /*
    const now = Math.round(Date.now() / 1000);
    const yesterday = now - 4 * 60 * 60;
    console.log(now, yesterday);
    */

    try {
      let items = await startQueryingPromise(params.from, params.to);
      console.log('DONE ', items.length);
      let response = {
        fromDate: new Date(params.from * 1000),
        toDate: new Date(params.to * 1000),
        totalItems: items.length
      };

      response.items = items;

      return response;
    } catch (e) {
      console.log(e);
      throw Boom.teapot(e.message);
    }
  }
});

server.route({
  method: 'GET',
  path: '/flights',
  handler: async (request, h) => {
    const params = request.query;
    console.log(params);

    try {
      let items = await startQueryingFlightsPromise(params.from, params.to);
      console.log('DONE ', items.length);
      let response = {
        fromDate: new Date(params.from * 1000),
        toDate: new Date(params.to * 1000),
        totalItems: items.length
      };

      response.items = items;

      return response;
    } catch (e) {
      console.log(e);
      throw Boom.teapot(e.message);
    }
  }
});

server.route({
  method: 'GET',
  path: '/allInBox',
  handler: async (request, h) => {
    const params = request.query;
    console.log(params);

    try {
      let items = await startQueryingAllFilteredPromise(params.from, params.to, Number(params.lat), Number(params.lon), Number(params.max));
      console.log('DONE ', items.length);
      let response = {
        fromDate: new Date(params.from * 1000),
        toDate: new Date(params.to * 1000),
        totalItems: items.length
      };

      response.items = items;

      return response;
    } catch (e) {
      console.log(e);
      throw Boom.teapot(e.message);
    }
  }
});

server.route({
  method: 'GET',
  path: '/allFlightsInBox',
  handler: async (request, h) => {
    const params = request.query;
    console.log(params);

    try {
      let items = await startQueryingAllFilteredPromise(params.from, params.to, Number(params.lat), Number(params.lon), Number(params.max));

      let flightsByIcao = {};

      for (let item of items) {
        flightsByIcao[item.icao] = flightsByIcao[item.icao] || 0;
        flightsByIcao[item.icao] = flightsByIcao[item.icao] + 1;
      }

      console.log(flightsByIcao);

      console.log('DONE ', items.length);
      let response = {
        fromDate: new Date(params.from * 1000),
        toDate: new Date(params.to * 1000),
        totalItems: items.length
      };

      response.items = items;

      return response;
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