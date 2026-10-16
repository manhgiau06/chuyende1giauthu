import mysql from 'mysql2/promise';

const globalForDb = globalThis;

export const pool =
  globalForDb.mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST || '::1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'chuyende1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function getSystemConfig(key, defaultVal = null) {
  try {
    const row = await queryOne('SELECT `value` FROM system_configs WHERE `key` = ? LIMIT 1', [key]);
    return row ? row.value : defaultVal;
  } catch {
    return defaultVal;
  }
}

export default pool;
