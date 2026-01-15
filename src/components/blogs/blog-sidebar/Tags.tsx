import React from "react";
import tags from "@/data/BlogTagData";
import AnimationWrapper from "@/components/common/AnimationWrapper";

interface TagsProps {
   selectedTagId: number | null
   onTagClick: (tagId: number | null) => void
}

const Tags: React.FC<TagsProps> = ({ selectedTagId, onTagClick }) => {
   const handleTagClick = (tagId: number) => {
      if (selectedTagId === tagId) {
         onTagClick(null)
      } else {
         onTagClick(tagId)
      }
   }

   return (
      <div className="sidebar-widget tag-cloud-widget">
         <AnimationWrapper animation="fadeInUp">
            <h3 className="widget-title">Keywords</h3>
            <div className="tagcloud">
               <button
                  type="button"
                  className={`tag-btn ${selectedTagId === null ? "active" : ""}`}
                  onClick={() => onTagClick(null)}
                  aria-label="Tampilkan semua tag"
               >
                  Semua
               </button>
               {tags.map((tag) => (
                  <button
                     key={tag.id}
                     type="button"
                     className={`tag-btn ${selectedTagId === tag.id ? "active" : ""}`}
                     onClick={() => handleTagClick(tag.id)}
                     aria-label={`Filter artikel dengan kata kunci: ${tag.name}`}
                     aria-pressed={selectedTagId === tag.id}
                  >
                     {tag.name}
                  </button>
               ))}
            </div>
         </AnimationWrapper>
      </div>
   )
}

Tags.displayName = "Tags"

export default Tags
