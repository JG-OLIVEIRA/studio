
/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados, conectando-se
 * a um banco de dados PostgreSQL para persistir os dados da aplicação.
 */
import 'server-only';
import type { Subject, Teacher, Review } from './types';
import { pool } from './db';
import { moderateReviewFlow } from '@/ai/flows/moderate-review-flow';

const curriculumSubjects = [
    "Geometria Analítica", "Cálculo I", "Cálculo II", "Cálculo III", "Cálculo IV", "Álgebra", "Matemática Discreta", "Fundamentos da Computação",
    "Álgebra Linear", "Cálculo das Probabilidades", "Algoritmos e Est. de Dados I", "Linguagem de Programação I", "Física I",
    "Português Instrumental", "Algoritmos e Est. de Dados II", "Elementos de Lógica", "Linguagem de Programação II", "Teoria da Computação",
    "Cálculo Numérico", "Algoritmos em Grafos", "Engenharia de Software", "Arquitetura de Computadores I", "Física II",
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

const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
};


let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase() {
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            console.log("Iniciando verificação do banco de dados...");

            await client.query(`
                CREATE TABLE IF NOT EXISTS subjects (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL
                );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS teachers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL
                );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS reviews (
                    id SERIAL PRIMARY KEY,
                    text TEXT,
                    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
                    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                    upvotes INTEGER NOT NULL DEFAULT 0,
                    downvotes INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                );
            `);
            
            // Allow 'text' column to be NULL, but default to empty string.
            await client.query(`
                ALTER TABLE reviews 
                ALTER COLUMN text SET DEFAULT '',
                ALTER COLUMN text SET NOT NULL;
            `);

            // Add 'reported' column to reviews table if it doesn't exist
            const reportedColumnExists = await client.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='reviews' AND column_name='reported';
            `);
            if (reportedColumnExists.rowCount === 0) {
                await client.query(`
                    ALTER TABLE reviews 
                    ADD COLUMN reported BOOLEAN NOT NULL DEFAULT false;
                `);
                console.log("Coluna 'reported' adicionada à tabela 'reviews'.");
            }
            
            const dbSubjectsResult = await client.query('SELECT name FROM subjects');
            const dbSubjectNames = dbSubjectsResult.rows.map(s => s.name);
            const subjectsToAdd = curriculumSubjects.filter(cs => !dbSubjectNames.includes(cs));

            if (subjectsToAdd.length > 0) {
                const insertQuery = 'INSERT INTO subjects (name) VALUES ' + subjectsToAdd.map((_, i) => `($${i + 1})`).join(', ');
                await client.query(insertQuery, subjectsToAdd);
                console.log(`Adicionadas ${subjectsToAdd.length} novas matérias.`);
            }

            await client.query('COMMIT');
            console.log("Banco de dados verificado com sucesso.");
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Erro durante a inicialização do banco de dados:", error);
            initializationPromise = null;
            throw new Error("Não foi possível inicializar o banco de dados.");
        } finally {
            client.release();
        }
    })();

    return initializationPromise;
}


export async function getSubjects(): Promise<Subject[]> {
    await initializeDatabase();
    
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                s.id as subject_id,
                s.name as subject_name,
                t.id as teacher_id,
                t.name as teacher_name,
                tr.id as review_id,
                tr.text as review_text,
                tr.rating as review_rating,
                tr.upvotes as review_upvotes,
                tr.downvotes as review_downvotes,
                tr.reported as review_reported,
                tr.created_at as review_created_at
            FROM subjects s
            LEFT JOIN (
                SELECT 
                    reviews.id,
                    reviews.text, 
                    reviews.rating,
                    reviews.upvotes, 
                    reviews.downvotes,
                    reviews.reported,
                    reviews.created_at,
                    reviews.teacher_id, 
                    reviews.subject_id
                FROM reviews
                JOIN teachers ON reviews.teacher_id = teachers.id
                WHERE reviews.reported = false
            ) tr ON s.id = tr.subject_id
            LEFT JOIN teachers t ON tr.teacher_id = t.id
            ORDER BY s.name, t.name;
        `;
        
        const result = await client.query(query);

        const subjectsMap: Map<number, Subject> = new Map();
        const allSubjectsResult = await client.query('SELECT id, name FROM subjects ORDER BY name');
        for (const subjectRow of allSubjectsResult.rows) {
            subjectsMap.set(subjectRow.id, {
                id: subjectRow.id,
                name: subjectRow.name,
                iconName: assignIconName(subjectRow.name),
                teachers: [],
            });
        }
        
        const teachersMap: Map<string, Teacher> = new Map();

        for (const row of result.rows) {
            if (!row.subject_id) continue;

            const subject = subjectsMap.get(row.subject_id);
            if (!subject) continue;
            
            if (row.teacher_id) {
                const teacherKey = `${row.teacher_id}-${row.subject_id}`;
                let teacher = teachersMap.get(teacherKey);

                if (!teacher) {
                    teacher = {
                        id: row.teacher_id,
                        name: row.teacher_name,
                        subject: subject.name,
                        reviews: [],
                        averageRating: 0,
                    };
                    teachersMap.set(teacherKey, teacher);
                    subject.teachers.push(teacher);
                }

                if (row.review_id && !teacher.reviews.some(r => r.id === row.review_id)) {
                    teacher.reviews.push({
                        id: row.review_id,
                        text: row.review_text,
                        rating: row.review_rating,
                        upvotes: row.review_upvotes,
                        downvotes: row.review_downvotes,
                        reported: row.review_reported,
                        createdAt: (row.review_created_at || new Date()).toISOString(),
                    });
                }
            }
        }
        
        subjectsMap.forEach(subject => {
            subject.teachers.forEach(teacher => {
                teacher.averageRating = calculateAverageRating(teacher.reviews);
            });
        });

        return Array.from(subjectsMap.values());

    } catch (error) {
        console.error("Erro ao buscar dados do PostgreSQL:", error);
        throw error; // Re-throw the error to be caught by the caller
    } finally {
        client.release();
    }
}


