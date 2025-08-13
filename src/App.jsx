import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
  { id: 'v1', type: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Video 1' },
  { id: 'v2', type: 'youtube', videoId: '3JZ_D3ELwOQ', title: 'Video 2' },
  { id: 'v3', type: 'file', src: '/videos/sample.mp4', title: 'Video local (înlocuiește)' },
];

function getPlayableSrc(v) {
  if (v.type === 'youtube' && v.videoId) {
    return `https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&modestbranding=1`;
  }
  if (v.url) {
    const hasQuery = v.url.includes('?');
    return v.url + (hasQuery ? '&' : '?') + 'autoplay=1&rel=0&modestbranding=1';
  }
  if (v.type === 'file' && v.src) return v.src;
  return '';
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

*,*::before,*::after{ box-sizing:border-box }
:root{ --bg:#0b1020; --card:#101726; --muted:#9aa3b2; --text:#e6eef8; --accent:#7c3aed }
html,body,#root{height:100%; width:100%}
body{margin:0;background:linear-gradient(180deg,#060812 0%, #0b1020 100%);color:var(--text);font-family:Poppins,system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial,sans-serif}

.app{
  min-height:100svh; /* mai corect pe mobile decât 100vh */
  width:100vw;
  display:grid;
  place-items:center; /* centrează pe ambele axe */
  overflow-x:hidden;
}
.container{
  width:min(1100px, 100%);
  margin:0 auto;
  padding:32px 16px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
}
.header{display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;margin-bottom:24px}
.title{font-size:clamp(28px,4vw,44px);font-weight:800}
.lead{color:var(--muted);max-width:760px}

/* Grid-ul rămâne centrat și pe ecrane mari */
.gifts{
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
  gap:18px;
  width:100%;
  align-items:stretch;
  justify-items:center;    /* centrează conținutul din fiecare celulă */
}

/* Card "cadou" */
.gift{
  width:100%;
  max-width:320px; /* astfel rămâne frumos centrat în celulă */
  background:linear-gradient(145deg, rgba(124,58,237,0.25), rgba(236,72,153,0.2));
  border:1px solid rgba(255,255,255,0.06);
  padding:18px;
  border-radius:16px;
  cursor:pointer;
  position:relative;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:140px;
  box-shadow:0 10px 24px rgba(2,6,23,.45);
  transition:transform .2s ease;
}
.gift:hover{ transform: translateY(-2px) }
.gift-emoji{font-size:42px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))}
.gift-title{margin-top:8px;font-weight:600;font-size:14px;color:#dbeafe}

/* Lightbox */
.lightbox{
  position:fixed; inset:0;
  display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.78); backdrop-filter:blur(2px);
  z-index:1000;
}
.dialog{
  position:relative;
  width:min(92vw,980px);
  aspect-ratio:16/9;
  border-radius:14px; overflow:hidden; background:#000;
  box-shadow:0 20px 60px rgba(0,0,0,.6);
}
.close{
  position:absolute; top:10px; right:10px;
  border:none; background:rgba(255,255,255,.1); color:#fff;
  font-size:20px; line-height:1; border-radius:10px;
  padding:8px 12px; cursor:pointer;
}
.close:hover{background:rgba(255,255,255,.18)}

@media (max-width: 520px){
  .gifts{grid-template-columns:repeat( 2, minmax(0,1fr) )}
  .gift{min-height:120px}
  .gift-emoji{font-size:34px}
}
`;

function Lightbox({ open, onClose, video }) {
  const escHandler = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', escHandler);
    return () => document.removeEventListener('keydown', escHandler);
  }, [open, escHandler]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="dialog"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {video ? (
              video.type === 'file' ? (
                <video src={getPlayableSrc(video)} controls autoPlay style={{ width: '100%', height: '100%' }} />
              ) : (
                <iframe
                  title={video.title || 'Video'}
                  src={getPlayableSrc(video)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%' }}
                />
              )
            ) : null}
            <button className="close" onClick={onClose} aria-label="Close">✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [openIdx, setOpenIdx] = useState(null);
  const [openingIdx, setOpeningIdx] = useState(null); // pentru animația de „deschidere” a cadoului

  const handleGiftClick = (idx) => {
    // pornește animația cutiei, apoi deschide lightbox
    setOpeningIdx(idx);
    window.clearTimeout(handleGiftClick._t);
    handleGiftClick._t = window.setTimeout(() => {
      setOpenIdx(idx);
      setOpeningIdx(null);
    }, 280); // durata animației cadoului
  };

  const closeVideo = () => setOpenIdx(null);

  return (
    <div className="app">
      <style>{styles}</style>
      <div className="container">
        <header className="header">
          <h1 className="title">La mulți ani, Sara! 🎁</h1>
          <p className="lead">Ai aici niște mesaje de la niște oameni dragi...</p>
        </header>

        <main>
          <section className="gifts">
            {videos.map((v, idx) => (
              <motion.button
                key={v.id}
                className="gift"
                onClick={() => handleGiftClick(idx)}
                whileHover={{ scale: 1.02 }}
                animate={
                  openingIdx === idx
                    ? { scale: [1, 1.06, 1], rotate: [0, -2, 0] } // „deschidere” rapidă
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.28 }}
              >
                <motion.span
                  className="gift-emoji"
                  animate={openingIdx === idx ? { y: [0, -6, 0] } : { y: 0 }}
                  transition={{ duration: 0.28 }}
                >
                  🎁
                </motion.span>
                <span className="gift-title">{v.title}</span>
              </motion.button>
            ))}
          </section>
        </main>
      </div>

      <Lightbox open={openIdx !== null} onClose={closeVideo} video={openIdx !== null ? videos[openIdx] : null} />
    </div>
  );
}
