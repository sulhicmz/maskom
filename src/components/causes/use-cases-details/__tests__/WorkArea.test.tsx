import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkArea from '../WorkArea';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

describe('WorkArea', () => {
  it('renders row structure', () => {
    const { container } = render(<WorkArea />);
    
    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
  });

  it('renders two xl-6 columns', () => {
    const { container } = render(<WorkArea />);
    
    const columns = container.querySelectorAll('.col-xl-6');
    expect(columns).toHaveLength(2);
  });

  it('renders nested row in first column', () => {
    const { container } = render(<WorkArea />);
    
    const firstColumn = container.querySelector('.col-xl-6');
    const nestedRow = firstColumn?.querySelector('.row');
    
    expect(nestedRow).toBeInTheDocument();
  });

  it('renders content box in second column', () => {
    const { container } = render(<WorkArea />);
    
    const contentBox = container.querySelector('.content-box');
    expect(contentBox).toBeInTheDocument();
  });

  it('renders main heading', () => {
    render(<WorkArea />);
    
    const heading = screen.getByText('Langkah implementasi Maskom');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('renders three iconic number boxes', () => {
    const { container } = render(<WorkArea />);
    
    const boxes = container.querySelectorAll('.iconic-number-box');
    expect(boxes).toHaveLength(3);
  });

  it('renders iconic number boxes with style-two class', () => {
    const { container } = render(<WorkArea />);
    
    const boxes = container.querySelectorAll('.iconic-number-box.style-two');
    expect(boxes).toHaveLength(3);
  });

  it('renders first iconic number box', () => {
    render(<WorkArea />);
    
    const number = screen.getByText('01');
    expect(number).toBeInTheDocument();
  });

  it('renders second iconic number box', () => {
    render(<WorkArea />);
    
    const number = screen.getByText('02');
    expect(number).toBeInTheDocument();
  });

  it('renders third iconic number box', () => {
    render(<WorkArea />);
    
    const number = screen.getByText('03');
    expect(number).toBeInTheDocument();
  });

  it('renders first step heading', () => {
    render(<WorkArea />);
    
    const heading = screen.getByText('Survey & assesment multi-gerai');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H5');
  });

  it('renders second step heading', () => {
    render(<WorkArea />);
    
    const heading = screen.getByText('Desain arsitektur & pilot');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H5');
  });

  it('renders third step heading', () => {
    render(<WorkArea />);
    
    const heading = screen.getByText('Operasi & continuous improvement');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H5');
  });

  it('renders four images', () => {
    render(<WorkArea />);
    
    const images = screen.getAllByAltText('case image');
    expect(images).toHaveLength(4);
  });

  it('renders nested lg-6 columns', () => {
    const { container } = render(<WorkArea />);
    
    const nestedColumns = container.querySelectorAll('.col-lg-6');
    expect(nestedColumns).toHaveLength(2);
  });

  it('renders nested lg-12 column', () => {
    const { container } = render(<WorkArea />);
    
    const nestedColumn = container.querySelector('.col-lg-12');
    expect(nestedColumn).toBeInTheDocument();
  });

  it('renders figure elements', () => {
    const { container } = render(<WorkArea />);
    
    const figures = container.querySelectorAll('figure');
    expect(figures).toHaveLength(4);
  });

  it('renders first step content', () => {
    render(<WorkArea />);
    
    expect(screen.getByText(/Tim solution architect memetakan infrastruktur/)).toBeInTheDocument();
  });

  it('renders second step content', () => {
    render(<WorkArea />);
    
    expect(screen.getByText(/Kami membuat blueprint konektivitas fiber/)).toBeInTheDocument();
  });

  it('renders third step content', () => {
    render(<WorkArea />);
    
    expect(screen.getByText(/Network Operation Center memonitor SLA/)).toBeInTheDocument();
  });

  it('has proper margin classes', () => {
    const { container } = render(<WorkArea />);
    
    const boxes = container.querySelectorAll('.iconic-number-box');
    boxes.forEach(box => {
      expect(box).toHaveClass('mb-30');
    });
  });

  it('renders Indonesian content', () => {
    render(<WorkArea />);
    
    expect(screen.getByText('Langkah implementasi Maskom')).toBeInTheDocument();
    expect(screen.getByText(/lebih dari 120 lokasi ritel/)).toBeInTheDocument();
    expect(screen.getByText(/validasi QoS/)).toBeInTheDocument();
  });

  it('renders content box structure', () => {
    const { container } = render(<WorkArea />);
    
    const secondColumn = container.querySelectorAll('.col-xl-6')[1];
    const contentBox = container.querySelector('.content-box');
    
    expect(secondColumn).toContainElement(contentBox as HTMLElement);
  });

  it('renders nested column structure properly', () => {
    const { container } = render(<WorkArea />);
    
    const firstColumn = container.querySelector('.col-xl-6');
    const nestedRow = firstColumn?.querySelector('.row');
    
    expect(nestedRow).toBeInTheDocument();
  });

  it('renders heading with proper spacing', () => {
    const { container } = render(<WorkArea />);
    
    const heading = container.querySelector('.content-box h3');
    expect(heading).toHaveClass('mb-30');
  });

  it('has proper grid structure', () => {
    const { container } = render(<WorkArea />);
    
    const xl6Columns = container.querySelectorAll('.col-xl-6');
    const lg6Columns = container.querySelectorAll('.col-lg-6');
    const lg12Column = container.querySelector('.col-lg-12');
    
    expect(xl6Columns).toHaveLength(2);
    expect(lg6Columns).toHaveLength(2);
    expect(lg12Column).toBeInTheDocument();
  });

  it('renders steps in correct order', () => {
    render(<WorkArea />);
    
    const numbers = screen.getAllByRole('generic');
    const textContent = numbers.map(n => n.textContent || '');
    
    expect(textContent).toContain('01');
    expect(textContent).toContain('02');
    expect(textContent).toContain('03');
  });

  it('renders step content properly', () => {
    const { container } = render(<WorkArea />);
    
    const boxes = container.querySelectorAll('.iconic-number-box');
    boxes.forEach((box) => {
      const number = box.querySelector('.number');
      const content = box.querySelector('.content');
      
      expect(number).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });
});
