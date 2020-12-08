/* Custom Sitefinity MVC Form Validation with Client Side JavaScript v1.0 --- https://https://github.com/Superhands89/SitefinityClientSideFormValidationMVC
* Custom form validation for Sitefinity MVC forms using client side JavaScript
* (includes pattern validation and smooth scrolling to areas that fail validation on form submit)
*
* By Superhands89 2019 --- https://github.com/Superhands89/
*
* MIT Licence - Free and unrestricted use.
*/

~function () {
    'use strict';

    function runCustomSfFormValidation() {

        // add form-group class to sf-fieldWrp elements as the presence of sf-fieldWrp usually means there are no form-group elements
        const fieldGroupCollection = document.querySelectorAll('.sf-fieldWrp');
        if (fieldGroupCollection.length) {
            Array.prototype.forEach.call(fieldGroupCollection, function (e) {
                if (!e.classList.contains('form-group')) {
                    e.classList.add('form-group');
                }
            });
        }

        const formContainer = document.querySelectorAll('[data-sf-role="form-container"]');

        if (formContainer.length) {

            // get error message
            function getGroupError(group, errorType) {
                const errorMsgDom = group.querySelector('[data-sf-role="violation-messages"]');
                const errorMsgObj = errorMsgDom !== null ? JSON.parse(errorMsgDom.value) : null;
                let errorMsg = "";
                if (errorMsgObj !== null) {
                    errorMsg = errorMsgObj[errorType];
                }
                else {
                    errorMsg = "This field is required";
                }
                if (errorMsg.indexOf('{0}') > -1) {
                    errorMsg = errorMsg.slice(3);
                }

                return errorMsg
            }

            // check if error already output and construct error element
            function getErrorDetails(group, pattern) {
                const alreadyError = group.querySelector('.custom-error') ? true : false;
                let currentError = "";
                let groupErrorMsg = getGroupError(group, 'required');
                if (typeof pattern !== typeof undefined) {
                    groupErrorMsg = getGroupError(group, 'regularExpression');
                }
                const errorElem = '<span class="custom-error" style="color: red;">' + groupErrorMsg + '</span>';

                return {
                    alreadyError: alreadyError,
                    currentError: currentError,
                    groupErrorMsg: groupErrorMsg,
                    errorElem: errorElem
                };
            }

            // fails validation
            function failsValidation(group, alreadyError, errorElem, submitEvent) {
                if (alreadyError === false) {
                    group.lastElementChild.insertAdjacentHTML('afterend', errorElem);
                    group.classList.add('group-error');
                }
                submitEvent.preventDefault();
                document.querySelector('.group-error').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }

            // passes validation
            function passesValidation(group, alreadyError, currentError) {
                if (alreadyError) {
                    currentError = group.querySelector('.custom-error');
                    currentError.parentNode.removeChild(currentError);
                    group.classList.remove('group-error');
                }
            }

            // evaluate text or dropdown or paragraph or checkbox
            function checkText(group, value, submitEvent) {
                const errorDetails = getErrorDetails(group);

                if (value.length < 1) {
                    failsValidation(group, errorDetails.alreadyError, errorDetails.errorElem, submitEvent);
                }
                else {
                    passesValidation(group, errorDetails.alreadyError, errorDetails.currentError);
                }
            }

            // evaluate radio
            function checkRadio(group, submitEvent) {
                const errorDetails = getErrorDetails(group);
                const radioInputs = Array.prototype.slice.call(group.querySelectorAll('input[type="radio"]'));
                let isRadioChecked = false;

                radioInputs.forEach(function (e) {
                    if (e.checked) { isRadioChecked = true; }
                });
                if (isRadioChecked === false) {
                    failsValidation(group, errorDetails.alreadyError, errorDetails.errorElem, submitEvent);
                }
                else {
                    passesValidation(group, errorDetails.alreadyError, errorDetails.currentError);
                }
            }

            // evaluate pattern reg exp
            function checkPattern(group, value, submitEvent, pattern) {
                const errorDetails = getErrorDetails(group, pattern);
                pattern = new RegExp(pattern);

                if (pattern.test(value)) {
                    passesValidation(group, errorDetails.alreadyError, errorDetails.currentError);
                }
                else {
                    failsValidation(group, errorDetails.alreadyError, errorDetails.errorElem, submitEvent);
                }
            }

            // main handler
            Array.prototype.forEach.call(formContainer, function (e) {
                const currentForm = e.querySelector('form');

                currentForm.setAttribute('novalidate', '');

                const formGroups = e.querySelectorAll('.form-group');
                const formSubmit = e.querySelector('[type="submit"]');

                formSubmit.addEventListener('click', function (event) {
                    const recaptchaElem = currentForm.querySelector('#captchaValid');
                    const recaptchaVal = recaptchaElem !== null ? recaptchaElem.hasAttribute('required') : null;

                    Array.prototype.forEach.call(formGroups, function (g) {
                        const groupContainsRequired = g.querySelectorAll('[required]');
                        const groupType = g.getAttribute('data-sf-role');
                        const hasPattern = g.querySelector('[pattern]');
                        const pattern = hasPattern !== null ? hasPattern.getAttribute('pattern') : null;

                        if (groupContainsRequired.length && groupType != "checkboxes-field-container") {
                            const textCurrentValue = groupContainsRequired[0].value;

                            groupType == "multiple-choice-field-container" ? checkRadio(g, event) : checkText(g, textCurrentValue, event);
                        }
                        else if (groupType == "checkboxes-field-container") {
                            const checkBoxReqioredValidatorElem = g.querySelector('[data-sf-role="required-validator"]');
                            const checkBoxRequiredValidator = checkBoxReqioredValidatorElem !== null ? checkBoxReqioredValidatorElem.getAttribute('value') : null;
                            const customCheckbox = g.classList.contains('custom-checkbox');
                            const checkboxTicked = g.querySelector('input[type="checkbox"]').checked;

                            if (checkBoxRequiredValidator == "True") {
                                groupContainsRequired.length ? checkText(g, "", event) : checkText(g, "1", event);
                            }
                            else if (customCheckbox == true) {
                                checkboxTicked == true ? checkText(g, "1", event) : checkText(g, "", event);
                            }
                        }
                        if (pattern !== null) {
                            const textValueOfPatternElem = hasPattern !== null ? hasPattern.value : null;
                            checkPattern(g, textValueOfPatternElem, event, pattern);
                        }
                        if (recaptchaVal === true) {
                            currentForm.classList.add('recapture-failed');
                            event.preventDefault();
                        }
                        if ((recaptchaVal === false) && (currentForm.classList.contains('recapture-failed'))) {
                            currentForm.classList.remove('recapture-failed');
                        }
                    });
                });
            });
        }
    }

	runCustomSfFormValidation();

}();
