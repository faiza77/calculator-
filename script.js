let display = document.getElementById("display");

function addValue(value) {
    if (display.value === "0" && value !== ".") {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.value = "0";
}

// 1. Sign Toggle (+/-): Inverts current input between positive & negative
function toggleSign() {
    if (display.value === "0" || display.value === "Error") return;

    if (display.value.startsWith("-")) {
        display.value = display.value.slice(1);
    } else {
        display.value = "-" + display.value;
    }
}

// 2. Percentage (%): Converts display value into a decimal percentage
function percentage() {
    if (display.value === "Error") return;
    try {
        const val = evalExpression(display.value);
        display.value = String(val / 100);
    } catch {
        display.value = "Error";
    }
}

// 3. Square Root (√): Computes square root of current display value
function squareRoot() {
    if (display.value === "Error") return;
    try {
        const val = evalExpression(display.value);
        if (val < 0) {
            display.value = "Error";
        } else {
            display.value = String(Math.sqrt(val));
        }
    } catch {
        display.value = "Error";
    }
}

// 4. Exponentiation (x²): Computes square of current display value
function square() {
    if (display.value === "Error") return;
    try {
        const val = evalExpression(display.value);
        display.value = String(Math.pow(val, 2));
    } catch {
        display.value = "Error";
    }
}

// Helper: Evaluates expressions and converts ^ to ** for custom power calculations
function evalExpression(expr) {
    const sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**");

    return Function('"use strict"; return (' + sanitized + ')')();
}

function calculate() {
    try {
        display.value = String(evalExpression(display.value));
    } catch {
        display.value = "Error";
    }
}

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
        display.value = display.value.slice(0, -1) || "0";
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