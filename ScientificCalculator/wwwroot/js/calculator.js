document.addEventListener('DOMContentLoaded', function () {
    // Constant variables to store all the elements
    const buttons = document.querySelectorAll('.buttons button');
    const inputDis = document.getElementById('output');
    let previousAns = '';
    const inputEl = document.getElementById('input');
    const historyContainer = document.querySelector('.historyContainer');

    const STORAGE_NAME = 'history_v4';

    if (localStorage.getItem(STORAGE_NAME) == null) {
        localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
    }

    const radButton = document.getElementById('radButton');
    const degButton = document.getElementById('degButton');

    // Set the default angle mode to radians
    let selectedAngleMode = 'radians';
    updateAngleModeStyles();

    // Function to update the angle mode styles based on the selected mode
    function updateAngleModeStyles() {
        if (selectedAngleMode === 'radians') {
            changeButtonsStyle(radButton, degButton);
        } else {
            // Assume the default is degrees
            changeButtonStyle(degButton, radButton);
        }
    }

    // Event listener for the radian button
    radButton.addEventListener('click', function () {
        selectedAngleMode = 'radians';
        updateAngleModeStyles();
        // Handle other actions as needed
    });

    // Event listener for the degree button
    degButton.addEventListener('click', function () {
        selectedAngleMode = 'degrees';
        updateAngleModeStyles();
        // Handle other actions as needed
    });

    function changeButtonsStyle(button1, button2) {
        button1.style.backgroundColor = 'linen';
        button1.style.color = 'darkslategray';
        button2.style.backgroundColor = ''; // Reset to default background color
        button2.style.color = ''; // Reset to default text color
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
                inputEl.value = '';
            } else if (symbol === 'Ans') {
                inputEl.value += previousAns;
            }else if (symbol === 'S⇔D') {

            } else {
                if (inputEl.value === 'Syntax Error') {
                    inputEl.value = '';
                }
                if (symbol === 'DEL') {
                    //inputDis.value = inputDis.value.slice(0, -1);
                    inputEl.value = inputEl.value.slice(0, -1);
                } else if (symbol === 'sin' || symbol === 'cos' || symbol === 'tan' || symbol === 'log' || symbol === 'ln'
                    || symbol === 'sinh' || symbol === 'tanh' || symbol === 'cosh' || symbol === 'abs') {
                    inputEl.value += `${symbol}(`;
                } else if (symbol === 'sin-1') {
                    inputEl.value += 'asin(';
                } else if (symbol === 'cos-1') {
                    inputEl.value += 'acos(';
                } else if (symbol === 'tan-1') {
                    inputEl.value += 'atan(';
                } else if (symbol === 'x') {
                    inputEl.value += '*';
                } else if (symbol === '÷') {
                    inputEl.value += '/';
                } else if (symbol === 'x!') {
                    inputEl.value += '!';
                } else if (symbol === '(-)') {
                    inputEl.value += '-';
                } else if (symbol === '√x') {
                    inputEl.value += 'sqrt(';
                } else if (symbol === '∛x') {
                    inputEl.value += 'cbrt(';
                } else if (symbol === 'x2') {
                    inputEl.value += '^2';
                } else if (symbol === 'xY') {
                    inputEl.value += '^(';
                } else if (symbol === 'ex') {
                    inputEl.value += 'e^';
                } else if (symbol === 'x-1') {
                    inputEl.value += '^(-1)';
                } else if (symbol === 'nPr') {
                    inputEl.value += 'P';
                } else if (symbol === 'nCr') {
                    inputEl.value += 'C';
                } else {
                    inputEl.value += symbol;
                }
                evaluateIntermediate();
            }
        });
    }

    function formatExpressionForDisplay(expression) {
        let formattedExpression = expression;

        // Add space between operators
        formattedExpression = formattedExpression.replace(/(\d+|\)|π|!|%)([+\-*/])/g, '$1 $2 ');
        // Replace '*' with 'x'
        formattedExpression = formattedExpression.replace(/\*/g, 'x');
        // Replace '/' with '÷'
        formattedExpression = formattedExpression.replace(/\//g, '÷');
        // Replace 'sqrt' with '√'
        formattedExpression = formattedExpression.replace(/sqrt()/g, '√');
        // Replace 'cbrt' with '∛'
        formattedExpression = formattedExpression.replace(/cbrt()/g, '∛');

        if (selectedAngleMode === 'degrees') {
            // If in degrees mode, add the degree symbol to numbers in trigonometric functions
            formattedExpression = formattedExpression.replace(/\b(sin|cos|tan|atan|acos|asin)\((\d+)\)/g, (match, func, number) => `${func}(${number}°)`);
        }

        return formattedExpression;
    }

    function formatExpressionForEvaluation(expression) {
        formattedExpression = expression.replace(/log/g, 'log10').replace(/ln/g, 'log').replace(/π/g, 'pi').replace(/(\d+)%/g, '($1/100)');

        if (selectedAngleMode === 'degrees') {
            // If in degrees mode, convert numbers in trigonometric functions to radians
            formattedExpression = formattedExpression.replace(/\b(sin|cos|tan|atan|acos|asin)\((.*?)\)/g, (match, func, content) => `${func}(${content} * pi / 180)`);
        }

        return formattedExpression;
    }



    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    // Function to be called when a button is clicked (except '=')
    function evaluateIntermediate() {
        try {
            // Replace 'x' with '*' before evaluation
            const expression = inputEl.value;
            console.log("expression:", formatExpressionForEvaluation(expression));
            const result = evaluateExp(formatExpressionForEvaluation(expression));
            console.log('Intermediate Result:', result); // Add this line for debugging

            // Update the inputDis field with the formatted expression using MathJax
            inputDis.value = formatExpressionForDisplay(expression + ' = ' + result);
        } catch (error) {
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
            } catch (error) {
                inputDis.value = formatExpressionForDisplay(inputEl.value);
            }
        }
    }

    function evaluateExp(expression) {
        const match = expression.match(/(\d+)([PC])(\d+)/);

        if (!match) {
            // If the expression doesn't match the pattern, use the regular math.evaluate
            return mathPro.evaluate(expression);
        }

        const n = parseInt(match[1]);
        const operation = match[2];
        const m = parseInt(match[3]);

        if (operation === 'P') {
            // Permutation: nPm = n! / (n-m)!
            return mathPro.evaluate(`factorial(${n}) / factorial(${n} - ${m})`);
        } else if (operation === 'C') {
            // Combination: nCm = n! / (m! * (n-m)!)
            return mathPro.evaluate(`factorial(${n}) / (factorial(${m}) * factorial(${n} - ${m}))`);
        } else {
            return Error;
        }
    }

   
    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    function evaluateExpression() {
        try {
            // Replace 'x' with '*' before evaluation
            const expression = inputEl.value;
            console.log("expression:", expression);
            const result = evaluateExp(formatExpressionForEvaluation(expression));
            console.log('Intermediate Result:', result); // Add this line for debugging

            // Update the inputDis field with the formatted expression using Mathjax
            console.log('formatted', formatExpressionForDisplay(expression + ' = ' + result));
            saveToHistory(inputEl.value, result);
            refreshHistory();
            inputDis.value = formatExpressionForDisplay(expression + ' = ' + result);
            inputEl.value = result;
            previousAns = result;
        } catch (error) {
            console.log(error);
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                saveToHistory(trial, result);
                refreshHistory();
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
                inputEl.value = result;
                previousAns = result;
            } catch (error) {
                console.log(error);
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