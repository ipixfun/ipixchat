'use client';
import React from 'react';
import Admin from './Admin';

/* ---- Segitiga Gelombang Atas (5% height) ---- */
const TrianglesTop = ({ mode }: { mode: 'public' | 'private' }) => {
  const c = mode === 'public' ? '59, 130, 246' : '16, 185, 129';
  return (
    <div className="absolute top-0 left-0 w-full h-[5%] overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{
          animationDuration: '9s',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L50,60 L100,120 L150,60 L250,120 L350,60 L450,120 L550,60 L650,120 L750,60 L850,120 L950,60 L1050,120 L1150,60 L1200,120 L1200,0 L0,0 Z' fill='rgba(${c},0.25)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.8,
        }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{
          animationDuration: '11s',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L70,80 L140,120 L210,80 L280,120 L350,80 L420,120 L490,80 L560,120 L630,80 L700,120 L770,80 L840,120 L910,80 L980,120 L1050,80 L1120,120 L1200,80 L1200,0 L0,0 Z' fill='rgba(${c},0.2)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.7,
        }} />
    </div>
  );
};

/* ---- Ombak Bawah (30% height) ---- */
const WavesBottom = ({ mode }: { mode: 'public' | 'private' }) => {
  const c = mode === 'public' ? '59, 130, 246' : '16, 185, 129';
  return (
    <div className="absolute bottom-0 left-0 w-full h-[30%] overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{ animationDuration: '8s', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z' fill='rgba(${c},0.3)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.9 }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{ animationDuration: '10s', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,70 C200,40 400,100 600,70 C800,40 1000,100 1200,70 L1200,120 L0,120 Z' fill='rgba(${c},0.25)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.8 }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{ animationDuration: '12s', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,50 C200,80 400,20 600,50 C800,80 1000,20 1200,50 L1200,120 L0,120 Z' fill='rgba(${c},0.2)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.7 }} />
      <div className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{ animationDuration: '14s', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,80 C200,60 400,90 600,80 C800,60 1000,90 1200,80 L1200,120 L0,120 Z' fill='rgba(${c},0.15)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: '50% 100%', opacity: 0.6 }} />
    </div>
  );
};

/* ---- Main layout ---- */
export default function ChatLayout({
  cMode, is2Col, isExp, hInteract, hScroll, aTab, selPrivUser, pUsers, pubMsgs, privMsgs, isPill,
  pDelta, pTouchX, capIdx, setPTouchX, setPDelta, setCapPause, setIsPill, renderMsgs, fmtTime, setSelPriv
}: any) {
  return (
    <>
      <style>{`
        @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes wave-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-wave { animation: wave linear infinite; }
        .animate-wave-reverse { animation: wave-reverse linear infinite; }
      `}</style>

      <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
                <div className={`h-full flex flex-col transition-all duration-500 ease-out relative bg-transparent ${is2Col?'w-1/2':(isExp&&cMode==='private'?'w-0 opacity-0 pointer-events-none':isExp&&cMode==='public'?'w-full':'w-1/2')}`}
          onClick={()=>hInteract('public')} onTouchStart={()=>hInteract('public')} onWheel={()=>hInteract('public')}>

          <TrianglesTop mode="public" />
          <WavesBottom mode="public" />
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-center text-[9px] font-bold text-blue-500/70 mb-2 tracking-widest uppercase">Ruang Publik</div>
            {renderMsgs(pubMsgs,'public',is2Col?!0:!isExp)}
            <div id="messages-end-public" className="h-0" />
          </div>
        </div>

                <div className={`h-full flex flex-col transition-all duration-500 ease-out relative bg-transparent ${is2Col?'w-1/2':(isExp&&cMode==='public'?'w-0 opacity-0 pointer-events-none':isExp&&cMode==='private'?'w-full':'w-1/2')}`}
          onClick={()=>hInteract('private')} onTouchStart={()=>hInteract('private')} onWheel={()=>hInteract('private')}>

          <TrianglesTop mode="private" />
          <WavesBottom mode="private" />
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-center text-[9px] font-bold text-emerald-500/70 mb-2 tracking-widest uppercase">Ruang Private</div>
            {aTab==='admin'&&cMode==='private'&&!selPrivUser?<Admin privateUsers={pUsers} setSelectedPrivateUser={setSelPriv} formatMessageTime={fmtTime} />:renderMsgs(privMsgs,'private',is2Col?!0:!isExp)}
            <div id="messages-end-private" className="h-0" />
          </div>
        </div>

        {isPill&&<div className="absolute bottom-4 left-1/2 z-30 flex justify-center select-none shadow-lg rounded-full"
          style={{transform:`translateX(calc(-50% + ${pDelta}px))`,transition:pDelta===0?'transform 0.3s ease-out, opacity 0.5s':'none',opacity:Math.abs(pDelta)>100?0:1}}
          onTouchStart={e=>{setCapPause(!0);setPTouchX(e.touches[0].clientX);}} onTouchMove={e=>setPDelta(e.touches[0].clientX-pTouchX)}
          onTouchEnd={()=>{setCapPause(!1);if(Math.abs(pDelta)>70)setIsPill(!1);setPDelta(0);}}>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-800 border shadow-sm text-center tracking-wide relative overflow-hidden flex items-center justify-center w-[300px] sm:min-w-[310px] h-[34px] cursor-grab active:cursor-grabbing bg-white/60 backdrop-blur-md ${cMode==='private'?'border-emerald-300/50':'border-blue-300/50'}`}>
            <div className={`absolute flex items-center gap-1 transition-all duration-500 w-full justify-center ${capIdx===0?'opacity-100 translate-y-0':'opacity-0 translate-y-4 pointer-events-none'}`}>
              <span>Bijaklah berinteraksi salam toleransi |</span>
              <a href="https://ipix.my.id" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline font-black" onClick={e=>e.stopPropagation()}>ipix.my.id</a>
            </div>
            <div className={`absolute flex items-center gap-2 transition-all duration-500 w-full justify-center ${capIdx===1?'opacity-100 translate-y-0':'opacity-0 -translate-y-4 pointer-events-none'}`}>
              <span className={`inline-block anim-slide-left font-black text-sm leading-none ${cMode==='private'?'text-emerald-600':'text-blue-600'}`}>&lt;</span>
              <span>geser hapus/balas</span>
              <span className={`inline-block anim-slide-right font-black text-sm leading-none ${cMode==='private'?'text-emerald-600':'text-blue-600'}`}>&gt;</span>
            </div>
          </div>
        </div>}
      </div>
    </>
  );
}