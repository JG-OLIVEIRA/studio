/**
 * @file data-service.ts
 * 
 * Este arquivo atua como uma camada de serviço de dados. Ele abstrai a fonte de dados
 * da lógica da aplicação. Atualmente, ele usa dados mocados em memória, mas está
 * preparado para ser conectado a um banco de dados MySQL.
 * 
 * Para conectar ao MySQL:
 * 1. Instale um driver MySQL para Node.js (ex: `npm install mysql2`).
 * 2. Configure a conexão com o banco de dados nas variáveis de ambiente.
 * 3. Substitua a lógica mocada nas funções abaixo pelas suas queries SQL.
 */

import type { Subject, Teacher, Review } from './types';
import { BookOpen, FlaskConical, Palette, ScrollText, Sigma, GraduationCap } from 'lucide-react';

// ============================================================================
// DATABASE MOCADO (EM MEMÓRIA)
// ============================================================================
// Estes dados são usados para demonstração. Em um ambiente de produção,
// eles seriam buscados do seu banco de dados MySQL.
// ============================================================================
let subjectsData: Subject[] = [
  {
    name: 'Matemática',
    icon: Sigma,
    teachers: [],
  },
  {
    name: 'Ciências',
    icon: FlaskConical,
    teachers: [],
  },
  {
    name: 'História',
    icon: ScrollText,
    teachers: [],
  },
  {
    name: 'Literatura',
    icon: BookOpen,
    teachers: [],
  },
  {
    name: 'Arte',
    icon: Palette,
    teachers: [],
  },
];

// Helper para reatribuir ícones que não são serializáveis.
function assignIcons(subjects: Subject[]) {
    const iconMap = {
        'Matemática': Sigma,
        'Ciências': FlaskConical,
        'História': ScrollText,
        'Literatura': BookOpen,
        'Arte': Palette,
    };
    return subjects.map(subject => ({
        ...subject,
        icon: iconMap[subject.name as keyof typeof iconMap] || GraduationCap
    }));
}


// ============================================================================
// FUNÇÕES DO SERVIÇO DE DADOS
// ============================================================================
// Substitua o conteúdo destas funções pela sua lógica de banco de dados MySQL.
// ============================================================================

/**
 * Busca todas as matérias e seus professores.
 * 
 * @returns {Subject[]} Uma lista de matérias com os professores.
 * 
 * PLACEHOLDER PARA MYSQL:
 * - Conecte-se ao seu banco de dados.
 * - Execute uma query para buscar todas as matérias (`SELECT * FROM subjects`).
 * - Para cada matéria, execute uma query para buscar os professores e suas avaliações.
 *   (ex: `SELECT * FROM teachers LEFT JOIN reviews ON teachers.id = reviews.teacher_id WHERE teachers.subject_id = ?`)
 * - Mapeie os resultados para o formato `Subject[]`.
 */
export function getSubjects(): Subject[] {
  console.log("Buscando dados (atualmente da memória)...");
  // Apenas retorna os dados mocados.
  return assignIcons(JSON.parse(JSON.stringify(subjectsData)));
}

/**
 * Adiciona um novo professor ou uma nova avaliação para um professor existente.
 * 
 * @param data Os dados do formulário.
 * 
 * PLACEHOLDER PARA MYSQL:
 * - Conecte-se ao seu banco de dados.
 * - Verifique se a matéria existe (`SELECT id FROM subjects WHERE name = ?`). Se não, crie-a (`INSERT INTO subjects ...`).
 * - Verifique se o professor existe para essa matéria (`SELECT id FROM teachers WHERE name = ? AND subject_id = ?`).
 * - Se o professor não existir, crie-o (`INSERT INTO teachers ...`).
 * - Insira a nova avaliação na tabela de reviews (`INSERT INTO reviews ...`).
 * - Lembre-se de usar transações para garantir a consistência dos dados.
 */
export function addTeacherOrReview(data: {
  teacherName: string;
  subjectName: string;
  reviewAuthor: string;
  reviewText: string;
  reviewRating: number;
}): void {
    console.log("Adicionando professor/avaliação (atualmente na memória)...", data);
    
    let subject = subjectsData.find((s) => s.name.toLowerCase() === data.subjectName.toLowerCase());

    if (!subject) {
      const newSubject: Subject = {
        name: data.subjectName,
        icon: GraduationCap, // Ícone padrão para novas matérias
        teachers: []
      };
      subjectsData.push(newSubject);
      subject = newSubject;
    }
    
    let teacher = subject.teachers.find((t) => t.name.toLowerCase() === data.teacherName.toLowerCase());

    const newReview: Review = {
      id: Date.now(),
      author: data.reviewAuthor,
      rating: data.reviewRating,
      text: data.reviewText,
    };

    if (teacher) {
      teacher.reviews.push(newReview);
    } else {
      const newTeacher: Teacher = {
        id: Date.now(),
        name: data.teacherName,
        reviews: [newReview],
      };
      subject.teachers.push(newTeacher);
    }
}
