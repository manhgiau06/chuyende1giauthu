import fs from 'fs';
import path from 'path';
import { pool, query } from '../src/lib/db.js';

async function exportDatabase() {
  let sql = '-- Khởi tạo CSDL chuyende1 cho Docker MySQL 8.4\n';
  sql += 'SET NAMES utf8mb4;\n';
  sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  const tables = await query('SHOW TABLES');
  for (const tRow of tables) {
    const table = Object.values(tRow)[0];
    const [createRow] = await query('SHOW CREATE TABLE ' + pool.escapeId(table));
    const createSql = createRow['Create Table']
      // MySQL 8.4 compatibility for utf8mb4 collations
      .replace(/utf8mb4_0900_ai_ci/g, 'utf8mb4_unicode_ci');

    sql += `DROP TABLE IF EXISTS ${pool.escapeId(table)};\n`;
    sql += `${createSql};\n\n`;

    const rows = await query('SELECT * FROM ' + pool.escapeId(table));
    if (rows.length > 0) {
      const cols = Object.keys(rows[0])
        .map((c) => pool.escapeId(c))
        .join(', ');
      for (const r of rows) {
        const vals = Object.values(r)
          .map((v) => pool.escape(v))
          .join(', ');
        sql += `INSERT INTO ${pool.escapeId(table)} (${cols}) VALUES (${vals});\n`;
      }
      sql += '\n';
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

  const outDir = path.resolve(process.cwd(), '..', 'docker', 'mysql');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'init.sql');
  fs.writeFileSync(outFile, sql, 'utf8');
  console.log(`>> Da xuat CSDL thanh cong ra: ${outFile} (${sql.length} bytes)`);
  process.exit(0);
}

exportDatabase().catch((err) => {
  console.error('Loi xuat CSDL:', err);
  process.exit(1);
});
