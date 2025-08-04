const zmq = require('zeromq');
const sock = new zmq.Publisher();

async function run() {
  await sock.bind(`tcp://127.0.0.1:5555`);
  console.log('Publisher bound to port 5555');

  // 每秒发送一条模拟数据
  setInterval(() => {
    const data = {
      sensor_id: `sensor_${Math.floor(Math.random() * 100)}`,
      temp: (Math.random() * 30 + 10).toFixed(2),
      humidity: (Math.random() * 100).toFixed(2),
      timestamp: Date.now()
    };
    
    const msg = [ 'sensor_data', JSON.stringify(data) ];
    sock.send(msg);
    console.log('Sent:', data);
  }, 1000);
}
