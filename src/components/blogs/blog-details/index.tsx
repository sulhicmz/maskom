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
          <Breadcrumb title="Wawasan Maskom" sub_title="Artikel" />
          <BlogDetailsArea />
          <Cta />
        </div>
      </div>
      <FooterTwo />
    </div>
  )
}

export default BlogDetails
