import { ReactNode } from "react";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";
import FooterTwo from "@/layouts/footers/FooterTwo";
import Breadcrumb from "@/components/common/Breadcrumb";

export interface PageBuilderConfig {
  title: string;
  subTitle: string;
  content: ReactNode;
  footer?: 'one' | 'two';
  headerStyle?: boolean;
  footerStyle?: boolean;
  footerStyle2?: boolean;
}

export interface PageBuilderWithSectionsConfig {
  title: string;
  subTitle: string;
  sections: ReactNode[];
  footer?: 'one' | 'two';
  headerStyle?: boolean;
  footerStyle?: boolean;
  footerStyle2?: boolean;
}

export function PageBuilder({
  title,
  subTitle,
  content,
  footer = 'two',
  headerStyle = true,
  footerStyle = false,
  footerStyle2 = false
}: PageBuilderConfig) {
  return (
    <div className="ac-page-wrapper">
      <HeaderOne style={headerStyle} />
      <div className="smooth-wrapper">
        <div id="smooth-content">
          <Breadcrumb title={title} sub_title={subTitle} />
          {content}
        </div>
      </div>
      {footer === 'one' 
        ? <FooterOne style={footerStyle} style_2={footerStyle2} /> 
        : <FooterTwo />
      }
    </div>
  );
}

export function PageBuilderWithSections({
  title,
  subTitle,
  sections,
  footer = 'two',
  headerStyle = true,
  footerStyle = false,
  footerStyle2 = false
}: PageBuilderWithSectionsConfig) {
  return (
    <div className="ac-page-wrapper">
      <HeaderOne style={headerStyle} />
      <div className="smooth-wrapper">
        <div id="smooth-content">
          <Breadcrumb title={title} sub_title={subTitle} />
          {sections.map((section, index) => (
            <section key={index}>{section}</section>
          ))}
        </div>
      </div>
      {footer === 'one' 
        ? <FooterOne style={footerStyle} style_2={footerStyle2} /> 
        : <FooterTwo />
      }
    </div>
  );
}

export default PageBuilder;
