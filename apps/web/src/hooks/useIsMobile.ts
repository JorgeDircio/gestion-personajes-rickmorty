"use client";

import { useEffect, useState } from "react";
import { MOBILE_MAX_WIDTH } from "@/lib/constants";

const QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
