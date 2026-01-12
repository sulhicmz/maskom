import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogComment from '../BlogComment';

jest.mock('@/assets/images/blog/comment-1.jpg', () => ({
  src: '/assets/images/blog/comment-1.jpg',
  height: 50,
  width: 50,
  blurDataURL: '',
}));

jest.mock('@/assets/images/blog/comment-2.jpg', () => ({
  src: '/assets/images/blog/comment-2.jpg',
  height: 50,
  width: 50,
  blurDataURL: '',
}));

const mockAvatar1 = {
  src: '/assets/images/blog/comment-1.jpg',
  height: 50,
  width: 50,
  blurDataURL: '',
};

const mockAvatar2 = {
  src: '/assets/images/blog/comment-2.jpg',
  height: 50,
  width: 50,
  blurDataURL: '',
};

const mockComments = [
   {
     id: 1,
     blogId: 1,
     name: 'John Doe',
     avatar: mockAvatar1,
     date: '2026-01-10',
     content: 'Great article! Very informative and well-written.',
   },
   {
     id: 2,
     blogId: 1,
     name: 'Jane Smith',
     avatar: mockAvatar2,
     date: '2026-01-09',
     content: 'I found this post very helpful. Thanks for sharing!',
   },
 ];

describe('BlogComment', () => {
  it('renders comment section with title', () => {
    render(<BlogComment comments={mockComments} />);

    expect(screen.getByText('2 Comments')).toBeInTheDocument();
  });

  it('renders all comments', () => {
    render(<BlogComment comments={mockComments} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders comment author names', () => {
    render(<BlogComment comments={mockComments} />);

    const authorNames = screen.getAllByText(/John Doe|Jane Smith/);
    expect(authorNames.length).toBe(2);
  });

  it('renders comment dates', () => {
    render(<BlogComment comments={mockComments} />);
    
    expect(screen.getByText('10 Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('09 Jan 2026')).toBeInTheDocument();
  });

  it('renders comment content', () => {
    render(<BlogComment comments={mockComments} />);

    expect(screen.getByText('Great article! Very informative and well-written.')).toBeInTheDocument();
    expect(screen.getByText('I found this post very helpful. Thanks for sharing!')).toBeInTheDocument();
  });

  it('renders reply buttons for each comment', () => {
    render(<BlogComment comments={mockComments} />);

    const replyButtons = screen.getAllByText('Reply');
    expect(replyButtons.length).toBe(2);
  });

  it('renders comment avatars as images', () => {
    render(<BlogComment comments={mockComments} />);

    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBe(2);
  });

  it('renders avatars with correct alt text', () => {
    render(<BlogComment comments={mockComments} />);

    const avatars = screen.getAllByRole('img');
    expect(avatars[0]).toHaveAttribute('alt', 'Avatar John Doe');
    expect(avatars[1]).toHaveAttribute('alt', 'Avatar Jane Smith');
  });

  it('renders comment count based on comments array length', () => {
    render(<BlogComment comments={mockComments} />);

    expect(screen.getByText('2 Comments')).toBeInTheDocument();
  });

  it('renders comment count as singular for single comment', () => {
    const singleComment = [mockComments[0]];
    render(<BlogComment comments={singleComment} />);

    expect(screen.getByText('1 Comments')).toBeInTheDocument();
  });

  it('renders comments as unordered list', () => {
    render(<BlogComment comments={mockComments} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('renders each comment as list item', () => {
    render(<BlogComment comments={mockComments} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);
  });

  it('does not add children class to first comment', () => {
    render(<BlogComment comments={mockComments} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0]).not.toHaveClass('children');
  });

  it('adds children class to subsequent comments', () => {
    render(<BlogComment comments={mockComments} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems[1]).toHaveClass('children');
  });

  it('renders comment info container', () => {
    render(<BlogComment comments={mockComments} />);

    const commentBoxes = document.querySelectorAll('.ac-postbox__comment-box');
    expect(commentBoxes.length).toBe(2);
  });

  it('renders comment info section with avatar and name', () => {
    render(<BlogComment comments={mockComments} />);

    const commentInfos = document.querySelectorAll('.ac-postbox__comment-info');
    expect(commentInfos.length).toBe(2);
  });

  it('renders comment avatar container', () => {
    render(<BlogComment comments={mockComments} />);

    const avatarContainers = document.querySelectorAll('.ac-postbox__comment-avater');
    expect(avatarContainers.length).toBe(2);
  });

  it('renders comment name section', () => {
    render(<BlogComment comments={mockComments} />);

    const nameSections = document.querySelectorAll('.ac-postbox__comment-name');
    expect(nameSections.length).toBe(2);
  });

  it('renders post-meta class for date', () => {
    render(<BlogComment comments={mockComments} />);
    
    const postMetas = screen.getAllByText(/10 Jan 2026|09 Jan 2026/);
    postMetas.forEach(meta => {
      expect(meta).toHaveClass('post-meta');
    });
  });

  it('renders comment text section', () => {
    render(<BlogComment comments={mockComments} />);

    const textSections = document.querySelectorAll('.ac-postbox__comment-text');
    expect(textSections.length).toBe(2);
  });

  it('renders comment reply section', () => {
    render(<BlogComment comments={mockComments} />);

    const replySections = document.querySelectorAll('.ac-postbox__comment-reply');
    expect(replySections.length).toBe(2);
  });

  it('renders reply buttons as button elements', () => {
    render(<BlogComment comments={mockComments} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('handles empty comments array gracefully', () => {
    render(<BlogComment comments={[]} />);

    expect(screen.getByText('0 Comments')).toBeInTheDocument();
  });

  it('renders proper spacing classes', () => {
    render(<BlogComment comments={mockComments} />);

    const commentSection = screen.getByText('2 Comments').closest('.ac-postbox_comment');
    expect(commentSection).toHaveClass('mb-55');
    expect(commentSection).toHaveClass('wow');
    expect(commentSection).toHaveClass('fadeInUp');
  });

  it('renders comment title with correct class', () => {
    render(<BlogComment comments={mockComments} />);

    const commentTitle = screen.getByText('2 Comments');
    expect(commentTitle).toHaveClass('ac-comment-title');
  });

  it('has proper semantic HTML structure', () => {
    render(<BlogComment comments={mockComments} />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
  });

  it('renders author names as heading elements', () => {
    render(<BlogComment comments={mockComments} />);

    const headings = screen.getAllByText(/John Doe|Jane Smith/);
    headings.forEach(heading => {
      expect(heading.tagName).toBe('H5');
    });
  });

  it('handles comments with long content', () => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    const longComment = [
      {
        id: 1,
        blogId: 1,
        name: 'Test User',
        avatar: mockAvatar1,
        date: '2026-01-10',
        content: longContent,
      },
    ];

    render(<BlogComment comments={longComment} />);

    expect(screen.getByText((content) => content.includes('Lorem ipsum dolor sit amet'))).toBeInTheDocument();
  });

  it('handles comments with special characters in content', () => {
    const specialComment = [
      {
        id: 1,
        blogId: 1,
        name: 'Test User',
        avatar: mockAvatar1,
        date: '2026-01-10',
        content: 'Great article! @author #hashtags & more <tags>',
      },
    ];

    render(<BlogComment comments={specialComment} />);

    expect(screen.getByText('Great article! @author #hashtags & more <tags>')).toBeInTheDocument();
  });

  it('renders all comments when provided', () => {
    const { container } = render(<BlogComment comments={mockComments} />);

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2);
  });

  it('renders proper margin on avatar container', () => {
    render(<BlogComment comments={mockComments} />);

    const avatarContainers = document.querySelectorAll('.ac-postbox__comment-avater');
    avatarContainers.forEach(container => {
      expect(container).toHaveClass('mr-25');
    });
  });

  it('renders margin on comment info sections', () => {
    render(<BlogComment comments={mockComments} />);

    const commentInfos = document.querySelectorAll('.ac-postbox__comment-info');
    commentInfos.forEach(info => {
      expect(info).toHaveClass('d-flex');
    });
  });

  it('renders comment paragraph content', () => {
    render(<BlogComment comments={mockComments} />);

    const paragraphs = screen.getAllByText(/Great article|I found this post/);
    paragraphs.forEach(p => {
      expect(p.tagName).toBe('P');
    });
  });
});
