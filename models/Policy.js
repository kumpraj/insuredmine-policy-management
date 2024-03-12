const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
    policy_number: {
    type: String
    },
    policy_start_date: {
    type: Date,
    },
    policy_end_date: {
    type: Date,
    },
    policy_type: {
        type: String,
    },
    collectionId: {
        type: String
    }, 
    companyCollectionId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('Policy', policySchema);
