// user.js
function onPageLoad() {
  // make current page to be user
  let user = document.getElementById("user");
  if (user) {
    user.classList.add("active");
    user.setAttribute("aria-current", "page");
  }
}

// call the function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", onPageLoad);

function removeLike(id) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Delete successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("DELETE", `http://localhost:3000/users/like`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artwork_id: id }));
}

function removeReview(artwork_id, id) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Delete successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("DELETE", `http://localhost:3000/users/reviews`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artwork_id: artwork_id, id: id }));
}

function deleteFollowing(artist_id) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Delete successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("DELETE", `http://localhost:3000/users/following`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artist_id: artist_id }));
}

function addNewArtwork() {
  let Title = document.getElementById("switchTitle").value;
  let Year = document.getElementById("switchYear").value;
  let Category = document.getElementById("switchCategory").value;
  let Medium = document.getElementById("switchMedium").value;
  let Poster = document.getElementById("switchPoster").value;
  let Description = document.getElementById("switchDescription").value;

  // check
  if (!Title || !Year || !Category || !Medium || !Poster || !Description) {
    alert("Must not be empty.");
    return;
  }
  // split category and medium
  Category = Category.split(",");
  Medium = Medium.split(",");

  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Add successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/artworks`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(
    JSON.stringify({
      Title: Title,
      Year: Year,
      Category: Category,
      Medium: Medium,
      Poster: Poster,
      Description: Description,
    })
  );
}

function switchRole() {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Switch successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("PUT", `http://localhost:3000/users`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send();
}

function addWorkshop() {
  let Title = document.getElementById("workshopTitle").value;
  // check
  if (!Title) {
    alert("Must not be empty.");
    return;
  }
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert("Add successfully");
        let userId = JSON.parse(this.responseText).userId;
        window.location.href = `http://localhost:3000/users/${userId}`;
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users/workshop`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(
    JSON.stringify({
      Title: Title,
    })
  );
}
