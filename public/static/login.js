document.getElementById("register").addEventListener("click", function (event) {
  // Prevent default form action. DO NOT REMOVE THIS LINE
  event.preventDefault();
  // Get values from input fields
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let user = {
    username: username,
    password: password,
  };

  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 201) {
        window.location.href = "http://localhost:3000/artworks";
      } else if (this.status == 400) {
        alert("Choose another Name");
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(user));
});

document.getElementById("login").addEventListener("click", function (event) {
  // Prevent default form action. DO NOT REMOVE THIS LINE
  event.preventDefault();
  // Get values from input fields
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let user = {
    username: username,
    password: password,
  };

  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        let text = this.responseText;
        if (text === "Already logged in.") {
          alert(text);
        } else {
          window.location.href = "http://localhost:3000/artworks";
        }
      } else if (this.status == 401) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/login`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(user));
});
