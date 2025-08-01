
/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados, conectando-se
 * a um banco de dados PostgreSQL para persistir os dados da aplicação.
 */
import 'server-only';
import type { Subject, Teacher, Review } from './types';
import { pool } from './db';


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


export async function getSubjects(): Promise<Subject[]> {
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
                tr.created_at as review_created_at
            FROM subjects s
            LEFT JOIN (
                SELECT 
                    reviews.id,
                    reviews.text, 
                    reviews.rating,
                    reviews.upvotes, 
                    reviews.downvotes,
                    reviews.created_at,
                    reviews.teacher_id, 
                    reviews.subject_id
                FROM reviews
                JOIN teachers ON reviews.teacher_id = teachers.id
                WHERE reviews.reported = false AND teachers.name != 'Noemi Rosa'
            ) tr ON s.id = tr.subject_id
            LEFT JOIN teachers t ON tr.teacher_id = t.id
            WHERE t.name IS NULL OR t.name != 'Noemi Rosa'
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
                        createdAt: (row.created_at || new Date()).toISOString(),
                        report_count: 0,
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find or create the teacher
        let teacherResult = await client.query('SELECT id FROM teachers WHERE name = $1', [data.teacherName]);
        let teacherId;
        if (teacherResult.rowCount === 0) {
            const newTeacherResult = await client.query('INSERT INTO teachers (name) VALUES ($1) RETURNING id', [data.teacherName]);
            teacherId = newTeacherResult.rows[0].id;
        } else {
            teacherId = teacherResult.rows[0].id;
        }

        // For each subject, check for duplicates and then create the review
        for (const subjectName of data.subjectNames) {
            let subjectId;
            const subjectResult = await client.query('SELECT id FROM subjects WHERE name = $1', [subjectName]);
            if (subjectResult.rowCount === 0) {
                // If subject doesn't exist, create it.
                const newSubjectResult = await client.query('INSERT INTO subjects (name) VALUES ($1) RETURNING id', [subjectName]);
                subjectId = newSubjectResult.rows[0].id;
            } else {
                subjectId = subjectResult.rows[0].id;
            }
            
            if(data.reviewText.trim()) {
                const duplicateCheck = await client.query(
                    'SELECT id FROM reviews WHERE teacher_id = $1 AND subject_id = $2 AND text = $3 AND reported = false',
                    [teacherId, subjectId, data.reviewText]
                );
                
                if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
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
        if (error instanceof Error && error.message.includes("idêntica")) {
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
        // Simple report: just increments the count and sets the flag.
        // More complex logic (like checking if user already reported) is removed for simplicity.
        await client.query(
            'UPDATE reviews SET reported = true, report_count = report_count + 1 WHERE id = $1',
            [reviewId]
        );
    } catch (error) {
        console.error("Erro ao denunciar avaliação:", error);
        throw new Error("Falha ao registrar a denúncia.");
    } finally {
        client.release();
    }
}


export async function getAllTeachers(): Promise<{ id: number; name: string }[]> {
    const client = await pool.connect();
    try {
        const result = await client.query("SELECT id, name FROM teachers WHERE name != 'Noemi Rosa' ORDER BY name");
        return result.rows;
    } catch (error) {
        console.error("Erro ao buscar todos os professores:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function getTeachersWithGlobalStats(): Promise<Teacher[]> {
    const client = await pool.connect();
    try {
        // First, get all teachers to ensure everyone is listed, even those with no reviews yet.
        const allTeachersResult = await client.query("SELECT id, name FROM teachers WHERE name != 'Noemi Rosa' ORDER BY name");
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
                r.created_at as review_created_at,
                r.report_count as review_report_count,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = false AND t.name != 'Noemi Rosa'
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
                        createdAt: (row.created_at || new Date()).toISOString(),
                        report_count: row.review_report_count,
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

export async function getRecentReviews(): Promise<Review[]> {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = false AND r.text IS NOT NULL AND r.text <> '' AND t.name != 'Noemi Rosa'
            ORDER BY r.created_at DESC
            LIMIT 5;
        `;
        const result = await client.query(query);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text,
            rating: row.rating,
            upvotes: row.upvotes,
            downvotes: row.downvotes,
            report_count: 0, // Not needed for this view
            createdAt: (row.created_at || new Date()).toISOString(),
            teacherName: row.teacher_name,
            subjectName: row.subject_name,
        }));
    } catch (error) {
        console.error("Erro ao buscar avaliações recentes:", error);
        return [];
    } finally {
        client.release();
    }
}


export async function getReportedReviews(): Promise<Review[]> {
    const client = await pool.connect();
    try {
        const query = `
            SELECT
                r.id,
                r.text,
                r.rating,
                r.upvotes,
                r.downvotes,
                r.report_count,
                r.created_at,
                t.name as teacher_name,
                s.name as subject_name
            FROM reviews r
            JOIN teachers t ON r.teacher_id = t.id
            JOIN subjects s ON r.subject_id = s.id
            WHERE r.reported = true
            ORDER BY r.report_count DESC, r.created_at ASC;
        `;
        const result = await client.query(query);
        return result.rows.map(row => ({
            id: row.id,
            text: row.text,
            rating: row.rating,
            upvotes: row.upvotes,
            downvotes: row.downvotes,
            report_count: row.report_count,
            createdAt: (row.created_at || new Date()).toISOString(),
            teacherName: row.teacher_name,
            subjectName: row.subject_name,
        }));
    } catch (error) {
        console.error("Erro ao buscar avaliações denunciadas:", error);
        return [];
    } finally {
        client.release();
    }
}

export async function approveReport(reviewId: number): Promise<void> {
    const client = await pool.connect();
    const APPROVAL_THRESHOLD = 5;

    try {
        await client.query('BEGIN');

        const updateResult = await client.query(
            'UPDATE reviews SET report_count = report_count + 1 WHERE id = $1 RETURNING report_count',
            [reviewId]
        );
        
        if (updateResult.rows.length === 0) {
            throw new Error('Avaliação não encontrada.');
        }

        const newApprovalCount = updateResult.rows[0].report_count;
        if (newApprovalCount >= APPROVAL_THRESHOLD) {
            await client.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao aprovar denúncia:", error);
        throw new Error('Falha ao aprovar denúncia.');
    } finally {
        client.release();
    }
}
