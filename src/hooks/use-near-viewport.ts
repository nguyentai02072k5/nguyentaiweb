'use client';

import { useEffect, useState } from 'react';

export function useNearViewport(ref: React.RefObject<Element | null>) {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isNear) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '700px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNear, ref]);

  return isNear;
}
