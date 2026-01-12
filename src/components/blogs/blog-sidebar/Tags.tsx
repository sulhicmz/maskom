import tags from "@/data/BlogTagData";
import AnimationWrapper from "@/components/common/AnimationWrapper";

const Tags = () => {
   return (
      <div className="sidebar-widget tag-cloud-widget">
         <AnimationWrapper animation="fadeInUp">
            <h3 className="widget-title">Keywords</h3>
            <div className="tagcloud">
               {tags.map((tag) => (
                  <span key={tag.id}>{tag.name}</span>
               ))}
            </div>
         </AnimationWrapper>
      </div>
   )
}

export default Tags
