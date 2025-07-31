
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeacherRateClient from '../teacher-rate-client';
import type { Subject } from '@/lib/types';

// Mock child components and server actions
jest.mock('../subject-section', () => ({
  __esModule: true,
  default: ({ subject }: { subject: Subject }) => <div data-testid={`subject-${subject.id}`}>{subject.name}</div>,
}));

jest.mock('../course-flowchart', () => ({
  __esModule: true,
  default: () => <div data-testid="flowchart">Fluxograma</div>,
}));

jest.mock('../recommendation-section', () => ({
    __esModule: true,
    default: () => <div data-testid="recommendations">Recomendações</div>,
}));


const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Cálculo I',
    iconName: 'Sigma',
    teachers: [
      { id: 101, name: 'Prof. Newton', reviews: [], averageRating: 0 },
      { id: 102, name: 'Prof. Leibniz', reviews: [], averageRating: 0 },
    ],
  },
  {
    id: 2,
    name: 'Algoritmos e Estr. de Dados I',
    iconName: 'Laptop',
    teachers: [
      { id: 201, name: 'Prof. Knuth', reviews: [], averageRating: 5 },
    ],
  },
  {
    id: 3,
    name: 'Física I',
    iconName: 'Atom',
    teachers: [],
  },
];

describe('TeacherRateClient', () => {
  it('renders all subjects grouped by semester initially', () => {
    render(<TeacherRateClient initialSubjectsData={mockSubjects} />);
    
    expect(screen.getByText('1º Período')).toBeInTheDocument();
    expect(screen.getByText('2º Período')).toBeInTheDocument();
    expect(screen.getByText('Cálculo I')).toBeInTheDocument();
    expect(screen.getByText('Algoritmos e Estr. de Dados I')).toBeInTheDocument();
    expect(screen.getByText('Física I')).toBeInTheDocument(); // Falls back to a later semester group
  });

  it('filters subjects based on search query', async () => {
    const user = userEvent.setup();
    render(<TeacherRateClient initialSubjectsData={mockSubjects} />);
    
    const searchInput = screen.getByPlaceholderText('Pesquisar por disciplina...');
    await user.type(searchInput, 'Cálculo');

    expect(screen.getByText('Cálculo I')).toBeInTheDocument();
    expect(screen.queryByText('Algoritmos e Estr. de Dados I')).not.toBeInTheDocument();
    expect(screen.queryByText('Física I')).not.toBeInTheDocument();
  });

  it('does not filter by teacher name anymore', async () => {
    const user = userEvent.setup();
    render(<TeacherRateClient initialSubjectsData={mockSubjects} />);
    
    const searchInput = screen.getByPlaceholderText('Pesquisar por disciplina...');
    await user.type(searchInput, 'Knuth');

    // It should now show the "no results" message because it only searches subjects
    expect(screen.getByText(/Nenhum resultado encontrado para "Knuth"/)).toBeInTheDocument();
    expect(screen.queryByText('Algoritmos e Estr. de Dados I')).not.toBeInTheDocument();
  });

  it('shows "no results" message when search yields no results', async () => {
    const user = userEvent.setup();
    render(<TeacherRateClient initialSubjectsData={mockSubjects} />);
    
    const searchInput = screen.getByPlaceholderText('Pesquisar por disciplina...');
    await user.type(searchInput, 'Zebra');

    expect(screen.getByText(/Nenhum resultado encontrado para "Zebra"/)).toBeInTheDocument();
  });
});
