// calculator.js

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.buttons button');
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const historyContainer = document.querySelector('.historyContainer');

    const STORAGE_NAME = 'history_v4';

    if (localStorage.getItem(STORAGE_NAME) == null) {
        localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
    }

    refreshHistory();

    for (let button of buttons) {
        button.addEventListener('click', function () {
            const symbol = button.innerText;

            if (symbol === '=') {
                evaluateExpression();
            } else if (symbol === 'DEL') {
                inputEl.value = inputEl.value.slice(0, -1);
            } else if (symbol === 'CLR') {
                inputEl.value = '';
            } else {
                inputEl.value += symbol;
            }
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

        const historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];

        for (let i = historyElements.length - 1; i >= 0; i--) {
            const div = document.createElement('div');
            div.className = 'historyItem';

            div.innerHTML = `
                <div>${truncate(historyElements[i].expression, 14)}</div>
                <div>${truncate(historyElements[i].result, 14)}</div>
            `;

            historyContainer.appendChild(div);

            div.addEventListener('click', function () {
                inputEl.value = historyElements[i].expression;
            });
        }
    }

    function truncate(str, maxLength) {
        return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
    }
});
