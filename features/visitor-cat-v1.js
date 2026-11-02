/* Browser-only visitor character persistence. No account or server storage. */
(function () {
  'use strict';
  const KEY = 'jelly-room:visitor-cat:v1';
  const DAY = 24 * 60 * 60 * 1000;

  function read(cats) {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      return value && value.version === 1 &&
        cats.some(cat => cat.id === value.id) &&
        Number.isSafeInteger(value.selectedAt) && value.selectedAt > 0 &&
        value.selectedAt <= Date.now() ? value : null;
    } catch (_) { return null; }
  }

  function save(record) {
    try {
      localStorage.setItem(KEY, JSON.stringify(record));
      return true;
    } catch (_) { return false; }
  }

  function Controls({ React, jsx, cats, draw, onChange }) {
    const [record, setRecord] = React.useState(null);
    const [now, setNow] = React.useState(0);
    const [storageOK, setStorageOK] = React.useState(true);
    const [notice, setNotice] = React.useState('');
    const current = React.useRef(null);

    function apply(value) {
      current.current = value;
      setRecord(value);
      setNow(Date.now());
      onChange(value.id);
    }

    React.useEffect(() => {
      let value = read(cats);
      if (!value) {
        value = { version: 1, id: draw().id, selectedAt: Date.now() };
        setStorageOK(save(value));
      }
      apply(value);
      const refresh = () => {
        const stored = read(cats);
        if (stored) apply(stored);
        else setNow(Date.now());
      };
      const changed = event => {
        if (event.key === KEY || event.key === null) refresh();
      };
      const timer = setInterval(() => setNow(Date.now()), 1000);
      window.addEventListener('storage', changed);
      window.addEventListener('focus', refresh);
      document.addEventListener('visibilitychange', refresh);
      return () => {
        clearInterval(timer);
        window.removeEventListener('storage', changed);
        window.removeEventListener('focus', refresh);
        document.removeEventListener('visibilitychange', refresh);
      };
    }, []);

    function reset() {
      // Recheck storage at the click, including changes made in another tab.
      const value = read(cats) || current.current;
      if (!value) return;
      if (Date.now() < value.selectedAt + DAY) {
        apply(value);
        return;
      }
      const next = { version: 1, id: draw().id, selectedAt: Date.now() };
      const saved = save(next);
      setStorageOK(saved);
      apply(next);
      setNotice('캐릭터를 다시 뽑았어요. 다음 초기화는 24시간 후에 가능해요.');
    }

    // Match the static HTML until client storage has been read.
    if (!record) return null;
    const remaining = Math.max(0, record.selectedAt + DAY - now);
    const minutes = Math.ceil(remaining / 60000);
    const wait = `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
    return jsx.jsxs('div', { className: 'visitor-cat-controls', children: [
      jsx.jsx('button', {
        type: 'button', className: 'visitor-cat-reset',
        disabled: remaining > 0, onClick: reset,
        'aria-describedby': 'visitor-cat-help',
        children: remaining > 0 ? `캐릭터 초기화 · ${wait} 후` : '캐릭터 초기화'
      }),
      jsx.jsx('small', { id: 'visitor-cat-help', children: storageOK
        ? '이 브라우저에 유지돼요. 24시간 후 버튼으로 다시 뽑을 수 있어요.'
        : '브라우저 저장이 차단되어 있어요. 다시 방문하면 캐릭터가 바뀔 수 있어요.' }),
      jsx.jsx('span', { className: 'visitor-cat-notice', role: 'status', children: notice })
    ] });
  }

  window.JellyVisitorCat = { Controls };
})();
