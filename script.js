let display = document.getElementById("display");
let isError = false;

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
        display.value = formatNumber(val / 100);
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
            display.value = formatNumber(Math.sqrt(val));
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
            display.value = formatNumber(Math.pow(val, 2));
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

    // Check for safety: only allow math tokens
    if (!/^[0-9+\-*/().\s*]+$/.test(sanitized)) {
        throw new Error("Invalid characters");
    }

    return Function('"use strict"; return (' + sanitized + ')')();
}

function formatNumber(num) {
    if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
        return "0";
    }

    // Limit precision to 12 places to avoid floating point artifacts (e.g. 0.1 + 0.2 = 0.3)
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
        const result = evalExpression(display.value);

        // Prevent crashes on division by zero (Infinity or -Infinity)
        if (result === Infinity || result === -Infinity) {
            showError("Cannot divide by 0");
        } else if (isNaN(result)) {
            if (/\/\s*0(?![.1-9])/.test(display.value)) {
                showError("Cannot divide by 0");
            } else {
                showError("Invalid Input");
            }
        } else if (typeof result !== "number") {
            showError("Invalid Expression");
        } else {
            display.value = formatNumber(result);
        }
    } catch {
        // Detect division by zero inside malformed or complex expressions
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