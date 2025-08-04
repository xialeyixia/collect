const zmq = require('zeromq');
const mysql = require('mysql2/promise');

// ZeroMQ 配置
const ZMQ_PORT = 5555;
const ZMQ_TOPIC = 'sensor_data'; // 订阅的主题（如不需要可留空）

// MySQL 配置
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'Tity*963.',
  database: 'sensor_db',
  waitForConnections: true,
  connectionLimit: 10
};

// 创建数据库连接池
const pool = mysql.createPool(DB_CONFIG);

// 创建 ZeroMQ SUB socket
const sock = new zmq.Subscriber();

async function start() {
  try {
    // 连接 ZeroMQ
    await sock.connect(`tcp://127.0.0.1:${ZMQ_PORT}`);
    sock.subscribe(ZMQ_TOPIC);
    console.log(`ZeroMQ connected on port ${ZMQ_PORT}, subscribed to "${ZMQ_TOPIC}"`);

    // 处理接收的消息
    for await (const [topic, msg] of sock) {
      try {
        const data = JSON.parse(msg.toString());
        console.log('Received:', data);

        // 插入数据库
        await insertData(data);
      } catch (parseErr) {
        console.error('Message parse error:', parseErr);
      }
    }
  } catch (err) {
    console.error('ZeroMQ connection failed:', err);
  }
}

// 插入数据到MySQL
async function insertData(data) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO sensor_readings 
      (sensor_id, temperature, humidity, timestamp) 
      VALUES (?, ?, ?, ?)`,
      [data.sensor_id, data.temp, data.humidity, new Date(data.timestamp)]
    );
    console.log(`Inserted ID: ${result.insertId}`);
  } catch (err) {
    console.error('Database insert error:', err);
  } finally {
    if (connection) connection.release();
  }
}

// 启动服务
start().catch(console.error);

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\nClosing connections...');
  await sock.close();
  await pool.end();
  process.exit();
});
