
import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedTeacher from '../featured-teacher';
import type { Teacher } from '@/lib/types';

// Mock the StarRating component
jest.mock('../star-rating', () => ({
  __esModule: true,
  default: ({ rating }: { rating: number }) => <div data-testid="star-rating">Rating: {rating}</div>,
}));

describe('FeaturedTeacher', () => {
  it('renders correctly with a teacher who has reviews', () => {
    const teacher: Teacher = {
      id: 1,
      name: 'Professor Destaque',
      reviews: [], // reviews are not used directly, averageRating is
      averageRating: 4.8,
    };

    render(<FeaturedTeacher teacher={teacher} />);

    expect(screen.getByText(/Destaque: Professor Destaque/)).toBeInTheDocument();
    expect(screen.getByTestId('star-rating')).toHaveTextContent('Rating: 4.8');
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('calculates and displays the average rating formatted to one decimal place', () => {
    const teacher: Teacher = {
      id: 2,
      name: 'Professor Média',
      averageRating: 3.75,
      reviews: [],
    };

    render(<FeaturedTeacher teacher={teacher} />);

    expect(screen.getByText('3.8')).toBeInTheDocument();
  });

  it('renders correctly for a teacher with a whole number rating', () => {
    const teacher: Teacher = {
        id: 3,
        name: 'Professor Inteiro',
        averageRating: 5,
        reviews: [],
    };

    render(<FeaturedTeacher teacher={teacher} />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('handles a teacher with zero rating', () => {
    const teacher: Teacher = {
        id: 4,
        name: 'Professor Zero',
        averageRating: 0,
        reviews: [],
    };

    render(<FeaturedTeacher teacher={teacher} />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
    expect(screen.getByTestId('star-rating')).toHaveTextContent('Rating: 0');
  });
});
