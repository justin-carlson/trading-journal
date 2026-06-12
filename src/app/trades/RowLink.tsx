"use client";

import { useRouter } from "next/navigation";

export function RowLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <tr className={className} onClick={() => router.push(href)}>
      {children}
    </tr>
  );
}
