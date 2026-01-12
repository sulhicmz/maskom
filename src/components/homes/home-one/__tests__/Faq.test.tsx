import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Faq from '../Faq';

jest.mock('@/data/FaqData', () => ({
  home_1_faq: [
    {
      id: 1,
      page: 'home_1',
      question: 'Apa saja cakupan layanan Maskom?',
      answer: 'Kami menyediakan konektivitas fiber & wireless, managed Wi-Fi dan LAN, SD-WAN, keamanan jaringan, layanan NOC 24/7, hingga direct cloud connect sesuai kebutuhan bisnis Anda.',
    },
    {
      id: 2,
      page: 'home_1',
      question: 'Seberapa cepat proses instalasi jaringan?',
      answer: 'Estimasi instalasi tergantung kesiapan infrastruktur lokasi. Untuk area dengan jaringan Maskom, provisioning dapat selesai dalam 7-10 hari kerja termasuk aktivasi perangkat dan uji kelayakan layanan.',
    },
    {
      id: 3,
      page: 'home_1',
      question: 'Bagaimana mekanisme dukungan teknis Maskom?',
      answer: 'Tim NOC kami memonitor jaringan secara proaktif dan siap menangani insiden melalui helpdesk 24/7. Untuk kasus kritikal, engineer on-site akan dikirim sesuai SLA yang disepakati.',
    },
  ],
}));

