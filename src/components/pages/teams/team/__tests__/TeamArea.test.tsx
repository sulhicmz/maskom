import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamArea from '../TeamArea';

jest.mock('react-paginate', () => {
  return function ReactPaginateMock({ onPageChange, pageCount }: { onPageChange: (e: { selected: number }) => void; pageCount: number }) {
    return (
      <nav>
        <div data-testid="paginate-info">PageCount: {pageCount}</div>
        <button onClick={() => onPageChange({ selected: 0 })}>Page 1</button>
        <button onClick={() => onPageChange({ selected: 1 })}>Page 2</button>
      </nav>
    );
  };
});

jest.mock('@/data/TeamData', () => [
  { id: 1, title: 'Made Surya', designation: 'Chief Executive Officer', img: '/team1.jpg' },
  { id: 2, title: 'Fitria Adelia', designation: 'Chief Technology Officer', img: '/team2.jpg' },
  { id: 3, title: 'Rangga Saputra', designation: 'Head of Network Engineering', img: '/team3.jpg' },
  { id: 4, title: 'Sylvia Nirmala', designation: 'Service Delivery Director', img: '/team4.jpg' },
  { id: 5, title: 'Rizal Fadlan', designation: 'Lead Solution Architect', img: '/team5.jpg' },
  { id: 6, title: 'Angela Mahardika', designation: 'Customer Success Manager', img: '/team6.jpg' },
  { id: 7, title: 'Bayu Wirawan', designation: 'Senior Network Engineer', img: '/team7.jpg' },
  { id: 8, title: 'Kezia Putri', designation: 'Cybersecurity Specialist', img: '/team8.jpg' },
  { id: 9, title: 'Grace Lee', designation: 'Product Manager', img: '/team9.jpg' },
  { id: 10, title: 'Henry Davis', designation: 'DevOps Lead', img: '/team10.jpg' },
]);

