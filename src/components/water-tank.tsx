"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = { level: number; stage: number; total: number; dropping?: boolean; background?: boolean };

export function WaterTank({ level, stage, total, dropping = false, background = false }: Props) {
  const reduced = useReducedMotion();
  return (
    <div className={`relative mx-auto w-full ${background ? "water-tank-background" : "max-w-[420px]"}`} aria-label={`Global collection: ${total.toLocaleString()} bucket lists. Container stage ${stage} is ${level.toFixed(2)}% full.`} role="img">
      <motion.div className={`tank-shell relative mx-auto overflow-hidden border-[6px] border-white bg-[#e0f7fa] shadow-[0_16px_40px_rgba(0,180,255,.15),inset_0_4px_20px_rgba(0,0,0,.05)] ${background ? "hero-tank-shell h-[530px] w-[min(104vw,610px)] rounded-[50px] opacity-100 sm:h-[650px]" : "h-[390px] w-[min(78vw,330px)] rounded-[40px]"}`} animate={dropping && !reduced ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] } : undefined} transition={{ type: "spring", bounce: 0.6 }}>
        <div className="absolute inset-x-0 top-4 h-12 rounded-full bg-white/50 mx-6 shadow-sm" />
        <div className="rise absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-b from-[#40c4ff] to-[#00b0ff]" style={{ height: `${Math.max(level, 1)}%` }}>
          <svg className="absolute -top-6 left-0 h-16 w-[150%]" viewBox="0 0 500 40" preserveAspectRatio="none" aria-hidden="true">
            <path className="wave fill-[#84ffff]" d="M0,20 C60,4 100,36 160,20 S260,4 330,20 S430,36 500,18 V40 H0Z" />
            <path className="wave-delayed fill-[#40c4ff]/80" d="M0,25 C65,8 115,38 175,21 S275,7 350,23 S445,37 500,20 V40 H0Z" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,.5)_6px,transparent_7px),radial-gradient(circle_at_75%_70%,rgba(255,255,255,.4)_8px,transparent_9px),radial-gradient(circle_at_50%_90%,rgba(255,255,255,.3)_4px,transparent_5px)]" />
        </div>
        <div className="absolute inset-0 rounded-[inherit] border-4 border-white/40 pointer-events-none" />
      </motion.div>
      {dropping && !reduced && <motion.span className="absolute left-1/2 top-[-20px] h-8 w-6 rounded-full bg-[#18ffff] shadow-[0_0_20px_#18ffff]" initial={{ y: -60, scale: 0.5 }} animate={{ y: background ? 280 : 120, scale: [0.5, 1.2, 0], opacity: [0, 1, 1, 0] }} transition={{ duration: .6, ease: "easeIn" }} aria-hidden="true" />}
    </div>
  );
}
