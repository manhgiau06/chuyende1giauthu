import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

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

// MySQL connection pool
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
    connectTimeout: 2000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPoolV3 = pool;
}

// Fallback SQLite instance for environments without running MySQL (like Windows without Docker)
let sqliteDb = null;
let useSqliteFallback = false;

function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  const sqliteModule = eval("require('node:sqlite')");
  const { DatabaseSync } = sqliteModule;
  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    // If database.sqlite doesn't exist yet, run init-sqlite
    try {
      require(path.resolve(process.cwd(), 'scripts/init-sqlite.js'));
    } catch (e) {
      console.warn('Could not auto-run init-sqlite:', e.message);
    }
  }

  sqliteDb = new DatabaseSync(dbPath);
  
  // Register MySQL custom functions in SQLite
  try {
    sqliteDb.function('now', () => new Date().toISOString().slice(0, 19).replace('T', ' '));
    sqliteDb.function('concat', (...args) => args.join(''));
  } catch {}

  return sqliteDb;
}

let innoDbChecked = globalForDb.innoDbChecked || false;

async function checkDatabaseBackend() {
  if (useSqliteFallback) return;
  try {
    // Test MySQL connection with a quick ping
    const conn = await pool.getConnection();
    conn.release();
  } catch (err) {
    if (!useSqliteFallback) {
      console.log('>> MySQL server khong kha dung (ECONNREFUSED). Tu dong su dung co so du lieu SQLite noi bo (database.sqlite)!');
      useSqliteFallback = true;
    }
  }
}

export async function query(sql, params = []) {
  await checkDatabaseBackend();

  if (useSqliteFallback) {
    const sdb = getSqliteDb();
    const cleanSql = sql.trim();
    const isSelect = /^SELECT\b/i.test(cleanSql) || /^PRAGMA\b/i.test(cleanSql);

    // Format params: replace undefined with null, convert Date to string
    const safeParams = params.map(p => {
      if (p === undefined) return null;
      if (p instanceof Date) return p.toISOString().slice(0, 19).replace('T', ' ');
      return p;
    });

    if (isSelect) {
      const stmt = sdb.prepare(cleanSql);
      const rows = stmt.all(...safeParams);
      return rows;
    } else {
      const stmt = sdb.prepare(cleanSql);
      const info = stmt.run(...safeParams);
      const res = [{
        insertId: Number(info.lastInsertRowid || 0),
        affectedRows: Number(info.changes || 0),
      }];
      res.insertId = Number(info.lastInsertRowid || 0);
      res.affectedRows = Number(info.changes || 0);
      return res;
    }
  }

  // MySQL query
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

export async function withTransaction(callback) {
  await checkDatabaseBackend();

  if (useSqliteFallback) {
    const sdb = getSqliteDb();
    sdb.exec('BEGIN TRANSACTION;');
    try {
      const tx = {
        query: async (sql, params = []) => query(sql, params),
        queryOne: async (sql, params = []) => queryOne(sql, params),
      };
      const result = await callback(tx);
      sdb.exec('COMMIT;');
      return result;
    } catch (err) {
      sdb.exec('ROLLBACK;');
      throw err;
    }
  }

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
