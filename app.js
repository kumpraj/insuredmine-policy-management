const express = require('express');
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const csv = require('csv-parser');
const fs = require('fs');
const { Worker } = require('worker_threads');
const { connectDB } = require('./db');
const cron = require('node-cron');
const server = require('./server');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  }

})

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
connectDB();


const Agent = require('./models/Agent');
const User = require('./models/User');
const Account = require('./models/Account');
const LOB = require('./models/LOB');
const Carrier = require('./models/Carrier');
const Policy = require('./models/Policy');
const ScheduledMessage = require('./models/ScheduledMessage');

app.post('/upload', upload.single('file'), (req, res) => {
  console.log("Hello uplaod");
  if (!req.file) {
    return res.status(400).send('No file was uploaded.');
  }

  const filePath = req.file.path;
  const worker = new Worker('./worker.js', { workerData: { filePath } });

  worker.on('message', (message) => {
    console.log(message);
  });

  worker.on('error', (error) => {
    console.error(error);
    res.status(500).send('An error occurred while uploading the file.');
  });

  worker.on('exit', (code) => {
    if (code === 0) {
      res.send('File uploaded and data inserted into MongoDB successfully.');
    } else {
      res.status(500).send('An error occurred while uploading the file.');
    }
  });
});

// Search API to find policy info with the help of the username
app.get('/users/:username/policies', async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ firstname: username });

    if (!user) {
      return res.status(404).json({ error: 'Policy with this User not found' });
    }

    const policies = await Policy.find({ userId: user._id });

    res.json(policies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to provide aggregated policy by each user
app.get('/users/policies/aggregated', async (req, res) => {
  try {
    const aggregatedPolicies = await Policy.aggregate([
      {
        $group: {
          _id: '$userId',
          policies: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          policies: 1,
        },
      },
    ]);

    res.json(aggregatedPolicies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to schedule messages based on day and time 
app.post('/schedule-message', async (req, res) => {
  const { message, day, time } = req.body;

  if (!message || !day || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const scheduledTime = new Date(`${day} ${time}`);
  const now = new Date();
  const delay = scheduledTime - now;

  if (delay < 0) {
    return res.status(400).json({ error: 'Scheduled time is in the past' });
  }

  const scheduledMessage = new ScheduledMessage({
    message,
    scheduledTime,
  });

  setTimeout(async () => {
    try {
      await scheduledMessage.save();
      console.log(`Message "${message}" scheduled for ${scheduledTime}`);
    } catch (err) {
      console.error(`Error saving message: ${err}`);
    }
  }, delay);

  res.status(200).json({ message: 'Message scheduled successfully' });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});