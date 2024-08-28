const crypto = require("crypto");

//generating a sectret key
const secret_key = crypto.randomBytes(32).toString('hex');

module.exports = {
    secret_key
}