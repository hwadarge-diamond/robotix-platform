import React, { useState, useEffect, useRef } from 'react';

// Custom useTypewriter Hook
interface TypewriterOptions {
  speed?: number;
  startDelay?: number;
}

function useTypewriter(text: string, { speed = 38, startDelay = 600 }: TypewriterOptions = {}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let intervalId: number;

    timeoutId = window.setTimeout(() => {
      let currentIndex = 0;
      intervalId = window.setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayed(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setDone(true);
          clearInterval(intervalId);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPillButtons, setShowPillButtons] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Video Scrubbing Refs & State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // 1. Action Pill Buttons appear 400ms after load independent of typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPillButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // 2. Typewriter Text
  const typewriterText = "Glad you stopped in. Good taste tends to find us. Now, what are we building?";
  const { displayed, done } = useTypewriter(typewriterText, { speed: 38, startDelay: 600 });

  // 3. Mouse-scrub video control
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const SENSITIVITY = 0.8;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      
      let nextTarget = targetTimeRef.current + timeOffset;
      nextTarget = Math.max(0, Math.min(video.duration, nextTarget));
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  // 4. Copy to Clipboard handler
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('hello@mainframe.co');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-black select-none">
      {/* BACKGROUND VIDEO (mouse-scrub controlled) */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4"
        className="fixed inset-0 z-0 h-full w-full object-cover"
        style={{ objectPosition: '70% center' }}
        muted
        playsInline
        preload="auto"
        onSeeked={handleSeeked}
      />

      {/* NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center">
        {/* Logo (left) */}
        <div className="flex flex-row items-center gap-3">
          <span
            style={{ fontFamily: 'var(--font-heading)' }}
            className="text-[21px] sm:text-[26px] tracking-tight text-black"
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop Nav Links (center, hidden below md) */}
        <nav className="hidden md:flex flex-row items-center text-[23px] text-black">
          <a href="#labs" className="hover:opacity-60 transition-opacity">Labs</a>
          <span>,&nbsp;</span>
          <a href="#studio" className="hover:opacity-60 transition-opacity">Studio</a>
          <span>,&nbsp;</span>
          <a href="#openings" className="hover:opacity-60 transition-opacity">Openings</a>
          <span>,&nbsp;</span>
          <a href="#shop" className="hover:opacity-60 transition-opacity">Shop</a>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="hidden md:block">
          <a
            href="#contact"
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
          >
            Get in touch
          </a>
        </div>

        {/* Mobile Hamburger (visible below md) */}
        <button
          type="button"
          aria-label="Toggle Navigation Menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden flex-col justify-center items-center gap-[5px] focus:outline-none"
        >
          <span
            className={`w-6 h-[2px] bg-black duration-300 transition-transform ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black duration-300 transition-opacity ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black duration-300 transition-transform ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      {/* Mobile Overlay (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <a
          href="#labs"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Labs
        </a>
        <a
          href="#studio"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Studio
        </a>
        <a
          href="#openings"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Openings
        </a>
        <a
          href="#shop"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
        >
          Shop
        </a>
        <a
          href="#contact"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-[32px] font-medium text-black underline underline-offset-4 hover:opacity-60 transition-opacity"
        >
          Get in touch
        </a>
      </div>

      {/* HERO SECTION (z-index: 1) */}
      <main className="relative z-[1] h-screen w-full flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden">
        <div className="max-w-xl relative z-10">
          {/* 1. Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#000',
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,
            <br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-black mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
            )}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className="flex flex-wrap gap-y-1 transition-all duration-400"
            style={{
              opacity: showPillButtons ? 1 : 0,
              transform: showPillButtons ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 White pill buttons */}
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
            >
              Pitch us an idea
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
            >
              Come work here
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
            >
              Send a brief hello
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200"
            >
              See how we operate
            </button>

            {/* 1 Outline pill button */}
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy email address"
              className="inline-flex items-center justify-center text-white bg-transparent border border-white rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap gap-2 sm:gap-3 hover:bg-white hover:text-black transition-colors duration-200"
            >
              <span>
                Reach us:{' '}
                <span className="underline underline-offset-1">
                  {copyFeedback ? 'Copied!' : 'hello@mainframe.co'}
                </span>
              </span>
              {/* 12x12 copy icon (two overlapping rectangles) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <rect
                  x="3.5"
                  y="3.5"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8.5 2V1.5C8.5 1.22386 8.27614 1 8 1H1.5C1.22386 1 1 1.22386 1 1.5V8C1 8.27614 1.22386 8.5 1.5 8.5H2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
