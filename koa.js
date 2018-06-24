require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const {startQueryingPromise} = require('./mysql');

const app = new Koa();
const router = new Router();

const PORT = 3002;

router.get('/', async (ctx) => {

  const now = Math.round(Date.now() / 1000);
  const yesterday = now - 4 * 60 * 60;
  console.log(now, yesterday);

  let items = await startQueryingPromise(yesterday, now);
  console.log('DONE ', items.length);
  let response = {
    fromDate: new Date(yesterday * 1000),
    toDate: new Date(now * 1000),
    totalItems: items.length
  };

  response.items = items;

  ctx.body = response;
})

app.use(router.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
