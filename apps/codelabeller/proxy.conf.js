require('dotenv').config();
const fs = require('fs');

let isHttps;

try {
  fs.readFileSync(process.env.SSL_CERT_ABSOLUTE_PATH);
  fs.readFileSync(process.env.SSL_PRIVATE_KEY_ABSOLUTE_PATH);
  isHttps = true;

} catch (error) {
  isHttps = false
}

const PROXY_CONFIG = {};

PROXY_CONFIG[`${process.env.API_GLOBAL_PREFIX}`] = {
  "target": `http${isHttps ? "s" : ""}://localhost:${process.env.API_PORT}`,
  "secure": false
}

module.exports = PROXY_CONFIG;
