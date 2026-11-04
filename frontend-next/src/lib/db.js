import mysql from 'mysql2/promise';

const globalForDb = globalThis;

export class HttpError extends Error {
  constructor(message, status = 422) {
    super(message);
    this.status = status;
  }
}

const resolvedHost =
  !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '::1'
    ? '127.0.0.1'
    : process.env.DB_HOST;

export const pool =
  globalForDb.mysqlPoolV3 ||
  mysql.createPool({
    host: resolvedHost,
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'chuyende1_user',
    password: process.env.DB_PASSWORD ?? 'Matkhau@123',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'chuyende1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPoolV3 = pool;
}

let innoDbChecked = globalForDb.innoDbChecked || false;

async function ensureInnoDB() {
  if (innoDbChecked) return;
  innoDbChecked = true;
  globalForDb.innoDbChecked = true;
  try {
    const dbName = process.env.DB_NAME || process.env.DB_DATABASE || 'chuyende1';
    const [myisamTables] = await pool.query(
      `SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND ENGINE = 'MyISAM'`,
      [dbName]
    );
    for (const row of myisamTables) {
      if (row.tableName) {
        await pool.query(`ALTER TABLE ${pool.escapeId(row.tableName)} ENGINE=InnoDB`);
      }
    }
  } catch {
    innoDbChecked = false;
    globalForDb.innoDbChecked = false;
  }
}

export async function query(sql, params = []) {
  await ensureInnoDB();
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function withTransaction(callback) {
  await ensureInnoDB();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const tx = {
      query: async (sql, params = []) => {
        const [rows] = await conn.query(sql, params);
        return rows;
      },
      queryOne: async (sql, params = []) => {
        const [rows] = await conn.query(sql, params);
        return rows[0] || null;
      },
    };
    const result = await callback(tx);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
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
