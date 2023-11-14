document.addEventListener('DOMContentLoaded', function () {
    // Constant variables to store all the elements
    const buttons = document.querySelectorAll('.buttons button');
    const inputEl = document.getElementById('input');
    const outputEl = document.getElementById('output');
    const historyContainer = document.querySelector('.historyContainer');

    const STORAGE_NAME = 'history_v4';

    localStorage.clear();

    if (localStorage.getItem(STORAGE_NAME) == null) {
        localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
    }

    // Create a math.js instance
    const mathPro = math.create();

    refreshHistory();

    for (let button of buttons) {
        // Add listener to function buttons
        button.addEventListener('pointerdown', function () {
            const symbol = button.innerText;

            if (symbol === '=') {
                evaluateExpression();
            } else if (symbol === 'DEL') {
                inputEl.value = inputEl.value.slice(0, -1);
            } else if (symbol === 'CLR') {
                inputEl.value = '';
                outputEl.value = '';
            } else {
                inputEl.value += symbol;
            }
        });
    }

    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    function evaluateExpression() {
        try {
            // Replace 'x' with '*' before evaluation
            const expression = preprocessInput(inputEl.value);
            const result = mathPro.evaluate(expression);
            outputEl.value = result;
            saveToHistory(inputEl.value, result);
            refreshHistory();
        } catch (error) {
            outputEl.value = 'Syntax Error';
        }
    }

    function preprocessInput(input) {
        // Replace 'x' with '*' and '÷' with '/'
        let processedInput = input.replace(/x/g, '*').replace(/÷/g, '/');

        // Add brackets around numerical values after sin, cos, tan, log, and ln
        processedInput = processedInput.replace(/(sin|cos|tan|log|ln)(\d+)/gi, '$1($2)');

        return processedInput;
    }


    // When an output is evaluated, save expression and output to history
    function saveToHistory(expression, result) {
        const historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];
        historyElements.push({ expression, result });
        localStorage.setItem(STORAGE_NAME, JSON.stringify(historyElements));
    }

    // Function to refresh history, limiting the number of history displayed as 9
    function refreshHistory() {
        const MAX_HISTORY_ITEMS = 9; // Set the maximum number of history items to display

        historyContainer.innerHTML = '';

        const historyElements = JSON.parse(localStorage.getItem(STORAGE_NAME)) || [];

        // Calculate the starting index to display based on the maximum history items
        const startIndex = Math.max(0, historyElements.length - MAX_HISTORY_ITEMS);

        for (let i = historyElements.length - 1; i >= startIndex; i--) {
            const div = document.createElement('div');
            div.className = 'historyItem';

            div.innerHTML = `
                <div>${truncate(historyElements[i].expression, 14)}</div>
                <div>${truncate(historyElements[i].result, 14)}</div>
            `;

            historyContainer.appendChild(div);

            div.addEventListener('pointerdown', function () {
                inputEl.value = historyElements[i].expression;
            });
        }
    }

    function truncate(str, maxLength) {
        return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
    }
});
