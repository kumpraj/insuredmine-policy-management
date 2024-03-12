const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  account_name: { type: String }
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
