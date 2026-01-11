import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Feature from '../Feature';

jest.mock('@/data/FeatureData', () => ({
  about_feature: [
    {
      id: 1,
      icon: 'flaticon-test',
      title: 'Test Feature 1',
      desc: 'Test description 1',
    },
    {
      id: 2,
      icon: 'flaticon-test-2',
      title: 'Test Feature 2',
      desc: 'Test description 2',
    },
    {
      id: 3,
      icon: 'flaticon-test-3',
      title: 'Test Feature 3',
      desc: 'Test description 3',
    },
  ],
}));

describe('Feature (About)', () => {
  it('renders features section with proper structure', () => {
    const { container } = render(<Feature />);
    
    const section = container.querySelector('.features-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pb-70');
  });

  it('renders section title with subtitle', () => {
    render(<Feature />);
    
    const subTitle = screen.getByText('Nilai Utama');
    expect(subTitle).toBeInTheDocument();
    expect(subTitle).toHaveClass('sub-title');
    expect(subTitle).toHaveClass('style-one');
  });

  it('renders section title heading', () => {
    render(<Feature />);
    
    const heading = screen.getByText('Fondasi Layanan Maskom');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders text box description', () => {
    render(<Feature />);
    
    const description = screen.getByText(/Kami berkomitmen menyediakan layanan yang proaktif/);
    expect(description).toBeInTheDocument();
  });

  it('renders text box with proper alignment', () => {
    const { container } = render(<Feature />);
    
    const textBox = container.querySelector('.text-box');
    expect(textBox).toBeInTheDocument();
    expect(textBox).toHaveClass('text-end');
  });

  it('renders all feature items from data', () => {
    render(<Feature />);
    
    expect(screen.getByText('Test Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Test Feature 2')).toBeInTheDocument();
    expect(screen.getByText('Test Feature 3')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Feature />);
    
    expect(screen.getByText('Test description 1')).toBeInTheDocument();
    expect(screen.getByText('Test description 2')).toBeInTheDocument();
    expect(screen.getByText('Test description 3')).toBeInTheDocument();
  });

  it('renders feature icons', () => {
    const { container } = render(<Feature />);
    
    const iconOne = container.querySelector('.flaticon-test');
    const iconTwo = container.querySelector('.flaticon-test-2');
    const iconThree = container.querySelector('.flaticon-test-3');
    
    expect(iconOne).toBeInTheDocument();
    expect(iconTwo).toBeInTheDocument();
    expect(iconThree).toBeInTheDocument();
  });

  it('renders feature items in iconic info boxes', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box');
    expect(iconicInfoBoxes.length).toBe(3);
  });

  it('renders iconic info boxes with style-four class', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box.style-four');
    expect(iconicInfoBoxes.length).toBe(3);
  });

  it('renders feature items with proper spacing', () => {
    const { container } = render(<Feature />);
    
    container.querySelectorAll('.iconic-info-box').forEach((box) => {
      expect(box).toHaveClass('mb-40');
    });
  });

  it('renders feature items with proper structure', () => {
    const { container } = render(<Feature />);
    
    container.querySelectorAll('.iconic-info-box').forEach((box) => {
      const icon = box.querySelector('.icon');
      const content = box.querySelector('.content');
      
      expect(icon).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  it('renders feature titles as h5 elements', () => {
    const { container } = render(<Feature />);
    
    const titles = container.querySelectorAll('.content h5');
    expect(titles.length).toBe(3);
  });

  it('renders feature descriptions as p elements', () => {
    const { container } = render(<Feature />);
    
    const descriptions = container.querySelectorAll('.content p');
    expect(descriptions.length).toBe(3);
  });

  it('has proper section title classes', () => {
    const { container } = render(<Feature />);
    
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle).toBeInTheDocument();
    expect(sectionTitle).toHaveClass('mb-50');
  });

  it('has proper animation classes', () => {
    const { container } = render(<Feature />);
    
    expect(container.querySelector('.fadeInLeft')).toBeInTheDocument();
    expect(container.querySelector('.fadeInRight')).toBeInTheDocument();
    expect(container.querySelector('.fadeInUp')).toBeInTheDocument();
  });

  it('renders layout with two rows', () => {
    const { container } = render(<Feature />);
    
    const rows = container.querySelectorAll('.row');
    expect(rows.length).toBe(2);
  });

  it('renders first row with aligned items', () => {
    const { container } = render(<Feature />);
    
    const firstRow = container.querySelector('.row');
    expect(firstRow).toHaveClass('align-items-center');
  });

  it('renders first row with two columns', () => {
    const { container } = render(<Feature />);
    
    const firstRow = container.querySelector('.row');
    const firstColumn = firstRow?.querySelector('.col-lg-7');
    const secondColumn = firstRow?.querySelector('.col-lg-5');
    
    expect(firstColumn).toBeInTheDocument();
    expect(secondColumn).toBeInTheDocument();
  });

  it('renders section title in first column', () => {
    const { container } = render(<Feature />);
    
    const firstColumn = container.querySelector('.col-lg-7');
    const sectionTitle = container.querySelector('.section-title');
    
    expect(firstColumn).toContainElement(sectionTitle as HTMLElement);
  });

  it('renders text box in second column', () => {
    const { container } = render(<Feature />);
    
    const secondColumn = container.querySelector('.col-lg-5');
    const textBox = container.querySelector('.text-box');
    
    expect(secondColumn).toContainElement(textBox as HTMLElement);
  });

  it('renders feature items in justified centered row', () => {
    const { container } = render(<Feature />);
    
    const secondRow = container.querySelectorAll('.row')[1];
    expect(secondRow).toHaveClass('justify-content-center');
  });

  it('renders feature items with responsive columns', () => {
    const { container } = render(<Feature />);
    
    const columns = container.querySelectorAll('.col-lg-4');
    expect(columns.length).toBe(3);
  });

  it('renders feature items with mobile responsive classes', () => {
    const { container } = render(<Feature />);
    
    const columns = container.querySelectorAll('.col-lg-4');
    columns.forEach((column) => {
      expect(column).toHaveClass('col-md-6');
      expect(column).toHaveClass('col-sm-12');
    });
  });

  it('renders Indonesian text correctly', () => {
    render(<Feature />);
    
    expect(screen.getByText('Nilai Utama')).toBeInTheDocument();
    expect(screen.getByText('Fondasi Layanan Maskom')).toBeInTheDocument();
    expect(screen.getByText(/Kami berkomitmen menyediakan layanan yang proaktif/)).toBeInTheDocument();
  });

  it('is a memoized component', () => {
    expect(Feature.displayName).toBe('Feature');
  });

  it('renders feature items with unique keys', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box');
    iconicInfoBoxes.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
  });

  it('has proper margin classes', () => {
    const { container } = render(<Feature />);
    
    expect(container.querySelector('.mb-40')).toBeInTheDocument();
    expect(container.querySelector('.mb-50')).toBeInTheDocument();
  });

  it('renders text box with bottom margin', () => {
    const { container } = render(<Feature />);
    
    const textBox = container.querySelector('.text-box');
    expect(textBox).toHaveClass('mb-50');
  });

  it('renders feature icons in icon container', () => {
    const { container } = render(<Feature />);
    
    container.querySelectorAll('.iconic-info-box').forEach((box) => {
      const icon = box.querySelector('.icon');
      expect(icon).toBeInTheDocument();
    });
  });

  it('renders feature content in content container', () => {
    const { container } = render(<Feature />);
    
    container.querySelectorAll('.iconic-info-box').forEach((box) => {
      const content = box.querySelector('.content');
      expect(content).toBeInTheDocument();
    });
  });

  it('renders all feature elements in proper order', () => {
    const { container } = render(<Feature />);
    
    const firstBox = container.querySelector('.iconic-info-box');
    expect(firstBox).toContainElement(screen.getByText('Test Feature 1') as HTMLElement);
  });
});
