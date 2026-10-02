import { useEffect, useRef, useState } from 'react';

/** Flips to true the first time `amount` (0–1) of the element is visible, then stops observing. */
export function useInView<T extends Element>(amount = 0) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: amount },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount, inView]);

  return [ref, inView] as const;
}
