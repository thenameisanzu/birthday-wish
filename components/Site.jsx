'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, animate, useMotionValue } from 'framer-motion'

// ---- Defaults. Any of these can be overridden from the link: ?name=Anu&age=25&from=Ansu&msg=Hello&wa=91XXXXXXXXXX ----
const DEFAULT = { name: 'Anu', age: 25, from: 'Ansu', msg: 'May this year bring you everything you wished for. Dinner is on me.', wa: '910000000000' }
const WISHES = ['More laughter than you can carry.', 'A year of good news only.', 'Chai, cake and zero Monday meetings.', 'Strong health and a lighter heart.', 'Every plan you made, actually happening.', 'People who love you louder every year.', 'Big dreams, small worries.', 'Eat the second slice.']
const COLORS = ['#FF3D81', '#FFD23F', '#2EE6D6', '#FF7A2F', '#8B5CF6', '#3DDC84']
const rnd = (() => { let s = 3; return () => ((s = (s * 9301 + 49297) % 233280) / 233280) })()
const BITS = Array.from({ length: 70 }, (_, i) => ({ c: COLORS[i % 6], x: (rnd() - .5) * 900, up: 120 + rnd() * 380, fall: 260 + rnd() * 380, r: rnd() * 720, w: 6 + rnd() * 8 }))
const STARS = Array.from({ length: 40 }, () => ({ l: rnd() * 100, t: rnd() * 60, s: 1 + rnd() * 2, d: rnd() * 3 }))
let ctx
const jingle = () => { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); [523, 659, 784, 1047, 784, 1047].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * .13; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.25, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + .4) }) }

const Confetti = ({ k, className = '' }) => k ? <div className={`pointer-events-none absolute left-1/2 top-1/2 z-30 ${className}`}>{BITS.map((b, i) => <motion.span key={`${k}${i}`} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: b.x, y: [0, -b.up, b.fall], rotate: b.r, opacity: [1, 1, 0] }} transition={{ duration: 2.4, ease: 'easeOut', times: [0, .35, 1] }} className="absolute rounded-[2px]" style={{ background: b.c, width: b.w, height: b.w * .6 }} />)}</div> : null

function Candle({ x, out, c }) {
  return (
    <g transform={`translate(${x} 96)`}>
      <rect x="-4" y="0" width="8" height="34" rx="2" fill={c} /><path d="M-4 8L4 4M-4 18L4 14M-4 28L4 24" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      <motion.g animate={{ scale: out ? 0 : 1 }} transition={{ duration: .25 }} style={{ originX: .5, originY: 1 }}>
        <circle cy="-14" r="26" fill="#FFB020" opacity=".22" />
        <motion.g animate={{ scaleY: [1, 1.15, .94, 1.08, 1], scaleX: [1, .92, 1.05, .97, 1] }} transition={{ duration: .7 + x % 3 * .1, repeat: Infinity }} style={{ originX: .5, originY: 1 }}><path d="M0 -2C-8 -12 -4 -22 0 -32C4 -22 8 -12 0 -2Z" fill="#FFB020" /><path d="M0 -3C-4 -9 -2 -15 0 -20C2 -15 4 -9 0 -3Z" fill="#FFF0B0" /></motion.g>
      </motion.g>
      {out && <motion.path d="M0 -4Q9 -18 0 -32T0 -60" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" initial={{ pathLength: 0, opacity: .7, y: 0 }} animate={{ pathLength: 1, opacity: 0, y: -26 }} transition={{ duration: 2.2, ease: 'easeOut' }} />}
    </g>
  )
}

function Balloon({ i, onPop }) {
  const [gone, setGone] = useState(0)
  const x = 6 + i * 11.5
  return (
    <AnimatePresence>
      {!gone && <motion.button key="b" aria-label="Pop balloon for a wish" onClick={() => { setGone(1); onPop(WISHES[i % WISHES.length]); navigator.vibrate?.(15); setTimeout(() => setGone(0), 3200) }} initial={{ y: 0 }} animate={{ y: '-125dvh', x: [0, 14, -10, 6] }} exit={{ scale: 1.6, opacity: 0 }} transition={{ y: { duration: 11 + (i % 4) * 2.5, repeat: Infinity, ease: 'linear', delay: -i * 2.2 }, x: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: .15 }, opacity: { duration: .15 } }} className="absolute bottom-[-18dvh] h-[110px] w-[86px]" style={{ left: `${x}%` }}>
        <svg viewBox="0 0 86 130" className="h-full w-full"><ellipse cx="43" cy="46" rx="38" ry="44" fill={COLORS[i % 6]} /><ellipse cx="30" cy="28" rx="9" ry="14" fill="#fff" opacity=".35" /><path d="M43 90L38 100H48Z" fill={COLORS[i % 6]} /><path d="M43 100Q30 115 43 130" stroke="#140B2B" strokeOpacity=".4" fill="none" /></svg>
      </motion.button>}
    </AnimatePresence>
  )
}

