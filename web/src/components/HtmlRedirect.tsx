"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function HtmlRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path.endsWith(".html")) {
        let cleanPath = path.substring(0, path.length - 5);
        if (cleanPath === "/index" || cleanPath.endsWith("/index")) {
          cleanPath = cleanPath.substring(0, cleanPath.length - 5) || "/";
        }
        router.replace(cleanPath);
      }
    }
  }, [router, pathname]);

  return null;
}
