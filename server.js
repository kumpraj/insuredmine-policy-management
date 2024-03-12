const os = require('os');
const child_process = require('child_process');

// Set the CPU usage threshold for restart
const CPU_USAGE_LIMIT = 70; // 70%

let prevCpuInfos = os.cpus().map(cpu => ({ ...cpu.times }));

// Function to get CPU usage
function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdleDiff = 0;
  let totalTickDiff = 0;

  cpus.forEach((cpu, index) => {
    const prevCpuInfo = prevCpuInfos[index];
    const idleDiff = cpu.times.idle - prevCpuInfo.idle;
    const tickDiff = Object.keys(cpu.times).reduce((acc, key) => acc + cpu.times[key], 0) - 
                     Object.keys(prevCpuInfo).reduce((acc, key) => acc + prevCpuInfo[key], 0);
    
    totalIdleDiff += idleDiff;
    totalTickDiff += tickDiff;

    prevCpuInfos[index] = { ...cpu.times };
  });

  return 1 - (totalIdleDiff / totalTickDiff);
}

// Function to restart the server
function restartServer() {
  console.log('CPU usage exceeding threshold, attempting to restart server...');
  child_process.exec('pm2 restart all', (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Execution stderr: ${stderr}`);
      return;
    }
    console.log(`Server restart stdout: ${stdout}`);
  });
}

// Monitor CPU usage at an interval
setInterval(() => {
  const cpuUsagePercent = getCPUUsage() * 100;
  console.log(`CPU Usage: ${cpuUsagePercent.toFixed(2)}%`);

  if (cpuUsagePercent >= CPU_USAGE_LIMIT) {
    restartServer();
  }
}, 1000); // Check every second
