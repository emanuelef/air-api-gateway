const AWS = require('aws-sdk');

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

exports.startScanning = startScanning;
