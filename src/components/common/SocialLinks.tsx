import Link from "next/link";
import React from "react";

interface SocialLinksProps {
  links?: Array<{
    url: string;
    iconClass: string;
    ariaLabel: string;
    target?: '_blank' | '_self';
  }>;
  className?: string;
}

const SocialLinks = ({ links, className = "social-link" }: SocialLinksProps) => {
  if (!links || links.length === 0) {
    return null;
  }

  return (
    <ul className={className}>
      {links.map((link, index) => (
        <li key={index}>
          <Link 
            href={link.url} 
            target={link.target || '_self'} 
            rel={link.target === '_blank' ? 'noopener noreferrer' : undefined} 
            aria-label={link.ariaLabel}
          >
            <i className={link.iconClass} aria-hidden="true"></i>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default React.memo(SocialLinks)
