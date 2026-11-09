const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function convertSqlite() {
  const initSqlPath = path.resolve(__dirname, '../../docker/mysql/init.sql');
  const dbPath = path.resolve(__dirname, '../database.sqlite');
  
  if (!fs.existsSync(initSqlPath)) {
    console.error('Cannot find init.sql at', initSqlPath);
    return;
  }

  const rawSql = fs.readFileSync(initSqlPath, 'utf8');
  
  // Clean statements
  const lines = rawSql.split(/\r?\n/);
  const statements = [];
  let currentStmt = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*')) continue;
    if (trimmed.startsWith('SET NAMES') || trimmed.startsWith('SET FOREIGN_KEY_CHECKS')) continue;

    currentStmt += line + '\n';
    if (trimmed.endsWith(';')) {
      statements.push(currentStmt.trim());
      currentStmt = '';
    }
  }

  // If database exists, remove and recreate
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = new DatabaseSync(dbPath);

  let success = 0;
  let errors = 0;

  for (let stmt of statements) {
    // Process CREATE TABLE
    if (/^CREATE\s+TABLE/i.test(stmt)) {
      // Clean table definition for SQLite
      stmt = stmt.replace(/ENGINE=InnoDB.*?;/gi, ';')
                 .replace(/DEFAULT\s+CHARSET=utf8mb4.*?;/gi, ';')
                 .replace(/COLLATE\s+utf8mb4_unicode_ci/gi, '')
                 .replace(/enum\([^)]+\)/gi, 'TEXT')
                 .replace(/bigint\s+unsigned/gi, 'INTEGER')
                 .replace(/int\s+unsigned/gi, 'INTEGER')
                 .replace(/tinyint\(\d+\)/gi, 'INTEGER')
                 .replace(/tinyint/gi, 'INTEGER')
                 .replace(/varchar\(\d+\)/gi, 'TEXT')
                 .replace(/decimal\(\d+,\s*\d+\)/gi, 'REAL')
                 .replace(/timestamp\s+NULL\s+DEFAULT\s+NULL/gi, 'TEXT')
                 .replace(/timestamp\s+NOT\s+NULL\s+DEFAULT\s+CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT CURRENT_TIMESTAMP')
                 .replace(/timestamp/gi, 'TEXT')
                 .replace(/AUTO_INCREMENT/gi, '');

      // Filter lines inside CREATE TABLE
      const tableLines = stmt.split('\n');
      const filteredLines = [];

      for (let tLine of tableLines) {
        const tr = tLine.trim();
        // Remove MySQL KEY indexes (SQLite doesn't support KEY inside CREATE TABLE)
        if (/^KEY\s+`[^`]+`/i.test(tr) || /^KEY\s+\w+/i.test(tr)) {
          continue;
        }
        // Format UNIQUE KEY to UNIQUE
        if (/^UNIQUE\s+KEY\s+`[^`]+`\s*(\([^)]+\))/i.test(tr)) {
          filteredLines.push(tLine.replace(/UNIQUE\s+KEY\s+`[^`]+`\s*(\([^)]+\))/i, 'UNIQUE $1'));
          continue;
        }
        filteredLines.push(tLine);
      }

      stmt = filteredLines.join('\n');
      // Fix trailing comma before close parenthesis
      stmt = stmt.replace(/,(\s*\))/g, '$1');
    }

    try {
      db.exec(stmt);
      success++;
    } catch (err) {
      errors++;
      console.warn('SQLite error on:', stmt.substring(0, 50), '->', err.message);
    }
  }

  console.log(`Initialized database.sqlite successfully: ${success} statements executed (${errors} ignored warnings).`);
  const booksCount = db.prepare('SELECT COUNT(*) as c FROM books').get();
  console.log(`Books in database: ${booksCount.c}`);
  const usersCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
  console.log(`Users in database: ${usersCount.c}`);
}

convertSqlite();
