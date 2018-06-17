const Sequelize = require('sequelize');

const HOST = process.env.MYSQL_DB_ENDPOINT;
const DB_NAME = process.env.MYSQL_DB_NAME;
const DB_USERNAME = process.env.MYSQL_DB_USERNAME;
const DB_PASSWORD = process.env.MYSQL_DB_PASSWORD;

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  host: HOST,
  dialect: 'mysql',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false
  }
});

const Op = Sequelize.Op

const All = sequelize.define(process.env.MYSQL_DB_TABLE_ALL, {
  icao: Sequelize.STRING,
  op: Sequelize.STRING,
  model: Sequelize.STRING,
  wakeTurbulence: Sequelize.STRING,
  distance: Sequelize.INTEGER,
  time: Sequelize.INTEGER,
  latitude: Sequelize.DOUBLE,
  longitude: Sequelize.DOUBLE,
  from: Sequelize.STRING,
  to: Sequelize.STRING,
  altM: Sequelize.SMALLINT,
  galtM: Sequelize.SMALLINT,
  euclidean: Sequelize.INTEGER,
  flying: Sequelize.BOOLEAN,
  speed: Sequelize.SMALLINT,
  trackAngle: Sequelize.FLOAT,
  verticalSpeed: Sequelize.SMALLINT,
  aircraftType: Sequelize.STRING,
  wCompass: Sequelize.TEXT('tiny'),
  wDeg: Sequelize.SMALLINT,
  wSpeed: Sequelize.FLOAT
}, {
  indexes: [
    {
      unique: false,
      fields: ['time']
    }
  ]
});

const Flights = sequelize.define(process.env.MYSQL_DB_TABLE_PASSAGES, {
  icao: Sequelize.STRING,
  op: Sequelize.STRING,
  samples: Sequelize.INTEGER,
  startTime: Sequelize.INTEGER,
  startLat: Sequelize.DOUBLE,
  startLon: Sequelize.DOUBLE,
  startAltitude: Sequelize.SMALLINT,
  flyingAtCreation: Sequelize.BOOLEAN,
  speedAtCreation: Sequelize.SMALLINT,
  verticalSpeedAtCreation: Sequelize.SMALLINT,
  from: Sequelize.STRING,
  to: Sequelize.STRING,
  minDistance: Sequelize.SMALLINT,
  minDTimestamp: Sequelize.INTEGER,
  minDAltitude: Sequelize.SMALLINT,
  minDLat: Sequelize.DOUBLE,
  minDLon: Sequelize.DOUBLE,
  timeMinDistanceFromStart: Sequelize.INTEGER,
  endTimeFromStart: Sequelize.INTEGER,
  endLat: Sequelize.DOUBLE,
  endLon: Sequelize.DOUBLE,
  endAltitude: Sequelize.SMALLINT,
  diffAltitude: Sequelize.SMALLINT,
  wDeg: Sequelize.SMALLINT,
  wSpeed: Sequelize.FLOAT
}, {
  indexes: [
    {
      unique: false,
      fields: ['startTime']
    }
  ]
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

const startQueryingPromise = async (from, to) => {
  return All.findAll({
    attributes: {
      exclude: [
        'wakeTurbulence',
        'euclidean',
        'flying',
        'aircraftType',
        'wCompass',
        'wDeg',
        'wSpeed'
      ]
    },
    where: {
      time: {
        [Op.between]: [from, to]
      }
    }
  });
};

exports.startQueryingPromise = startQueryingPromise;
