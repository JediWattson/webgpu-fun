"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Portal({
  children,
  elementId,
}: {
  elementId: string;
  children: React.ReactNode;
}) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    let element = document.getElementById(elementId);
    if (!element) {
      element = document.createElement("div");
      element.setAttribute("id", elementId);
      const html = document.getElementsByTagName("html")[0];
      html.appendChild(element);
    }
    setPortalNode(element);
  }, []);

  if (!portalNode) return null;
  return createPortal(children, portalNode);
}
