"use client";
import Loader from "./Loader";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const RouteLoader = () => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); // Simulate loading
    return () => clearTimeout(timeout);
  }, [pathname]);

  return loading ? <Loader /> : null;
};

export default RouteLoader; 