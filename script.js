
// script.js

function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
}

function showSignupForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
}

function signIn() {
    // Validate sign-in form
    var signInForm = document.getElementById("signInFormElement");
    if (signInForm.checkValidity()) {
        // Perform sign-in action
        console.log('Sign In button clicked');
    } else {
        // Alert for unfilled fields
        alert("Please fill in all fields.");
    }
}

function signUp() {
    // Validate sign-up form
    var signUpForm = document.getElementById("signUpFormElement");
    if (signUpForm.checkValidity()) {
        // Perform sign-up action
        // Check for existing username logic can be added here
        console.log('Sign Up button clicked');
    } else {
        // Alert for unfilled fields
        alert("Please fill in all fields.");
    }
}
