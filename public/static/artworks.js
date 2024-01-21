// artworks.js
function onPageLoad() {
  // make current page to be artworks
  let artworks = document.getElementById("artworks");
  if (artworks) {
    artworks.classList.add("active");
    artworks.setAttribute("aria-current", "page");
  }

  let aLinkP = document.getElementById("aLinkP");

  if (aLinkP) {
    let id = aLinkP.textContent;
    sendUrl(`http://localhost:3000/artworks/${id}`);
  }
}

// call the function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", onPageLoad);

function getArtwork(event) {
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
        let artwork = JSON.parse(this.responseText).result;
        let like = JSON.parse(this.responseText).like;
        updateShowResult(artwork, like);
      }
    }
  };
  // request send
  xhttp.open("GET", url);
  xhttp.setRequestHeader("Accept", "application/json");
  xhttp.send();
}

function updateShowResult(artwork, like) {
  let showResult = document.getElementById("showResult");
  let res = `<img style="width: 100%; height: 100%;" src="${artwork.Poster}" alt="..."/>`;
  res += `<h1>${artwork.Title}</h1>`;
  res += "<ul>";
  Object.keys(artwork).forEach((key) => {
    if (
      key === "_id" ||
      key === "__v" ||
      key === "Poster" ||
      key === "Title" ||
      key === "artist_id"
    ) {
      return;
    }
    // show category and medium
    if (key === "Category") {
      res += `<li>${key}:<ul>`;
      artwork[key].forEach((ele) => {
        res += `<li><a href="http://localhost:3000/artworks?Category=${ele}"> ${ele}</a></li>`;
      });
      res += "</ul></li>";
      return;
    }
    if (key === "Medium") {
      res += `<li>${key}:<ul>`;
      artwork[key].forEach((ele) => {
        res += `<li> ${ele}</li>`;
      });
      res += "</ul></li>";
      return;
    }

    // show likes
    if (key === "likes") {
      if (like) {
        res += `<li>${key}: ${artwork[key]} </li>`;
      } else {
        res += `<li>${key}: ${artwork[key]} <h4 onclick=likeArtwork('${artwork._id}')>❤️️</h4></li>`;
      }
      return;
    }

    // show reviewsx
    if (key === "reviews") {
      res += `<li>${key}: `;
      res += "<ul>";
      // show content
      artwork[key].forEach((r) => {
        res += `<li>${r.username}: ${r.content}</li>`;
      });
      res += "</ul>";
      res += `<div class="mb-3 col-8">
            <label for="reviewContent" class="form-label">Add New comments:</label>
            <textarea class="form-control" id="reviewContent" rows="3"></textarea>
            <button id="addNewReview()" onclick=addNewReview('${artwork._id}') style="float:right; margin-top:5px;" type="button" class="btn btn-primary">Add</button>
          </div>`;
      res += "</li>";
      return;
    }

    // show artist link
    if (key === "Artist") {
      res += `<li>${key}: <a href="http://localhost:3000/users/${artwork.artist_id}"> ${artwork[key]}</a></li>`;
      return;
    }
    res += `<li>${key}: ${artwork[key]}</li>`;
  });
  res += "</ul>";
  showResult.innerHTML = res;
}

function likeArtwork(id) {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert(this.responseText);
        sendUrl(`http://localhost:3000/artworks/${id}`);
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users/like`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artwork_id: id }));
}

function addNewReview(id) {
  let content = document.getElementById("reviewContent").value;
  if (!content) {
    alert("Please input text!");
    return;
  }
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        alert(this.responseText);
        sendUrl(`http://localhost:3000/artworks/${id}`);
      } else if (this.status == 400) {
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("POST", `http://localhost:3000/users/reviews`);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ artwork_id: id, content: content }));
}
