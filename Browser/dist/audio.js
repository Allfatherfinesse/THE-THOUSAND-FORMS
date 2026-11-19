// Original synthesized sound. No remote audio or licensed samples.
export function createAudio() {
  let context, master, enabled = true, ambientTimer;
  const audio = () => {
    if (!context) {
      context = new (window.AudioContext || window.webkitAudioContext)();
      master = context.createGain();
      master.gain.value = enabled ? .32 : 0;
      master.connect(context.destination);
    }
    return context;
  };
  function tone(frequency, length = .2, volume = .18, type = 'sine', end = frequency) {
    if (!enabled || !context || context.state !== 'running') return;
    const now = context.currentTime, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + length);
    gain.gain.setValueAtTime(.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .008);
    gain.gain.exponentialRampToValueAtTime(.001, now + length);
    oscillator.connect(gain); gain.connect(master);
    oscillator.start(now); oscillator.stop(now + length + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function noise(length = .12, volume = .16, cutoff = 1200) {
    if (!enabled || !context || context.state !== 'running') return;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = cutoff;
    gain.gain.value = volume;
    source.connect(filter); filter.connect(gain); gain.connect(master);
    source.start();
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }
  return {
    async unlock() {
      try {
        await audio().resume();
        if (!ambientTimer) {
          ambientTimer = setInterval(() => {
            if (!document.hidden) tone([110, 146.83, 164.81, 220][Math.floor(Math.random() * 4)], 2.5, .022);
          }, 2800);
        }
      } catch { /* Audio is optional when device policy blocks it. */ }
    },
    setEnabled(value) { enabled = value; if (master) master.gain.setTargetAtTime(value ? .32 : 0, context.currentTime, .05); },
    event(event) {
      switch (event.type) {
        case 'strike': noise(.12, .1, 1800); break;
        case 'hit': noise(.13, .55, 700); tone(105, .16, .55, 'sine', 38); break;
        case 'block': noise(.07, .26, 1400); tone(180, .12, .2, 'triangle', 75); break;
        case 'deflect': tone(980, .5, .14, 'sine', 600); tone(1470, .35, .06); break;
        case 'evade': noise(.18, .12, 2600); break;
        case 'style': tone(440, .18, .08); tone(660, .3, .05); break;
        case 'break': noise(.3, .4, 400); tone(75, .4, .35, 'triangle', 30); break;
        case 'phase': tone(75, 1.4, .3, 'sine', 45); break;
        case 'win': [220, 330, 440].forEach((f, i) => setTimeout(() => tone(f, 1.2, .13), i * 160)); break;
        case 'lose': tone(110, 1.6, .15, 'sine', 45); break;
      }
    },
    dispose() { clearInterval(ambientTimer); context?.close(); }
  };
}
