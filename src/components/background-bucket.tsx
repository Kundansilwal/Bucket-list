"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = { level: number; stage: number; dropping?: boolean; total?: number };

/** A decorative hero illustration; the detailed accessible water status lives in the hero copy. */
export function BackgroundBucket({ level, stage, dropping = false, total }: Props) {
  const reduced = useReducedMotion();
  const waterTop = 600 - Math.max(level, 3) * 3.6;
  return <div className="background-bucket" aria-hidden="true">
    <motion.svg viewBox="0 0 520 650" fill="none" xmlns="http://www.w3.org/2000/svg" animate={dropping && !reduced ? { rotate: [0, -3, 3, 0], scale: [1, 1.03, 1] } : undefined} transition={{ type: "spring", bounce: 0.6 }}>
      <defs>
        <clipPath id="bucket-clip">
          <path d="M 40 220 L 110 580 C 120 630, 400 630, 410 580 L 480 220 Z" />
        </clipPath>
      </defs>

      {/* Bucket Drop Shadow */}
      <ellipse cx="260" cy="620" rx="180" ry="26" fill="rgba(0, 176, 255, 0.15)" />
      
      {/* Handle */}
      <path d="M 40 220 C 40 40, 480 40, 480 220" stroke="#ffca3a" strokeWidth="24" strokeLinecap="round" />
      
      {/* Handle Joints (Back) */}
      <circle cx="40" cy="220" r="22" fill="#ffca3a" stroke="#00b0ff" strokeWidth="8" />
      <circle cx="480" cy="220" r="22" fill="#ffca3a" stroke="#00b0ff" strokeWidth="8" />
      
      {/* Top Opening (White fill to cover gaps) */}
      <ellipse cx="260" cy="220" rx="220" ry="36" fill="white" />
      
      {/* Back Rim (Inside top edge) */}
      <path d="M 40 220 A 220 36 0 0 1 480 220" fill="none" stroke="#00b0ff" strokeWidth="12" />
      
      {/* Bucket Back Wall (Solid White Inside) */}
      <path d="M 40 220 L 110 580 C 120 630, 400 630, 410 580 L 480 220 Z" fill="white" />
      
      {/* Water Overlay (Cross-section) */}
      <g clipPath="url(#bucket-clip)">
         <motion.g animate={{ y: dropping && !reduced ? [0, -10, 0] : 0 }} transition={{ duration: .8 }}>
           <rect x="0" y={waterTop} width="1000" height="650" fill="#00b0ff" />
           
           {/* Back Wave (flowing left) */}
           <motion.path 
             fill="#40c4ff"
             d={`M0 ${waterTop} Q 60 ${waterTop - 15} 120 ${waterTop} T 240 ${waterTop} T 360 ${waterTop} T 480 ${waterTop} T 600 ${waterTop} T 720 ${waterTop} T 840 ${waterTop} T 960 ${waterTop} V650 H0 Z`}
             animate={!reduced ? { x: [0, -240] } : undefined} 
             transition={{ ease: "linear", duration: 3.5, repeat: Infinity }}
           />
           
           {/* Front Wave (flowing right) */}
           <motion.path 
             fill="#84ffff" fillOpacity="0.9"
             d={`M0 ${waterTop + 10} Q 50 ${waterTop + 25} 100 ${waterTop + 10} T 200 ${waterTop + 10} T 300 ${waterTop + 10} T 400 ${waterTop + 10} T 500 ${waterTop + 10} T 600 ${waterTop + 10} T 700 ${waterTop + 10} T 800 ${waterTop + 10} V650 H0 Z`}
             animate={!reduced ? { x: [-200, 0] } : undefined} 
             transition={{ ease: "linear", duration: 4, repeat: Infinity }}
           />
         </motion.g>
         
         {/* Glossy Water Highlights / Reflections */}
         <path d="M360 240 L330 590" stroke="rgba(255,255,255,0.6)" strokeWidth="24" strokeLinecap="round" />
         <path d="M400 240 L370 580" stroke="rgba(255,255,255,0.6)" strokeWidth="10" strokeLinecap="round" />
         <path d="M160 240 L200 590" stroke="rgba(0,176,255,0.15)" strokeWidth="32" strokeLinecap="round" />
      </g>
      
      {/* Bucket Outline & Front Rim (The Cutaway Edges) */}
      <path d="M 40 220 L 110 580 C 120 630, 400 630, 410 580 L 480 220" fill="none" stroke="#00b0ff" strokeWidth="12" strokeLinejoin="round" />
      <path d="M 40 220 A 220 36 0 0 0 480 220" fill="none" stroke="#00b0ff" strokeWidth="12" />
      
      {/* Front Rim Highlight */}
      <path d="M 40 220 A 220 36 0 0 0 480 220" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />

      {/* Handle Joints (Front peg) */}
      <circle cx="40" cy="220" r="6" fill="white" />
      <circle cx="480" cy="220" r="6" fill="white" />
      
      {/* Responses Text in Middle */}
      {total !== undefined && (
        <g textAnchor="middle" fontFamily="var(--font-nunito), sans-serif" fontWeight="900">
          <text x="260" y="420" fill="none" stroke="white" strokeWidth="12" strokeLinejoin="round" fontSize="56" letterSpacing="2">
            {total.toLocaleString()}
          </text>
          <text x="260" y="420" fill="#00b0ff" fontSize="56" letterSpacing="2">
            {total.toLocaleString()}
          </text>
          <text x="260" y="460" fill="none" stroke="white" strokeWidth="8" strokeLinejoin="round" fontSize="20" letterSpacing="4">
            RESPONSES
          </text>
          <text x="260" y="460" fill="#00b0ff" fontSize="20" letterSpacing="4">
            RESPONSES
          </text>
        </g>
      )}
    </motion.svg>
  </div>;
}
