import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BarChart3, ChevronRight, FileSignature, FileText, Shield, Sparkles, Users, Wallet, Zap } from 'lucide-react';
import ContractKitHero from '../components/contractkit/ContractKitHero';
import ContractKitNav from '../components/contractkit/ContractKitNav';
import ScrollFade, {
  fadeUpVariant,
  scrollTransition,
  scrollViewport,
  staggerContainer,
} from '../components/contractkit/ScrollFade';

const features = [
  {
    icon: Sparkles,
    title: 'AI Contract Generator',
    tag: 'Groq LLaMA · < 3 sec',
    desc: 'Describe your project in plain English and get a complete, professional contract with automatic risk flagging.',
  },
  {
    icon: FileSignature,
    title: 'E-Signature Workflow',
    tag: 'Public signing links',
    desc: 'Send secure signing links to clients. Track draft → sent → signed status without chasing email threads.',
  },
  {
    icon: Wallet,
    title: 'Invoicing',
    tag: 'INR · USD · EUR',
    desc: 'Create line-item invoices, track their status, and monitor revenue alongside your contract pipeline.',
  },
  {
    icon: Shield,
    title: 'AI Risk Detection',
    tag: 'Dual LLM pipeline',
    desc: 'Every contract is scanned for missing clauses, risky language, and compliance gaps before you send.',
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    tag: 'Reusable library',
    desc: 'Save any contract as a template. Prefill generation and ship repeat work faster.',
  },
  {
    icon: BarChart3,
    title: 'Business Analytics',
    tag: 'Real-time dashboard',
    desc: 'Revenue, signed contracts, client performance, and invoice status in one premium view.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Describe your project',
    desc: 'One sentence is enough—budget, milestones, revisions, payment terms. AI handles the legal structure.',
  },
  {
    step: '02',
    title: 'Review & refine with AI',
    desc: 'Edit inline or ask AI to add clauses, tighten payment terms, or adjust scope in seconds.',
  },
  {
    step: '03',
    title: 'Send, sign & invoice',
    desc: 'Share a public link for signing, then invoice the client and track invoice status in the same workspace.',
  },
];

const StaggerGrid = ({ className, children }: { className: string; children: ReactNode }) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" whileInView="visible" viewport={scrollViewport}>
      {children}
    </motion.div>
  );
};

const StaggerItem = ({ className, children }: { className?: string; children: ReactNode }) => {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={fadeUpVariant} transition={scrollTransition()}>
      {children}
    </motion.div>
  );
};

const SectionHeader = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) => (
  <ScrollFade className="landing-section-header">
    <p className="landing-eyebrow">{eyebrow}</p>
    <h2 className="landing-h2">{title}</h2>
    {children}
  </ScrollFade>
);

const ContractKitLanding = () => {
  return (
    <div className="landing-page font-sans antialiased">
      <ContractKitNav />
      <ContractKitHero />

      {/* About */}
      <section id="about-us" className="landing-section">
        <div className="landing-container">
          <SectionHeader
            eyebrow="About"
            title="The intelligent workspace for modern freelancers."
          />
          <ScrollFade delay={0.1} className="landing-body max-w-3xl">
            <p>
              Most freelancers juggle four or five tools for contracts, invoices, and client management.
              AI ContractKit replaces all of them with a single AI-powered workspace.
            </p>
            <p>
              Built on Groq LLaMA with a dual generate-and-analyze pipeline, every contract ships with
              professional formatting, e-signature readiness, and automatic risk detection—so you
              focus on the work, not the paperwork.
            </p>
          </ScrollFade>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section landing-section--features">
        <div className="landing-container">
          <SectionHeader eyebrow="Features" title="Everything to run your freelance business">
            <Link to="/register" className="landing-link mt-2">
              Start free today
              <ArrowRight className="h-4 w-4" />
            </Link>
          </SectionHeader>

          <StaggerGrid className="landing-features-grid">
            {features.map(({ icon: Icon, title, tag, desc }) => (
              <StaggerItem key={title} className="landing-card">
                <Icon className="landing-card-icon h-5 w-5" aria-hidden="true" />
                <h3 className="landing-card-title">{title}</h3>
                <p className="landing-card-tag">{tag}</p>
                <p className="landing-card-desc">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-container">
          <SectionHeader eyebrow="How it works" title="From prompt to paid in three steps" />

          <StaggerGrid className="landing-steps-row">
            {steps.map(({ step, title, desc }, index) => (
              <div key={step} className="contents">
                <StaggerItem className="landing-step-card">
                  <span className="landing-step-number">{step}</span>
                  <h3 className="landing-step-title">{title}</h3>
                  <p className="landing-step-desc">{desc}</p>
                </StaggerItem>
                {index < steps.length - 1 && (
                  <div className="landing-step-connector" aria-hidden="true">
                    <ChevronRight className="h-6 w-6 text-[var(--landing-accent)] opacity-60" />
                  </div>
                )}
              </div>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="landing-band landing-section !py-0">
        <div className="landing-container py-[100px]">
          <SectionHeader eyebrow="Security" title="Enterprise-grade security" />
          <ScrollFade delay={0.1}>
            <div className="landing-band-inner">
              <p className="landing-body mb-8 max-w-2xl">
                JWT authentication, encrypted sessions, audit logging, and AI compliance scanning—built for
                operators who take client data seriously.
              </p>
              <Link to="/security" className="landing-btn-secondary">
                View security dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="landing-section">
        <div className="landing-container">
          <SectionHeader eyebrow="Platform" title="More built into the workspace" />

          <StaggerGrid className="landing-platform-grid">
            <StaggerItem className="landing-card">
              <Users className="landing-card-icon h-6 w-6" />
              <h3 className="landing-card-title text-xl">Client management</h3>
              <p className="landing-card-desc mt-4">
                Full client database with revenue tracking, linked contracts, and invoice history per client.
              </p>
            </StaggerItem>
            <StaggerItem className="landing-card">
              <Zap className="landing-card-icon h-6 w-6" />
              <h3 className="landing-card-title text-xl">AI proposals & training</h3>
              <p className="landing-card-desc mt-4">
                Generate winning proposals, train AI on your contract library, and reuse templates for repeat clients.
              </p>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section id="apply" className="landing-section landing-section--cta">
        <div className="landing-container text-center">
          <ScrollFade>
            <p className="landing-eyebrow">Get started</p>
            <h2 className="landing-h2 landing-cta-title">Ready to replace your contract stack?</h2>
            <div className="landing-cta-buttons">
              <Link to="/register" className="landing-btn-primary !mt-0">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="landing-btn-secondary">
                Sign in to dashboard
              </Link>
            </div>
          </ScrollFade>
        </div>
      </section>

      <footer id="contact" className="landing-footer">
        <ScrollFade className="landing-container landing-footer-inner">
          <span className="landing-footer-brand">AI ContractKit</span>
          <p className="landing-footer-text">© {new Date().getFullYear()} AI ContractKit</p>
          <div className="flex gap-8">
            <Link to="/login" className="landing-footer-link">
              Sign in →
            </Link>
            <Link to="/register" className="landing-footer-link">
              Register
            </Link>
          </div>
        </ScrollFade>
      </footer>
    </div>
  );
};

export default ContractKitLanding;
