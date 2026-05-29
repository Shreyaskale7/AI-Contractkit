import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Triggers when ~20% of the element enters the viewport */
export const scrollViewport = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -60px 0px' as const,
};

export const fadeUpVariant = {
  hidden: { opacity: 0, y: 56 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

export const scrollTransition = (delay = 0) => ({
  duration: 0.8,
  delay,
  ease: EASE,
});

type ScrollFadeProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Fade + slide up when scrolled into view */
const ScrollFade = ({ children, className = '', delay = 0 }: ScrollFadeProps) => {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fadeUpVariant}
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      transition={scrollTransition(delay)}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFade;
