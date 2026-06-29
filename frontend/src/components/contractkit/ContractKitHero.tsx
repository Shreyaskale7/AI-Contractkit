import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Purple-desert cinematic loop (served from /public). The poster still shows
// instantly while the 4K video streams in.
const VIDEO_URL = '/purple-desert.mp4';
const POSTER_URL = '/purple-desert.jpg';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const ContractKitHero = () => {
  // Fade the video in once it can actually play, so it never pops over the
  // poster. The poster is also the section background (see .ck-hero) for an
  // instant, flash-free first paint.
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section
      id="home"
      className="ck-hero"
      style={{ backgroundImage: `url(${POSTER_URL})` }}
    >
      <video
        className={`ck-hero-video absolute inset-0 h-full w-full object-cover ${videoReady ? 'is-ready' : ''}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={POSTER_URL}
        onCanPlay={() => setVideoReady(true)}
        aria-hidden="true"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      <div className="absolute inset-0 ck-hero-overlay" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 ck-hero-gradient" aria-hidden="true" />

      <div className="ck-hero-inner">
        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="ck-hero-title"
        >
          Contracts in{' '}
          <span className="ck-hero-accent">Seconds</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="landing-subtitle mx-auto mt-6 text-center"
        >
          Type one sentence. Get a legally-sound agreement with risk analysis—in under 3 seconds.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/register" className="landing-btn-primary">
            Get Started Free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ContractKitHero;
