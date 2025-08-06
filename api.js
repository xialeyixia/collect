const express = require('express')
const mysql = require('mysql2/promise')
const app = express()
const PORT = 39999
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'Tity*963.',
    database: 'collect_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})
app.get('/api/table', async (req, res) => {
    try {
        const dbName = 'collect_db'
        const query = `
    SELECT TABLE_NAME 
    FROM TABLES 
    WHERE TABLE_SCHEMA = ?
  `

        // 从连接池获取连接
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('获取数据库连接失败:', err)
                return res.status(500).json({ error: '数据库连接失败' })
            }

            // 执行查询
            connection.query(query, [dbName], (error, results) => {
                // 释放连接回连接池
                connection.release()

                if (error) {
                    console.error('查询失败:', error)
                    return res.status(500).json({ error: '数据库查询失败' })
                }

                // 提取表名到数组
                const tables = results.map((row) => row.TABLE_NAME)
                console.log(tables, 1111111)
                res.json({
                    ret: 0,
                    data: tables,
                })
            })
        })
    } catch (err) {
        console.error('查询失败:', err)
        res.status(500).json({ success: false, error: '数据库查询失败' })
    }
})
app.get('/api/data', async (req, res) => {
    try {
        // 获取分页参数并设置默认值
        const page = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.pageSize) || 20

        // 计算偏移量
        const offset = (page - 1) * pageSize

        // 获取排序参数（可选）
        const sortField = req.query.sort || 'timestamp'
        const sortOrder = req.query.order || 'DESC'

        // 验证排序字段防止SQL注入
        const validSortFields = ['id', 'sensor_id', 'value', 'timestamp']
        if (!validSortFields.includes(sortField)) {
            return res.status(400).json({ success: false, error: '无效的排序字段' })
        }

        // 验证排序方向
        const validSortOrders = ['ASC', 'DESC']
        if (!validSortOrders.includes(sortOrder.toUpperCase())) {
            return res.status(400).json({ success: false, error: '无效的排序方向' })
        }

        // 获取过滤条件（可选）
        const sensorId = req.query.sensor_id
        const startDate = req.query.start_date
        const endDate = req.query.end_date

        // 构建查询条件
        let whereClause = ''
        const params = []

        if (sensorId) {
            whereClause += ' AND sensor_id = ?'
            params.push(sensorId)
        }

        if (startDate) {
            whereClause += ' AND timestamp >= ?'
            params.push(startDate)
        }

        if (endDate) {
            whereClause += ' AND timestamp <= ?'
            params.push(endDate)
        }

        // 移除开头的 " AND " 如果有条件
        if (whereClause) {
            whereClause = 'WHERE ' + whereClause.substring(5)
        }

        // 查询数据
        const [rows] = await pool.query(
            `SELECT * FROM sensor_data 
       ${whereClause}
       ORDER BY ?? ${sortOrder}
       LIMIT ?, ?`,
            [sortField, offset, pageSize]
        )

        // 查询总数
        const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM sensor_data ${whereClause}`, params)

        const totalItems = countResult[0].total
        const totalPages = Math.ceil(totalItems / pageSize)

        res.json({
            ret: 0,
            data: rows,
            pagination: {
                page,
                pageSize,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        })
    } catch (err) {
        console.error('查询失败:', err)
        res.status(500).json({ success: false, error: '数据库查询失败' })
    }
})

// 启动服务器
app.listen(PORT, () => {
    console.log(`API服务运行在 http://localhost:${PORT}`)
})
