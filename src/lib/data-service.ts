/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados, conectando-se
 * a um banco de dados PostgreSQL para persistir os dados da aplicação.
 */
import 'server-only';
import type { Subject, Teacher, Review } from './types';
import { pool } from './db';

const iconNameMap: Record<string, string> = {
    'Matemática': 'Sigma',
    'Ciências': 'FlaskConical',
    'História': 'ScrollText',
    'Literatura': 'BookOpen',
    'Arte': 'Palette',
};

function assignIconName(subjectName: string): string {
    return iconNameMap[subjectName] || 'GraduationCap';
}

/**
 * Garante que as tabelas necessárias existam no banco de dados.
 * Cria as tabelas se elas ainda não tiverem sido criadas.
 */
async function ensureDbTablesExist() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE(name, subject_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
        upvotes INTEGER NOT NULL DEFAULT 0,
        downvotes INTEGER NOT NULL DEFAULT 0
      );
    `);
    
    // Add columns if they don't exist
    const reviewColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='reviews' AND column_name IN ('upvotes', 'downvotes');
    `);
    const existingCols = reviewColumns.rows.map(r => r.column_name);
    if (!existingCols.includes('upvotes')) {
      await client.query('ALTER TABLE reviews ADD COLUMN upvotes INTEGER NOT NULL DEFAULT 0;');
    }
    if (!existingCols.includes('downvotes')) {
      await client.query('ALTER TABLE reviews ADD COLUMN downvotes INTEGER NOT NULL DEFAULT 0;');
    }


    // Check if 'author' column exists and drop it if it does
    const authorColumnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='reviews' AND column_name='author';
    `);
    if(authorColumnCheck.rowCount > 0) {
        await client.query('ALTER TABLE reviews DROP COLUMN author;');
    }
    
    console.log("Verificação de tabelas concluída. As tabelas necessárias existem.");
  } catch (error) {
    console.error("Erro ao criar ou verificar as tabelas do banco de dados:", error);
    throw new Error("Não foi possível inicializar o banco de dados.");
  } finally {
    client.release();
  }
}

/**
 * Busca todas as matérias, seus professores e avaliações do banco de dados.
 */
export async function getSubjects(): Promise<Subject[]> {
  // Garante que as tabelas existem antes de tentar buscar os dados
  await ensureDbTablesExist();
  
  console.log("Buscando dados do banco de dados PostgreSQL...");
  const client = await pool.connect();
  try {
    const subjectsResult = await client.query('SELECT * FROM subjects ORDER BY name');
    const teachersResult = await client.query('SELECT * FROM teachers');
    const reviewsResult = await client.query('SELECT * FROM reviews');

    const reviewsByTeacherId = reviewsResult.rows.reduce((acc, review) => {
      if (!acc[review.teacher_id]) {
        acc[review.teacher_id] = [];
      }
      acc[review.teacher_id].push({
        id: review.id,
        rating: review.rating,
        text: review.text,
        upvotes: review.upvotes,
        downvotes: review.downvotes,
      });
      return acc;
    }, {} as Record<number, Review[]>);

    const teachersBySubjectId = teachersResult.rows.reduce((acc, teacher) => {
        if (!acc[teacher.subject_id]) {
            acc[teacher.subject_id] = [];
        }
        acc[teacher.subject_id].push({
            id: teacher.id,
            name: teacher.name,
            subject: '', // Placeholder, will be set later if needed
            reviews: reviewsByTeacherId[teacher.id] || [],
        });
        return acc;
    }, {} as Record<number, Teacher[]>);


    const subjects: Subject[] = subjectsResult.rows.map(subject => ({
      id: subject.id,
      name: subject.name,
      iconName: assignIconName(subject.name),
      teachers: (teachersBySubjectId[subject.id] || []).map(t => ({...t, subject: subject.name })),
    }));

    return subjects;

  } catch (error) {
    console.error("Erro ao buscar dados do PostgreSQL:", error);
    // Em caso de erro, retorna uma estrutura de dados vazia para não quebrar a UI
    return [];
  } finally {
    client.release();
  }
}

/**
 * Adiciona um novo professor ou uma nova avaliação para um professor existente no banco de dados.
 */
export async function addTeacherOrReview(data: {
  teacherName: string;
  subjectName: string;
  reviewText: string;
  reviewRating: number;
}): Promise<void> {
    // Garante que as tabelas existem antes de tentar adicionar dados
    await ensureDbTablesExist();
    
    console.log("Adicionando professor/avaliação no banco de dados PostgreSQL...", data);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Encontra ou cria a matéria
        let subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [data.subjectName]);
        let subjectId;
        if (subjectResult.rowCount === 0) {
            const newSubjectResult = await client.query('INSERT INTO subjects (name) VALUES ($1) RETURNING id', [data.subjectName]);
            subjectId = newSubjectResult.rows[0].id;
        } else {
            subjectId = subjectResult.rows[0].id;
        }

        // 2. Encontra ou cria o professor
        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1 AND subject_id = $2', [data.teacherName, subjectId]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            const newTeacherResult = await client.query('INSERT INTO teachers (name, subject_id) VALUES ($1, $2) RETURNING id', [data.teacherName, subjectId]);
            teacherId = newTeacherResult.rows[0].id;
        } else {
            teacherId = teacherResult.rows[0].id;
        }

        // 3. Insere a avaliação
        await client.query(
            'INSERT INTO reviews (text, rating, teacher_id) VALUES ($1, $2, $3)',
            [data.reviewText, data.reviewRating, teacherId]
        );

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao adicionar professor/avaliação:", error);
        throw new Error("Falha ao salvar os dados no banco de dados.");
    } finally {
        client.release();
    }
}

/**
 * Deleta uma avaliação do banco de dados.
 */
export async function deleteReview(reviewId: number): Promise<void> {
    console.log(`Deletando avaliação com ID: ${reviewId}`);
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        throw new Error("Falha ao deletar a avaliação do banco de dados.");
    } finally {
        client.release();
    }
}

/**
 * Atualiza o nome de uma matéria no banco de dados.
 */
export async function updateSubjectName(subjectId: number, newName: string): Promise<void> {
    console.log(`Atualizando matéria com ID ${subjectId} para o novo nome: ${newName}`);
    const client = await pool.connect();
    try {
        await client.query('UPDATE subjects SET name = $1 WHERE id = $2', [newName, subjectId]);
    } catch (error) {
        console.error("Erro ao atualizar o nome da matéria:", error);
        if ((error as any).code === '23505') { // unique_violation
            throw new Error("Uma matéria com este nome já existe.");
        }
        throw new Error("Falha ao atualizar o nome da matéria no banco de dados.");
    } finally {
        client.release();
    }
}

/**
 * Incrementa o contador de upvotes de uma avaliação.
 */
export async function upvoteReview(reviewId: number): Promise<void> {
    console.log(`Upvoting review com ID: ${reviewId}`);
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET upvotes = upvotes + 1 WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao dar upvote na avaliação:", error);
        throw new Error("Falha ao registrar o voto.");
    } finally {
        client.release();
    }
}

/**
 * Incrementa o contador de downvotes de uma avaliação.
 */
export async function downvoteReview(reviewId: number): Promise<void> {
    console.log(`Downvoting review com ID: ${reviewId}`);
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET downvotes = downvotes + 1 WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao dar downvote na avaliação:", error);
        throw new Error("Falha ao registrar o voto.");
    } finally {
        client.release();
    }
}