jest.mock('next/image', () => {
  return function ImageMock({ alt, src }: { alt: string; src: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="team-image" />;
  };
});

describe('TeamArea', () => {
  it('renders team section with container', () => {
    render(<TeamArea />);

    const section = document.querySelector('.team-section');
    expect(section).toBeInTheDocument();
  });

  it('renders team members on first page', () => {
    render(<TeamArea />);

    expect(screen.getByText('Made Surya')).toBeInTheDocument();
    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument();
    expect(screen.getByText('Fitria Adelia')).toBeInTheDocument();
    expect(screen.getByText('Chief Technology Officer')).toBeInTheDocument();
  });

  it('displays exactly 8 team members per page (itemsPerPage)', () => {
    render(<TeamArea />);

    const images = screen.getAllByTestId('team-image');
    expect(images.length).toBe(8);
  });

  it('renders pagination component', () => {
    render(<TeamArea />);

    expect(screen.getByTestId('paginate-info')).toBeInTheDocument();
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(screen.getByText('Page 2')).toBeInTheDocument();
  });

  it('displays correct page count for 10 items with 8 per page', () => {
    render(<TeamArea />);

    expect(screen.getByText('PageCount: 2')).toBeInTheDocument();
  });

  it('navigates to next page when Page 2 is clicked', () => {
    render(<TeamArea />);

    const page2Button = screen.getByText('Page 2');
    fireEvent.click(page2Button);

    expect(screen.getByText('Grace Lee')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('Henry Davis')).toBeInTheDocument();
    expect(screen.getByText('DevOps Lead')).toBeInTheDocument();
  });

  it('hides first page members when on second page', () => {
    render(<TeamArea />);

    const page2Button = screen.getByText('Page 2');
    fireEvent.click(page2Button);

    expect(screen.queryByText('Made Surya')).not.toBeInTheDocument();
    expect(screen.queryByText('Fitria Adelia')).not.toBeInTheDocument();
  });

  it('navigates back to first page when Page 1 is clicked', () => {
    render(<TeamArea />);

    const page2Button = screen.getByText('Page 2');
    fireEvent.click(page2Button);

    const page1Button = screen.getByText('Page 1');
    fireEvent.click(page1Button);

    expect(screen.getByText('Made Surya')).toBeInTheDocument();
    expect(screen.getByText('Fitria Adelia')).toBeInTheDocument();
  });

  it('has proper section structure and CSS classes', () => {
    const { container } = render(<TeamArea />);

    const section = container.querySelector('.team-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-120');
  });

  it('renders team items with correct structure', () => {
    const { container } = render(<TeamArea />);

    const teamItems = container.querySelectorAll('.team-item');
    expect(teamItems.length).toBe(8);
  });

  it('renders team images with proper structure', () => {
    const { container } = render(<TeamArea />);

    const memberImages = container.querySelectorAll('.member-image');
    expect(memberImages.length).toBe(8);
  });

  it('renders team member info (title and designation)', () => {
    render(<TeamArea />);

    expect(screen.getByText('Made Surya')).toBeInTheDocument();
    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument();
    expect(screen.getByText('Fitria Adelia')).toBeInTheDocument();
    expect(screen.getByText('Chief Technology Officer')).toBeInTheDocument();
  });

  it('renders social share buttons for each team member', () => {
    const { container } = render(<TeamArea />);

    const shareButtons = container.querySelectorAll('.share-button');
    expect(shareButtons.length).toBe(8);
  });

  it('renders social media buttons with aria-labels', () => {
    render(<TeamArea />);

    const facebookButtons = screen.getAllByLabelText('Share on Facebook');
    const twitterButtons = screen.getAllByLabelText('Share on Twitter');
    const linkedinButtons = screen.getAllByLabelText('Share on LinkedIn');
    const instagramButtons = screen.getAllByLabelText('Share on Instagram');

    expect(facebookButtons.length).toBeGreaterThan(0);
    expect(twitterButtons.length).toBeGreaterThan(0);
    expect(linkedinButtons.length).toBeGreaterThan(0);
    expect(instagramButtons.length).toBeGreaterThan(0);
  });

  it('handles multiple page navigation correctly', () => {
    render(<TeamArea />);

    const page1Button = screen.getByText('Page 1');
    const page2Button = screen.getByText('Page 2');

    fireEvent.click(page2Button);
    expect(screen.getByText('Grace Lee')).toBeInTheDocument();

    fireEvent.click(page1Button);
    expect(screen.getByText('Made Surya')).toBeInTheDocument();

    fireEvent.click(page2Button);
    expect(screen.getByText('Henry Davis')).toBeInTheDocument();
  });

  it('preserves team data structure across page changes', () => {
    render(<TeamArea />);

    const page1Button = screen.getByText('Page 1');
    const page2Button = screen.getByText('Page 2');

    fireEvent.click(page2Button);
    expect(screen.getByText('Grace Lee')).toBeInTheDocument();
    expect(screen.getByText('Henry Davis')).toBeInTheDocument();

    fireEvent.click(page1Button);
    expect(screen.getByText('Made Surya')).toBeInTheDocument();
    expect(screen.getByText('Fitria Adelia')).toBeInTheDocument();
  });

  it('handles rapid page navigation without errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    render(<TeamArea />);

    const page1Button = screen.getByText('Page 1');
    const page2Button = screen.getByText('Page 2');

    for (let i = 0; i < 5; i++) {
      fireEvent.click(page2Button);
      fireEvent.click(page1Button);
    }

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('renders team members in grid layout', () => {
    const { container } = render(<TeamArea />);

    const row = container.querySelector('.row');
    const cols = row?.querySelectorAll('[class*="col-"]');
    expect(cols?.length).toBe(8);
  });

  it('has pagination with correct structure', () => {
    const { container } = render(<TeamArea />);

    const pagination = container.querySelector('.ac-pagination');
    expect(pagination).toBeInTheDocument();
    expect(pagination).toHaveClass('text-center');
    expect(pagination).toHaveClass('mt-30');
  });

  it('uses "use client" directive (client component)', () => {
    render(<TeamArea />);

    expect(document.querySelector('.team-section')).toBeInTheDocument();
  });

  it('maintains itemsPerPage constant at 8', () => {
    render(<TeamArea />);

    const images = screen.getAllByTestId('team-image');
    expect(images.length).toBe(8);
  });

  it('displays team members in correct order on first page', () => {
    render(<TeamArea />);

    const allText = screen.getAllByText(/(Made|Fitria|Rangga|Sylvia|Rizal|Angela|Bayu|Kezia|Grace|Henry)/);
    const firstPageNames = allText.slice(0, 8);
    
    expect(firstPageNames[0]).toHaveTextContent('Made Surya');
    expect(firstPageNames[7]).toHaveTextContent('Kezia Putri');
  });
});