export default function Site() {
  const [P, setP] = useState(DEFAULT)
  const [out, setOut] = useState([false, false, false, false, false])
  const [on, setOn] = useState(false), [burst, setBurst] = useState(0), [age, setAge] = useState(0), [mic, setMic] = useState(false), [wish, setWish] = useState(null), [gift, setGift] = useState(false), [gb, setGb] = useState(0)
  const level = useMotionValue(0), hold = useRef(null), acc = useRef(0)
  const streamRef = useRef(null), audioCtxRef = useRef(null), animFrameRef = useRef(null)
  const [mk, setMk] = useState({ name: '', age: '', from: '', msg: '', wa: '' }), [link, setLink] = useState('')
  useEffect(() => { const q = new URLSearchParams(location.search); setP((p) => ({ name: q.get('name') || p.name, age: +(q.get('age') || p.age), from: q.get('from') || p.from, msg: q.get('msg') || p.msg, wa: (q.get('wa') || p.wa).replace(/\D/g, '') })) }, [])
  const snuff = () => setOut((o) => { const i = o.indexOf(false); if (i < 0) return o; const n = [...o]; n[i] = true; navigator.vibrate?.(10); return n })
  
  const stopMic = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null }
    setMic(false)
    level.set(0)
  }

  useEffect(() => {
    if (out.every(Boolean) && !on) {
      stopMic()
      const t = setTimeout(() => { setOn(true); setBurst((b) => b + 1); jingle(); animate(0, P.age, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setAge(Math.round(v)) }) }, 800)
      return () => clearTimeout(t)
    }
  }, [out, on, P.age])
  useEffect(() => { return () => stopMic() }, [])
  useEffect(() => { if (!wish) return; const t = setTimeout(() => setWish(null), 3800); return () => clearTimeout(t) }, [wish])

  const startMic = async () => {
    try {
      let s
      try {
        s = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        })
      } catch {
        s = await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      streamRef.current = s

      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const c = new AudioCtx()
      audioCtxRef.current = c
      if (c.state === 'suspended') {
        await c.resume()
      }

      const an = c.createAnalyser()
      an.fftSize = 512
      an.smoothingTimeConstant = 0.2
      c.createMediaStreamSource(s).connect(an)
      setMic(true)

      const timeData = new Uint8Array(an.fftSize)
      const freqData = new Uint8Array(an.frequencyBinCount)
      let last = performance.now()

      const loop = (t) => {
        an.getByteTimeDomainData(timeData)
        an.getByteFrequencyData(freqData)

        let sum = 0
        for (let i = 0; i < timeData.length; i++) {
          const val = (timeData[i] - 128) / 128
          sum += val * val
        }
        const rms = Math.sqrt(sum / timeData.length)

        let lowSum = 0
        const lowCount = 15
        for (let i = 1; i <= lowCount; i++) {
          lowSum += freqData[i]
        }
        const lowAvg = lowSum / lowCount

        const blowScore = Math.min(1, Math.max(rms * 14, lowAvg / 70))
        level.set(blowScore)

        const dt = Math.min(t - last, 100)
        last = t

        const isBlowing = (lowAvg > 32 && rms > 0.02) || rms > 0.04

        if (isBlowing) {
          const boost = Math.min(2.2, Math.max(1, blowScore * 1.6))
          acc.current += dt * boost
        } else {
          acc.current = Math.max(0, acc.current - dt * 0.4)
        }

        if (acc.current > 180) {
          acc.current = 0
          snuff()
        }

        animFrameRef.current = requestAnimationFrame(loop)
      }

      animFrameRef.current = requestAnimationFrame(loop)
    } catch {
      setMic(false)
    }
  }
  const blowHold = () => { snuff(); hold.current = setInterval(snuff, 450) }
  const blowEnd = () => clearInterval(hold.current)
  const make = (e) => { e.preventDefault(); const q = new URLSearchParams(Object.entries(mk).filter(([, v]) => v)); setLink(`${location.origin}${location.pathname}?${q}`) }
  const wa = (t) => `https://wa.me/${P.wa}?text=${encodeURIComponent(t)}`
  const inp = 'w-full rounded-2xl bg-white px-5 py-4 text-lg placeholder:text-plum/40'

  return (
    <MotionConfig reducedMotion="user">
      <motion.section animate={{ backgroundColor: on ? '#FFD23F' : '#140B2B' }} transition={{ duration: 1.2 }} className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
        <motion.div animate={{ opacity: on ? 0 : 1 }} className="absolute inset-0" aria-hidden>{STARS.map((s, i) => <span key={i} className="star absolute rounded-full bg-white" style={{ left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}</motion.div>
        <div className="relative z-10 mt-6 text-center">
          <AnimatePresence mode="wait">
            {!on ? <motion.div key="a" exit={{ opacity: 0, y: -20 }}><p className="font-display text-4xl font-bold text-white md:text-6xl">Make a wish, {P.name}.</p><p className="mt-2 text-white/70">Then blow out the candles.</p></motion.div> :
              <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h1 className="font-display text-[15vw] font-bold leading-[.95] md:text-[8rem]" aria-label={`Happy birthday ${P.name}`}>{['Happy', 'Birthday', `${P.name}!`].map((w, i) => <motion.span key={w} className="block" initial={{ y: 80, scale: .6, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12, delay: .2 + i * .2 }}><span className={i === 2 ? 'text-pink' : ''}>{w}</span></motion.span>)}</h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-3 font-display text-3xl font-bold">{age} today</motion.p></motion.div>}
          </AnimatePresence>
        </div>
        <svg viewBox="0 0 300 270" className="relative z-10 mt-6 w-[80vw] max-w-[380px]" aria-label="Birthday cake with five candles">
          <ellipse cx="150" cy="248" rx="140" ry="14" fill="#000" opacity=".25" /><rect x="40" y="150" width="220" height="90" rx="20" fill="#FF7FAE" /><path d="M40 170Q60 190 80 170T120 170T160 172T200 170T240 172T260 170V160H40Z" fill="#fff" />
          <rect x="72" y="112" width="156" height="56" rx="16" fill="#FFD23F" /><path d="M72 128Q90 146 108 128T144 128T180 130T216 128L228 128V120H72Z" fill="#fff" />
          {[[60, 205], [100, 215], [140, 210], [180, 218], [220, 208]].map(([x, y], i) => <circle key={i} cx={x + 6} cy={y + 12} r="4" fill={COLORS[i + 1]} />)}
          {[88, 119, 150, 181, 212].map((x, i) => <Candle key={x} x={x} out={out[i]} c={COLORS[i % 6]} />)}
        </svg>
        {!on && (
          <div className="relative z-10 mt-6 flex flex-col items-center gap-3">
            <button onClick={startMic} disabled={mic} className="rounded-full bg-pink px-7 py-4 font-bold text-white">{mic ? 'Listening... blow now' : 'Blow into your mic'}</button>
            {mic && <div className="h-2 w-40 overflow-hidden rounded-full bg-white/20"><motion.div style={{ scaleX: level }} className="h-full origin-left bg-aqua" /></div>}
            <button onPointerDown={blowHold} onPointerUp={blowEnd} onPointerLeave={blowEnd} onPointerCancel={blowEnd} className="touch-none rounded-full px-7 py-3.5 font-bold text-white ring-2 ring-white/60">Or press and hold to blow</button>
            <button onClick={() => setOut([true, true, true, true, true])} className="text-sm text-white/50 underline">Skip</button>
          </div>)}
        <Confetti k={burst} className="top-[45%]" />
        {on && <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ delay: 2, duration: 2, repeat: Infinity }} className="relative z-10 mt-6 font-bold">Scroll for your surprises</motion.p>}
      </motion.section>

      {on && (
        <>
          <section className="relative h-[100dvh] overflow-hidden bg-aqua">
            <div className="relative z-10 px-5 pt-[max(24px,env(safe-area-inset-top))] text-center"><h2 className="font-display text-5xl font-bold md:text-7xl">Pop a balloon</h2><p className="mt-2 text-lg">Each one holds a wish for you.</p></div>
            {Array.from({ length: 8 }, (_, i) => <Balloon key={i} i={i} onPop={setWish} />)}
            <AnimatePresence>{wish && <motion.div key={wish} initial={{ y: 40, scale: .8, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0, y: -30 }} className="absolute inset-x-5 top-[38%] z-20 mx-auto max-w-md rounded-[32px] bg-white p-7 text-center shadow-2xl"><p className="font-display text-3xl font-bold leading-tight">{wish}</p><p className="mt-3 text-plum/60">From {P.from}</p></motion.div>}</AnimatePresence>
          </section>

          <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-pink px-5 py-16 text-center text-white">
            <h2 className="font-display text-5xl font-bold md:text-7xl">{gift ? `For you, ${P.name}` : 'One last thing'}</h2>
            {!gift ? (
              <motion.button onClick={() => { setGift(true); setGb((b) => b + 1); navigator.vibrate?.([20, 40, 20]) }} aria-label="Open your gift" animate={{ rotate: [0, -6, 6, -4, 4, 0] }} transition={{ duration: .8, repeat: Infinity, repeatDelay: 2.2 }} className="mt-10 w-56">
                <svg viewBox="0 0 160 160"><rect x="20" y="70" width="120" height="80" rx="8" fill="#FFD23F" /><rect x="72" y="70" width="16" height="80" fill="#FF7A2F" /><rect x="14" y="52" width="132" height="26" rx="8" fill="#FFB020" /><rect x="72" y="52" width="16" height="26" fill="#FF7A2F" /><path d="M80 52C60 20 30 36 56 52M80 52C100 20 130 36 104 52" stroke="#FF7A2F" strokeWidth="8" fill="none" strokeLinecap="round" /></svg>
                <span className="mt-2 block text-lg font-bold">Tap to open</span>
              </motion.button>
            ) : (
              <motion.div initial={{ y: 60, scale: .6, opacity: 0, rotate: -6 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: -2 }} transition={{ type: 'spring', stiffness: 160, damping: 12 }} className="mt-10 max-w-md rounded-[28px] bg-white p-8 text-plum shadow-2xl"><p className="font-display text-3xl font-bold leading-snug">{P.msg}</p><p className="mt-5 text-lg font-bold text-pink">With love, {P.from}</p><a href={wa(`Thank you for the wishes, ${P.from}! Loved it.`)} className="mt-6 inline-block rounded-full bg-plum px-7 py-3.5 font-bold text-white">Say thank you</a></motion.div>)}
            <Confetti k={gb} />
          </section>

          <section className="bg-sun px-5 py-20">
            <div className="mx-auto max-w-xl"><h2 className="font-display text-5xl font-bold md:text-7xl">Send one to a friend</h2><p className="mt-3 text-lg">Make a personal birthday link in ten seconds.</p>
              <form onSubmit={make} className="mt-8 space-y-3">
                <input required value={mk.name} onChange={(e) => setMk({ ...mk, name: e.target.value })} placeholder="Their name" className={inp} />
                <input required type="number" min="1" max="120" value={mk.age} onChange={(e) => setMk({ ...mk, age: e.target.value })} placeholder="Their age" className={inp} />
                <input value={mk.from} onChange={(e) => setMk({ ...mk, from: e.target.value })} placeholder="From (your name)" className={inp} />
                <textarea value={mk.msg} onChange={(e) => setMk({ ...mk, msg: e.target.value })} placeholder="Your message inside the gift" rows={3} className={inp} />
                <input value={mk.wa} onChange={(e) => setMk({ ...mk, wa: e.target.value })} placeholder="Your WhatsApp number with country code" inputMode="numeric" className={inp} />
                <button className="rounded-full bg-plum px-8 py-4 font-bold text-white">Make the link</button>
              </form>
              {link && <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl bg-white p-5"><p className="break-all text-sm">{link}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => navigator.clipboard?.writeText(link)} className="rounded-full bg-plum px-5 py-3 font-bold text-white">Copy link</button><a href={`https://wa.me/?text=${encodeURIComponent(`I made something for you: ${link}`)}`} className="rounded-full px-5 py-3 font-bold ring-2 ring-plum">Share on WhatsApp</a></div></motion.div>}
            </div>
          </section>
        </>)}
    </MotionConfig>
  )
}
