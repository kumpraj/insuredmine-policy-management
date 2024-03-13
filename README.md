

# Node.js Policy Management (MongoDB Data Upload and Management API)

This Node.js application provides APIs for uploading data from XLSX/CSV files into MongoDB using worker threads, searching for policy information via username, aggregating policies by user, tracking real-time CPU utilization, and scheduling messages to be inserted into the database at a specified day and time.

## Features

- **Data Upload**: Upload XLSX/CSV files and insert data into MongoDB using worker threads.
- **Search API**: Search for policy information using a username.
- **Aggregated Policy Information**: Get aggregated policy information for each user.
- **Real-Time CPU Utilization Tracking**: Monitor the CPU usage of the server in real-time and restart the server if the usage exceeds 70%.
- **Scheduled Message Posting**: Schedule messages to be saved in the database at a specific day and time.

## Installation

To get started with this application, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/kumpraj/insuredmine-policy-management.git

```

2. Install the necessary dependencies:

```bash
npm install
```

3. Ensure MongoDB is running on your local system or set up a MongoDB Atlas cluster and configure the connection string in `db.js`.

4. Start the application:

```bash
npm start
```

## Usage

### Uploading Data

To upload data:

1. Use the `/upload` endpoint to upload your XLSX/CSV file. This endpoint accepts a file in the form data with the key `file`.
<br>

![Upload api route image](./images/Upload%20CSV%20API.JPG)

### Searching for Policy Information

To search for policy information by username:

1. Use the `/users/:username/policies` endpoint, replacing `:username` with the actual username.
<br>

![Search for policy information by username](./images/Search%20API%20to%20find%20policy%20with%20username.JPG)

### Getting Aggregated Policy Information

To get aggregated policy information:

1. Use the `/users/policies/aggregated` endpoint.

<br>

![Aggreagated Policies by User](./images/Aggregated%20policies%20by%20each%20user.JPG)

### Monitoring CPU Utilization and Server Restart

The application automatically monitors the CPU usage and will attempt to restart the server if the CPU usage exceeds 70%.
<br>

![PM2 Monit CPU Usage](./images/PM2%20Monit%20CPU%20Usage.JPG)

### Scheduling Messages

To schedule a message:

1. Use the `/schedule-message` endpoint with the `message`, `day`, and `time` parameters in the request body.
<br>

![API for scheduled message](./images/Scheduled%20Message%20API.JPG)


