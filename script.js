let display = document.getElementById("display");
let isError = false;

// History State
let historyData = [];
try {
    const stored = localStorage.getItem("calc_history");
    if (stored) historyData = JSON.parse(stored);
} catch {
    historyData = [];
}

const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const historyToggle = document.getElementById("historyToggle");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");

function saveHistory() {
    try {
        localStorage.setItem("calc_history", JSON.stringify(historyData));
    } catch {
        // Fallback for private browsing or disabled storage
    }
}

function renderHistory() {
    if (!historyList) return;

    if (historyData.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
        return;
    }

    historyList.innerHTML = historyData
        .map((item, index) => {
            const escapedResult = String(item.result).replace(/'/g, "\\'");
            return `
                <button type="button" class="history-item" onclick="loadHistoryResult('${escapedResult}')" aria-label="Load result ${item.result}">
                    <span class="history-expr">${item.expression} =</span>
                    <span class="history-val">${item.result}</span>
                </button>
            `;
        })
        .join("");
}

function addHistoryEntry(expression, result) {
    const formattedExpr = expression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−");

    historyData.unshift({
        expression: formattedExpr,
        result: result
    });

    if (historyData.length > 50) {
        historyData.pop();
    }

    saveHistory();
    renderHistory();
}

// Re-use Previous Results: loads clicked result back into display
function loadHistoryResult(result) {
    clearError();
    display.value = String(result);
}

// Clear History Option
function clearHistory() {
    historyData = [];
    saveHistory();
    renderHistory();
}

// Toggle History Panel
if (historyToggle) {
    historyToggle.addEventListener("click", function () {
        historyPanel.classList.toggle("open");
    });
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", function () {
        historyPanel.classList.remove("open");
    });
}

function showError(message) {
    display.value = message;
    display.classList.add("error");
    isError = true;
}

function clearError() {
    if (isError) {
        display.classList.remove("error");
        display.value = "0";
        isError = false;
    }
}

function addValue(value) {
    clearError();

    if (display.value === "0" && value !== ".") {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.classList.remove("error");
    display.value = "0";
    isError = false;
}

function deleteLast() {
    if (isError) {
        clearError();
        return;
    }
    display.value = display.value.slice(0, -1) || "0";
}

// 1. Sign Toggle (+/-): Inverts current input between positive & negative
function toggleSign() {
    if (isError) {
        clearError();
        return;
    }
    if (display.value === "0") return;

    if (display.value.startsWith("-")) {
        display.value = display.value.slice(1);
    } else {
        display.value = "-" + display.value;
    }
}

// 2. Percentage (%): Converts display value into a decimal percentage
function percentage() {
    if (isError) {
        clearError();
        return;
    }
    try {
        const val = evalExpression(display.value);
        if (isNaN(val) || !isFinite(val)) {
            showError("Invalid Input");
            return;
        }
        const formatted = formatNumber(val / 100);
        addHistoryEntry(display.value + "%", formatted);
        display.value = formatted;
    } catch {
        showError("Invalid Expression");
    }
}

// 3. Square Root (√): Computes square root of current display value
function squareRoot() {
    if (isError) {
        clearError();
        return;
    }
    try {
        const val = evalExpression(display.value);
        if (val < 0) {
            showError("Invalid Input");
        } else if (isNaN(val) || !isFinite(val)) {
            showError("Invalid Input");
        } else {
            const formatted = formatNumber(Math.sqrt(val));
            addHistoryEntry("√(" + display.value + ")", formatted);
            display.value = formatted;
        }
    } catch {
        showError("Invalid Expression");
    }
}

// 4. Exponentiation (x²): Computes square of current display value
function square() {
    if (isError) {
        clearError();
        return;
    }
    try {
        const val = evalExpression(display.value);
        if (isNaN(val) || !isFinite(val)) {
            showError("Invalid Input");
        } else {
            const formatted = formatNumber(Math.pow(val, 2));
            addHistoryEntry("(" + display.value + ")²", formatted);
            display.value = formatted;
        }
    } catch {
        showError("Invalid Expression");
    }
}

// Helper: Evaluates expressions and converts ^ to ** for custom power calculations
function evalExpression(expr) {
    const sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**");

    if (!/^[0-9+\-*/().\s*]+$/.test(sanitized)) {
        throw new Error("Invalid characters");
    }

    return Function('"use strict"; return (' + sanitized + ')')();
}

function formatNumber(num) {
    if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
        return "0";
    }

    const rounded = parseFloat(num.toPrecision(12));

    if (Math.abs(rounded) >= 1e14 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
        return rounded.toExponential(6).replace(/\.?0+e/, "e");
    }

    return String(rounded);
}

// Error Handling & Calculation
function calculate() {
    if (isError) {
        clearError();
        return;
    }

    try {
        const rawExpr = display.value;
        const result = evalExpression(rawExpr);

        if (result === Infinity || result === -Infinity) {
            showError("Cannot divide by 0");
        } else if (isNaN(result)) {
            if (/\/\s*0(?![.1-9])/.test(rawExpr)) {
                showError("Cannot divide by 0");
            } else {
                showError("Invalid Input");
            }
        } else if (typeof result !== "number") {
            showError("Invalid Expression");
        } else {
            const formatted = formatNumber(result);
            if (rawExpr !== formatted) {
                addHistoryEntry(rawExpr, formatted);
            }
            display.value = formatted;
        }
    } catch {
        if (/\/\s*0(?![.1-9])/.test(display.value)) {
            showError("Cannot divide by 0");
        } else {
            showError("Invalid Expression");
        }
    }
}

// Keyboard listener
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if ("0123456789+-*/.".includes(key)) {
        addValue(key);
    } else if (key === "^") {
        addValue("^");
    } else if (key === "%") {
        percentage();
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Escape") {
        clearDisplay();
    } else if (key === "Backspace") {
        deleteLast();
    }
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeToggle.textContent = "Switch to Light Mode";
    } else {
        themeToggle.textContent = "Switch to Dark Mode";
    }
});

// Initial Render
renderHistory();