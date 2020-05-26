function validateRegistrationFields() {

    // First Name 
    var userFirstName = document.getElementById("FirstName").value;
    if (!/^[a-zA-Z]/.test(userFirstName)) { setError("FirstNameValidation", "First name must contain only letters"); }
    else { setValid("FirstNameValidation", "First name must contain only letters"); }

    // Last Name
    var userLastName = document.getElementById("LastName").value;
    if (!/^[a-zA-Z]/.test(userFirstName)) { setError("LastNameValidation", "Last name must contain only letters") }
    else { setValid("LastNameValidation", "Last name must contain only letters"); }

    // user mail
    var userMail = document.getElementById("InputEmail");
    if (!userMail.validity.valid || userMail.value == "") { setError("EmailValidation", "Must be valid email address"); }
    else { setValid("EmailValidation", "Must Be Valid Email Address"); }

    validatePasswords();
}

function validatePasswords() {
    var userPassword = document.getElementById("InputPassword").value;
    var confirmationPassword = document.getElementById("RepeatPassword").value;

    // Matching Passwords
    if (userPassword != confirmationPassword || userPassword == "") { setError("PasswordsMatch", "The passwords must match"); }
    else { setValid("PasswordsMatch", "The passwords must match"); }

    // password contains 6 characters
    if (userPassword.length < 6) { setError("PasswordContainsSixCharacters", "Password must contain at least 6 characters"); }
    else { setValid("PasswordContainsSixCharacters", "Password must contain at least 6 characters"); }

    // password contain at least 1 digit
    if (userPassword.search(/[0-9]/) < 0) { setError("PasswordContainsAtLeastOneDigit", "Password must contain at least one digit"); }
    else { setValid("PasswordContainsAtLeastOneDigit", "Password must contain at least one digit"); }
}

// mark as green when the field is valid
function setValid(id, value) {
    var element = document.getElementById(id);
    element.innerHTML = "V " + value;
    element.setAttribute("style", "display:block; color: #55A846;")
}

// mark as green when the field is invalid
function setError(id, value) {
    var element = document.getElementById(id);
    element.innerHTML = "X " + value;
    element.setAttribute("style", "display:block; color: #D71D1D;")
}


///*for contact us fields validation*/
//function validateSuportFields() {
//    var userFullName = document.getElementById("name").value;
//    if (userFullName.length == 0) { alert("Please fill your name"); return false; }
//    var userMail = document.getElementById("email");
//    if (!userMail.validity.valid) { alert("Invalid Email Address"); return false; }
//    var selectedSubject = document.getElementById("subject").value;
//    if (selectedSubject == "Select Subject") { alert("Please select subject"); return false; }
//    var userComment = document.getElementById("comment").value;
//    if (userComment.length == 0) { alert("Please fill your message"); return false; }
//    else { alert(userFullName + "\n" + userMail.value + "\n" + selectedSubject + "\n" + userComment); return true; }
//}

//// show password
//function showPassword(mod) {
//    switch (document.getElementById("inpPassword").type) {
//        case "password":
//            document.getElementById("inpPassword").type = "text";
//            break;
//        case "text":
//            document.getElementById("inpPassword").type = "password";
//            break;
//    }
//    if (mod == "signUp") {
//        switch (document.getElementById("inpConPassword").type) {
//            case "password":
//                document.getElementById("inpConPassword").type = "text";
//                break;
//            case "text":
//                document.getElementById("inpConPassword").type = "password";
//                break;
//        }
//    }
//}