const redis = require('redis');
const client = redis.createClient({
  url: 'redis://127.0.0.1:6379' // Adjust the URL if needed
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect();

module.exports = client;
