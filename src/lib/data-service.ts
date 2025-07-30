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
        subject_id INTEGER NOT NULL REFERENCES subjects(id),
        UNIQUE(name, subject_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        teacher_id INTEGER NOT NULL REFERENCES teachers(id)
      );
    `);
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
        author: review.author,
        rating: review.rating,
        text: review.text,
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
            reviews: reviewsByTeacherId[teacher.id] || [],
        });
        return acc;
    }, {} as Record<number, Teacher[]>);


    const subjects: Subject[] = subjectsResult.rows.map(subject => ({
      name: subject.name,
      iconName: assignIconName(subject.name),
      teachers: teachersBySubjectId[subject.id] || [],
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
  reviewAuthor: string;
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
            'INSERT INTO reviews (author, text, rating, teacher_id) VALUES ($1, $2, $3, $4)',
            [data.reviewAuthor, data.reviewText, data.reviewRating, teacherId]
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
