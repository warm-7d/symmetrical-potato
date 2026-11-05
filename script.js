const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector("#calculator-keys");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let justCalculated = false;

function render() {
  display.textContent = currentValue;
  expression.textContent = storedValue !== null && pendingOperator
    ? `${formatNumber(storedValue)} ${pendingOperator}`
    : "";
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 10 });
}

function inputDigit(digit) {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = digit;
    waitingForOperand = false;
    justCalculated = false;
  } else {
    currentValue = currentValue === "0" ? digit : currentValue + digit;
  }
  render();
}

function inputDecimal() {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = "0.";
    waitingForOperand = false;
    justCalculated = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "−": return left - right;
    case "×": return left * right;
    case "÷": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function cleanResult(value) {
  if (!Number.isFinite(value)) return "Error";
  // Avoid displaying common floating-point artifacts such as 0.1 + 0.2.
  return String(Number(value.toPrecision(12)));
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;
  const inputValue = Number(currentValue);

  if (pendingOperator && !waitingForOperand) {
    const result = calculate(Number(storedValue), inputValue, pendingOperator);
    currentValue = cleanResult(result);
    storedValue = currentValue === "Error" ? null : Number(currentValue);
  } else {
    storedValue = inputValue;
  }

  pendingOperator = currentValue === "Error" ? null : operator;
  waitingForOperand = true;
  justCalculated = false;
  render();
}

function performCalculation() {
  if (!pendingOperator || storedValue === null || currentValue === "Error") return;
  const result = calculate(Number(storedValue), Number(currentValue), pendingOperator);
  expression.textContent = `${formatNumber(storedValue)} ${pendingOperator} ${formatNumber(currentValue)} =`;
  currentValue = cleanResult(result);
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  justCalculated = true;
  display.textContent = currentValue;
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  justCalculated = false;
  render();
}

function backspace() {
  if (currentValue === "Error" || waitingForOperand || justCalculated) {
    currentValue = "0";
    waitingForOperand = false;
    justCalculated = false;
  } else {
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
    if (currentValue === "-" || currentValue === "-0") currentValue = "0";
  }
  render();
}

function toggleSign() {
  if (currentValue !== "0" && currentValue !== "Error") {
    currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
  }
  render();
}

function percent() {
  if (currentValue !== "Error") {
    currentValue = cleanResult(Number(currentValue) / 100);
    waitingForOperand = false;
    justCalculated = false;
    render();
  }
}

function handleAction(action) {
  switch (action) {
    case "clear": clear(); break;
    case "backspace": backspace(); break;
    case "decimal": inputDecimal(); break;
    case "sign": toggleSign(); break;
    case "percent": percent(); break;
    case "equals": performCalculation(); break;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.digit !== undefined) inputDigit(button.dataset.digit);
  else if (button.dataset.operator) chooseOperator(button.dataset.operator);
  else if (button.dataset.action) handleAction(button.dataset.action);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
  else if (event.key === ".") inputDecimal();
  else if (event.key === "Enter" || event.key === "=") performCalculation();
  else if (event.key === "Backspace") backspace();
  else if (event.key === "Escape") clear();
  else {
    const operators = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    if (operators[event.key]) chooseOperator(operators[event.key]);
    else return;
  }
  event.preventDefault();
});

render();
