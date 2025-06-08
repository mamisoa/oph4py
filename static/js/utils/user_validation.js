// polyfill for RegExp.escape
////////////////////////////////////////
if(!RegExp.escape) {
    RegExp.escape = function(s) {
      return String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    };
  }

  document.addEventListener("DOMContentLoaded", function() {

////////////////////////////////////////
// JavaScript form validation on SUBMIT
////////////////////////////////////////
var checkPassword = function(str) {
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return re.test(str);
    };

var checkForm = function(e) {
    if(this.username.value == "") {
        alert("Error: Username cannot be blank!");
        this.username.focus();
        e.preventDefault(); // equivalent to return false
        return;
    }
    re = /^\w+$/;
    if(!re.test(this.username.value)) {
        alert("Error: Username must contain only letters, numbers and underscores!");
        this.username.focus();
        e.preventDefault();
        return;
    }
    if(this.password.value != "" && this.password.value == this.passwordCheck.value) {
        if(!checkPassword(this.password.value)) {
        alert("The password you have entered is not valid!");
        this.password.focus();
        e.preventDefault();
        return;
    }
    } else {
    alert("Error: Please check that you've entered and confirmed your password!");
    this.password.focus();
    e.preventDefault();
    return;
    };
    // alert("Both username and password are VALID!");
};

var userForm = document.getElementById("userForm");
userForm.addEventListener("submit", checkForm, true);

////////////////////////////////////////
// HTML5 form validation
////////////////////////////////////////
var supports_input_validity = function() {
    var i = document.createElement("input");
    return "setCustomValidity" in i;
    }

    if(supports_input_validity()) {
    var usernameInput = document.getElementById("username");
    usernameInput.setCustomValidity(usernameInput.title);

    var pwd1Input = document.getElementById("password");
    pwd1Input.setCustomValidity(pwd1Input.title);

    var pwd2Input = document.getElementById("passwordCheck");

    // input key handlers

    usernameInput.addEventListener("keyup", function(e) {
        usernameInput.setCustomValidity(this.validity.patternMismatch ? usernameInput.title : "");
    }, false);

    pwd1Input.addEventListener("keyup", function(e) {
        this.setCustomValidity(this.validity.patternMismatch ? pwd1Input.title : "");
        if(this.checkValidity()) {
        pwd2Input.pattern = RegExp.escape(this.value);
        pwd2Input.setCustomValidity(pwd2Input.title);
        } else {
        pwd2Input.pattern = this.pattern;
        pwd2Input.setCustomValidity("");
        }
    }, false);

    pwd2Input.addEventListener("keyup", function(e) {
        this.setCustomValidity(this.validity.patternMismatch ? pwd2Input.title : "");
    }, false);

    }

    }, false);

////////////////////////////////////////