export async function addTeacherOrReview(data: {
  teacherName: string;
  subjectNames: string[];
  reviewText: string;
  reviewRating: number;
}): Promise<void> {
    // 1. Moderate the review text before anything else, if text is provided.
    if(data.reviewText.trim()) {
        const moderationResult = await moderateReviewFlow({ reviewText: data.reviewText });
        if (moderationResult.isProblematic) {
            throw new Error(moderationResult.reason || "A avaliação foi considerada inadequada e não pode ser publicada.");
        }
    }
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 2. Find or create the teacher
        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1', [data.teacherName]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            const newTeacherResult = await client.query('INSERT INTO teachers (name) VALUES ($1) RETURNING id', [data.teacherName]);
            teacherId = newTeacherResult.rows[0].id;
        } else {
            teacherId = teacherResult.rows[0].id;
        }

        // 3. For each subject, check for duplicates and then create the review
        for (const subjectName of data.subjectNames) {
            const subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [subjectName]);
            if (subjectResult.rowCount === 0) {
                console.warn(`Matéria "${subjectName}" não encontrada. Pulando.`);
                continue; 
            }
            const subjectId = subjectResult.rows[0].id;

            // Anti-spam: Check for an identical review if text is provided.
             if(data.reviewText.trim()) {
                const duplicateCheck = await client.query(
                    'SELECT id FROM reviews WHERE teacher_id = $1 AND subject_id = $2 AND text = $3',
                    [teacherId, subjectId, data.reviewText]
                );

                if (duplicateCheck.rowCount > 0) {
                    // Throw an error that will be caught and shown to the user
                    throw new Error(`Uma avaliação idêntica para o professor ${data.teacherName} na matéria ${subjectName} já foi enviada.`);
                }
            }

            await client.query(
                'INSERT INTO reviews (text, rating, teacher_id, subject_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
                [data.reviewText || '', data.reviewRating, teacherId, subjectId]
            );
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao adicionar professor/avaliação:", error);
        // Re-throw the original error if it's from our logic, otherwise throw a generic one.
        if (error instanceof Error && (error.message.includes("inadequada") || error.message.includes("idêntica"))) {
            throw error;
        }
        throw new Error("Falha ao salvar os dados no banco de dados.");
    } finally {
        client.release();
    }
}

export async function upvoteReview(reviewId: number): Promise<void> {
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

export async function downvoteReview(reviewId: number): Promise<void> {
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

export async function reportReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET reported = true WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao denunciar avaliação:", error);
        throw new Error("Falha ao registrar a denúncia.");
    } finally {
        client.release();
    }
}

