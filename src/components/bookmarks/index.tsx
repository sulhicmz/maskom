'use client';

import React, { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark } from '@/utils/bookmarkStorage';
import { Bookmark } from '@/types/bookmark';
import PageBuilder from '@/components/common/PageBuilder';
import Link from 'next/link';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = () => {
    setLoading(true);
    const savedBookmarks = getBookmarks();
    setBookmarks(savedBookmarks);
    setLoading(false);
  };

  useEffect(() => {
    const fetchBookmarks = () => {
      setLoading(true);
      const savedBookmarks = getBookmarks();
      setBookmarks(savedBookmarks);
      setLoading(false);
    };
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = (postId: string) => {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      removeBookmark(postId);
      loadBookmarks();
    }
  };

  if (loading) {
    return (
      <PageBuilder
        title="My Bookmarks"
        subTitle="Your saved blog posts"
        content={
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }
      />
    );
  }

  if (bookmarks.length === 0) {
    return (
      <PageBuilder
        title="My Bookmarks"
        subTitle="Your saved blog posts"
        content={
          <div className="container py-5 text-center">
            <div className="alert alert-info mt-4">
              <i className="far fa-bookmark me-2" aria-hidden="true" />
              You haven&apos;t bookmarked any posts yet.
            </div>
            <Link href="/blog" className="btn btn-primary">
              <i className="far fa-arrow-right me-1" aria-hidden="true" />
              Browse Blog
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <PageBuilder
      title="My Bookmarks"
      subTitle={`${bookmarks.length} saved posts`}
      content={
        <div className="container py-5">
          <div className="row mt-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{bookmark.postTitle}</h5>
                    {bookmark.postCategory && (
                      <p className="text-muted small">
                        <i className="far fa-folder me-1" aria-hidden="true" />
                        {bookmark.postCategory}
                      </p>
                    )}
                    {bookmark.postTags && bookmark.postTags.length > 0 && (
                      <div className="mb-3">
                        {bookmark.postTags.map((tag, index) => (
                          <span
                            key={`${bookmark.id}-${tag}-${index}`}
                            className="badge bg-light text-dark me-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-muted small mb-3">
                      <i className="far fa-clock me-1" aria-hidden="true" />
                      Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                    </p>
      <div className="d-flex gap-2">
        {bookmark.postSlug && (
          <Link
            href={`/blog-details?id=${bookmark.postId}`}
            className="btn btn-primary btn-sm flex-grow-1"
          >
            <i className="far fa-eye me-1" aria-hidden="true" />
            Read Post
          </Link>
        )}
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.postId)}
                        className="btn btn-outline-danger btn-sm"
                        type="button"
                        aria-label="Remove bookmark"
                      >
                        <i className="far fa-trash-alt" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
