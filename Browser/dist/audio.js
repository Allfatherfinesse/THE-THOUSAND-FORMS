// All instruments are synthesized locally. Noise is generated once per audio context.
export function createAudio() {
  let context, master, noiseBuffer, enabled = true, bellTimer;
  const ready = () => enabled && context?.state === 'running' && !document.hidden;
  function tone(start, end, length, level, type = 'sine', delay = 0) {
    if (!ready()) return;
    const time = context.currentTime + delay;
    const voice = context.createOscillator(), env = context.createGain();
    voice.type = type;
    voice.frequency.setValueAtTime(start, time);
    voice.frequency.exponentialRampToValueAtTime(end, time + length);
    env.gain.setValueAtTime(.0001, time);
    env.gain.exponentialRampToValueAtTime(level, time + .006);
    env.gain.exponentialRampToValueAtTime(.0001, time + length);
    voice.connect(env).connect(master);
    voice.start(time); voice.stop(time + length + .01);
    voice.onended = () => { voice.disconnect(); env.disconnect(); };
  }
  function noise(length, level, from, to) {
    if (!ready()) return;
    const time = context.currentTime;
    const voice = context.createBufferSource(), filter = context.createBiquadFilter(), env = context.createGain();
    voice.buffer = noiseBuffer;
    filter.type = 'bandpass'; filter.Q.value = .8;
    filter.frequency.setValueAtTime(from, time);
    filter.frequency.exponentialRampToValueAtTime(to, time + length);
    env.gain.setValueAtTime(.0001, time);
    env.gain.exponentialRampToValueAtTime(level, time + .009);
    env.gain.exponentialRampToValueAtTime(.0001, time + length);
    voice.connect(filter).connect(env).connect(master);
    voice.start(time, Math.random() * .45, length);
    voice.onended = () => { voice.disconnect(); filter.disconnect(); env.disconnect(); };
  }
  function bell(root, length, gain) {
    for (const [ratio, volume, decay] of [[1, 1, 1], [2.39, .31, .65], [3.07, .18, .4], [4.16, .08, .22]]) {
      tone(root * ratio, root * ratio * .995, length * decay, gain * volume);
    }
  }
  let toll = 0;
  return {
    async unlock() {
      try {
        if (!context) {
          context = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
          master = context.createGain(); master.gain.value = enabled ? .36 : 0;
          master.connect(context.destination);
          noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
          const samples = noiseBuffer.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        }
        await context.resume();
        if (!bellTimer) {
          const tollBell = () => bell([73.42, 110, 82.41, 73.42][toll++ % 4], 3.1, .047);
          tollBell(); bellTimer = setInterval(tollBell, 12500);
        }
      } catch { /* Sound is optional when the browser blocks audio. */ }
    },
    setEnabled(value) {
      enabled = value;
      if (master) master.gain.setTargetAtTime(value ? .36 : 0, context.currentTime, .025);
    },
    step(gain, effort = 0, alternate = 0) {
      const pitch = alternate ? 1.07 : .96;
      noise(.082 + effort * .028, gain * (.15 + .10 * effort), (1300 + effort * 270) * pitch, 370);
      tone((85 + effort * 12) * pitch, 45, .09 + effort * .024, gain * (.075 + effort * .08));
    },
    event(e) {
      const heavy = e.kind === 'heavy' || e.kind === 'hybrid' || e.damage >= 20;
      const pitch = e.actor === 'enemy' ? .84 : 1;
      switch (e.type) {
        case 'strike': noise(heavy ? .16 : .09, heavy ? .34 : .23, 620 * pitch, (heavy ? 1550 : 2600) * pitch); break;
        case 'hit':
          noise(heavy ? .14 : .083, heavy ? .72 : .47, 2200 * pitch, 360);
          tone((heavy ? 118 : 170) * pitch, heavy ? 39 : 64, heavy ? .20 : .11, heavy ? .58 : .34);
          break;
        case 'block': noise(.08, .36, 2100, 720); tone(238, 92, .13, .20, 'triangle'); break;
        case 'deflect': noise(.045, .32, 4200, 1800); bell(836, .72, .17); break;
        case 'evade': noise(.19, .19, 1500, 430); break;
        case 'style': bell([330, 392, 440][e.style] || 330, .35, .08); break;
        case 'break': noise(.24, .54, 1750, 260); tone(95, 31, .33, .41); break;
        case 'phase': bell(65.41, 2.3, .24); break;
        case 'win': bell(196, 1.7, .15); tone(293.66, 293.66, 1.3, .12, 'sine', .22); break;
        case 'lose': bell(73.42, 2.2, .18); break;
      }
    },
    dispose() { clearInterval(bellTimer); context?.close(); },
  };
}
