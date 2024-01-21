document.getElementById("logoutButton").addEventListener("click", function () {
  // request
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        window.location.href = "http://localhost:3000";
        alert(this.responseText);
      }
    }
  };
  // request send
  xhttp.open("GET", `http://localhost:3000/logout`);
  xhttp.send();
});

document.getElementById("searchButton").addEventListener("click", function () {
  let Title = document.getElementById("searchTitle").value;
  let Artist = document.getElementById("searchArtistName").value;
  let Category = document.getElementById("searchCategory").value;
  // Construct the query string
  let queryString = `Title=${Title}&Artist=${Artist}&Category=${Category}`;

  window.location.href = `http://localhost:3000/artworks?${queryString}`;
});
