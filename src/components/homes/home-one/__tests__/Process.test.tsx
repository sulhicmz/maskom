import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Process from '../Process';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('@/data/ProcessData', () => ({
  home_1_process: [
    {
      id: 1,
      page: 'home_1',
      img: 'mock-image-1',
      count: '01',
      title: 'Test Process 1',
      desc: 'Test description 1',
    },
    {
      id: 2,
      page: 'home_1',
      img: 'mock-image-2',
      count: '02',
      title: 'Test Process 2',
      desc: 'Test description 2',
    },
    {
      id: 3,
      page: 'home_1',
      img: 'mock-image-3',
      count: '03',
      title: 'Test Process 3',
      desc: 'Test description 3',
    },
  ],
}));

describe('Process', () => {
  it('renders works process section with proper structure', () => {
    const { container } = render(<Process />);
    
    const section = container.querySelector('.works-process-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pb-75');
    expect(section).toHaveAttribute('id', 'pendekatan');
  });

  it('renders section title with subtitle', () => {
    render(<Process />);
    
    const subTitle = screen.getByText('Pendekatan Kami');
    expect(subTitle).toBeInTheDocument();
    expect(subTitle).toHaveClass('sub-title');
    expect(subTitle).toHaveClass('style-one');
  });

  it('renders section title heading', () => {
    render(<Process />);
    
    const heading = screen.getByText('Implementasi Cepat & Terukur');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders section title description', () => {
    render(<Process />);
    
    const description = screen.getByText(/Maskom memastikan setiap fase berjalan/);
    expect(description).toBeInTheDocument();
  });

  it('renders all process items from data', () => {
    render(<Process />);
    
    expect(screen.getByText('Test Process 1')).toBeInTheDocument();
    expect(screen.getByText('Test Process 2')).toBeInTheDocument();
    expect(screen.getByText('Test Process 3')).toBeInTheDocument();
  });

  it('renders process descriptions', () => {
    render(<Process />);
    
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 3')).toBeInTheDocument();
  });

  it('renders process count numbers', () => {
    render(<Process />);
    
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('renders process images', () => {
    render(<Process />);
    
    const images = screen.getAllByAltText(/Ilustrasi/);
    expect(images.length).toBe(3);
  });

  it('renders process items in proper structure', () => {
    const { container } = render(<Process />);
    
    const processItems = container.querySelectorAll('.ac-process-item');
    expect(processItems.length).toBe(3);
  });

  it('renders process items with proper spacing classes', () => {
    const { container } = render(<Process />);
    
    const processItems = container.querySelectorAll('.ac-process-item');
    processItems.forEach((item) => {
      expect(item).toHaveClass('mb-40');
    });
  });

  it('renders process inner content', () => {
    const { container } = render(<Process />);
    
    container.querySelectorAll('.ac-process-item').forEach((item) => {
      const innerContent = item.querySelector('.process-inner-content');
      expect(innerContent).toBeInTheDocument();
    });
  });

  it('renders process thumbnails', () => {
    const { container } = render(<Process />);
    
    container.querySelectorAll('.ac-process-item').forEach((item) => {
      const thumbnail = item.querySelector('.thumbnail');
      expect(thumbnail).toBeInTheDocument();
    });
  });

  it('renders process content sections', () => {
    const { container } = render(<Process />);
    
    container.querySelectorAll('.ac-process-item').forEach((item) => {
      const content = item.querySelector('.content');
      expect(content).toBeInTheDocument();
    });
  });

  it('renders process titles as h5 elements', () => {
    const { container } = render(<Process />);
    
    const titles = container.querySelectorAll('.content h5');
    expect(titles.length).toBe(3);
  });

  it('renders process descriptions as p elements', () => {
    const { container } = render(<Process />);
    
    const descriptions = container.querySelectorAll('.content p');
    expect(descriptions.length).toBe(3);
  });

  it('has proper section title classes', () => {
    const { container } = render(<Process />);
    
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle).toBeInTheDocument();
    expect(sectionTitle).toHaveClass('text-center');
    expect(sectionTitle).toHaveClass('mb-55');
  });

  it('renders animation classes on elements', () => {
    const { container } = render(<Process />);
    
    expect(container.querySelector('.fadeInDown')).toBeInTheDocument();
    expect(container.querySelector('.fadeInUp')).toBeInTheDocument();
  });

  it('renders layout with centered content', () => {
    const { container } = render(<Process />);
    
    const centeredColumns = container.querySelectorAll('.justify-content-center');
    expect(centeredColumns.length).toBeGreaterThan(0);
  });

  it('renders process items with responsive columns', () => {
    const { container } = render(<Process />);
    
    const columns = container.querySelectorAll('.col-xl-4');
    expect(columns.length).toBe(3);
  });

  it('renders process items with mobile responsive classes', () => {
    const { container } = render(<Process />);
    
    const processItems = container.querySelectorAll('.col-xl-4');
    processItems.forEach((item) => {
      expect(item).toHaveClass('col-md-6');
      expect(item).toHaveClass('col-sm-6');
    });
  });

  it('renders Indonesian text correctly', () => {
    render(<Process />);
    
    expect(screen.getByText('Pendekatan Kami')).toBeInTheDocument();
    expect(screen.getByText('Implementasi Cepat & Terukur')).toBeInTheDocument();
    expect(screen.getByText(/Maskom memastikan setiap fase berjalan/)).toBeInTheDocument();
  });

  it('is a memoized component', () => {
    expect(Process.displayName).toBe('Process');
  });

  it('renders process items with unique keys', () => {
    const { container } = render(<Process />);
    
    const processItems = container.querySelectorAll('.ac-process-item');
    processItems.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
  });

  it('renders process numbers with proper class', () => {
    const { container } = render(<Process />);
    
    const numbers = container.querySelectorAll('.number');
    expect(numbers.length).toBe(3);
  });

  it('renders all process elements in proper order', () => {
    const { container } = render(<Process />);
    
    container.querySelectorAll('.ac-process-item').forEach((item) => {
      const number = item.querySelector('.number');
      const title = item.querySelector('h5');
      const description = item.querySelector('p');
      
      expect(number).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  it('has proper section structure with container', () => {
    const { container } = render(<Process />);
    
    const section = container.querySelector('.works-process-section');
    const containerDiv = container.querySelector('.container');
    
    expect(section).toContainElement(containerDiv as HTMLElement);
  });

  it('renders section title with proper margins', () => {
    const { container } = render(<Process />);
    
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle).toHaveClass('mb-55');
  });

  it('renders process items with bottom margin', () => {
    const { container } = render(<Process />);
    
    const processItems = container.querySelectorAll('.ac-process-item');
    processItems.forEach((item) => {
      expect(item).toHaveClass('mb-40');
    });
  });
});
