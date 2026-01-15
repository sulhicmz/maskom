"use client"
import React from "react";
import tags from "@/data/BlogTagData";
import AnimationWrapper from "@/components/common/AnimationWrapper";

interface TagsProps {
  selectedTagId: number | null
  onTagClick: (tagId: number | null) => void
}

const Tags: React.FC<TagsProps> = ({ selectedTagId, onTagClick }) => {
    const handleTagClick = (tagId: number) => {
      onTagClick(selectedTagId === tagId ? null : tagId)
    }

    return (
       <div className="sidebar-widget tag-cloud-widget">
          <AnimationWrapper animation="fadeInUp">
             <h3 className="widget-title">Keywords</h3>
             <div className="tagcloud">
                {tags.map((tag) => (
                   <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.id)}
                      className={`tag-btn ${selectedTagId === tag.id ? 'active' : ''}`}
                      aria-label={`Filter artikel dengan kata kunci: ${tag.name}`}
                      aria-pressed={selectedTagId === tagId}
                   >
                      {tag.name}
                   </button>
                ))}
                {selectedTagId && (
                  <button
                    onClick={() => onTagClick(null)}
                    className="clear-tags-btn"
                    aria-label="Hapus filter keyword"
                  >
                    Hapus Filter
                  </button>
                )}
             </div>
          </AnimationWrapper>
       </div>
    )
}

Tags.displayName = "Tags"

export default Tags
