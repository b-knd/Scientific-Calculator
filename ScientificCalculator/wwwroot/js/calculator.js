document.addEventListener('DOMContentLoaded', function () {
    //all the important variables used in the script
    const buttons = document.querySelectorAll('.buttons button');
    const inputDis = document.getElementById('output');
    let previousAns = '';
    let memoryStack = 0;
    let intermediateResult = 0;
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
    const alphaButton = document.getElementById('alphaButton');
    let isAlpha = false;
    const mathPro = math.create();

    //INITIALISATIONS for the scientific calculator

    //prepare the history container by retrieving histories from local storage
    if (localStorage.getItem(STORAGE_NAME) == null) {
        localStorage.setItem(STORAGE_NAME, JSON.stringify([]));
    }

    // Set the default angle mode to radians
    let selectedAngleMode = 'radians';
    updateAngleModeStyles();

    // Set the default result mode to decimal
    let selectedFracDec = 'dec';
    updateFrac();

    // Set the default numberSystem mode to basic maths and base-10
    let selectedNumSys = 'dec';
    let selectedMode = 'math';
    updateNumSys();
    changeButtonsStyle(mathButton, baseButton, 'teal', 'white');
    

    // EVENT LISTENERS for event handlings

    radButton.addEventListener('click', function () {
        selectedAngleMode = 'radians';
        updateAngleModeStyles();
    });

    alphaButton.addEventListener('click', function () {
        if (isAlpha) {
            isAlpha = false;
        } else {
            isAlpha = true;
        }
    });

    degButton.addEventListener('click', function () {
        selectedAngleMode = 'degrees';
        updateAngleModeStyles();
    });

    fracButton.addEventListener('click', function () {
        selectedFracDec = 'frac';
        updateFrac();
        if (inputEl.value !== "") {
            inputEl.value = formatExpressionForDisplay(mathPro.simplify(inputEl.value).toString());
        }
    });

    deciButton.addEventListener('click', function () {
        selectedFracDec = 'dec';
        updateFrac();
        inputEl.value = formatExpressionForDisplay(eval(inputEl.value).toString());
    });

    binButton.addEventListener('click', function () {
        selectedNumSys = 'bin';
        clearInputs();
        updateNumSys();
    });

    decButton.addEventListener('click', function () {
        selectedNumSys = 'dec';
        updateNumSys();
    });

    hexButton.addEventListener('click', function () {
        selectedNumSys = 'hex';
        clearInputs();
        updateNumSys();
    });

    octButton.addEventListener('click', function () {
        selectedNumSys = 'oct';
        clearInputs();
        updateNumSys();
    });

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

  
    //the main part of the code will be handling all the main buttons
    for (let button of buttons) {
        //we handle event only if buttons are not disabled
        if (!button.disabled) { 
            button.addEventListener('pointerdown', function () {
                const symbol = button.innerText.replace(/\s/g, '');
                console.log(button);

                if (isAlpha && button.hasAttribute('data-value')) {
                    var dataValue = button.getAttribute('data-value');
                    isAlpha = false;
                    insertAtCaret(inputEl, dataValue.charAt(0));
                    evaluateIntermediate();
                } else {
                    if (symbol === '=') {
                        evaluateExpression();
                    } else if (symbol === 'CLR') {
                        clearInputs();
                    } else if (symbol === 'y M+') {
                        memoryIn(intermediateResult);
                    } else if (symbol === 'z M-') {
                        memoryOut(intermediateResult);
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
                            recallFromMemory();
                        } else if (symbol === 'AND') {
                            insertAtCaret(inputEl, '&');
                        } else if (symbol === 'OR') {
                            insertAtCaret(inputEl, '|');
                        } else if (symbol === 'XOR') {
                            insertAtCaret(inputEl, '^');
                        } else if (symbol === 'NOT') {
                            insertAtCaret(inputEl, '~');
                        } else if (symbol === 'm sin' || symbol === 'ncos' || symbol === 'otan'
                            || symbol === 'plog' || symbol === 'qln' || symbol === 'fabs'
                            || symbol === 'ssinh' || symbol === 'utanh' || symbol === 'tcosh') {
                            insertAtCaret(inputEl, `${symbol.substring(1)}(`);
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
                        } else if (symbol === 'kx-1') {
                            insertAtCaret(inputEl, '^(-1)');
                        } else if (symbol === 'rex') {
                            insertAtCaret(inputEl, 'e^');
                        } else if (symbol === 'bnPr') {
                            insertAtCaret(inputEl, 'P');
                        } else if (symbol === 'cnCr') {
                            insertAtCaret(inputEl, 'C');
                        } else if (symbol === 'd%') {
                            insertAtCaret(inputEl, '%');
                        } else {
                            insertAtCaret(inputEl, symbol);
                        }
                        evaluateIntermediate();
                    }
                }
            });
        }
    }

    function formatExpressionForDisplay(expression) {
        let formattedExpression = expression.replace(/\s/g, '');

        if (selectedMode != 'math') {
            formattedExpression = expression.replace(/\|/g, ' OR ')
                .replace(/\&/g, ' AND ')
                .replace(/~([0-9A-Z]+)/g, 'NOT($1)')
                .replace(/\^/g, (' XOR '));
        }

        formattedExpression = formattedExpression.replace(/(\S+)([=])/g, '$1 $2 ');
        formattedExpression = formattedExpression.replace(/sqrt()/g, '√');
        formattedExpression = formattedExpression.replace(/cbrt()/g, '∛');
        formattedExpression = formattedExpression.replace(/derivative\(\'(\S+)\',\s*\'([a-zA-Z])\'\)/g, 'd($1)/d$2');

        if (selectedAngleMode === 'degrees') {
            // If in degrees mode, add the degree symbol to numbers in trigonometric functions
            formattedExpression = formattedExpression.replace(/\b(sin|cos|tan|atan|acos|asin)\((\d+)\)/g, (match, func, number) => `${func}(${number}°)`);
        }

        return formattedExpression;
    }

    function formatExpressionForEvaluation(expression) {
        formattedExpression = expression.replace(/log/g, 'log10').replace(/ln/g, 'log')
            .replace(/π/g, 'pi').replace(/(\d+)%/g, '($1/100)');

        if (selectedAngleMode === 'degrees') {
            // If in degrees mode, convert numbers in trigonometric functions to radians
            formattedExpression = formattedExpression.replace(/\b(sin|cos|tan|atan|acos|asin)\((.*?)\)/g,
                (match, func, content) => `${func}(${content} * pi / 180)`);
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
            intermediateResult = parseInt(result);

            // Update the inputDis field with the formatted expression using MathJax
            inputDis.value = formatExpressionForDisplay(expression + ' = ' + result);

        } catch (error) {
            try {
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
                intermediateResult = parseInt(result);
            } catch (error) {
                inputDis.value = formatExpressionForDisplay(inputEl.value);
            }
        }
    }

    // Function to actually evaluate the expression
    function evaluateExp(expression) {
        // If we are in a different base system
        if (selectedMode !== 'math') {
            const numberRegex = /\b\d+\b/g;
            let base = 10;
            if (selectedNumSys === 'bin') {
                base = 2;
            } else if (selectedNumSys === 'hex') {
                base = 16;
            } else if(selectedNumSys === 'oct') {
                base = 8;
            }
            expression = simplifyBitwiseOperations(expression, base);
            let converted;
            if (base === 2 || base === 8) {
                converted = expression.replace(numberRegex, match => parseInt(match, base));
            } else {
                converted = expression.replace(/\b[0-9A-F]+\b/g, match => parseInt(match, base));
            }
            const result = decimalToBase(mathPro.evaluate(converted), base).toUpperCase();
            return result;
        } else {
            // Regular expression to match permutation/combination expressions like '7P6' or '7C3'
            const permCombRegex = /(\d+)([PC])(\d+)/g;

            // Replace permutation/combination expressions with their evaluated results

            expression = expression.replace(/pi/, function (match, x) {
                return mathPro.evaluate('pi');
            });

            expression = expression.replace(/\be\b/g, function (match, x) {
                return mathPro.evaluate('e');
            });

            expression = expression.replace(permCombRegex, function (match, n, operation, m) {
                if (operation === 'P') {
                    // Permutation: nPm = n! / (n-m)!
                    return mathPro.evaluate(`factorial(${n}) / factorial(${n} - ${m})`).toString();
                } else if (operation === 'C') {
                    // Combination: nCm = n! / (m! * (n-m)!)
                    return mathPro.evaluate(`factorial(${n}) / (factorial(${m}) * factorial(${n} - ${m}))`).toString();
                }
            });

            // Regular expression to match derivative expressions like 'derivative('expression', 'variable')'
            const derivativeRegex = /derivative\('([^']+)',\s*'([^']+)'\)/g;
            // Replace derivative expressions with their evaluated results
            expression = expression.replace(derivativeRegex, function (match, baseExpression, variable) {
                const derivativeResult = mathPro.derivative(baseExpression, variable);
                return derivativeResult.toString();
            });

            // Evaluate the final expression after replacing permutation/combination and derivative expressions
            
            const result = mathPro.simplify(expression).toString();
            const containsVariables = /[a-zA-Z]/.test(result);


            if (selectedFracDec === 'dec' && !containsVariables) {
                return mathPro.evaluate(result).toString();
            }
            return result;
        }
    }

    // Function to be called when '=' is clicked on
    // Basically, evaluate the input and show the result as output
    function evaluateExpression() {
        try {
            if (inputEl.value === '') {
                clearInputs()
            } else {
                // Replace 'x' with '*' before evaluation
                const expression = inputEl.value;
                const result = evaluateExp(formatExpressionForEvaluation(expression));

                // Update the inputDis field with the formatted expression using Mathjax
                saveToHistory(inputEl.value, result);
                refreshHistory();
                inputDis.value = formatExpressionForDisplay(expression + ' = ' + result);
                inputEl.value = formatExpressionForDisplay(result);
                previousAns = formatExpressionForDisplay(result);
            }
        } catch (error) {
            try {
                // Try to add a closing bracket behind, if we can evaluate the expression, return result
                // Otherwise, return as 'Syntax Error'
                const expression = inputEl.value;
                const trial = expression + ')';
                const result = evaluateExp(formatExpressionForEvaluation(trial));
                saveToHistory(trial, result);
                refreshHistory();
                inputDis.value = formatExpressionForDisplay(trial + ' = ' + result);
                inputEl.value = formatExpressionForDisplay(result);
                previousAns = formatExpressionForDisplay(result);
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

    function insertAtCaret(textarea, value) {
        const startPos = textarea.selectionStart;
        const endPos = textarea.selectionEnd;

        textarea.value = textarea.value.substring(0, startPos) + value + textarea.value.substring(endPos, textarea.value.length);
        textarea.selectionStart = startPos + value.length;
        textarea.selectionEnd = startPos + value.length;
        textarea.focus();
    }


    function simplifyBitwiseOperations(expression, base) {
        console.log("base", base);
        // Replace spaces and convert to uppercase for consistency
        expression = expression.replace(/\s/g, '').toUpperCase();

        // Process NOT operations
        
        if (base == 10) {
            expression = expression.replace(/~([0-9]+)/g, (_, group) =>
                ~group.toString());
        } else {
            expression = expression.replace(/~([0-9A-F]+)/g, (_, group) =>
                ((~parseInt(group, base)) >>> 0).toString(base));
        }

        // Process AND operations
        expression = expression.replace(/([0-9A-F]+)&([0-9A-F]+)/g, (_, group1, group2) =>
            (parseInt(group1, base) & parseInt(group2, base)).toString(base));

        // Process XOR operations
        expression = expression.replace(/([0-9A-F]+)\^([0-9A-F]+)/g, (_, group1, group2) =>
            (parseInt(group1, base) ^ parseInt(group2, base)).toString(base));

        // Process OR operations
        expression = expression.replace(/([0-9A-F]+)\|([0-9A-F]+)/g, (_, group1, group2) =>
            (parseInt(group1, base) | parseInt(group2, base)).toString(base));

        return expression;
    }

    // Custom XOR function
    function xor(a, b) {
        return (a ^ b); // Ensure it's a 32-bit unsigned integer
    }


    function clearInputs() {
        inputEl.value = '';
        inputDis.value = '';
    }

    function recallFromMemory() {
        inputDis.value += memoryStack;
        insertAtCaret(inputEl, memoryStack);
    }

    function memoryIn(intermediateResult) {
        memoryStack += intermediateResult;
    }

    function memoryOut(intermediateResult) {
        memoryStack -= intermediateResult;
    }
});