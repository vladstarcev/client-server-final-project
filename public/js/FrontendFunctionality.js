// mark as green when the field is valid
function setValid(id, value) {
    var element = document.getElementById(id);
    element.innerHTML = "✔ " + value;
    element.setAttribute("style", "display:block; color: green;")
}

// mark as green when the field is invalid
function setError(id, value) {
    var element = document.getElementById(id);
    element.innerHTML = "✖ " + value;
    element.setAttribute("style", "display:block; color: red;")
}

/*
// this function handles the reCAPTCHA response from server for the login page
function submitForm(event) {
    event.preventDefault();

    const captcha = document.querySelector("#g-recaptcha-response").value;

    fetch("/verifyCaptcha", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ captcha })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                $(this).unbind('submit').submit();
            }
            else { setError("recaptchaMessage", data.message); }
        });
}

function validateRegistrationFields() {

    var validationsPassed = validatePasswords();

    // First Name 
    var userFirstName = document.getElementById("FirstName").value;
    if (!/^[a-zA-Z]/.test(userFirstName)) {
        setError("FirstNameValidation", "First name must contain only letters");
        validationsPassed = false;
    }
    else { setValid("FirstNameValidation", "First name must contain only letters"); }

    // Last Name
    var userLastName = document.getElementById("LastName").value;
    if (!/^[a-zA-Z]/.test(userLastName)) {
        setError("LastNameValidation", "Last name must contain only letters")
        validationsPassed = false;
    }
    else { setValid("LastNameValidation", "Last name must contain only letters"); }

    // user mail
    var userMail = document.getElementById("InputEmail");
    if (!userMail.validity.valid || userMail.value == "") {
        setError("EmailValidation", "Must be valid email address");
        validationsPassed = false;
    }
    else { setValid("EmailValidation", "Must Be Valid Email Address"); }

    return validationsPassed;
}

function validatePasswords() {
    var validationsPassed = true;

    var userPassword = document.getElementById("InputPassword").value;
    var confirmationPassword = document.getElementById("RepeatPassword").value;

    // Matching Passwords
    if (userPassword != confirmationPassword || userPassword == "") {
        setError("PasswordsMatch", "The passwords must match");
        validationsPassed = false;
    }
    else { setValid("PasswordsMatch", "The passwords must match"); }

    // password contains 6 characters
    if (userPassword.length < 6) {
        setError("PasswordContainsSixCharacters", "Password must contain at least 6 characters");
        validationsPassed = false;
    }
    else { setValid("PasswordContainsSixCharacters", "Password must contain at least 6 characters"); }

    // password contain at least 1 digit
    if (userPassword.search(/[0-9]/) < 0) {
        setError("PasswordContainsAtLeastOneDigit", "Password must contain at least one digit");
        validationsPassed = false;
    }
    else { setValid("PasswordContainsAtLeastOneDigit", "Password must contain at least one digit"); }

    return validationsPassed;
}

// this function handles the reCAPTCHA response from server for the registration page
function submitRegistrationForm(event) {
    event.preventDefault();

    const captcha = document.querySelector("#g-recaptcha-response").value;
    var validationsPassed = validateRegistrationFields();

    fetch("/verifyCaptcha", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ captcha })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (validationsPassed)
                    $(this).unbind('submit').submit();
            }
            else { setError("recaptchaMessage", data.message); }
        });
}
*/