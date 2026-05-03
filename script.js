'use strict';

// ============================================================
//  State
// ============================================================
const state = {
  current: '0',
  previous: null,
  operator: null,
  shouldReset: false,
  justCalculated: false,
};

const MAX_DISPLAY_LEN = 12;
const MAX_HISTORY     = 5;
const history         = [];

// ============================================================
//  DOM refs
// ============================================================
const currentValueEl = document.getElementById('currentValue');
const expressionEl   = document.getElementById('expression');
const historyListEl  = document.getElementById('historyList');
const themeToggle    = document.getElementById('themeToggle');
const buttons        = document.querySelector('.buttons');

// ============================================================
//  Display helpers
// ============================================================
function updateDisplay() {
  const val = state.current;
  // Shrink font if number is long
  if (val.length > 9) {
    currentValueEl.style.fontSize = '34px';
  } else if (val.length > 6) {
    currentValueEl.style.fontSize = '44px';
  } else {
    currentValueEl.style.fontSize = '52px';
  }
  currentValueEl.textContent = val;
}

function setExpression(text) {
  expressionEl.textContent = text;
}

function addHistory(expr, result) {
  history.push({ expr, result });
  if (history.length > MAX_HISTORY) history.shift();
  renderHistory();
}

function renderHistory() {
  historyListEl.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `${item.expr} = <span>${item.result}</span>`;
    historyListEl.appendChild(li);
  });
}

// ============================================================
//  Core calculation
// ============================================================
function calculate(a, operator, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  let result;

  switch (operator) {
    case '+':
      result = numA + numB; break;
    case '−':
      result = numA - numB; break;
    case '×':
      result = numA * numB; break;
    case '÷':
      if (numB === 0) return 'Error: ÷0';
      result = numA / numB; break;
    default:
      return b;
  }

  // Overflow protection
  if (!isFinite(result)) return 'Error';

  // Format: avoid floating point noise
  const str = parseFloat(result.toPrecision(10)).toString();
  return str.length > MAX_DISPLAY_LEN
    ? parseFloat(result.toExponential(4)).toString()
    : str;
}

// ============================================================
//  Action handlers
// ============================================================
function handleNumber(value) {
  if (state.current === 'Error: ÷0' || state.current === 'Error') return;

  if (state.shouldReset) {
    state.current = value;
    state.shouldReset = false;
  } else {
    if (state.current === '0') {
      state.current = value;
    } else {
      if (state.current.replace('-', '').replace('.', '').length >= MAX_DISPLAY_LEN) return;
      state.current += value;
    }
  }
  state.justCalculated = false;
  updateDisplay();
}

function handleDecimal() {
  if (state.shouldReset) {
    state.current = '0.';
    state.shouldReset = false;
    updateDisplay();
    return;
  }
  if (state.current.includes('.')) return;
  state.current += '.';
  updateDisplay();
}

function handleOperator(op) {
  if (state.current === 'Error: ÷0' || state.current === 'Error') return;

  // If there's a pending operation, calculate first
  if (state.operator && !state.shouldReset) {
    const result = calculate(state.previous, state.operator, state.current);
    if (result.startsWith('Error')) {
      state.current = result;
      state.operator = null;
      state.previous = null;
      updateDisplay();
      setExpression('');
      return;
    }
    state.current = result;
    updateDisplay();
  }

  state.previous = state.current;
  state.operator = op;
  state.shouldReset = true;
  state.justCalculated = false;

  setExpression(`${state.previous} ${op}`);

  // Highlight active operator button
  document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === op);
  });
}

function handleEquals() {
  if (!state.operator || state.current === 'Error: ÷0' || state.current === 'Error') return;

  const expr = `${state.previous} ${state.operator} ${state.current}`;
  const result = calculate(state.previous, state.operator, state.current);

  addHistory(expr, result);
  setExpression(expr + ' =');

  state.current = result;
  state.previous = null;
  state.operator = null;
  state.shouldReset = true;
  state.justCalculated = true;

  document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
  updateDisplay();
}

function handleClear() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.shouldReset = false;
  state.justCalculated = false;
  setExpression('');
  document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
  updateDisplay();
}

function handleBackspace() {
  if (state.shouldReset || state.current === 'Error: ÷0' || state.current === 'Error') {
    handleClear();
    return;
  }
  if (state.current.length === 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
  updateDisplay();
}

function handleToggleSign() {
  if (state.current === '0' || state.current === 'Error: ÷0' || state.current === 'Error') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

function handlePercent() {
  if (state.current === 'Error: ÷0' || state.current === 'Error') return;
  const val = parseFloat(state.current);
  if (isNaN(val)) return;

  const base = state.previous ? parseFloat(state.previous) : 100;
  state.current = (val / 100 * (state.operator ? base : 1)).toString();
  updateDisplay();
}

// ============================================================
//  Event Delegation (Buttons)
// ============================================================
buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'number':      handleNumber(value);    break;
    case 'decimal':     handleDecimal();        break;
    case 'operator':    handleOperator(value);  break;
    case 'equals':      handleEquals();         break;
    case 'clear':       handleClear();          break;
    case 'backspace':   handleBackspace();      break;
    case 'toggle-sign': handleToggleSign();     break;
    case 'percent':     handlePercent();        break;
  }
});

// ============================================================
//  Keyboard Support
// ============================================================
const KEY_MAP = {
  '0': () => handleNumber('0'),
  '1': () => handleNumber('1'),
  '2': () => handleNumber('2'),
  '3': () => handleNumber('3'),
  '4': () => handleNumber('4'),
  '5': () => handleNumber('5'),
  '6': () => handleNumber('6'),
  '7': () => handleNumber('7'),
  '8': () => handleNumber('8'),
  '9': () => handleNumber('9'),
  '.': () => handleDecimal(),
  ',': () => handleDecimal(),
  '+': () => handleOperator('+'),
  '-': () => handleOperator('−'),
  '*': () => handleOperator('×'),
  '/': () => handleOperator('÷'),
  'Enter':     () => handleEquals(),
  '=':         () => handleEquals(),
  'Backspace':  () => handleBackspace(),
  'Escape':     () => handleClear(),
  'Delete':     () => handleClear(),
  '%':          () => handlePercent(),
};

document.addEventListener('keydown', (e) => {
  if (KEY_MAP[e.key]) {
    e.preventDefault();
    KEY_MAP[e.key]();
    // Visual feedback: flash the corresponding button
    const selector = {
      'Enter': '[data-action="equals"]',
      '=':     '[data-action="equals"]',
      'Backspace': '[data-action="backspace"]',
      'Escape':    '[data-action="clear"]',
      'Delete':    '[data-action="clear"]',
    }[e.key];
    if (selector) {
      const el = document.querySelector(selector);
      if (el) { el.style.filter = 'brightness(1.4)'; setTimeout(() => el.style.filter = '', 120); }
    }
  }
});

// ============================================================
//  Theme Toggle
// ============================================================
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  document.body.classList.toggle('light', !isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('calc-theme', isDark ? 'dark' : 'light');
});

// Restore theme from localStorage
(function initTheme() {
  const saved = localStorage.getItem('calc-theme') || 'dark';
  document.body.className = saved;
  themeToggle.textContent = saved === 'dark' ? '☀️' : '🌙';
})();

// Initial render
updateDisplay();
