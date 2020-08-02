const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const msg = document.getElementById("msg");
const btn = document.getElementsByTagName("button");
const loginForm = document.getElementById("loginForm");
const loginUserName = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");

let hasError = false;

// show input err message
function showError(input, message) {
  const formControl = input.parentElement;
  formControl.className = "form-control error";
  const small = formControl.querySelector("small");
  small.innerText = message;
}
// clear input status
function clearStatus(...inputs) {
  inputs.forEach((input) => {
    const formControl = input.parentElement;
    formControl.classList.remove("success");
    formControl.classList.remove("error");
  });
}

// show success outline
function showSuccess(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
}

// show access message : make it visible only when all fields ar valid
function successMessage() {
  const formControl = msg.parentElement;
  formControl.className = "form-control access";
  msg.textContent = "Welcome!";
}

// check email is valid
function checkEmail(input) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(input.value.trim())) {
    showSuccess(input);
  } else {
    showError(input, "Email is not valid");
  }
}

// check rquired fields
function checkRequired(inputArr) {
  inputArr.forEach(function (input) {
    if (input.value.trim() === "") {
      showError(input, `${getFieldName(input)} is required`);
    } else {
      showSuccess(input);
    }
  });
}

// check input length
function checkLength(input, min, max) {
  if (input.value.length < min) {
    showError(
      input,
      `${getFieldName(input)} must be at least ${min} characters`
    );
  } else if (input.value.length > max) {
    showError(
      input,
      `${getFieldName(input)} must be less then ${max} characters`
    );
  } else {
    showSuccess(input);
  }
}

// check passwords mach
function checkPasswordsMatch(input1, input2) {
  if (input1.value !== input2.value) {
    showError(input2, "Passwords do not match");
  }
}

// get field name
function getFieldName(input) {
  return input.id.charAt(0).toUpperCase() + input.id.slice(1);
}

// Event Listeners
form.addEventListener("submit", function (e) {
  e.preventDefault();

  checkRequired([username, email, password, password2]);
  checkLength(username, 3, 15);
  checkLength(password, 6, 25);
  checkEmail(email);
  checkPasswordsMatch(password, password2);
  // sends the users info to the back end
  fetch("/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value,
    }),
  })
    .then((response) => {
      // when response
      console.log(response.status);
      if (response.status === 400) {
        // check if response status 400
        hasError = true; //if 400 then it has err
      } else {
        hasError = false; // if false then no err
      }
      return response.text(); // response message text
    })
    .then((message) => {
      if (hasError === true) {
        // if status 400
        showError(username, message); // when user name mach then show err message
      }
    })
    .then(console.log);
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  clearStatus(loginUserName, loginPassword);

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: loginUserName.value,
      password: loginPassword.value,
    }),
  })
    .then((response) => {
      if (response.status === 200) {
        // clear err message
        hasError = false;
      } else if (response.status === 401) {
        hasError = true;
      }
      return response.json();
    })
    .then((message) => {
      if (hasError === false) {
        // clear err message
        showSuccess(loginUserName);
        showSuccess(loginPassword);
      } else if (hasError === true) {
        if (message.username) {
          showError(loginUserName, message.username); // if status is 401
        }
        if (message.password) {
          showError(loginPassword, message.password);
        }
      }
    })
    .then(console.log);
});
