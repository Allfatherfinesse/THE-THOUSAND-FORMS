// Fullscreen is an explicit user action. A denied request never stops the game.
export function createAppShell({ root, button, onReset, onChange, onNotice }) {
  const active = () => document.fullscreenElement === root || document.webkitFullscreenElement === root;
  let busy = false;
  let previous = active();
  function sync() {
    const enabled = active();
    document.body.classList.toggle('is-fullscreen', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Exit full screen' : 'Enter full screen');
    button.title = enabled ? 'Exit full screen' : 'Enter full screen';
    const wasActive = previous;
    previous = enabled;
    onReset();
    onChange({ enabled, exited: wasActive && !enabled });
  }
  async function toggle() {
    if (busy) return;
    busy = true;
    onReset();
    try {
      if (active()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
      } else {
        const enter = root.requestFullscreen || root.webkitRequestFullscreen;
        if (!enter) throw new Error('Fullscreen unavailable');
        await enter.call(root);
      }
    } catch {
      onNotice('Use the app’s expand control, or open this game in your browser for full screen.', 4);
      onChange({ enabled: active(), exited: false });
    } finally {
      busy = false;
    }
  }
  button.addEventListener('click', toggle);
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('webkitfullscreenchange', sync);
  button.setAttribute('aria-pressed', String(active()));
  return { active, toggle, get busy() { return busy; } };
}