export async function getAllTeachers(): Promise<{ id: number; name: string }[]> {
    await initializeDatabase();
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, name FROM teachers ORDER BY name');
        return result.rows;
    } catch (error) {
        console.error("Erro ao buscar todos os professores:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function getTeachersWithGlobalStats(): Promise<Teacher[]> {
    await initializeDatabase();
    const client = await pool.connect();
    try {
        // First, get all teachers to ensure everyone is listed, even those with no reviews yet.
        const allTeachersResult = await client.query('SELECT id, name FROM teachers ORDER BY name');
        const teachersMap: Map<number, Teacher> = new Map();

        allTeachersResult.rows.forEach(t => {
            teachersMap.set(t.id, {
                id: t.id,
                name: t.name,
                reviews: [],
                averageRating: 0,
                subjects: new Set<string>(),
            });
        });

        // Then, fetch all non-reported reviews with their subject and teacher info.
        const reviewsQuery = `
            SELECT 
                t.id as teacher_id,
                t.name as teacher_name,
                r.id as review_id,
                r.text as review_text,
                r.rating as review_rating,
                r.upvotes as review_upvotes,
                r.downvotes as review_downvotes,
                r.reported as review_reported,
                r.created_at as review_created_at,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = false
            ORDER BY t.name, s.name;
        `;
        const reviewsResult = await client.query(reviewsQuery);

        // Populate reviews and subjects for each teacher.
        for (const row of reviewsResult.rows) {
            let teacher = teachersMap.get(row.teacher_id);
            if (teacher) {
                if (row.review_id && !teacher.reviews.some(r => r.id === row.review_id)) {
                    teacher.reviews.push({
                        id: row.review_id,
                        text: row.review_text,
                        rating: row.review_rating,
                        upvotes: row.review_upvotes,
                        downvotes: row.review_downvotes,
                        reported: row.review_reported,
                        createdAt: (row.created_at || new Date()).toISOString(),
                    });
                }
                if (row.subject_name) {
                    (teacher.subjects as Set<string>).add(row.subject_name);
                }
            }
        }

        // Calculate average rating for each teacher based on their collected reviews.
        const teacherList = Array.from(teachersMap.values());
        for (const teacher of teacherList) {
            teacher.averageRating = calculateAverageRating(teacher.reviews);
        }

        return teacherList;

    } catch (error) {
        console.error("Erro ao buscar professores com estatísticas globais:", error);
        return [];
    } finally {
        client.release();
    }
}

// Admin Data Service Functions

export async function getReportedReviews(): Promise<(Review & { teacherName: string, subjectName: string })[]> {
    await initializeDatabase();
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.reported,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = true
            ORDER BY r.created_at DESC;
        `;
        const result = await client.query(query);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text,
            rating: row.rating,
            upvotes: row.upvotes,
            downvotes: row.downvotes,
            reported: row.reported,
            createdAt: (row.created_at || new Date()).toISOString(),
            teacherName: row.teacher_name,
            subjectName: row.subject_name
        }));
    } catch (error) {
        console.error("Erro ao buscar avaliações denunciadas:", error);
        throw new Error("Falha ao buscar dados de moderação.");
    } finally {
        client.release();
    }
}

export async function getAllReviewsForModeration(): Promise<(Review & { teacherName: string; subjectName: string; })[]> {
    await initializeDatabase();
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.reported,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id;
        `;
         const result = await client.query(query);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text,
            rating: row.rating,
            upvotes: row.upvotes,
            downvotes: row.downvotes,
            reported: row.reported,
            createdAt: (row.created_at || new Date()).toISOString(),
            teacherName: row.teacher_name,
            subjectName: row.subject_name
        }));
    } catch (error) {
        console.error("Erro ao buscar todas as avaliações para moderação:", error);
        throw new Error("Falha ao buscar dados para moderação de IA.");
    } finally {
        client.release();
    }
}

export async function approveReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('UPDATE reviews SET reported = false WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao aprovar avaliação:", error);
        throw new Error("Falha ao aprovar a avaliação no banco de dados.");
    } finally {
        client.release();
    }
}

export async function deleteReview(reviewId: number): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        throw new Error("Falha ao deletar a avaliação no banco de dados.");
    } finally {
        client.release();
    }
}


export async function getDashboardStats() {
    await initializeDatabase();
    const client = await pool.connect();
    try {
        const teachersQuery = client.query('SELECT COUNT(*) FROM teachers;');
        const reviewsQuery = client.query('SELECT COUNT(*) FROM reviews;');
        const subjectsQuery = client.query('SELECT COUNT(*) FROM subjects;');
        const reportedQuery = client.query('SELECT COUNT(*) FROM reviews WHERE reported = true;');
        
        const [teachersResult, reviewsResult, subjectsResult, reportedResult] = await Promise.all([
            teachersQuery,
            reviewsQuery,
            subjectsQuery,
            reportedQuery
        ]);

        return {
            totalTeachers: parseInt(teachersResult.rows[0].count, 10),
            totalReviews: parseInt(reviewsResult.rows[0].count, 10),
            totalSubjects: parseInt(subjectsResult.rows[0].count, 10),
            reportedReviews: parseInt(reportedResult.rows[0].count, 10)
        };
    } catch (error) {
        console.error("Erro ao buscar estatísticas do dashboard:", error);
        throw new Error("Falha ao buscar os dados do dashboard.");
    } finally {
        client.release();
    }
}

export async function getRecentReviews(limit = 5): Promise<(Review & { teacherName: string, subjectName: string })[]> {
     await initializeDatabase();
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.reported,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            ORDER BY r.created_at DESC
            LIMIT $1;
        `;
        const result = await client.query(query, [limit]);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text,
            rating: row.rating,
            upvotes: row.upvotes,
            downvotes: row.downvotes,
            reported: row.reported,
            createdAt: (row.created_at || new Date()).toISOString(),
            teacherName: row.teacher_name,
            subjectName: row.subject_name
        }));
    } catch (error) {
        console.error("Erro ao buscar avaliações recentes:", error);
        throw new Error("Falha ao buscar as avaliações mais recentes.");
    } finally {
        client.release();
    }
}
