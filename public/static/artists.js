// artists.js
function onPageLoad() {
  // make current page to be artists
  let home = document.getElementById("artists");
  if (home) {
    home.classList.add("active");
    home.setAttribute("aria-current", "page");
  }

  let aLinkP = document.getElementById("aLinkP");

  if (aLinkP) {
    let id = aLinkP.textContent;
    sendUrl(`http://localhost:3000/users/${id}`);
  }
}

// call the function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", onPageLoad);

// get the particular artist information
function getArtist(event) {
  event.preventDefault();
  // get url
  let url = event.currentTarget.getAttribute("href");
  sendUrl(url);
}

function sendUrl(url) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        // get the response
        let artitst = JSON.parse(this.responseText).result;
        let following = JSON.parse(this.responseText).following;
        updateShowResult(artitst, following);
      }
    }
  };
  // request send
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.send();
}

function updateShowResult(artitst, following) {
  let showResult = document.getElementById("showResult");
  let res = "";
  res += `<h1>${artitst.username}</h1>`;
  res += "<ul>";
  Object.keys(artitst).forEach((key) => {
    if (
      key === "_id" ||
      key === "__v" ||
      key === "username" ||
      key === "password" ||
      key === "artist" ||
      key === "date_of_birth" ||
      key === "reviews" ||
      key === "likes" ||
      key === "notifications" ||
      key === "enrollment" ||
      key === "followers"
    ) {
      return;
    }

    // show artworks
    if (key === "artworks") {
      res += `<li>${key}:<ul>`;
      artitst[key].forEach((ele) => {
        res += `<li><a href="http://localhost:3000/artworks/${ele.artwork_id}"> ${ele.artwork_title}</a></li>`;
      });
      res += "</ul></li>";
      return;
    }

    // show workshops
    if (key === "host") {
      if (artitst[key].length == 0) {
        return;
      }
      res += `<li>${key}:<p id="notification_information" style="display:none;">${artitst.username},${artitst._id}</p><ul>`;
      artitst[key].forEach((ele) => {
        res += `<li >${ele} <img onclick="enrollment(event)" src="/add.png" alt="add button" style="width: 15px;"> </li>`;
      });
      res += "</ul></li>";
      return;
    }

    // show following
    if (key === "following") {
      if (following) {
        return;
      } else {
        res += `<li>${key}: <img onclick="following('${artitst._id}')" src="/add.png" id="addFollowing" alt="add button" style="width: 15px;">  </li>`;
      }
      return;
    }

    res += `<li>${key}: ${artitst[key]}</li>`;
  });
  res += "</ul>";
  showResult.innerHTML = res;
}

function following(artist_id) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert(this.responseText);
        sendUrl(`http://localhost:3000/users/${artist_id}`);
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users/following`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artist_id: artist_id }));
}

function enrollment(event) {
  // get workshop title
  let li = event.target.parentNode;
  let title = li.childNodes[0].textContent;
  let artist_name = document
    .getElementById("notification_information")
    .textContent.split(",")[0];
  let artist_id = document
    .getElementById("notification_information")
    .textContent.split(",")[1];
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert(this.responseText);
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users/enrollment`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(
    JSON.stringify({
      title: title,
      artist_id: artist_id,
      artist_name: artist_name,
    })
  );
}
