const { parentPort, workerData } = require('worker_threads');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./db');

const { filePath } = workerData;

// Connect to MongoDB
connectDB();

const Agent = require('./models/Agent');
const User = require('./models/User');
const Account = require('./models/Account');
const LOB = require('./models/LOB');
const Carrier = require('./models/Carrier');
const Policy = require('./models/Policy');

const stream = fs.createReadStream(filePath).pipe(csv());

const BATCH_SIZE = 199; 
let currentBatch = [];

stream.on('data', (data) => {
  currentBatch.push(data);
  // console.log(data);

  if (currentBatch.length === BATCH_SIZE) {
    processDataBatch(currentBatch);
    currentBatch = [];
  }
});

stream.on('end', async () => {
  if (currentBatch.length > 0) {
    await processDataBatch(currentBatch);
  }

  parentPort.postMessage('CSV file processed successfully.');
  disconnectDB();
  parentPort.close();
});

async function processDataBatch(batch) {
  try {
    const promises = [];

    for (const data of batch) {
      const agentData = { agent: data.agent };
      const userData = {
        _id: new mongoose.Types.ObjectId(),
        firstname: data.firstname,
        dob: data.dob,
        address: data.address,
        phone: data.phone,
        state: data.state,
        zip: data.zip,
        email: data.email,
        gender: data.gender,
        userType: data.userType,
      };
      const accountData = { account_name: data.account_name };
      const lobData = { category_name: data.category_name };
      const carrierData = { company_name: data.company_name };
      const policyData = {
        policy_number: data.policy_number,
        policy_start_date: data.policy_start_date,
        policy_end_date: data.policy_end_date,
        policy_type: data.policy_type,
        collectionId: data.account_name,
        companyCollectionId: data.company_name,
        userId: userData._id,
      };

      const user = new User(userData);
      const agent = new Agent(agentData);
      const account = new Account(accountData);
      const lob = new LOB(lobData);
      const carrier = new Carrier(carrierData);
      const policy = new Policy(policyData);

      promises.push(user.save());
      promises.push(agent.save());
      promises.push(account.save());
      promises.push(lob.save());
      promises.push(carrier.save());
      promises.push(policy.save());
    }

    await Promise.all(promises);
    parentPort.postMessage(`Batch processed successfully.`);
  } catch (err) {
    parentPort.postMessage(`Error processing batch: ${err}`);
  }
}