const buttons = document.querySelectorAll('.buttons button');
const inputEl = document.querySelector('input');
const output = document.querySelector('#output');
const historyContainer = document.querySelector('.historyContainer');

const STORAGE_NAME = 'history_v4';

if (localStorage.getItem(STORAGE_NAME) == null) {
    localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
}

refreshHistory();

function registrateChange() {
    let newValue = eval(inputEl.value) || ''

    output.value = newValue
}

for (let button of buttons) {
    button.addEventListener('pointerdown', () => {
        const symbol = button.innerHTML;

        if (symbol === '=') {
            const historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];
            if (!historyElements.includes(inputEl.value)) {
                historyElements.push(inputEl.value);
            }
            localStorage.setItem(STORAGE_NAME, JSON.stringify(historyElements));

            inputEl.value = output.value;
            refreshHistory();
        } else if (symbol === 'DEL') {
            inputEl.value = inputEl.value.slice(0, inputEl.value.length - 1);
        } else if (symbol === 'CLEAR') {
            inputEl.value = '';
        } else {
            inputEl.value += symbol;
        }

        registrateChange();
    });
}

function evaluateExpression() {
    try {
        const result = eval(inputEl.value);
        outputEl.value = result;
        saveToHistory(inputEl.value, result);
        refreshHistory();
    } catch (error) {
        outputEl.value = 'Syntax Error';
    }
}

function saveToHistory(expression, result) {
    const historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];
    historyElements.push({ expression, result });
    localStorage.setItem(STORAGE_NAME, JSON.stringify(historyElements));
}

function refreshHistory() {
    historyContainer.innerHTML = '';

    let historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];

    for (let i = historyElements.length - 1; i >= 0; i--) {
        const div = document.createElement('div');
        div.className = 'historyItem';

        let evaluated = '';

        try {
            evaluated = eval(historyElements[i]);
        } catch (error) {
            evaluated = 'INVALID RESULT';
        }

        div.innerHTML = `
            <div>${truncate(historyElements[i], 14)}</div>
            <div>${truncate(evaluated, 14)}</div>
        `;

        historyContainer.appendChild(div);

        div.addEventListener('pointerdown', () => {
            inputEl.value = historyElements[i];
            registrateChange();
        });
    }
}

function clearInputAndOutput() {
    inputEl.value = '';
    outputEl.value = '';
}

function truncate(str, maxLength) {
    return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
}

