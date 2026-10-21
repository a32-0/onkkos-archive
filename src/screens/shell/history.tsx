"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type AnchorHTMLAttributes, type MouseEvent } from "react";

const visited: string[] = [];

export function Visit() {
  useEffect(() => {
    const here = window.location.href;
    if (visited[visited.length - 1] !== here) visited.push(here);
  }, []);
  return null;
}

export function BackLink({
  href,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useRouter();
  const back = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || visited.length < 2) return;
    event.preventDefault();
    visited.pop();
    router.back();
  };
  return <Link href={href} onClick={back} {...rest} />;
}
