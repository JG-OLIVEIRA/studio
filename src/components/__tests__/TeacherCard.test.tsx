
import React from 'react';
import { render, screen } from '@testing-library/react';
import TeacherCard from '../teacher-card';
import type { Teacher } from '@/lib/types';

// Mock child components
jest.mock('../star-rating', () => ({
    __esModule: true,
    default: ({ rating }: { rating: number }) => <div data-testid="star-rating">Rating: {rating}</div>,
}));
jest.mock('../ai-review-insights', () => ({
    __esModule: true,
    default: ({ children, disabled }: { children: React.ReactNode, disabled: boolean }) => (
        <div data-testid="ai-insights" data-disabled={disabled}>{children}</div>
    ),
}));
jest.mock('../view-reviews-dialog', () => ({
    __esModule: true,
    ViewReviewsDialog: ({ children, disabled }: { children: React.ReactNode, disabled: boolean }) => (
        <div data-testid="view-reviews" data-disabled={disabled}>{children}</div>
    ),
}));
jest.mock('../add-review-form', () => ({
    __esModule: true,
    AddReviewForm: ({ children }: { children: React.ReactNode }) => <div data-testid="add-review">{children}</div>,
}));

const mockTeacher: Teacher = {
    id: 1,
    name: 'Professor Teste',
    subject: 'Matemática',
    reviews: [
        { id: 1, rating: 5, text: 'Excelente', upvotes: 1, downvotes: 0, createdAt: new Date().toISOString() },
        { id: 2, rating: 4, text: 'Muito bom', upvotes: 1, downvotes: 0, createdAt: new Date().toISOString() },
    ],
    averageRating: 4.5
};

const mockTeacherNoReviews: Teacher = {
    id: 2,
    name: 'Professor Sem Avaliação',
    subject: 'Física',
    reviews: [],
    averageRating: 0,
};

describe('TeacherCard', () => {
    it('renders teacher name and average rating', () => {
        render(<TeacherCard teacher={mockTeacher} />);

        expect(screen.getByText('Professor Teste')).toBeInTheDocument();
        expect(screen.getByTestId('star-rating')).toHaveTextContent('Rating: 4.5');
        expect(screen.getByText('4.5')).toBeInTheDocument();
        expect(screen.getByText('2 avaliações')).toBeInTheDocument();
    });

    it('renders correctly for a teacher with no reviews', () => {
        render(<TeacherCard teacher={mockTeacherNoReviews} />);

        expect(screen.getByText('Professor Sem Avaliação')).toBeInTheDocument();
        expect(screen.getByText('Nenhuma avaliação ainda')).toBeInTheDocument();
        // The rating and count shouldn't be displayed
        expect(screen.queryByText('0.0')).not.toBeInTheDocument();
    });

    it('enables action buttons when there are reviews', () => {
        render(<TeacherCard teacher={mockTeacher} />);

        expect(screen.getByTestId('ai-insights')).toHaveAttribute('data-disabled', 'false');
        expect(screen.getByTestId('view-reviews')).toHaveAttribute('data-disabled', 'false');
    });

    it('disables action buttons when there are no reviews', () => {
        render(<TeacherCard teacher={mockTeacherNoReviews} />);

        expect(screen.getByTestId('ai-insights')).toHaveAttribute('data-disabled', 'true');
        expect(screen.getByTestId('view-reviews')).toHaveAttribute('data-disabled', 'true');
    });

    it('renders the top teacher trophy when isTopTeacher is true', () => {
        render(<TeacherCard teacher={mockTeacher} isTopTeacher={true} />);
        const trophyIcon = screen.getByRole('img', { hidden: true }); // Lucide icons don't have explicit roles
        expect(trophyIcon).toBeInTheDocument();
    });

    it('does not render the top teacher trophy when isTopTeacher is false', () => {
        render(<TeacherCard teacher={mockTeacher} isTopTeacher={false} />);
        expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });
});
