import * as zmq from "zeromq";
import mysql from "mysql2/promise";
const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "Tity*963.",
  database: "collect_db",
  waitForConnections: true,
  connectionLimit: 10,
};
const pool = mysql.createPool(DB_CONFIG);
async function insertData(data) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO ScanData_999999996A6C3075E172BE6C3075
      (Id, ScanTime, Duration, SpecName,SummaryOrNot,RBW,Harmonic, FrequencyCount,MinFrequency,MaxFrequency,PowerValues,AverageMag,ChannelPower,Stdev,UpMinLowForCp,AIValues)
      VALUES (?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.mid,
        data.date_time,
        data.duration || null,
        null,
        null,
        data.rbw,
        data.harmonic,
        data.frequency_count,
        data.frequency_min,
        data.frequency_max,
        data.power,
        null,
        null,
        null,
        null,
        data.ai || null,
      ]
    );
    console.log(`Inserted ID: ${result}`);
  } catch (err) {
    console.error("Database insert error:", err);
  } finally {
    if (connection) connection.release();
  }
}
async function run() {
  const sock = new zmq.Reply();

  sock.connect("tcp://127.0.0.1:3000");
  console.log("Worker connected to port 3000");
  while (true) {
    try {
      const [msg] = await sock.receive();
      const data = JSON.parse(msg.toString());
      console.log("Received:", data);

      // 插入数据库
      if (data.type == 1) {
        await insertData(data);
        await sock.send(
          JSON.stringify({
            ret: 0,
            msg: "ok",
          })
        );
      }
    } catch (parseErr) {
      console.error("Message parse error:", parseErr);
    }
  }
}

run();

