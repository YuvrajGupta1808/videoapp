document.addEventListener("DOMContentLoaded", () => {
  // Form Validation
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmpassword");

  const usernameError = document.createElement("span");
  usernameError.style.color = "red";
  usernameInput.parentNode.insertBefore(
    usernameError,
    usernameInput.nextSibling
  );

  const passwordError = document.createElement("span");
  passwordError.style.color = "red";
  passwordInput.parentNode.insertBefore(
    passwordError,
    passwordInput.nextSibling
  );

  const confirmPasswordError = document.createElement("span");
  confirmPasswordError.style.color = "red";
  confirmPasswordInput.parentNode.insertBefore(
    confirmPasswordError,
    confirmPasswordInput.nextSibling
  );

  usernameInput.addEventListener("input", () => {
    const username = usernameInput.value;
    const valid = /^[a-zA-Z][a-zA-Z0-9]{2,}$/.test(username);
    if (!valid) {
      usernameError.textContent =
        "Invalid username. Must start with a letter and be at least 3 characters long.";
    } else {
      usernameError.textContent = "";
    }
  });

  function validatePassword() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const validPassword =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[/\*\-\+\!@#$\^&~\[\]]).{8,}$/.test(password);

    if (!validPassword) {
      passwordError.textContent =
        "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character.";
    } else {
      passwordError.textContent = "";
    }

    if (password !== confirmPassword) {
      confirmPasswordError.textContent = "Passwords do not match.";
    } else {
      confirmPasswordError.textContent = "";
    }
  }

  passwordInput.addEventListener("input", validatePassword);
  confirmPasswordInput.addEventListener("input", validatePassword);

  form.addEventListener("submit", (event) => {
    const username = usernameInput.value;
    const validUsername = /^[a-zA-Z][a-zA-Z0-9]{2,}$/.test(username);
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const validPassword =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[/\*\-\+\!@#$\^&~\[\]]).{8,}$/.test(password);

    if (!validUsername) {
      event.preventDefault();
      usernameError.textContent =
        "Invalid username. Must start with a letter and be at least 3 characters long.";
    }

    if (!validPassword) {
      event.preventDefault();
      passwordError.textContent =
        "Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character.";
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      confirmPasswordError.textContent = "Passwords do not match.";
    }

    console.log("Form submission attempted");
    console.log("Username:", username);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Fetch and Display Photos
  fetch("https://jsonplaceholder.typicode.com/albums/2/photos")
    .then((response) => response.json())
    .then((data) => {
      const photoContainer = document.getElementById("photoContainer");
      photoContainer.innerHTML = "";

      data.forEach((photo) => {
        const photoDiv = document.createElement("div");
        photoDiv.classList.add("photo");

        const img = document.createElement("img");
        img.src = photo.url;
        img.alt = photo.title;
        img.classList.add("photo-image");

        const title = document.createElement("p");
        title.textContent = photo.title;

        photoDiv.appendChild(img);
        photoDiv.appendChild(title);
        photoContainer.appendChild(photoDiv);

        photoDiv.addEventListener("click", () => {
          fadeOut(photoDiv);
        });
      });

      updatePhotoCount(data.length);
    });
});

function updatePhotoCount(count) {
  document.getElementById(
    "photoCount"
  ).textContent = `Number of photos: ${count}`;
}

function fadeOut(element) {
  let opacity = 1;
  const timer = setInterval(() => {
    if (opacity <= 0.1) {
      clearInterval(timer);
      element.remove();
      const count = document.querySelectorAll(".photo").length;
      updatePhotoCount(count);
    }
    element.style.opacity = opacity;
    opacity -= opacity * 0.1;
  }, 50);
}
