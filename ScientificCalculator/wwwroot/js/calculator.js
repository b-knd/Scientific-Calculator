document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.buttons button');
    const inputDis = document.getElementById('output');
    let previousAns = '';
    let memoryStack = 0;
    let intermediateResult = '';
    const inputEl = document.getElementById('input');
    const historyContainer = document.querySelector('.historyContainer');
    const STORAGE_NAME = 'history_v4';
    const radButton = document.getElementById('radButton');
    const degButton = document.getElementById('degButton');
    const fracButton = document.getElementById('fracButton');
    const deciButton = document.getElementById('deciButton');
    const binButton = document.getElementById('binButton');
    const octButton = document.getElementById('octButton');
    const hexButton = document.getElementById('hexButton');
    const decButton = document.getElementById('decButton');
    const mathButton = document.getElementById('mathButton');
    const baseButton = document.getElementById('baseButton');
    const numSysButtons = document.querySelectorAll('.numSys button');
    const mathPro = math.create();


    if (localStorage.getItem(STORAGE_NAME) == null) {
        localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
    }

    // Set the default angle mode to radians
    let selectedAngleMode = 'radians';
    updateAngleModeStyles();

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


    // Set the default angle mode to radians
    let selectedFracDec = 'dec';
    updateFrac();

    

    // Event listener for the radian button
    fracButton.addEventListener('click', function () {
        selectedFracDec = 'frac';
        updateFrac();
        inputEl.value = formatExpressionForDisplay(mathPro.simplify(inputEl.value).toString());
    });

    // Event listener for the degree button
    deciButton.addEventListener('click', function () {
        selectedFracDec = 'dec';
        updateFrac();
        inputEl.value = formatExpressionForDisplay(eval(inputEl.value).toString());
    });

    // Set the default angle mode to radians
    let selectedNumSys = 'dec';
    let selectedMode = 'math';
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

    

    changeButtonsStyle(mathButton, baseButton, 'teal', 'white');
    numSysButtons.forEach(button => {
        button.disabled = true;
        button.style.color = 'gray';
    });

    mathButton.addEventListener('click', function () {
        selectedNumSys = 'dec';
        selectedMode = 'math';
        updateNumSys();
        numSysButtons.forEach(button => {
            button.disabled = true;
            button.style.color = 'gray';
        });
        changeButtonsStyle(mathButton, baseButton, 'teal', 'white');
    });

    baseButton.addEventListener('click', function () {
        selectedNumSys = 'dec';
        selectedMode = 'base';
        updateNumSys();
        numSysButtons.forEach(button => {
            button.disabled = false;
            button.style.color = '';
        });
        updateNumSys();
        changeButtonsStyle(baseButton, mathButton, 'teal', 'white');
    });

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
        if(!button.isD)
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
                    const startPos = inputEl.selectionStart;
                    const endPos = inputEl.selectionEnd;

                    if (startPos === endPos) {
                        // If no text is selected, delete the character to the left of the caret
                        inputEl.value = inputEl.value.substring(0, startPos - 1) + inputEl.value.substring(endPos, inputEl.value.length);
                        inputEl.selectionStart = startPos - 1;
                        inputEl.selectionEnd = startPos - 1;
                    } else {
                        // If text is selected, delete the selected text
                        inputEl.value = inputEl.value.substring(0, startPos) + inputEl.value.substring(endPos, inputEl.value.length);
                        inputEl.selectionStart = startPos;
                        inputEl.selectionEnd = startPos;
                    }
                } else if (symbol === 'Ans') {
                    insertAtCaret(inputEl, previousAns);
                } else if (symbol === 'MR') {
                    inputDis.value += memoryStack;
                    insertAtCaret(inputEl, memoryStack);
                } else if (symbol === 'AND') {
                    insertAtCaret(inputEl, '&');
                } else if (symbol === 'OR') {
                    insertAtCaret(inputEl, '|');
                } else if (symbol === 'XOR') {
                    insertAtCaret(inputEl, '^');
                } else if (symbol === 'NOT') {
                    insertAtCaret(inputEl, '~');
                } else if (symbol === 'msin' || symbol === 'ncos' || symbol === 'otan' || symbol === 'plog' || symbol === 'qln'
                    || symbol === 'ssinh' || symbol === 'utanh' || symbol === 'tcosh' || symbol === 'fabs') {
                    insertAtCaret(inputEl, `${symbol}(`);
                } else if (symbol === 'vsin-1') {
                    insertAtCaret(inputEl, 'asin(');
                } else if (symbol === 'wcos-1') {
                    insertAtCaret(inputEl, 'acos(')
                } else if (symbol === 'xtan-1') {
                    insertAtCaret(inputEl, 'atan(')
                } else if (symbol === 'ldy/dx') {
                    insertAtCaret(inputEl, 'derivative(\'\', \'x\')');
                } else if (symbol === 'x') {
                    insertAtCaret(inputEl, '*');
                } else if (symbol === '÷') {
                    insertAtCaret(inputEl, '/');
                } else if (symbol === 'ax!') {
                    insertAtCaret(inputEl, '!');
                } else if (symbol === 'e(-)') {
                    insertAtCaret(inputEl, '-');
                } else if (symbol === 'g√x') {
                    insertAtCaret(inputEl, 'sqrt(');
                } else if (symbol === 'h∛x') {
                    insertAtCaret(inputEl, 'cbrt(');
                } else if (symbol === 'ix2') {
                    insertAtCaret(inputEl, '^2');
                } else if (symbol === 'jxY') {
                    insertAtCaret(inputEl, '^(');
                } else if (symbol === 'rex') {
                    insertAtCaret(inputEl, 'e^');
                } else if (symbol === 'kx-1') {
                    insertAtCaret(inputEl, '^(-1)');
                } else if (symbol === 'bnPr') {
                    insertAtCaret(inputEl, 'P');
                } else if (symbol === 'cnCr') {
                    insertAtCaret(inputEl, 'C');
                } else if (symbol === 'yM+') {
                    memoryStack += intermediateResult;
                } else if (symbol === 'zM-') {
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
        formattedExpression = formattedExpression.replace(/derivative\(\'(\S+)\',\s*\'([a-zA-Z])\'\)/g, 'd($1)/d$2');

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
        if (selectedNumSys != 'dec') {
            const numberRegex = /\b\d+\b/g;
            base = 10;
            if (selectedNumSys === 'bin') {
                base = 2;
            } else if (selectedNumSys === 'hex') {
                base = 16;
            } else {
                base = 8;
            }
            if (base === 2 || base === 8){
                converted = expression.replace(numberRegex, match => parseInt(match, base));
            } else {
                converted = expression.replace(/\b[0-9A-F]+\b/g, match => parseInt(match, base));
            }
            console.log("Converted: ", converted);
            console.log("Evaluate: ", mathPro.evaluate(converted));
            result = decimalToBase(mathPro.evaluate(converted), base).toUpperCase();
            return result;
        } else {
            const match = expression.match(/(\d+)([PC])(\d+)/);
            if (!match) {
                if (expression.match(/(\d+)([PC])/) || expression.match(/([PC])/)) {
                    throw Error;
                }
                simplifiedExpression = mathPro.simplify(expression).toString();
                if (selectedFracDec === 'dec') {
                    return eval(simplifiedExpression).toString();
                } else {
                    return simplifiedExpression;
                }
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

    function changeButtonsStyle(button1, button2, bgColor, fontColor) {
        button1.style.backgroundColor = bgColor;
        button1.style.color = fontColor;
        button2.style.backgroundColor = ''; // Reset to default background color
        button2.style.color = ''; // Reset to default text color
    }

    // Function to update the angle mode styles based on the selected mode
    function updateAngleModeStyles() {
        if (selectedAngleMode === 'radians') {
            changeButtonsStyle(radButton, degButton, 'teal', 'white');
        } else {
            changeButtonsStyle(degButton, radButton, 'teal', 'white');
        }
    }

    // Function to update the angle mode styles based on the selected mode
    function updateFrac() {
        if (selectedFracDec === 'frac') {
            changeButtonsStyle(fracButton, deciButton, 'teal', 'white');
        } else {
            // Assume the default is degrees
            changeButtonsStyle(deciButton, fracButton, 'teal', 'white');
        }
    }

    // Function to update the angle mode styles based on the selected mode
    function updateNumSys() {
        // Add a click event listener to the hex button
        const allButtons = document.querySelectorAll('.buttons button');
        const baseButtons = document.querySelectorAll('.base');
        allButtons.forEach(button => {
            button.disabled = true;
            button.style.color = 'gray';
        });
        const basicButtons = document.querySelectorAll('.basic');
        basicButtons.forEach(button => {
            button.disabled = false;
            button.style.color = '';
        })
        if (selectedNumSys === 'dec' ) {
            styleNumSysButtons(decButton, octButton, hexButton, binButton);
            
            if (selectedMode === 'math') {
                allButtons.forEach(button => {
                    button.disabled = false;
                    button.style.color = '';
                });
                baseButtons.forEach(button => {
                    button.disabled = true;
                    button.style.color = 'gray';
                })
            } else {
                const decButtons = document.querySelectorAll('.dec');
                decButtons.forEach(button => {
                    button.disabled = false;
                    button.style.color = '';
                })
            }
        } else {
            if (selectedNumSys === 'bin') {
                styleNumSysButtons(binButton, octButton, hexButton, decButton);
                const binButtons = document.querySelectorAll('.bin');
                console.log(binButtons.length);
                binButtons.forEach(button => {
                    button.disabled = false;
                    button.style.color = '';
                })
            } else if (selectedNumSys === 'oct') {
                styleNumSysButtons(octButton, decButton, hexButton, binButton);
                const octButtons = document.querySelectorAll('.octal');
                octButtons.forEach(button => {
                    button.disabled = false;
                    button.style.color = '';
                })
            } else {
                styleNumSysButtons(hexButton, octButton, decButton, binButton);
                const hexButtons = document.querySelectorAll('.hexa');
                hexButtons.forEach(button => {
                    button.disabled = false;
                    button.style.color = '';
                })
            }
        }
    }

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

    function decimalToBase(decimalNumber, base) {
        let integerPart = Math.floor(decimalNumber);
        let fractionalPart = decimalNumber - integerPart;

        let integerResult = integerPart.toString(base);
        let fractionalResult = '';
        while (fractionalPart !== 0){
            fractionalPart *= base;
            let digit = Math.floor(fractionalPart);
            if (digit < 10) {
                fractionalResult += digit.toString(base);
            } else {
                fractionalResult += String.fromCharCode('A'.charCodeAt(0) + digit - 10);
            }
            fractionalPart -= digit;
        }

        let result = integerResult.toUpperCase();
        if (fractionalResult != '') {
            result += '.' + fractionalResult.toUpperCase();
        }

        return result;
    }
});