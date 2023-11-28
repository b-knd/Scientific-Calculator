document.addEventListener('DOMContentLoaded', function () {
    // Constant variables to store all the elements
    const buttons = document.querySelectorAll('.buttons button');
    const inputDis = document.getElementById('output');
    let previousAns = '';
    let memoryStack = 0;
    let intermediateResult = '';
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

    function changeButtonsStyle(button1, button2) {
        button1.style.backgroundColor = 'linen';
        button1.style.color = 'darkslategray';
        button2.style.backgroundColor = ''; // Reset to default background color
        button2.style.color = ''; // Reset to default text color
    }

    // Function to update the angle mode styles based on the selected mode
    function updateAngleModeStyles() {
        if (selectedAngleMode === 'radians') {
            changeButtonsStyle(radButton, degButton);
        } else {
            // Assume the default is degrees
            changeButtonsStyle(degButton, radButton);
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

    const fracButton = document.getElementById('fracButton');
    const deciButton = document.getElementById('deciButton');

    // Set the default angle mode to radians
    let selectedFracDec = 'dec';
    updateFrac();

    // Function to update the angle mode styles based on the selected mode
    function updateFrac() {
        if (selectedFracDec === 'frac') {
            changeButtonsStyle(fracButton, deciButton);
        } else {
            // Assume the default is degrees
            changeButtonsStyle(deciButton, fracButton);
        }
    }

    // Event listener for the radian button
    fracButton.addEventListener('click', function () {
        selectedFracDec = 'frac';
        updateFrac();
        // Handle other actions as needed
    });

    // Event listener for the degree button
    deciButton.addEventListener('click', function () {
        selectedFracDec = 'dec';
        updateFrac();
        // Handle other actions as needed
    });

    const binButton = document.getElementById('binButton');
    const octButton = document.getElementById('octButton');
    const hexButton = document.getElementById('hexButton');
    const decButton = document.getElementById('decButton');

    function styleNumSysButtons(button1, button2, button3, button4) {
        button1.style.backgroundColor = 'linen';
        button1.style.color = 'darkslategray';
        button2.style.backgroundColor = ''; // Reset to default background color
        button2.style.color = ''; // Reset to default text color
        button3.style.backgroundColor = ''; // Reset to default background color
        button3.style.color = ''; // Reset to default text color
        button4.style.backgroundColor = ''; // Reset to default background color
        button4.style.color = ''; // Reset to default text color
    }

    // Function to update the angle mode styles based on the selected mode
    function updateNumSys() {
        if (selectedNumSys === 'dec') {
            styleNumSysButtons(decButton, octButton, hexButton, binButton);
            for (let button of buttons) {
                button.disabled = false;
            }
        } else {
            //for (let button of buttons) {
            //    button.disabled = true;
            //}
            if (selectedNumSys === 'bin') {
                styleNumSysButtons(binButton, octButton, hexButton, decButton);
            } else if (selectedNumSys === 'oct') {
                styleNumSysButtons(octButton, decButton, hexButton, binButton);
            } else {
                styleNumSysButtons(hexButton, octButton, decButton, binButton);
            }
        }
    }

    // Set the default angle mode to radians
    let selectedNumSys = 'dec';
    updateNumSys();

    // Event listener for the radian button
    binButton.addEventListener('click', function () {
        selectedNumSys = 'bin';
        updateNumSys();
    });

    // Event listener for the degree button
    decButton.addEventListener('click', function () {
        selectedNumSys = 'dec';
        updateNumSys();
    });

    // Event listener for the degree button
    hexButton.addEventListener('click', function () {
        selectedNumSys = 'hex';
        updateNumSys();
    });

    // Event listener for the degree button
    octButton.addEventListener('click', function () {
        selectedNumSys = 'oct';
        updateNumSys();
    });


    // Create a math.js instance
    const mathPro = math.create();

    refreshHistory();

    function insertAtCaret(textarea, value) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;

        textarea.value = textarea.value.substring(0, startPos) + value + textarea.value.substring(endPos, textarea.value.length);
        textarea.selectionStart = startPos + value.length;
        textarea.selectionEnd = startPos + value.length;
        textarea.focus();
    }


    for (let button of buttons) {
        // Add listener to function buttons
        button.addEventListener('pointerdown', function () {
            const symbol = button.innerText;

            if (symbol === '=') {
                evaluateExpression();
            } else if (symbol === 'CLR') {
                inputDis.value = '';
                inputEl.value = '';
            } else if (symbol === 'S⇔D') {

            } else {
                if (inputEl.value === 'Syntax Error') {
                    inputEl.value = '';
                }
                if (symbol === 'DEL') {
                    const startPos = textarea.selectionStart;
                    const endPos = textarea.selectionEnd;

                    if (startPos === endPos) {
                        // If no text is selected, delete the character to the left of the caret
                        textarea.value = textarea.value.substring(0, startPos - 1) + textarea.value.substring(endPos, textarea.value.length);
                        textarea.selectionStart = startPos - 1;
                        textarea.selectionEnd = startPos - 1;
                    } else {
                        // If text is selected, delete the selected text
                        textarea.value = textarea.value.substring(0, startPos) + textarea.value.substring(endPos, textarea.value.length);
                        textarea.selectionStart = startPos;
                        textarea.selectionEnd = startPos;
                    }
                } else if (symbol === 'Ans') {
                    insertAtCaret(inputEl, previousAns);
                } else if (symbol === 'MR') {
                    inputDis.value += memoryStack;
                    insertAtCaret(inputEl, memoryStack);
                } else if (symbol === 'sin' || symbol === 'cos' || symbol === 'tan' || symbol === 'log' || symbol === 'ln'
                    || symbol === 'sinh' || symbol === 'tanh' || symbol === 'cosh' || symbol === 'abs') {
                    insertAtCaret(inputEl, `${symbol}(`);
                } else if (symbol === 'sin-1') {
                    insertAtCaret(inputEl, 'asin(');
                } else if (symbol === 'cos-1') {
                    insertAtCaret(inputEl, 'acos(')
                } else if (symbol === 'tan-1') {
                    insertAtCaret(inputEl, 'atan(')
                } else if (symbol === 'dy/dx') {
                    insertAtCaret(inputEl, 'derivative(\'\', \'x\')');
                } else if (symbol === 'x') {
                    insertAtCaret(inputEl, '*');
                } else if (symbol === '÷') {
                    insertAtCaret(inputEl, '/');
                } else if (symbol === 'x!') {
                    insertAtCaret(inputEl, '!');
                } else if (symbol === '(-)') {
                    insertAtCaret(inputEl, '-');
                } else if (symbol === '√x') {
                    insertAtCaret(inputEl, 'sqrt(');
                } else if (symbol === '∛x') {
                    insertAtCaret(inputEl, 'cbrt(');
                } else if (symbol === 'x2') {
                    insertAtCaret(inputEl, '^2');
                } else if (symbol === 'xY') {
                    insertAtCaret(inputEl, '^(');
                } else if (symbol === 'ex') {
                    insertAtCaret(inputEl, 'e^');
                } else if (symbol === 'x-1') {
                    insertAtCaret(inputEl, '^(-1)');
                } else if (symbol === 'nPr') {
                    insertAtCaret(inputEl, 'P');
                } else if (symbol === 'nCr') {
                    insertAtCaret(inputEl, 'C');
                } else if (symbol === 'M+') {
                    memoryStack += intermediateResult;
                } else if (symbol === 'M-') {
                    memoryStack -= intermediateResult;
                } else {
                    insertAtCaret(inputEl, symbol);
                }
                evaluateIntermediate();
            }
        });
    }

    function formatExpressionForDisplay(expression) {
        let formattedExpression = expression.replace(/\s/g, '');

        // Add space between operators
        formattedExpression = formattedExpression.replace(/(\S+)([=])/g, '$1 $2 ');
        // Replace 'sqrt' with '√'
        formattedExpression = formattedExpression.replace(/sqrt()/g, '√');
        // Replace 'cbrt' with '∛'
        formattedExpression = formattedExpression.replace(/cbrt()/g, '∛');
        formattedExpression = formattedExpression.replace(/derivative\(\'(\S+)\',\s*\'([a-z])\'\)/g, 'd($1)/d$2');

        console.log(formattedExpression);

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
            if (inputEl.value === '') {
                throw error;
            }
            // Replace 'x' with '*' before evaluation
            const expression = inputEl.value;
            console.log("expression:", formatExpressionForEvaluation(expression));
            const result = evaluateExp(formatExpressionForEvaluation(expression));
            console.log('Intermediate Result:', result); // Add this line for debugging
            intermediateResult = result;

            // Update the inputDis field with the formatted expression using MathJax
            inputDis.value = formatExpressionForDisplay(expression + ' = ' + result);

        } catch (error) {
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
                intermediateResult = result;
            } catch (error) {
                inputDis.value = formatExpressionForDisplay(inputEl.value);
            }
        }
    }

    function evaluateExp(expression) {
        const match = expression.match(/(\d+)([PC])(\d+)/);

        if (!match) {
            if (expression.match(/(\d+)([PC])/) || expression.match(/([PC])/)) {
                throw Error;
            }
            // If the expression doesn't match the pattern, use the regular math.evaluate
            return mathPro.simplify(expression).toString();
        }

        const n = parseInt(match[1]);
        const operation = match[2];
        const m = parseInt(match[3]);

        if (operation === 'P') {
            // Permutation: nPm = n! / (n-m)!
            return mathPro.simplify(`factorial(${n}) / factorial(${n} - ${m})`).toString();
        } else if (operation === 'C') {
            // Combination: nCm = n! / (m! * (n-m)!)
            return mathPro.simplify(`factorial(${n}) / (factorial(${m}) * factorial(${n} - ${m}))`).toString();
        } else {
            return Error;
        }
    }

   
    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    function evaluateExpression() {
        try {
            if (inputEl.value === '') {
                inputDis.value = '';
                inputEl.value = '';
            } else {
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
                inputEl.value = formatExpressionForDisplay(result);
                previousAns = formatExpressionForDisplay(result);
            }
        } catch (error) {
            console.log(error);
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                saveToHistory(trial, result);
                refreshHistory();
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
                inputEl.value = formatExpressionForDisplay(result);
                previousAns = formatExpressionForDisplay(result);
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
        const MAX_HISTORY_ITEMS = 10; // Set the maximum number of history items to display

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
        try {
            return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
        } catch (error) {
            console.log(error);
        }
    }
});