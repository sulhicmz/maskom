import React from "react"

export interface BackgroundSectionProps {
   children: React.ReactNode
   backgroundImage: string
   className?: string
   id?: string
}

const BackgroundSection: React.FC<BackgroundSectionProps> = ({
   children,
   backgroundImage,
   className = "",
   id
}) => {
   return (
      <section className={`bg_cover ${className}`} style={{ backgroundImage: `url(${backgroundImage})` }} {...(id && { id })}>
         {children}
      </section>
   )
}

export default React.memo(BackgroundSection)
