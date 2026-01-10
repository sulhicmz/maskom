import { ReactNode } from "react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import FooterTwo from "@/layouts/footers/FooterTwo";
import Breadcrumb from "@/components/common/Breadcrumb";

interface PageLayoutProps {
  children: ReactNode;
  breadcrumbTitle?: string;
  breadcrumbSubTitle?: string;
  footer?: 'one' | 'two';
  headerStyle?: boolean;
  footerStyle?: boolean;
  footerStyle2?: boolean;
}

const PageLayout = ({ children, breadcrumbTitle, breadcrumbSubTitle, footer = 'two', headerStyle = true, footerStyle = false, footerStyle2 = false }: PageLayoutProps) => {
  return (
    <div className="ac-page-wrapper">
      <HeaderOne style={headerStyle} />
      <div className="smooth-wrapper">
        <div id="smooth-content">
          {breadcrumbTitle && breadcrumbSubTitle && (
            <Breadcrumb title={breadcrumbTitle} sub_title={breadcrumbSubTitle} />
          )}
          {children}
        </div>
      </div>
      {footer === 'one' ? <FooterOne style={footerStyle} style_2={footerStyle2} /> : <FooterTwo />}
    </div>
  )
}

export default PageLayout
