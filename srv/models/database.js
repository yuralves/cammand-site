const pg = require('pg');
const connectionString = process.env.POSTGRESQL_URI;

const client = new pg.Client(connectionString);
client.connect();
