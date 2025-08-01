import 'server-only';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// A instância do Pool será criada apenas uma vez e reutilizada
// em todas as chamadas de função do servidor.
// A DATABASE_URL do ambiente já contém todas as configurações necessárias.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
