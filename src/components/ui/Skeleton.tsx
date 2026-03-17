import clsx from "clsx";

type SkeletonProps = {
  className?: string;
  dark?: boolean;
};

export function Skeleton({ className, dark = false }: SkeletonProps) {
  return <div className={clsx("skeleton", dark && "skeleton-dark", className)} aria-hidden="true" />;
}
