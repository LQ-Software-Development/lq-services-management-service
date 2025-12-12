/**
 * Migration Script Runner
 * 
 * Este script executa a migração SQL para adicionar e popular o campo indexDay.
 * 
 * Uso:
 *   node migrations/run-migration.js
 * 
 * Requisitos:
 *   - pg (npm install pg)
 *   - Variáveis de ambiente configuradas (DATABASE_URL ou DB_HOST, DB_USER, etc.)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco de dados
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // Ou configure manualmente:
  // host: process.env.DB_HOST || 'localhost',
  // port: process.env.DB_PORT || 5432,
  // database: process.env.DB_NAME || 'your_database',
  // user: process.env.DB_USER || 'postgres',
  // password: process.env.DB_PASSWORD || 'password',
};

async function runMigration() {
  const client = new Client(dbConfig);

  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'add-index-day-field.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Executando migração...');
    console.log('-----------------------------------');
    
    // Executar a migração
    const result = await client.query(sql);
    
    console.log('-----------------------------------');
    console.log(`✅ Migração concluída com sucesso!`);
    console.log(`   Linhas afetadas: ${result.rowCount || 'N/A'}`);

    // Executar query de verificação
    console.log('\n📊 Verificando resultados...');
    const verifyQuery = `
      SELECT 
        "organizationId",
        DATE("date") as schedule_date,
        COUNT(*) as total_schedules,
        MIN("indexDay") as min_index,
        MAX("indexDay") as max_index
      FROM schedule
      WHERE "deletedAt" IS NULL
      GROUP BY "organizationId", DATE("date")
      ORDER BY "organizationId", schedule_date
      LIMIT 10;
    `;
    
    const verifyResult = await client.query(verifyQuery);
    
    if (verifyResult.rows.length > 0) {
      console.log('\n📋 Amostra dos resultados (primeiros 10):');
      console.table(verifyResult.rows);
    } else {
      console.log('⚠️  Nenhum schedule encontrado no banco.');
    }

  } catch (error) {
    console.error('❌ Erro ao executar migração:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar migração
console.log('🚀 Iniciando script de migração indexDay...\n');
runMigration()
  .then(() => {
    console.log('\n✨ Migração finalizada com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na migração:', error.message);
    process.exit(1);
  });
