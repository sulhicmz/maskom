import React from "react"

export interface SectionTitleProps {
   subtitle?: string
   title: string
   description?: string
   className?: string
   align?: "left" | "center" | "right"
   animation?: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none"
   whiteText?: boolean
}

const SectionTitle: React.FC<SectionTitleProps> = ({
   subtitle,
   title,
   description,
   className = "",
   align = "center",
   animation = "fadeInDown",
   whiteText = false
}) => {
   const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right"
   const whiteClass = whiteText ? "title-white" : ""
   const animationClass = animation !== "none" ? `wow ${animation}` : ""

   return (
      <div className={`section-title ${alignClass} ${whiteClass} ${className} ${animationClass}`}>
         {subtitle && <span className="sub-title style-one">{subtitle}</span>}
         <h2>{title}</h2>
         {description && <p>{description}</p>}
      </div>
   )
}

export default React.memo(SectionTitle)
