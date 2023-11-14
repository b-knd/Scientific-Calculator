document.addEventListener('DOMContentLoaded', function () {
    // Constant variables to store all the elements
    const buttons = document.querySelectorAll('.buttons button');
    const inputDis = document.getElementById('output');
    //let inputEl.value = ''
    const inputEl = document.getElementById('input');
    const historyContainer = document.querySelector('.historyContainer');

    const STORAGE_NAME = 'history_v4';

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
            } else if (symbol === 'CLR') {
                inputDis.value = '';
                //inputEl.value = '';
                inputEl.value = '';
            } else {
                if (symbol === 'DEL') {
                    //inputDis.value = inputDis.value.slice(0, -1);
                    inputEl.value = inputEl.value.slice(0, -1);
                } else if (symbol === 'sin' || symbol === 'cos' || symbol === 'tan' || symbol === 'log' || symbol === 'ln') {
                    //inputDis.value += `${symbol}(`;
                    inputEl.value += `${symbol}(`;
                } else if (symbol === 'x!') {
                    //inputDis.value += '!';
                    inputEl.value += '!';
                } else if (symbol === '(-)') {
                    //inputDis.value += '-';
                    inputEl.value += '-';
                } else if (symbol === '√x') {
                    //inputDis.value += '√(';
                    inputEl.value += 'sqrt(';
                } else if (symbol === 'x2') {
                    //inputDis.value += '^2';
                    inputEl.value += '^2';
                } else if (symbol === 'xY') {
                    //inputDis.value += '^(';
                    inputEl.value += '^(';
                } else if (symbol === 'x-1') {
                    //inputDis.value += '^(';
                    inputEl.value += '^(-1)';
                } else if (['+', '-', '×', '÷'].includes(symbol)) {
                    // Add space before and after the operator
                    inputEl.value += ` ${symbol} `;
                } else {
                    //inputDis.value += symbol;
                    inputEl.value += symbol;
                    console.log("number clicked:", symbol);
                }
                console.log("calling intermediate function");
                evaluateIntermediate();
            }
        });
    }



    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    // Function to be called when a button is clicked (except '=')
    function evaluateIntermediate() {
        try {
            // Replace 'x' with '*' before evaluation
            const expression = inputEl.value;
            console.log("expression:", expression);
            const result = mathPro.evaluate(expression);
            console.log('Intermediate Result:', result); // Add this line for debugging

            // Update the inputDis field with the formatted expression using MathJax
            inputDis.value = expression + ' = ' + result;
        } catch (error) {
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = mathPro.evaluate(trial);
                inputDis.value = trial + ' = ' + result;
            } catch (error) {
                inputDis.value = inputEl.value;
            }
        }
    }

    // Function to update inputDis with MathJax typesetting
    function updateInputDisplayed(content) {
        const inputDis = document.getElementById('input');
        inputDis.textContent = content;
    }

   
    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    function evaluateExpression() {
        try {
            // Replace 'x' with '*' before evaluation
            const expression = inputEl.value;
            console.log("expression:", expression);
            const result = mathPro.evaluate(expression);
            console.log('Intermediate Result:', result); // Add this line for debugging

            // Update the inputDis field with the formatted expression using MathJax
            inputDis.value = expression + ' = ' + result;
            saveToHistory(inputEl.value, result);
            refreshHistory();
        } catch (error) {
            try {
                const trial = expression + ')';
                const result = mathPro.evaluate(expression);
                inputDis.value = trial + ' = ' + result;
            } catch (error) {
                inputDis.value = '';
                inputEl.value = 'Syntax Error';
            }
        }
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
