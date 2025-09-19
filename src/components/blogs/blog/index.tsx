import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import BlogArea from "./BlogArea"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Cta from "@/components/common/Cta"

const Blog = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Blog Post" sub_title="Blog Post" />
               <BlogArea />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Blog