describe('Faq', () => {
  it('renders FAQ section with title and description', () => {
    render(<Faq />);

    expect(screen.getByText('Pertanyaan Umum')).toBeInTheDocument();
    expect(screen.getByText('Hal yang Sering Ditanyakan Klien')).toBeInTheDocument();
  });

  it('renders all FAQ questions', () => {
     render(<Faq />);

     expect(screen.getByText('Apa saja cakupan layanan Maskom?')).toBeInTheDocument();
     expect(screen.getByText('Seberapa cepat proses instalasi jaringan?')).toBeInTheDocument();
     expect(screen.getByText('Bagaimana mekanisme dukungan teknis Maskom?')).toBeInTheDocument();
   });

  it('renders first FAQ as active by default', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    expect(questions[0]).toHaveClass('accordion-title');
    expect(questions[0]).not.toHaveClass('collapsed');
  });

  it('switches active FAQ on click', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const firstQuestion = questions[0];
    const secondQuestion = questions[1];

    fireEvent.click(secondQuestion);

    expect(firstQuestion).toHaveClass('collapsed');
    expect(secondQuestion).not.toHaveClass('collapsed');
  });

  it('displays answer for active FAQ', () => {
    render(<Faq />);

    expect(screen.getByText(/Kami menyediakan konektivitas fiber/)).toBeInTheDocument();
  });

  it('updates answer when clicking different question', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const secondQuestion = questions[1];

    fireEvent.click(secondQuestion);

    expect(screen.getByText(/Estimasi instalasi tergantung kesiapan/)).toBeInTheDocument();
  });

  it('switches back to first FAQ when clicking it', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const firstQuestion = questions[0];
    const secondQuestion = questions[1];

    fireEvent.click(secondQuestion);
    fireEvent.click(firstQuestion);

    expect(firstQuestion).not.toHaveClass('collapsed');
    expect(secondQuestion).toHaveClass('collapsed');
  });

  it('maintains FAQ state independently from other interactions', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const firstQuestion = questions[0];

    fireEvent.click(firstQuestion);
    fireEvent.click(firstQuestion);

    expect(firstQuestion).not.toHaveClass('collapsed');
  });

  it('handles multiple rapid FAQ switches correctly', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const firstQuestion = questions[0];
    const secondQuestion = questions[1];
    const thirdQuestion = questions[2];

    fireEvent.click(secondQuestion);
    fireEvent.click(firstQuestion);
    fireEvent.click(thirdQuestion);
    fireEvent.click(secondQuestion);

    expect(firstQuestion).toHaveClass('collapsed');
    expect(secondQuestion).not.toHaveClass('collapsed');
    expect(thirdQuestion).toHaveClass('collapsed');
  });

  it('renders all FAQ answers initially hidden except active one', () => {
    render(<Faq />);

    const answers = document.querySelectorAll('.accordion-collapse');
    expect(answers[0]).toHaveClass('show');
    expect(answers[1]).not.toHaveClass('show');
    expect(answers[2]).not.toHaveClass('show');
  });

  it('shows answer when clicking on question', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    const secondQuestion = questions[1];

    fireEvent.click(secondQuestion);

    const answers = document.querySelectorAll('.accordion-collapse');
    expect(answers[0]).not.toHaveClass('show');
    expect(answers[1]).toHaveClass('show');
    expect(answers[2]).not.toHaveClass('show');
  });

  it('has proper accordion structure with id references', () => {
     render(<Faq />);

     const collapses = document.querySelectorAll('.accordion-collapse');
     expect(collapses.length).toBe(3);
     expect(collapses[0]).toHaveAttribute('id', 'faq-collapse-1');
   });

  it('has proper accordion cards structure', () => {
    render(<Faq />);

    const cards = document.querySelectorAll('.accordion-card');
    expect(cards.length).toBe(3);
  });

  it('has proper section structure with section ID', () => {
    render(<Faq />);

    const section = document.getElementById('faq');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('faqs-section');
  });

  it('renders section title with proper classes', () => {
    render(<Faq />);

    const sectionTitle = document.querySelector('.section-title');
    expect(sectionTitle).toBeInTheDocument();
    expect(sectionTitle).toHaveClass('mb-55');
  });

  it('renders sub-title with proper styling', () => {
    render(<Faq />);

    const subTitle = screen.getByText('Pertanyaan Umum');
    expect(subTitle).toHaveClass('sub-title');
    expect(subTitle).toHaveClass('style-one');
  });

  it('renders contact images section', () => {
    render(<Faq />);

    const imageBox = document.querySelector('.contact-two_image-box');
    expect(imageBox).toBeInTheDocument();
  });

  it('renders all contact images with proper classes', () => {
    render(<Faq />);

    const images = document.querySelectorAll('.contact-two_image-box img');
    expect(images.length).toBe(4);
  });

  it('has proper grid layout for FAQ section', () => {
    render(<Faq />);

    const rows = document.querySelectorAll('.faqs-section .row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('has proper accordion wrapper structure', () => {
    render(<Faq />);

    const accordion = document.querySelector('.accordion');
    expect(accordion).toBeInTheDocument();
  });

  it('renders each FAQ as unique accordion card', () => {
    render(<Faq />);

    const cards = document.querySelectorAll('.accordion-card');
    expect(cards.length).toBe(3);
  });

  it('has proper question headings with correct class', () => {
     render(<Faq />);
 
     const headings = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
     headings.forEach(heading => {
       expect(heading.tagName).toBe('BUTTON');
       expect(heading).toHaveClass('accordion-title');
     });
   });

  it('has proper answer content structure', () => {
    render(<Faq />);

    const contents = document.querySelectorAll('.accordion-content');
    expect(contents.length).toBe(3);
  });

  it('handles empty FAQ data gracefully', () => {
    render(<Faq />);

    const questions = screen.getAllByText(/Apa saja|Seberapa cepat|Bagaimana mekanisme/);
    expect(questions.length).toBe(3);
  });

  it('has proper padding classes for section spacing', () => {
    render(<Faq />);

    const section = document.querySelector('.faqs-section');
    expect(section).toHaveClass('pt-110');
    expect(section).toHaveClass('pb-190');
  });

  it('has proper column layout for responsive design', () => {
    render(<Faq />);

    const columns = document.querySelectorAll('.faqs-section .col-xl-6');
    expect(columns.length).toBe(2);
  });

  it('has proper margin bottom on accordion cards', () => {
    render(<Faq />);

    const cards = document.querySelectorAll('.accordion-card');
    cards.forEach(card => {
      expect(card).toHaveClass('mb-15');
    });
  });

  it('has proper header structure for each accordion item', () => {
    render(<Faq />);

    const headers = document.querySelectorAll('.accordion-header');
    expect(headers.length).toBe(3);
  });
});
