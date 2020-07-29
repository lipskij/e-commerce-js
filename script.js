const form = document.getElementById("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("password2");
const fields = { username, email, password, password2 };

function notEmpty(value) {
  return value.trim() !== "";
}

function isEmail(email) {
  return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
}

function matches(key) {
  return function (value, context) {
    return value === context[key];
  };
}

function length(min = 0, max = Infinity) {
  return function (value) {
    return value.length >= min && value.length < max;
  };
}

const signupFormSchema = {
  username: [
    { validator: notEmpty, message: "Username cannot be empty" },
    {
      validator: length(4, 20),
      message: "Username should be at least 4 characters",
    },
  ],
  email: [
    { validator: notEmpty, message: "Email cannot be empty" },
    { validator: isEmail, message: "Email should be an email" },
  ],
  password: [
    { validator: notEmpty, message: "Password cannot be empty" },
    {
      validator: length(8, 30),
      message: "Password should be at least 8 characters",
    },
  ],
  password2: [
    { validator: notEmpty, message: "Password cannot be empty" },
    { validator: matches("password"), message: "Passwords have to match" },
  ],
};

function validate(schema, values) {
  console.log(schema, values);
  console.log(Object.entries(schema));
  const entries = Object.entries(schema).map(([propertyName, validators]) => [
    propertyName,
    validators
      .filter(({ validator }) => !validator(values[propertyName], values))
      .map(({ message }) => message),
  ]);
  console.log(entries);
  return Object.fromEntries(entries);
}

function getValuesObj(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries()); // ???
}

function hasErrors(errors) {
  return Object.entries(errors).some(([key, value]) => value.length);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const values = getValuesObj(e.target);
  const errors = validate(signupFormSchema, values);

  renderErrors(errors);
  if (!hasErrors(errors)) {
    window.location = "/shop.html";
  }
});

function renderErrors(errors) {
  Object.entries(errors).forEach(([key, messages]) => {
    if (messages.length) {
      setErrorFor(fields[key], messages);
    } else {
      setSuccessFor(fields[key]);
    }
  });
}

function setErrorFor(input, message) {
  const firstMsg = message[0];
  const formControl = input.parentElement; // .form-control
  const small = formControl.querySelector("small");
  // add error message inside small tag
  small.innerText = firstMsg;
  // add error class
  formControl.className = "form-control error";
}

function setSuccessFor(input) {
  const formControl = input.parentElement;
  formControl.className = "form-control success";
}

function renderLiveUpdate(event) {
  const name = event.target.name;
  const errors = validate(
    { [name]: signupFormSchema[name] },
    getValuesObj(form)
  );
  if (errors[name].length) {
    setErrorFor(fields[name], errors[name]);
  } else {
    setSuccessFor(fields[name]);
  }
}

//live ui update
form.addEventListener("keyup", renderLiveUpdate);
