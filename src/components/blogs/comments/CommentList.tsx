"use client";

import { useState } from "react";
import Image from "next/image";
import { BlogCommentItem } from "@/types/data";
import { formatCommentDate } from "@/utils/dateFormat";
import CommentForm, { CommentFormData } from "./CommentForm";
import { memo } from "react";

interface CommentListProps {
  comments: BlogCommentItem[];
  blogId: number;
}

const CommentList = ({ comments, blogId }: CommentListProps) => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [localComments, setLocalComments] = useState<BlogCommentItem[]>(comments);
  const [userVotes, setUserVotes] = useState<Map<number, 'up' | 'down'>>(new Map());

  const approvedComments = localComments.filter(c => c.status === 'approved');

  const buildCommentTree = (comments: BlogCommentItem[], parentId: number | null = null) => {
    return comments
      .filter(comment => comment.parentId === parentId)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
  };

  const rootComments = buildCommentTree(approvedComments, null);

  const handleVote = (commentId: number, voteType: 'up' | 'down') => {
    const previousVote = userVotes.get(commentId);

    if (previousVote === voteType) {
      const updatedVotes = new Map(userVotes);
      updatedVotes.delete(commentId);
      setUserVotes(updatedVotes);

      setLocalComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            upvotes: voteType === 'up' ? comment.upvotes - 1 : comment.upvotes,
            downvotes: voteType === 'down' ? comment.downvotes - 1 : comment.downvotes
          };
        }
        return comment;
      }));
    } else {
      const updatedVotes = new Map(userVotes);
      updatedVotes.set(commentId, voteType);
      setUserVotes(updatedVotes);

      setLocalComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const upvoteChange = voteType === 'up' ? 1 : (previousVote === 'up' ? -1 : 0);
          const downvoteChange = voteType === 'down' ? 1 : (previousVote === 'down' ? -1 : 0);
          return {
            ...comment,
            upvotes: comment.upvotes + upvoteChange,
            downvotes: comment.downvotes + downvoteChange
          };
        }
        return comment;
      }));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReplySuccess = (data: CommentFormData) => {
    setReplyingTo(null);
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: BlogCommentItem; depth?: number }) => {
    const replies = buildCommentTree(approvedComments, comment.id);
    const currentVote = userVotes.get(comment.id);
    const isReplying = replyingTo === comment.id;

    return (
      <div
        className={`comment-item ${depth > 0 ? 'comment-reply' : ''}`}
        style={{ marginLeft: depth > 0 ? '40px' : '0' }}
        role="article"
        aria-labelledby={`comment-${comment.id}-name`}
      >
        <div className="ac-postbox__comment-box">
          <div className="ac-postbox__comment-info d-flex">
            <div className="ac-postbox__comment-avater mr-25">
              <Image 
                src={comment.avatar} 
                alt={`Avatar ${comment.name}`}
                width={50}
                height={50}
              />
            </div>
            <div className="ac-postbox__comment-name">
              <h5 id={`comment-${comment.id}-name`}>{comment.name}</h5>
              <span className="post-meta">{formatCommentDate(comment.date)}</span>
            </div>
          </div>
          <div className="ac-postbox__comment-text">
            <p>{comment.content}</p>
            <div className="comment-actions d-flex align-items-center gap-2 mt-2">
              <button
                type="button"
                className="btn-vote"
                onClick={() => handleVote(comment.id, 'up')}
                aria-label={`Setuju dengan komentar dari ${comment.name}`}
                aria-pressed={currentVote === 'up'}
              >
                <i className={`far fa-thumbs-up ${currentVote === 'up' ? 'active' : ''}`}></i>
                <span>{comment.upvotes}</span>
              </button>
              <button
                type="button"
                className="btn-vote"
                onClick={() => handleVote(comment.id, 'down')}
                aria-label={`Tidak setuju dengan komentar dari ${comment.name}`}
                aria-pressed={currentVote === 'down'}
              >
                <i className={`far fa-thumbs-down ${currentVote === 'down' ? 'active' : ''}`}></i>
                <span>{comment.downvotes}</span>
              </button>
              <button
                type="button"
                className="btn-reply"
                onClick={() => setReplyingTo(comment.id)}
                aria-label={`Balas komentar dari ${comment.name}`}
              >
                <i className="far fa-comment"></i>
                Balas
              </button>
            </div>
            {isReplying && (
              <div className="reply-form mt-3">
                <CommentForm
                  blogId={blogId}
                  parentId={comment.id}
                  onSubmitSuccess={handleReplySuccess}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </div>
            )}
          </div>
        </div>
        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ac-postbox_comment mb-55 wow fadeInUp">
      <h3 className="ac-comment-title">
        {approvedComments.length} Komentar
      </h3>
      {approvedComments.length === 0 ? (
        <p className="no-comments">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
      ) : (
        <ul className="comment-list">
          {rootComments.map(comment => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default memo(CommentList);