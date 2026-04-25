import pool from './db';

export async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS agent_tasks (
        id VARCHAR(36) PRIMARY KEY,
        projectId VARCHAR(50) NOT NULL,
        projectName VARCHAR(100) NOT NULL,
        brief TEXT NOT NULL,
        status ENUM('queued','running','complete','failed','testing','passed') DEFAULT 'queued',
        logs LONGTEXT,
        claudeInstructions LONGTEXT,
        deploymentUrl VARCHAR(500),
        testStatus ENUM('pending','passed','failed') DEFAULT 'pending',
        testNotes TEXT,
        errorMessage TEXT,
        parentTaskId VARCHAR(36) NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completedAt DATETIME NULL,
        INDEX idx_projectId (projectId),
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt),
        INDEX idx_parentTaskId (parentTaskId)
      )
    `);
    console.log('✅ agent_tasks table created/verified');
  } finally {
    connection.release();
  }
}
