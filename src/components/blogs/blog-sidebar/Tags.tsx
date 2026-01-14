import React from "react";
import tags from "@/data/BlogTagData";
import Link from "next/link";
import AnimationWrapper from "@/components/common/AnimationWrapper";

const Tags = () => {
    return (
       <div className="sidebar-widget tag-cloud-widget">
          <AnimationWrapper animation="fadeInUp">
             <h3 className="widget-title">Keywords</h3>
             <div className="tagcloud">
                {tags.map((tag) => (
                   <Link key={tag.id} href="/blog" aria-label={`Filter artikel dengan kata kunci: ${tag.name}`}>
                      {tag.name}
                   </Link>
                ))}
             </div>
          </AnimationWrapper>
       </div>
    )
}

Tags.displayName = "Tags"

export default Tags
