const fs = require('fs');
const path = require('path');

// Read the SQL migration file
const migrationPath = path.join(__dirname, 'database', 'migrations', 'create_ai_teacher_sessions.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('AI Teacher Sessions Migration SQL:');
console.log('=================================');
console.log(migrationSQL);
console.log('=================================');
console.log('Please run this SQL in your Supabase SQL editor or database client.');