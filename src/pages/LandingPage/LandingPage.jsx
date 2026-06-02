import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function LandingPage() {

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      if (useStore.getState().isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('section > div').forEach((el) => {
      el.classList.add('transition-all', 'duration-700', 'ease-out', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    const navLinks = document.querySelectorAll('.nav-link');
    const navSections = [...navLinks]
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    function setActiveNav(sectionId) {
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('is-active', active);
        link.classList.toggle('text-primary', active);
        link.classList.toggle('bg-primary/10', active);
        link.classList.toggle('text-on-surface-variant', !active);
      });
    }

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-35% 0px -50% 0px',
        threshold: 0,
      }
    );

    navSections.forEach((section) => navObserver.observe(section));

    return () => {
      observer.disconnect();
      navObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 bg-surface/72 backdrop-blur-[18px] border-b border-white/25 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
        <div className="flex justify-between items-center px-container-padding h-20 w-full max-w-[1440px] mx-auto">
          <div className="flex items-center gap-2 z-10">
            <div className="flex items-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
                  <rect width="40" height="40" rx="10" fill="#F5A623"/>
                  <path d="M20 8L30 13V15L20 20L10 15V13L20 8Z" fill="white" opacity="0.95"/>
                  <path d="M10 17L20 22L30 17V24.5C30 24.5 25 27 20 27C15 27 10 24.5 10 24.5V17Z" fill="white" opacity="0.85"/>
                  <rect x="29" y="15" width="2" height="7" rx="1" fill="white" opacity="0.7"/>
                  <circle cx="30" cy="23" r="2" fill="white" opacity="0.7"/>
                </svg>
              </div>

            <div>
              <span className="font-headline-md font-extrabold text-on-background tracking-tight">
                SAPAS
              </span>
              <p className="font-label-sm text-[10px] tracking-widest text-on-surface-variant -mt-1 uppercase">
                STUDENT ANALYTICS
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <a className="nav-link font-label-md text-primary bg-primary/10 font-bold is-active px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all" href="#dashboard-preview">
              Dashboard
            </a>
            <a className="nav-link font-label-md text-on-surface-variant font-bold px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all" href="#performance-analytics">
              Performance
            </a>
            <a className="nav-link font-label-md text-on-surface-variant font-bold px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all" href="#study-planner">
              Study Planner
            </a>
            <a className="nav-link font-label-md text-on-surface-variant font-bold px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all" href="#ai-insights">
              AI Insights
            </a>
            <a className="nav-link font-label-md text-on-surface-variant font-bold px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-all" href="#about-sapas">
              About
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-label-md text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 px-6 py-2.5 rounded-full transition-all duration-200 ease-in-out">
              Log In
            </Link>
          </div>
        </div>
      </header>
      <main className="relative">
        <section className="relative min-h-[90vh] pt-32 pb-20 overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0 transition-all duration-700 ease-out opacity-100 translate-y-0">
            <img
              alt="Interior Design Context"
              className="w-full h-full object-cover opacity-60"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiR9zNKs-2At47KuIqf2YrNK5EeZ0YU8EiBJDIjJw-cZKJb08NTud2v2Ej8wYy8TuOdZJImSo1tBBMaKBYsHW_ag8t3vQx2So8O75ko_8icxMdq51eo8L4GtKpqwht95O0lZ5jsaRKDjfqvxxyfUiOCXdcFj5gd1yOmSY0BcoFTqu-mkzkNAvD6Bw8gYtNahSL_bPEGZMY1E_-qfTgvxmIQ_bnUmP3IZmBWX7MlSVGxV2NzxsHNiWpxVnKq0PbDdRdZk_hlYYoow"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-container-padding grid md:grid-cols-2 gap-stack-lg items-center transition-all duration-700 ease-out opacity-100 translate-y-0">
            <div className="max-w-xl">
              <div className="inline-block bg-tertiary-fixed px-3 py-1 rounded-full mb-stack-md">
                <span className="font-label-sm text-on-tertiary-fixed-variant uppercase tracking-wider">
                  AI POWERED STUDENT ANALYTICS
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-background mb-stack-md leading-tight">
                Track Performance, <span className="text-primary">Plan Smarter</span>, Improve With AI.
              </h1>
              <p className="font-body-lg text-on-surface-variant mb-stack-lg max-w-md">
                Track academic performance, manage study goals, and receive AI-powered improvement
                insights in one smart student analytics platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="primary-btn px-8 py-4 rounded-full font-label-md text-on-primary-fixed flex items-center gap-2 hover:scale-[0.98] transition-transform">
                  Open Dashboard
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <button className="glass-card px-8 py-4 rounded-full font-label-md text-primary flex items-center gap-2 hover:bg-surface transition-colors border-primary/20">
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    play_circle
                  </span>
                  View Features
                </button>
              </div>
            </div>
            <div className="hidden md:block h-full relative">
              <div className="absolute top-0 right-0 grid grid-cols-4 gap-4 opacity-20">
                {Array(8).fill(null).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary"></div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-surface-container-low/50" id="dashboard-preview">
          <div className="max-w-[1440px] mx-auto px-container-padding text-center mb-stack-lg transition-all duration-700 ease-out opacity-100 translate-y-0">
            <h2 className="font-headline-lg text-on-surface mb-4">Your Academic Command Center</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Get a birds-eye view of your entire educational journey with our beautiful, glassmorphic
              analytics interface.
            </p>
          </div>
          <div className="max-w-[1200px] mx-auto px-container-padding transition-all duration-700 ease-out opacity-100 translate-y-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/40">
              <img
                alt="Dashboard Preview"
                className="w-full h-auto"
                decoding="async"
                src="/assets/screen.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </section>
        <section className="py-20 relative overflow-hidden" id="performance-analytics">
          <div className="max-w-[1440px] mx-auto px-container-padding transition-all duration-700 ease-out opacity-100 translate-y-0">
            <div className="grid md:grid-cols-2 gap-stack-lg items-center">
              <div>
                <span className="font-label-md text-primary font-bold tracking-widest uppercase mb-2 block">
                  Performance Insight
                </span>
                <h2 className="font-headline-lg text-on-surface mb-stack-md">Visualizing Your Growth</h2>
                <p className="font-body-lg text-on-surface-variant mb-8">
                  Compare subject performance with precision. Our trend analytics help you see exactly
                  where you're excelling and where you need a little more focus.
                </p>
                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-2xl flex items-center gap-6">
                    <div className="bg-primary-container p-3 rounded-xl">
                      <span className="material-symbols-outlined text-on-primary-container">
                        trending_up
                      </span>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-sm mb-1">Subject Comparison</h4>
                      <p className="text-on-surface-variant text-sm">
                        Real-time benchmarks against your personal goals.
                      </p>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl flex items-center gap-6">
                    <div className="bg-secondary-container p-3 rounded-xl">
                      <span className="material-symbols-outlined text-on-secondary-container">
                        query_stats
                      </span>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-sm mb-1">Forecasting Preview</h4>
                      <p className="text-on-surface-variant text-sm">
                        AI-driven grade predictions based on current trajectories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex justify-center">
                <div className="w-full aspect-square max-w-md bg-surface-container rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-[20px] border-primary-fixed-dim rounded-full opacity-20 animate-pulse"></div>
                  <div className="glass-card p-8 rounded-3xl w-4/5 text-center shadow-xl">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <svg className="w-32 h-32">
                        <circle
                          className="text-primary-fixed-dim/20"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="58"
                          cx="64"
                          cy="64"
                        ></circle>
                        <circle
                          className="text-primary"
                          strokeWidth="8"
                          strokeDasharray="364.4"
                          strokeDashoffset="47.4"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="58"
                          cx="64"
                          cy="64"
                        ></circle>
                      </svg>
                      <span className="absolute text-3xl font-bold font-display-lg text-on-surface">
                        8.7
                      </span>
                    </div>
                    <p className="font-label-md text-on-surface-variant mt-2 uppercase tracking-widest">
                      Cumulative GPA
                    </p>
                    <div className="mt-6 h-24 flex items-end justify-center gap-2">
                      <div className="w-4 bg-primary rounded-t-lg h-[60%]"></div>
                      <div className="w-4 bg-primary/60 rounded-t-lg h-[80%]"></div>
                      <div className="w-4 bg-primary rounded-t-lg h-[50%]"></div>
                      <div className="w-4 bg-secondary-container rounded-t-lg h-[90%]"></div>
                      <div className="w-4 bg-primary rounded-t-lg h-[70%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-surface-container-low/30" id="study-planner">
          <div className="max-w-[1440px] mx-auto px-container-padding transition-all duration-700 ease-out opacity-100 translate-y-0">
            <div className="flex flex-col md:flex-row-reverse gap-stack-lg items-center">
              <div className="md:w-1/2">
                <span className="font-label-md text-primary font-bold tracking-widest uppercase mb-2 block">
                  Productivity Engine
                </span>
                <h2 className="font-headline-lg text-on-surface mb-stack-md">Master Your Schedule</h2>
                <p className="font-body-lg text-on-surface-variant mb-8">
                  Our intelligent planner doesn't just list tasks—it optimizes your time. Use the
                  built-in focus timer to maximize deep study sessions.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-bright border border-outline-variant/30 p-6 rounded-2xl">
                    <span className="material-symbols-outlined text-primary mb-2">timer</span>
                    <h4 className="font-label-md font-bold mb-1">Focus Timer</h4>
                    <p className="text-xs text-on-surface-variant">Stay in the flow state.</p>
                  </div>
                  <div className="bg-surface-bright border border-outline-variant/30 p-6 rounded-2xl">
                    <span className="material-symbols-outlined text-primary mb-2">check_circle</span>
                    <h4 className="font-label-md font-bold mb-1">Priority View</h4>
                    <p className="text-xs text-on-surface-variant">What's due next?</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="glass-card rounded-3xl p-8 border border-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-md text-lg">Weekly Focus</h3>
                    <button className="text-primary text-sm font-bold">Manage Tasks</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border-l-4 border-primary">
                      <span className="material-symbols-outlined text-primary">book</span>
                      <div className="flex-1">
                        <p className="font-label-md">Organic Chemistry Prep</p>
                        <p className="text-[10px] text-on-surface-variant">2 Hours Session • Today</p>
                      </div>
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold">
                        ACTIVE
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-surface p-4 rounded-xl opacity-60">
                      <span className="material-symbols-outlined text-on-surface-variant">edit</span>
                      <div className="flex-1">
                        <p className="font-label-md">History Essay Draft</p>
                        <p className="text-[10px] text-on-surface-variant">Due Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-surface p-4 rounded-xl opacity-60">
                      <span className="material-symbols-outlined text-on-surface-variant">
                        calculate
                      </span>
                      <div className="flex-1">
                        <p className="font-label-md">Calculus Problem Set</p>
                        <p className="text-[10px] text-on-surface-variant">4 Days Left</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 relative overflow-hidden" id="ai-insights">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[120px] transition-all duration-700 ease-out opacity-100 translate-y-0"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-tertiary-container/20 rounded-full blur-[120px] transition-all duration-700 ease-out opacity-100 translate-y-0"></div>
          <div className="max-w-[1440px] mx-auto px-container-padding text-center transition-all duration-700 ease-out opacity-100 translate-y-0">
            <span className="font-label-md text-primary font-bold tracking-widest uppercase mb-2 block">
              Powered by Intelligence
            </span>
            <h2 className="font-headline-lg text-on-surface mb-stack-md">AI Smart Suggestions</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
              SAPAS AI analyzes your study patterns and results to provide tailored recommendations
              that actually move the needle on your grades.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  </div>
                  <h4 className="font-headline-md text-base mb-2">Subject Optimization</h4>
                  <p className="text-sm text-on-surface-variant">
                    "Focus 20% more on Physics this week to hit your goal GPA."
                  </p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden group ring-2 ring-primary/20">
                <div className="absolute inset-0 bg-primary/10"></div>
                <div className="relative z-10">
                  <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/40">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                  </div>
                  <h4 className="font-headline-md text-base mb-2">Study Style Analysis</h4>
                  <p className="text-sm text-on-surface-variant font-medium">
                    "Your retention is 30% higher during morning focus blocks."
                  </p>
                </div>
              </div>
              <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="bg-white/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/60">
                    <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  </div>
                  <h4 className="font-headline-md text-base mb-2">Content Prediction</h4>
                  <p className="text-sm text-on-surface-variant">
                    "Predicted exam topics based on your syllabus trend analysis."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-24 bg-surface-dim/40" id="about-sapas">
          <div className="max-w-[1440px] mx-auto px-container-padding transition-all duration-700 ease-out opacity-100 translate-y-0">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-headline-lg text-on-surface mb-8">Our Mission</h2>
              <div className="space-y-6 text-left">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">school</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg mb-2">Democratizing Academic Success</h3>
                    <p className="font-body-md text-on-surface-variant">
                      We believe every student deserves access to the same high-level analytics and
                      planning tools used by professionals. SAPAS bridges the gap between effort and
                      results.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">
                      science
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg mb-2">Pioneering Educational AI</h3>
                    <p className="font-body-md text-on-surface-variant">
                      By leveraging the latest in machine learning, we're building a future where
                      your study tools understand your learning style as well as you do.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-32 relative overflow-hidden bg-primary text-on-primary text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 transition-all duration-700 ease-out opacity-100 translate-y-0"></div>
          <div className="relative z-10 px-container-padding max-w-4xl mx-auto transition-all duration-700 ease-out opacity-100 translate-y-0">
            <h2 className="font-display-lg text-display-lg mb-8">Ready to start your journey?</h2>
            <p className="font-body-lg mb-12 opacity-90 max-w-2xl mx-auto">
              Join thousands of students who are already using AI to transform their academic
              performance and reclaim their time.
            </p>
            <div className="flex justify-center gap-6 flex-wrap">
              <Link to="/login" className="bg-white text-primary px-10 py-5 rounded-full font-headline-md hover:scale-105 transition-transform shadow-xl">
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-stack-lg mt-stack-lg bg-surface-container-low dark:bg-surface-dim border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-container-padding max-w-[1440px] mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-bold text-on-background">
                SAPAS
              </span>
            </div>
            <p className="text-on-surface-variant text-sm mt-2">Empowering student success with AI.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">
              Privacy Policy
            </a>
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">
              Terms of Service
            </a>
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">
              Contact Us
            </a>
            <a className="font-label-sm text-on-surface-variant hover:text-primary transition-colors hover:underline" href="#">
              Help Center
            </a>
          </div>
          <div className="mt-8 md:mt-0 text-on-surface-variant text-sm font-label-sm">
            © 2026<span style={{ fontSize: '0.875rem' }}>&nbsp;SAPAS Student Analytics. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
