import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIStep } from '@/types/data';
import AIAutomation from '../AIAutomation';

describe('AIAutomation', () => {
  const mockSteps: AIStep[] = [
    {
      id: 1,
      title: 'Step 1: Select AI Type',
      content: 'Choose the type of AI automation you want to implement',
    },
    {
      id: 2,
      title: 'Step 2: Configure Settings',
      content: 'Configure the AI model parameters and behavior',
    },
    {
      id: 3,
      title: 'Step 3: Deploy',
      content: 'Deploy your AI automation to production',
    },
  ];

  describe('Rendering', () => {
    it('should render AI Automation Wizard title', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      expect(screen.getByText('AI Automation Wizard')).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const { container } = render(<AIAutomation steps={mockSteps} />);
      
      const progressBar = container.querySelector('.progress');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render step content section', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      expect(screen.getByText('Step 1: Select AI Type')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should render AI type dropdown', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    it('should start on first step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      expect(screen.getByText('Step 1: Select AI Type')).toBeInTheDocument();
      expect(screen.getByText('Choose the type of AI automation you want to implement')).toBeInTheDocument();
    });

    it('should have correct progress bar width for first step', () => {
      const { container } = render(<AIAutomation steps={mockSteps} />);
      
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '33%' });
    });

    it('should disable Previous button on first step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('should show Next button text on first step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('Navigation - Next Button', () => {
    it('should navigate to second step when Next is clicked', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Step 2: Configure Settings')).toBeInTheDocument();
      expect(screen.getByText('Configure the AI model parameters and behavior')).toBeInTheDocument();
    });

    it('should enable Previous button after moving to second step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      
      const previousButton = screen.getByText('Previous');
      expect(previousButton).not.toBeDisabled();
    });

    it('should show Next button text on intermediate steps', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should update progress bar when moving to next step', () => {
      const { container } = render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '67%' });
    });

    it('should change Next button to Finish on last step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });
  });

  describe('Navigation - Previous Button', () => {
    it('should navigate back to first step from second step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Previous'));
      
      expect(screen.getByText('Step 1: Select AI Type')).toBeInTheDocument();
    });

    it('should disable Previous button when back on first step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Previous'));
      
      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('should update progress bar when moving to previous step', () => {
      const { container } = render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '67%' });
      
      fireEvent.click(screen.getByText('Previous'));
      expect(progressBar).toHaveStyle({ width: '33%' });
    });
  });

  describe('Last Step', () => {
    it('should navigate to last step correctly', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Step 3: Deploy')).toBeInTheDocument();
      expect(screen.getByText('Deploy your AI automation to production')).toBeInTheDocument();
    });

    it('should show Finish button on last step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should have correct progress bar width on last step', () => {
      const { container } = render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should enable Previous button on last step', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      fireEvent.click(screen.getByText('Next'));
      fireEvent.click(screen.getByText('Next'));
      
      const previousButton = screen.getByText('Previous');
      expect(previousButton).not.toBeDisabled();
    });
  });

  describe('AI Type Dropdown', () => {
    it('should render all AI type options', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThanOrEqual(3); 
      expect(options[0]).toHaveTextContent('Chatbot');
      expect(options[1]).toHaveTextContent('Product Recommendations');
      expect(options[2]).toHaveTextContent('Workflow Automation');
    });

    it('should allow selecting AI type', () => {
      render(<AIAutomation steps={mockSteps} />);
      
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Chatbot' } });
      
      expect(select).toHaveValue('Chatbot');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const singleStep: AIStep[] = [
        {
          id: 1,
          title: 'Single Step',
          content: 'Only one step',
        },
      ];
      
      render(<AIAutomation steps={singleStep} />);
      
      expect(screen.getByText('Single Step')).toBeInTheDocument();
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should handle two steps', () => {
      const twoSteps: AIStep[] = [
        {
          id: 1,
          title: 'Step 1',
          content: 'First step',
        },
        {
          id: 2,
          title: 'Step 2',
          content: 'Second step',
        },
      ];
      
      render(<AIAutomation steps={twoSteps} />);
      
      expect(screen.getByText('Step 1')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Next'));
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Finish')).toBeInTheDocument();
    });

    it('should handle steps with special characters', () => {
      const specialSteps: AIStep[] = [
        {
          id: 1,
          title: "Step 1: O'Connor's Setup",
          content: "Setup with special 'characters'",
        },
      ];
      
      render(<AIAutomation steps={specialSteps} />);
      
      expect(screen.getByText("Step 1: O'Connor's Setup")).toBeInTheDocument();
      expect(screen.getByText("Setup with special 'characters'")).toBeInTheDocument();
    });

    it('should handle steps with very long content', () => {
      const longContentSteps: AIStep[] = [
        {
          id: 1,
          title: 'Very Long Step Title That Might Break Layout',
          content: 'Very long content that might break the layout if not handled properly by the component',
        },
      ];
      
      render(<AIAutomation steps={longContentSteps} />);
      
      expect(screen.getByText('Very Long Step Title That Might Break Layout')).toBeInTheDocument();
      expect(screen.getByText('Very long content that might break the layout if not handled properly by the component')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate progress correctly for 4 steps', () => {
      const fourSteps: AIStep[] = [
        { id: 1, title: 'Step 1', content: 'Content 1' },
        { id: 2, title: 'Step 2', content: 'Content 2' },
        { id: 3, title: 'Step 3', content: 'Content 3' },
        { id: 4, title: 'Step 4', content: 'Content 4' },
      ];
      
      const { container } = render(<AIAutomation steps={fourSteps} />);
      
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '25%' });
      
      fireEvent.click(screen.getByText('Next'));
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should calculate progress correctly for 5 steps', () => {
      const fiveSteps: AIStep[] = [
        { id: 1, title: 'Step 1', content: 'Content 1' },
        { id: 2, title: 'Step 2', content: 'Content 2' },
        { id: 3, title: 'Step 3', content: 'Content 3' },
        { id: 4, title: 'Step 4', content: 'Content 4' },
        { id: 5, title: 'Step 5', content: 'Content 5' },
      ];
      
      const { container } = render(<AIAutomation steps={fiveSteps} />);
      
      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toHaveStyle({ width: '20%' });
    });
  });
});
