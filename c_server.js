import * as zmq from "zeromq"
import mysql from "mysql2/promise"
const DB_CONFIG = {
    host: "localhost",
    user: "root",
    password: "Tity*963.",
    database: "collect_db",
    waitForConnections: true,
    connectionLimit: 10,
}
const pool = mysql.createPool(DB_CONFIG)
async function insertData(data) {
    let connection
    try {
        connection = await pool.getConnection()
        const [result] = await connection.execute(
            `INSERT INTO ScanData_999999996A6C3075E172BE6C3075
      (Id,ScanTime, Duration, SpecName,SummaryOrNot,RBW,Harmonic, FrequencyCount,MinFrequency,MaxFrequency,PowerValues,AverageMag,ChannelPower,Stdev,UpMinLowForCp,AIValues)
      VALUES (?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                null,
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
            ],
        )
        console.log(`Inserted ID: ${result}`)
    } catch (err) {
        console.error("Database insert error:", err)
    } finally {
        if (connection) connection.release()
    }
}
async function run() {
    const sock = new zmq.Reply()

    await sock.bind("tcp://0:40000")
    console.log("Worker connected to port 40000")
    for await (const [msg] of sock) {
        console.log(msg, msg.toString(), 22222222)
        let data = JSON.parse(msg.toString())
        if (data.type == 1) {
            await sock.send(JSON.stringify({ ret: 0, mes: "ok" }))
            await insertData(data)
        }
    }
}

run()

