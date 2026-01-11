import React from "react"

export interface AnimationWrapperProps {
   children: React.ReactNode
   animation?: "fadeInDown" | "fadeInUp" | "fadeInLeft" | "fadeInRight" | "none"
   delay?: string
   offset?: string
   duration?: string
   className?: string
}

const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
   children,
   animation = "fadeInUp",
   delay,
   offset,
   duration,
   className = ""
}) => {
   if (animation === "none") {
      return <>{children}</>
   }

   return (
      <div className={`wow ${animation} ${className}`} {...(delay && { "data-wow-delay": delay })} {...(offset && { "data-wow-offset": offset })} {...(duration && { "data-wow-duration": duration })}>
         {children}
      </div>
   )
}

export default React.memo(AnimationWrapper)
