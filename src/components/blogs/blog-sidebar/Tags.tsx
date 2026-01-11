import tags from "@/data/BlogTagData";

const Tags = () => {
   return (
      <div className="sidebar-widget tag-cloud-widget wow fadeInUp">
         <h3 className="widget-title">Keywords</h3>
          <div className="tagcloud">
             {tags.map((tag, i) => (
                <span key={i}>{tag}</span>
             ))}
          </div>
      </div>
   )
}

export default Tags
