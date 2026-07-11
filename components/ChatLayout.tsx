'use client';
import React from 'react';
import Admin from './Admin';

export default function ChatLayout({
  cMode, is2Col, isExp, hInteract, hScroll, aTab, selPrivUser, pUsers, pubMsgs, privMsgs, isPill, 
  pDelta, pTouchX, capIdx, setPTouchX, setPDelta, setCapPause, setIsPill, renderMsgs, fmtTime, setSelPriv 
}: any) {
  return (
    <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
      <div className={`h-full flex flex-col transition-all duration-500 ease-out ${cMode === 'public' ? 'bg-gradient-to-t from-blue-200 via-blue-50 to-white' : 'bg-blue-50/30'} ${is2Col ? 'w-1/2' : (isExp && cMode === 'private' ? 'w-0 opacity-0 pointer-events-none' : isExp && cMode === 'public' ? 'w-full' : 'w-1/2')}`} onClick={() => hInteract('public')} onTouchStart={() => hInteract('public')} onWheel={() => hInteract('public')}>
        <div onScroll={hScroll} className="p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"><div className="text-center text-[9px] font-bold text-blue-500 mb-2 tracking-widest uppercase opacity-70">Ruang Publik</div>{renderMsgs(pubMsgs, 'public', is2Col ? true : !isExp)}<div id="messages-end-public" className="h-0" /></div>
      </div>
      {(!isExp || is2Col) && <div className="w-[1.5px] bg-gray-200 relative z-10 shrink-0 overflow-hidden shadow-[0_0_5px_rgba(0,0,0,0.05)]"><div className={`absolute w-full h-1/2 animate-drop-line ${cMode === 'public' ? 'bg-gradient-to-t from-transparent via-blue-500 to-blue-700' : 'bg-gradient-to-t from-transparent via-emerald-500 to-emerald-700'}`}></div></div>}
      <div className={`h-full flex flex-col transition-all duration-500 ease-out ${cMode === 'private' ? 'bg-gradient-to-t from-emerald-200 via-emerald-50 to-white' : 'bg-emerald-50/30'} ${is2Col ? 'w-1/2' : (isExp && cMode === 'public' ? 'w-0 opacity-0 pointer-events-none' : isExp && cMode === 'private' ? 'w-full' : 'w-1/2')}`} onClick={() => hInteract('private')} onTouchStart={() => hInteract('private')} onWheel={() => hInteract('private')}>
        <div onScroll={hScroll} className="p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"><div className="text-center text-[9px] font-bold text-emerald-500 mb-2 tracking-widest uppercase opacity-70">Ruang Private</div>
          {aTab === 'admin' && cMode === 'private' && !selPrivUser ? <Admin privateUsers={pUsers} setSelectedPrivateUser={setSelPriv} formatMessageTime={fmtTime} /> : renderMsgs(privMsgs, 'private', is2Col ? true : !isExp)}<div id="messages-end-private" className="h-0" />
        </div>
      </div>
      {isPill && (
        <div className="absolute bottom-4 left-1/2 z-30 flex justify-center select-none shadow-lg rounded-full" style={{ transform: `translateX(calc(-50% + ${pDelta}px))`, transition: pDelta === 0 ? 'transform 0.3s ease-out, opacity 0.5s' : 'none', opacity: Math.abs(pDelta) > 100 ? 0 : 1 }} onTouchStart={(e) => { setCapPause(true); setPTouchX(e.touches[0].clientX); }} onTouchMove={(e) => setPDelta(e.touches[0].clientX - pTouchX)} onTouchEnd={() => { setCapPause(false); if (Math.abs(pDelta) > 70) setIsPill(false); setPDelta(0); }}>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-700 border shadow-sm text-center tracking-wide relative overflow-hidden flex items-center justify-center w-[300px] sm:min-w-[310px] h-[34px] cursor-grab active:cursor-grabbing bg-white/95 backdrop-blur ${cMode === 'private' ? 'border-emerald-300' : 'border-blue-300'}`}>
            <div className={`absolute flex items-center gap-1 transition-all duration-500 w-full justify-center ${capIdx === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}><span>Bijaklah berinteraksi salam toleransi |</span><a href="https://ipix.my.id" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline font-black" onClick={(e) => e.stopPropagation()}>ipix.my.id</a></div>
            <div className={`absolute flex items-center gap-2 transition-all duration-500 w-full justify-center ${capIdx === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}><span className={`inline-block anim-slide-left font-black text-sm leading-none ${cMode === 'private' ? 'text-emerald-500' : 'text-blue-500'}`}>&lt;</span><span>geser hapus/balas</span><span className={`inline-block anim-slide-right font-black text-sm leading-none ${cMode === 'private' ? 'text-emerald-500' : 'text-blue-500'}`}>&gt;</span></div>
          </div>
        </div>
      )}
    </div>
  );
}