import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  className?: string;
}

/** Brand shine: Security blue base + white sweep · 100deg · 3s loop */
const BASE = '#0497f9';
const SHINE = '#ffffff';
const SPREAD = 100;
const DURATION = 3;

const ShinyText = ({ text, className = '' }: ShinyTextProps) => {
  const gradient = `linear-gradient(${SPREAD}deg, ${BASE} 0%, ${BASE} 38%, ${SHINE} 50%, ${BASE} 62%, ${BASE} 100%)`;

  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block',
      }}
      animate={{ backgroundPosition: ['200% center', '-200% center'] }}
      transition={{
        duration: DURATION,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  );
};

export default ShinyText;
