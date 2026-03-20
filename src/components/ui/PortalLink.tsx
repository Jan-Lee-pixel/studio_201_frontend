import { AnchorHTMLAttributes, ReactNode } from "react";

type PortalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function PortalLink({ href, children, ...props }: PortalLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
