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

let innoDbChecked = globalForDb.innoDbCheckedV3 || false;

async function ensureInnoDB() {
  if (innoDbChecked) return;
  innoDbChecked = true;
  globalForDb.innoDbCheckedV3 = true;
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`book_maintenance_logs\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`book_copy_id\` bigint unsigned NOT NULL,
        \`book_id\` bigint unsigned NOT NULL,
        \`librarian_id\` bigint unsigned DEFAULT NULL,
        \`action_type\` varchar(50) NOT NULL DEFAULT 'recover_cover',
        \`cover_type\` varchar(50) DEFAULT 'plastic_glossy',
        \`condition_before\` varchar(30) DEFAULT 'good',
        \`condition_after\` varchar(30) DEFAULT 'new',
        \`cost\` decimal(12,2) NOT NULL DEFAULT '5000.00',
        \`notes\` text,
        \`status\` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
        \`started_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`completed_at\` timestamp NULL DEFAULT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_maint_copy\` (\`book_copy_id\`),
        KEY \`idx_maint_book\` (\`book_id\`),
        KEY \`idx_maint_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).catch(() => {});

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`book_find_requests\` (
        \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
        \`reader_id\` bigint unsigned NOT NULL,
        \`book_title\` varchar(255) NOT NULL,
        \`author_or_publisher\` varchar(255) DEFAULT NULL,
        \`purpose\` enum('borrow','buy','both') NOT NULL DEFAULT 'both',
        \`description\` text,
        \`contact_phone\` varchar(50) DEFAULT NULL,
        \`status\` enum('pending','searching','found','unavailable') NOT NULL DEFAULT 'pending',
        \`matched_book_id\` bigint unsigned DEFAULT NULL,
        \`librarian_id\` bigint unsigned DEFAULT NULL,
        \`librarian_note\` text,
        \`notified_at\` timestamp NULL DEFAULT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_find_reader\` (\`reader_id\`),
        KEY \`idx_find_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).catch(() => {});

    const compositeIndexes = [
      ['book_copies', 'idx_book_copies_book_status', '(book_id, status)'],
      ['books', 'idx_books_cat_price', '(category_id, sale_price)'],
      ['borrow_tickets', 'idx_borrow_tickets_reader_status', '(reader_id, status)'],
      ['orders', 'idx_orders_reader_status', '(reader_id, order_status)'],
    ];
    for (const [table, idxName, cols] of compositeIndexes) {
      const [existing] = await pool.query(
        `SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
        [dbName, table, idxName]
      );
      if (!existing || existing.length === 0) {
        await pool.query(`CREATE INDEX ${idxName} ON ${table} ${cols}`).catch(() => {});
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
