import 'server-only';
import { Pool } from 'pg';

// A instância do Pool será criada apenas uma vez e reutilizada
// em todas as chamadas de função do servidor.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
