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

const curriculumSubjects = [
    "Geometria Analítica", "Cálculo I", "Álgebra", "Matemática Discreta", "Fundamentos da Computação",
    "Álgebra Linear", "Cálculo II", "Cálculo das Probabilidades", "Algoritmos e Est. de Dados I", "Linguagem de Programação I", "Física I",
    "Português Instrumental", "Cálculo III", "Algoritmos e Est. de Dados II", "Elementos de Lógica", "Linguagem de Programação II", "Teoria da Computação",
    "Cálculo Numérico", "Cálculo IV", "Algoritmos em Grafos", "Engenharia de Software", "Arquitetura de Computadores I", "Física II",
    "Estruturas de Linguagens", "Banco de Dados I", "Otimização em Grafos", "Análise e Proj. de Sistemas", "Sistemas Operacionais I", "Arquitetura de Computadores II", "Eletiva Básica",
    "Otimização Combinatória", "Banco de Dados II", "Interfaces Humano-Comp.", "Eletiva I", "Sistemas Operacionais II", "Compiladores",
    "Computação Gráfica", "Inteligência Artificial", "Ética Comp. e Sociedade", "Metod. Cient. no Projeto Final", "Redes de Computadores I", "Arq. Avançadas de Computadores",
    "Eletiva II", "Eletiva III", "Projeto Final", "Sistemas Distribuídos", "Eletiva IV"
];

function assignIconName(subjectName: string): string {
    const name = subjectName.toLowerCase();
    if (name.includes('cálculo') || name.includes('matemática') || name.includes('geometria') || name.includes('álgebra')) return 'Sigma';
    if (name.includes('física')) return 'Atom';
    if (name.includes('computação') || name.includes('algoritmos') || name.includes('programação') || name.includes('sistemas') || name.includes('software') || name.includes('arquitetura') || name.includes('redes') || name.includes('dados') || name.includes('inteligência artificial')) return 'Laptop';
    if (name.includes('lógica')) return 'BrainCircuit';
    if (name.includes('grafos')) return 'GitGraph';
    return 'GraduationCap';
}

// Variável para garantir que a inicialização ocorra apenas uma vez.
let dbInitialized = false;

/**
 * Garante que as tabelas necessárias existam e sincroniza as matérias.
 * Esta função é chamada apenas uma vez para evitar deadlocks.
 */
async function initializeDatabase() {
    if (dbInitialized) return;

    const client = await pool.connect();
    try {
        // Criação de tabelas
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
                subject_id INTEGER NOT NULL,
                UNIQUE(name, subject_id)
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                teacher_id INTEGER NOT NULL,
                upvotes INTEGER NOT NULL DEFAULT 0,
                downvotes INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            );
        `);

        // Garante as constraints de ON DELETE CASCADE
        await client.query(`
            ALTER TABLE teachers 
            DROP CONSTRAINT IF EXISTS teachers_subject_id_fkey,
            ADD CONSTRAINT teachers_subject_id_fkey 
            FOREIGN KEY (subject_id) 
            REFERENCES subjects(id) 
            ON DELETE CASCADE;
        `);
        await client.query(`
            ALTER TABLE reviews 
            DROP CONSTRAINT IF EXISTS reviews_teacher_id_fkey,
            ADD CONSTRAINT reviews_teacher_id_fkey 
            FOREIGN KEY (teacher_id) 
            REFERENCES teachers(id) 
            ON DELETE CASCADE;
        `);

        console.log("Verificação de tabelas concluída e constraints corretas.");

        // Sincronização de matérias
        await client.query('BEGIN');
        const dbSubjectsResult = await client.query('SELECT id, name FROM subjects');
        const dbSubjectNames = dbSubjectsResult.rows.map(s => s.name);

        const subjectsToAdd = curriculumSubjects.filter(cs => !dbSubjectNames.includes(cs));
        if (subjectsToAdd.length > 0) {
            const insertQuery = 'INSERT INTO subjects (name) VALUES ' + subjectsToAdd.map((_, i) => `($${i + 1})`).join(', ');
            await client.query(insertQuery, subjectsToAdd);
            console.log(`Adicionadas ${subjectsToAdd.length} novas matérias ao DB.`);
        }

        const subjectsToRemove = dbSubjectsResult.rows.filter(ds => !curriculumSubjects.includes(ds.name));
        if (subjectsToRemove.length > 0) {
            const idsToRemove = subjectsToRemove.map(s => s.id);
            await client.query('DELETE FROM subjects WHERE id = ANY($1::int[])', [idsToRemove]);
            console.log(`Removidas ${subjectsToRemove.length} matérias obsoletas do DB.`);
        }
        await client.query('COMMIT');
        
        dbInitialized = true; // Marca como inicializado
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao inicializar o banco de dados:", error);
        throw new Error("Não foi possível inicializar o banco de dados.");
    } finally {
        client.release();
    }
}


/**
 * Busca todas as matérias, seus professores e avaliações do banco de dados.
 */
export async function getSubjects(): Promise<Subject[]> {
  await initializeDatabase();
  
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
        // Garante que a data seja uma string no formato ISO, que é segura para serialização
        createdAt: (review.created_at || new Date()).toISOString(),
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
    console.log("Adicionando professor/avaliação no banco de dados PostgreSQL...", data);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Encontra a matéria (não cria mais)
        let subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [data.subjectName]);
        if (subjectResult.rowCount === 0) {
            throw new Error(`Matéria "${data.subjectName}" não encontrada. A criação de novas matérias não é permitida.`);
        }
        const subjectId = subjectResult.rows[0].id;

        // 2. Encontra ou cria o professor
        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1 AND subject_id = $2', [data.teacherName, subjectId]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            // A criação de professores ainda é permitida dentro de matérias existentes
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
