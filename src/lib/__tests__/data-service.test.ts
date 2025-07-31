
import { Pool } from 'pg';
import { getSubjects } from '../data-service';

// Mock a 'pg' Pool
jest.mock('pg', () => {
  const mPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock a 'server-only'
jest.mock('server-only', () => {});

describe('DataService: getSubjects', () => {
  let pool: Pool;
  let client: { query: jest.Mock; release: jest.Mock };

  beforeEach(() => {
    pool = new Pool();
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(client);
    
    // Reset dbInitialized state before each test if initializeDatabase is exported and needs testing.
    // For now, we assume it's called internally and we mock its effects.
    client.query.mockResolvedValue({ rows: [], rowCount: 0 }); // Default mock
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of subjects with correctly associated teachers and reviews', async () => {
    const mockSubjects = [{ id: 1, name: 'Cálculo I' }];
    const mockData = [
      {
        subject_id: 1,
        subject_name: 'Cálculo I',
        teacher_id: 101,
        teacher_name: 'Dr. Newton',
        review_id: 1001,
        review_text: 'Great teacher!',
        review_rating: 5,
        review_upvotes: 10,
        review_downvotes: 0,
        review_created_at: new Date(),
      },
    ];

    // Mock for initializeDatabase's internal calls (if any beyond the main query)
    client.query
      .mockResolvedValueOnce({ rows: mockSubjects, rowCount: 1 }) // for the initial subjects query
      .mockResolvedValueOnce({ rows: mockData, rowCount: 1 }); // for the main data query

    const subjects = await getSubjects();

    expect(subjects).toHaveLength(1);
    expect(subjects[0].name).toBe('Cálculo I');
    expect(subjects[0].teachers).toHaveLength(1);
    expect(subjects[0].teachers[0].name).toBe('Dr. Newton');
    expect(subjects[0].teachers[0].reviews).toHaveLength(1);
    expect(subjects[0].teachers[0].reviews[0].text).toBe('Great teacher!');
    expect(subjects[0].teachers[0].subject).toBe('Cálculo I');
  });

  it('should handle teachers with no reviews', async () => {
    const mockSubjects = [{ id: 1, name: 'Álgebra Linear' }];
    const mockData = [
      {
        subject_id: 1,
        subject_name: 'Álgebra Linear',
        teacher_id: 102,
        teacher_name: 'Dr. Euler',
        review_id: null,
      },
    ];
    
    client.query
      .mockResolvedValueOnce({ rows: mockSubjects, rowCount: 1 })
      .mockResolvedValueOnce({ rows: mockData, rowCount: 1 });

    const subjects = await getSubjects();
    
    expect(subjects).toHaveLength(1);
    expect(subjects[0].teachers).toHaveLength(1);
    expect(subjects[0].teachers[0].name).toBe('Dr. Euler');
    expect(subjects[0].teachers[0].reviews).toHaveLength(0);
  });

  it('should handle subjects with no teachers', async () => {
    const mockSubjects = [{ id: 2, name: 'Física I' }];
    const mockData = []; // No teachers or reviews for this subject
    
    client.query
      .mockResolvedValueOnce({ rows: mockSubjects, rowCount: 1 })
      .mockResolvedValueOnce({ rows: mockData, rowCount: 0 });

    const subjects = await getSubjects();

    expect(subjects).toHaveLength(1);
    expect(subjects[0].name).toBe('Física I');
    expect(subjects[0].teachers).toHaveLength(0);
  });

  it('should correctly associate a teacher who teaches multiple subjects', async () => {
    const mockSubjects = [
      { id: 1, name: 'Cálculo I' },
      { id: 2, name: 'Cálculo II' },
    ];
    const mockData = [
      // Dr. Gauss in Cálculo I
      {
        subject_id: 1,
        subject_name: 'Cálculo I',
        teacher_id: 103,
        teacher_name: 'Dr. Gauss',
        review_id: 1002,
        review_text: 'Tough but fair.',
        review_rating: 4,
        review_upvotes: 5,
        review_downvotes: 1,
        review_created_at: new Date(),
      },
      // Dr. Gauss in Cálculo II
      {
        subject_id: 2,
        subject_name: 'Cálculo II',
        teacher_id: 103,
        teacher_name: 'Dr. Gauss',
        review_id: 1003,
        review_text: 'Even tougher!',
        review_rating: 3,
        review_upvotes: 2,
        review_downvotes: 2,
        review_created_at: new Date(),
      },
    ];

    client.query
      .mockResolvedValueOnce({ rows: mockSubjects, rowCount: 2 })
      .mockResolvedValueOnce({ rows: mockData, rowCount: 2 });
      
    const subjects = await getSubjects();

    const calculoI = subjects.find(s => s.name === 'Cálculo I');
    const calculoII = subjects.find(s => s.name === 'Cálculo II');
    
    expect(calculoI).toBeDefined();
    expect(calculoII).toBeDefined();

    // Check teacher in Cálculo I
    expect(calculoI.teachers).toHaveLength(1);
    expect(calculoI.teachers[0].name).toBe('Dr. Gauss');
    // In the new logic, the teacher object for a specific subject only contains reviews for that subject+teacher combo.
    // However, the current data structure doesn't fully separate reviews by subject within the teacher object,
    // let's adjust the test to match the implementation. The implementation seems to collect all reviews for a teacher
    // regardless of the subject context. This might be a bug or intended. For now, let's assume the current implementation is correct.
    // *** Correction based on implementation analysis ***
    // The implementation creates a *new* teacher object for each subject context (`teacherKey = `${row.teacher_id}-${row.subject_id}``).
    // This means reviews are correctly separated.
    expect(calculoI.teachers[0].reviews).toHaveLength(1);
    expect(calculoI.teachers[0].reviews[0].text).toBe('Tough but fair.');
    expect(calculoI.teachers[0].subject).toBe('Cálculo I');

    // Check teacher in Cálculo II
    expect(calculoII.teachers).toHaveLength(1);
    expect(calculoII.teachers[0].name).toBe('Dr. Gauss');
    expect(calculoII.teachers[0].reviews).toHaveLength(1);
    expect(calculoII.teachers[0].reviews[0].text).toBe('Even tougher!');
    expect(calculoII.teachers[0].subject).toBe('Cálculo II');

    // Ensure teacher objects are distinct instances for each subject context
    expect(calculoI.teachers[0]).not.toBe(calculoII.teachers[0]);
    expect(calculoI.teachers[0].id).toBe(calculoII.teachers[0].id);
  });
});
