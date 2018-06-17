const AWS = require('aws-sdk');
const util = require('util');

AWS.config.update({endpoint: 'https://dynamodb.eu-west-2.amazonaws.com', region: 'eu-west-2'});

const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();

const TABLE = process.env.TABLE_NAME;
const TABLE_PASSAGES = process.env.TABLE_NAME_FLIGHT_PASSAGES;

var params = {
  TableName: TABLE
  /*
    FilterExpression: '#yr between :start_yr and :end_yr',
    ExpressionAttributeNames: {
        '#yr': 'year',
    },
    ExpressionAttributeValues: {
         ':start_yr': 1950,
         ':end_yr': 1959
    }
    */
};

let numItems = 0;
const fields = [
  'icao',
  'timestamp',
  'latitude',
  'longitude',
  'euclidean',
  'galtM'
];

let allItems = [];

function onScan(err, data) {
  if (err) {
    console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Scan succeeded.');

    allItems = allItems.concat(data.Items);
    numItems += data.Items.length;

    // continue scanning because
    // scan can retrieve a maximum of 1MB of data
    if (typeof data.LastEvaluatedKey != 'undefined') {
      console.log('Scanning for more...');
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      docClient.scan(params, onScan);
    } else {
      console.log(`Found ${numItems} items`);
    }
  }
}

const startScanning = () => {
  console.log('Scanning');
  docClient.scan(params, onScan);
};

const startQuerying = (from, to, callback) => {

  let itemsQuery = [];
  let numItemsQuery = 0;

  const paramsQuery = {
    TableName: TABLE,
    IndexName: "timestamp-index",
    KeyConditionExpression: "#timestamp BETWEEN :from and :to",
    ExpressionAttributeNames: {
      "#timestamp": "timestamp"
    },
    ExpressionAttributeValues: {
      ":from": from,
      ":to": to
    }
  };

  const runQuery = (callback) => {
    docClient.query(paramsQuery, (err, result) => {
      if (err) {
        //console.error('Unable to query the table. Error JSON:', JSON.stringify(err, null, 2));
        callback(err);
      } else {
        console.log('Query succeeded.');

        itemsQuery = itemsQuery.concat(result.Items);
        numItemsQuery += result.Items.length;

        if (typeof result.LastEvaluatedKey != 'undefined') {
          console.log('Querying for more...');
          paramsQuery.ExclusiveStartKey = result.LastEvaluatedKey;
          runQuery(callback);
        } else {
          console.log(`Found ${numItemsQuery} items`);
          callback(err, itemsQuery);
        }
      }
    });
  }

  console.log('Querying');
  runQuery(callback);
};

const startQueryingPromise = (from, to) => {
  return new Promise((resolve, reject) => {
    startQuerying(from, to, (err, data) => {
      if (err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

exports.startScanning = startScanning;
exports.startQueryingPromise = startQueryingPromise;
