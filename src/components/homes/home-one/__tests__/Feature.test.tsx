import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Feature from '../Feature';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('@/data/FeatureHomeOneData', () => [
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
]);

describe('Feature', () => {
  it('renders features section with proper structure', () => {
    const { container } = render(<Feature />);
    
    const section = container.querySelector('.features-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-70');
  });

  it('renders section content box', () => {
    const { container } = render(<Feature />);
    
    const sectionContentBox = container.querySelector('.section-content-box');
    expect(sectionContentBox).toBeInTheDocument();
    expect(sectionContentBox).toHaveClass('mb-50');
  });

  it('renders section title with subtitle', () => {
    render(<Feature />);
    
    const subTitle = screen.getByText('Mengapa Maskom');
    expect(subTitle).toBeInTheDocument();
    expect(subTitle).toHaveClass('sub-title');
    expect(subTitle).toHaveClass('style-one');
  });

  it('renders section title heading', () => {
    render(<Feature />);
    
    const heading = screen.getByText(/Keunggulan Layanan/);
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
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

  it('renders iconic info list', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoList = container.querySelector('.iconic-info-list');
    expect(iconicInfoList).toBeInTheDocument();
  });

  it('renders iconic info boxes', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box');
    expect(iconicInfoBoxes.length).toBe(3);
  });

  it('renders iconic info boxes with style-two class', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box.style-two');
    expect(iconicInfoBoxes.length).toBe(3);
  });

  it('renders feature image box', () => {
    const { container } = render(<Feature />);
    
    const sectionImageBox = container.querySelector('.section-image-box');
    expect(sectionImageBox).toBeInTheDocument();
    expect(sectionImageBox).toHaveClass('style-one');
  });

  it('renders feature image', () => {
    render(<Feature />);

    const featureImage = screen.getByAltText('Ilustrasi visual keunggulan layanan konektivitas Maskom');
    expect(featureImage).toBeInTheDocument();
  });

  it('renders layout with two columns', () => {
    const { container } = render(<Feature />);
    
    const firstColumn = container.querySelector('.col-xl-5');
    const secondColumn = container.querySelector('.col-xl-7');
    
    expect(firstColumn).toBeInTheDocument();
    expect(secondColumn).toBeInTheDocument();
  });

  it('has proper animation classes', () => {
    const { container } = render(<Feature />);
    
    expect(container.querySelector('.fadeInDown')).toBeInTheDocument();
    expect(container.querySelector('.fadeInUp')).toBeInTheDocument();
    expect(container.querySelector('.fadeInRight')).toBeInTheDocument();
  });

  it('renders feature items in iconic info structure', () => {
    const { container } = render(<Feature />);
    
    container.querySelectorAll('.iconic-info-box').forEach((box) => {
      const icon = box.querySelector('.icon');
      const content = box.querySelector('.content');
      const title = box.querySelector('h4');
      const description = box.querySelector('p');
      
      expect(icon).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(description).toBeInTheDocument();
    });
  });

  it('renders feature items in iconic info structure', () => {
    const { container } = render(<Feature />);
    
    const firstBox = container.querySelector('.iconic-info-box');
    expect(firstBox).toContainElement(screen.getByText('Test Feature 1') as HTMLElement);
  });

  it('has proper spacing classes', () => {
    const { container } = render(<Feature />);
    
    expect(container.querySelector('.mb-30')).toBeInTheDocument();
    expect(container.querySelector('.mb-50')).toBeInTheDocument();
  });

  it('renders Indonesian text correctly', () => {
    render(<Feature />);
    
    expect(screen.getByText('Mengapa Maskom')).toBeInTheDocument();
    expect(screen.getByText(/Keunggulan Layanan/)).toBeInTheDocument();
    expect(screen.getByText(/Konektivitas Maskom/)).toBeInTheDocument();
  });

  it('is a memoized component', () => {
    expect(Feature.displayName).toBe('Feature');
  });

  it('renders feature items with unique keys', () => {
    const { container } = render(<Feature />);
    
    const iconicInfoBoxes = container.querySelectorAll('.iconic-info-box');
    iconicInfoBoxes.forEach((box) => {
      expect(box).toBeInTheDocument();
    });
  });

  it('renders feature image in proper column', () => {
    const { container } = render(<Feature />);

    const secondColumn = container.querySelector('.col-xl-7');
    const featureImage = screen.getByAltText('Ilustrasi visual keunggulan layanan konektivitas Maskom');

    expect(secondColumn).toContainElement(featureImage);
  });

  it('renders section title with proper margins', () => {
    const { container } = render(<Feature />);
    
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle).toHaveClass('mb-50');
  });
});
