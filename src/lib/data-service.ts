/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados, conectando-se
 * a um banco de dados PostgreSQL para persistir os dados da aplicação.
 */
import 'server-only';
import type { Subject, Teacher, Review } from './types';
import { pool } from './db';

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
            console.log("Iniciando verificação e migração do banco de dados...");

            // 1. Criar tabelas com o novo esquema, se não existirem
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
                    text TEXT NOT NULL,
                    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
                    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                    upvotes INTEGER NOT NULL DEFAULT 0,
                    downvotes INTEGER NOT NULL DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                );
            `);
            
            const teachersTableHasSubjectId = await client.query(`
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='teachers' AND column_name='subject_id';
            `).then(res => res.rowCount > 0);

            if (teachersTableHasSubjectId) {
                console.log("Detectado esquema antigo. Iniciando migração de dados...");
                
                // Renomear tabelas antigas
                await client.query('ALTER TABLE reviews RENAME TO reviews_old;');
                await client.query('ALTER TABLE teachers RENAME TO teachers_old;');

                // Criar novas tabelas com o esquema correto
                await client.query(`
                    CREATE TABLE teachers (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) UNIQUE NOT NULL
                    );
                `);
                 await client.query(`
                    CREATE TABLE reviews (
                        id SERIAL PRIMARY KEY,
                        text TEXT NOT NULL,
                        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                        teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
                        subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
                        upvotes INTEGER NOT NULL DEFAULT 0,
                        downvotes INTEGER NOT NULL DEFAULT 0,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
                    );
                `);

                // Migrar professores primeiro
                await client.query(`
                    INSERT INTO teachers (name)
                    SELECT DISTINCT name FROM teachers_old
                    ON CONFLICT (name) DO NOTHING;
                `);
                
                // Agora migrar avaliações, associando com os novos IDs
                await client.query(`
                    INSERT INTO reviews (id, text, rating, teacher_id, subject_id, upvotes, downvotes, created_at)
                    SELECT 
                        r_old.id, 
                        r_old.text, 
                        r_old.rating, 
                        t_new.id,
                        t_old.subject_id,
                        r_old.upvotes,
                        r_old.downvotes,
                        r_old.created_at
                    FROM reviews_old r_old
                    JOIN teachers_old t_old ON r_old.teacher_id = t_old.id
                    JOIN teachers t_new ON t_old.name = t_new.name;
                `);

                // Remover tabelas antigas
                await client.query('DROP TABLE reviews_old;');
                await client.query('DROP TABLE teachers_old;');

                console.log("Migração de esquema concluída com sucesso.");
            }

            // Adicionar a coluna created_at se ela não existir
            const reviewsHasCreatedAt = await client.query(`
                SELECT 1 FROM information_schema.columns
                WHERE table_name='reviews' AND column_name='created_at';
            `).then(res => res.rowCount > 0);

            if (!reviewsHasCreatedAt) {
                console.log("Adicionando coluna 'created_at' à tabela 'reviews'.");
                await client.query('ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL');
            }

            // Sincronizar matérias do currículo
            const dbSubjectsResult = await client.query('SELECT name FROM subjects');
            const dbSubjectNames = dbSubjectsResult.rows.map(s => s.name);
            const subjectsToAdd = curriculumSubjects.filter(cs => !dbSubjectNames.includes(cs));

            if (subjectsToAdd.length > 0) {
                const insertQuery = 'INSERT INTO subjects (name) VALUES ' + subjectsToAdd.map((_, i) => `($${i + 1})`).join(', ');
                await client.query(insertQuery, subjectsToAdd);
                console.log(`Adicionadas ${subjectsToAdd.length} novas matérias.`);
            }

            await client.query('COMMIT');
            console.log("Banco de dados inicializado e migrado com sucesso.");
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Erro durante a inicialização/migração do banco de dados:", error);
            // Redefinir a promessa em caso de erro para permitir nova tentativa
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
                r.id as review_id,
                r.text as review_text,
                r.rating as review_rating,
                r.upvotes as review_upvotes,
                r.downvotes as review_downvotes,
                r.created_at as review_created_at
            FROM subjects s
            LEFT JOIN (
                SELECT * FROM reviews 
                LEFT JOIN teachers ON reviews.teacher_id = teachers.id
            ) AS tr ON s.id = tr.subject_id
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
        return [];
    } finally {
        client.release();
    }
}


export async function addTeacherOrReview(data: {
  teacherName: string;
  subjectName: string;
  reviewText: string;
  reviewRating: number;
}): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [data.subjectName]);
        if (subjectResult.rowCount === 0) {
            throw new Error(`Matéria "${data.subjectName}" não encontrada.`);
        }
        const subjectId = subjectResult.rows[0].id;

        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1', [data.teacherName]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            const newTeacherResult = await client.query('INSERT INTO teachers (name) VALUES ($1) RETURNING id', [data.teacherName]);
            teacherId = newTeacherResult.rows[0].id;
        } else {
            teacherId = teacherResult.rows[0].id;
        }

        await client.query(
            'INSERT INTO reviews (text, rating, teacher_id, subject_id, created_at) VALUES ($1, $2, $3, $4, NOW())',
            [data.reviewText, data.reviewRating, teacherId, subjectId]
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
        const query = `
            SELECT 
                t.id as teacher_id,
                t.name as teacher_name,
                r.id as review_id,
                r.text as review_text,
                r.rating as review_rating,
                r.upvotes as review_upvotes,
                r.downvotes as review_downvotes,
                r.created_at as review_created_at,
                s.name as subject_name
            FROM teachers t
            LEFT JOIN reviews r ON t.id = r.teacher_id
            LEFT JOIN subjects s ON r.subject_id = s.id
            ORDER BY t.name, s.name;
        `;
        const result = await client.query(query);

        const teachersMap: Map<number, Teacher> = new Map();

        for (const row of result.rows) {
            let teacher = teachersMap.get(row.teacher_id);
            if (!teacher) {
                teacher = {
                    id: row.teacher_id,
                    name: row.teacher_name,
                    reviews: [],
                    averageRating: 0,
                    subjects: new Set<string>(),
                };
                teachersMap.set(row.teacher_id, teacher);
            }
            
            if (row.review_id && !teacher.reviews.some(r => r.id === row.review_id)) {
                teacher.reviews.push({
                    id: row.review_id,
                    text: row.review_text,
                    rating: row.review_rating,
                    upvotes: row.review_upvotes,
                    downvotes: row.review_downvotes,
                    createdAt: (row.review_created_at || new Date()).toISOString(),
                });
            }
            if(row.subject_name) {
                (teacher.subjects as Set<string>).add(row.subject_name);
            }
        }

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
