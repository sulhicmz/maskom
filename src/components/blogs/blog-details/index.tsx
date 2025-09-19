import Breadcrumb from "@/components/common/Breadcrumb"
import Cta from "@/components/common/Cta"
import FooterTwo from "@/layouts/footers/FooterTwo"
import HeaderOne from "@/layouts/headers/HeaderOne"
import BlogDetailsArea from "./BlogDetailsArea"

const BlogDetails = () => {
  return (
    <div className="ac-page-wrapper">
      <HeaderOne style={true} />
      <div className="smooth-wrapper">
        <div id="smooth-content">
          <Breadcrumb title="Blog Details" sub_title="Blog Details" />
          <BlogDetailsArea />
          <Cta />
        </div>
      </div>
      <FooterTwo />
    </div>
  )
}

export default BlogDetails
