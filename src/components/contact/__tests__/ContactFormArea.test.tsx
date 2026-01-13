import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactFormArea from '../ContactFormArea';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div data-testid="contact-form">Mock ContactForm</div>;
  MockComponent.displayName = 'MockComponent';
  return MockComponent;
});

describe('ContactFormArea', () => {
  it('renders contact section with proper structure', () => {
    const { container } = render(<ContactFormArea />);
    
    const section = container.querySelector('.contact-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-70');
  });

  it('renders contact one image box', () => {
    const { container } = render(<ContactFormArea />);
    
    const imageBox = container.querySelector('.contact-one_image-box');
    expect(imageBox).toBeInTheDocument();
    expect(imageBox).toHaveClass('p-r');
    expect(imageBox).toHaveClass('z-1');
  });

  it('renders contact images', () => {
    render(<ContactFormArea />);
    
    const supportImage = screen.getByAltText('Ilustrasi tim dukungan pelanggan Maskom siap membantu');
    const techImage = screen.getByAltText('Ilustrasi tim teknis bekerja sama');
    const collabImage = screen.getByAltText('Ilustrasi kolaborasi tim profesional');
    const decorImage = screen.getByAltText('Elemen dekoratif visual halaman kontak');
    
    expect(supportImage).toBeInTheDocument();
    expect(techImage).toBeInTheDocument();
    expect(collabImage).toBeInTheDocument();
    expect(decorImage).toBeInTheDocument();
  });

  it('renders contact images with proper classes', () => {
    const { container } = render(<ContactFormArea />);
    
    const imageOne = container.querySelector('.image-one');
    const imageTwo = container.querySelector('.image-two');
    const imageThree = container.querySelector('.image-three');
    
    expect(imageOne).toBeInTheDocument();
    expect(imageTwo).toBeInTheDocument();
    expect(imageThree).toBeInTheDocument();
  });

  it('renders contact shape image', () => {
    const { container } = render(<ContactFormArea />);
    
    const shapeImage = container.querySelector('.shape-one');
    expect(shapeImage).toBeInTheDocument();
  });

  it('renders section content box', () => {
    const { container } = render(<ContactFormArea />);
    
    const sectionContentBox = container.querySelector('.section-content-box');
    expect(sectionContentBox).toBeInTheDocument();
    expect(sectionContentBox).toHaveClass('mb-50');
    expect(sectionContentBox).toHaveClass('pl-xl-45');
  });

  it('renders section title with subtitle', () => {
    render(<ContactFormArea />);
    
    const subTitle = screen.getByText('Hubungi Maskom');
    expect(subTitle).toBeInTheDocument();
    expect(subTitle).toHaveClass('sub-title');
    expect(subTitle).toHaveClass('style-one');
  });

  it('renders section title heading', () => {
    render(<ContactFormArea />);
    
    const heading = screen.getByText(/Kami Siap Membantu/);
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('renders contact form', () => {
    render(<ContactFormArea />);
    
    const contactForm = screen.getByTestId('contact-form');
    expect(contactForm).toBeInTheDocument();
  });

  it('renders layout with two columns', () => {
    const { container } = render(<ContactFormArea />);
    
    const firstColumn = container.querySelector('.col-xl-5');
    const secondColumn = container.querySelector('.col-xl-7');
    
    expect(firstColumn).toBeInTheDocument();
    expect(secondColumn).toBeInTheDocument();
  });

  it('renders image box in first column', () => {
    const { container } = render(<ContactFormArea />);
    
    const firstColumn = container.querySelector('.col-xl-5');
    const imageBox = container.querySelector('.contact-one_image-box');
    
    expect(firstColumn).toContainElement(imageBox as HTMLElement);
  });

  it('renders section content box in second column', () => {
    const { container } = render(<ContactFormArea />);
    
    const secondColumn = container.querySelector('.col-xl-7');
    const sectionContentBox = container.querySelector('.section-content-box');
    
    expect(secondColumn).toContainElement(sectionContentBox as HTMLElement);
  });

  it('has proper animation classes', () => {
    const { container } = render(<ContactFormArea />);
    
    expect(container.querySelector('.fadeInLeft')).toBeInTheDocument();
    expect(container.querySelector('.fadeInRight')).toBeInTheDocument();
  });

  it('renders contact image box with bottom margin', () => {
    const { container } = render(<ContactFormArea />);
    
    const imageBox = container.querySelector('.contact-one_image-box');
    expect(imageBox).toHaveClass('mb-50');
  });

  it('renders section content box with bottom margin', () => {
    const { container } = render(<ContactFormArea />);
    
    const sectionContentBox = container.querySelector('.section-content-box');
    expect(sectionContentBox).toHaveClass('mb-50');
  });

  it('renders section title with bottom margin', () => {
    const { container } = render(<ContactFormArea />);
    
    const sectionTitle = container.querySelector('.section-title');
    expect(sectionTitle).toHaveClass('mb-30');
  });

  it('renders Indonesian text correctly', () => {
    render(<ContactFormArea />);
    
    expect(screen.getByText('Hubungi Maskom')).toBeInTheDocument();
    expect(screen.getByText(/Kami Siap Membantu/)).toBeInTheDocument();
    expect(screen.getByText(/Kebutuhan Jaringan Anda/)).toBeInTheDocument();
  });

  it('has proper positioning classes', () => {
    const { container } = render(<ContactFormArea />);
    
    const imageBox = container.querySelector('.contact-one_image-box');
    expect(imageBox).toHaveClass('p-r');
    expect(imageBox).toHaveClass('z-1');
  });

  it('renders all contact images in image box', () => {
    const { container } = render(<ContactFormArea />);
    
    const imageBox = container.querySelector('.contact-one_image-box');
    const supportImage = screen.getByAltText('Ilustrasi tim dukungan pelanggan Maskom siap membantu');
    const techImage = screen.getByAltText('Ilustrasi tim teknis bekerja sama');
    const collabImage = screen.getByAltText('Ilustrasi kolaborasi tim profesional');
    const decorImage = screen.getByAltText('Elemen dekoratif visual halaman kontak');
    
    expect(imageBox).toContainElement(supportImage);
    expect(imageBox).toContainElement(techImage);
    expect(imageBox).toContainElement(collabImage);
    expect(imageBox).toContainElement(decorImage);
  });

  it('renders contact form inside section content box', () => {
    const { container } = render(<ContactFormArea />);
    
    const sectionContentBox = container.querySelector('.section-content-box');
    const contactForm = screen.getByTestId('contact-form');
    
    expect(sectionContentBox).toContainElement(contactForm);
  });

  it('renders section title inside section content box', () => {
    const { container } = render(<ContactFormArea />);
    
    const sectionContentBox = container.querySelector('.section-content-box');
    const sectionTitle = container.querySelector('.section-title');
    
    expect(sectionContentBox).toContainElement(sectionTitle as HTMLElement);
  });

  it('renders contact section with container', () => {
    const { container } = render(<ContactFormArea />);
    
    const section = container.querySelector('.contact-section');
    const containerDiv = container.querySelector('.container');
    
    expect(section).toContainElement(containerDiv as HTMLElement);
  });

  it('renders layout with row structure', () => {
    const { container } = render(<ContactFormArea />);
    
    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
  });

  it('has proper padding classes', () => {
    const { container } = render(<ContactFormArea />);
    
    const section = container.querySelector('.contact-section');
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-70');
  });

  it('renders shape image with alt text', () => {
    render(<ContactFormArea />);
    
    const decorImage = screen.getByAltText('Elemen dekoratif visual halaman kontak');
    expect(decorImage).toBeInTheDocument();
    expect(decorImage).toHaveClass('shape-one');
  });
});
