import throttle from 'common/throttle';

let timeout;
let booted = false;

export function start(container: HTMLElement) {

  /* Detected browsers with a correct grid min-content implementation:
   * Chrome, Chromium, Brave, Opera, Safari 12+
   */
  if (window.chrome) return;

  const runHacks = throttle(200, () => {
    window.lichess.raf(() => {
      fixChat(container);
      fixBoardHeight(container);
      schedule();
    });
  });

  function schedule() {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(runHacks, 500);
  }

  runHacks();

  if (!booted) {
    booted = true;
    document.body.addEventListener('chessground.resize', runHacks);
    window.lichess.pubsub.on('analyse.grid-hack', runHacks);
  }
}

function fixChat(container: HTMLElement) {
  const chat = container.querySelector('.mchat') as HTMLElement,
    board = container.querySelector('.analyse__board') as HTMLElement,
    side = container.querySelector('.analyse__side') as HTMLElement;
  if (chat && board && side) {
    const height = board.offsetHeight - side.offsetHeight;
    if (height) chat.style.height = `calc(${height}px - 2vmin)`;
  }
}

// Firefox 60- needs this to properly compute the grid layout.
export function fixBoardHeight(container: HTMLElement) {
  const el = container.querySelector('.main-board') as HTMLElement;
  el.style.height = el.offsetWidth + 'px';
  window.lichess.dispatchEvent(document.body, 'chessground.resize');
}
