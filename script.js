let myLat = 48.4284;
let myLong = -123.3656;
let myLocation = new google.maps.LatLng(myLat, myLong);

let map;
let service;
let infoWindowPark;
let infoWindowCurrentLocation;
let newRadius = 500;

let markers = [];

window.onload = initMap();

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: myLocation,
    zoom: 13
  });

  infoWindowCurrentLocation = new google.maps.InfoWindow();
  infoWindowPark = new google.maps.InfoWindow();

  searchForParks(myLocation);

  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to current Location";
  locationButton.classList.add("custom-map-control-button");

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          myLocation = google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          infoWindowCurrentLocation.setPosition(pos);
          infoWindowCurrentLocation.setContent("Location found.");
          infoWindowCurrentLocation.open(map);
          map.setCenter(pos);
          searchForParks(pos);
        },
        () => {
          handleLocationError(true, infoWindowCurrentLocation, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindowCurrentLocation, map.getCenter());
    }
  });
}

function searchForParks(location) {
  let request = {
    location: location,
    radius: newRadius,
    query: "park"
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, processParks);
}

function changeRad(){
  newRadius = document.getElementById("rad").value;
  searchForParks(myLocation);
}

function processParks(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    deleteMarkers();
    for (let i = 0; i < results.length; i++) {
      let place = results[i];
      console.log(place);
      createMarker(place);
    }
  }
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  // From https://stackoverflow.com/questions/15096461/resize-google-maps-marker-icon-image
  const scaledIcon = {
    url: place.icon, // url
    scaledSize: new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  };

  // https://developers.google.com/maps/documentation/javascript/markers
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    icon: scaledIcon,
    title: place.name
  });

  google.maps.event.addListener(marker, "click", () => {
    console.log("clicked");
    let contentString =
      "<h3>" +
      place.name +
      "</h3>Rating:&nbsp;<b>" +
      place.rating +
      "</b> / 5<p>" +
      place.formatted_address +
      "</p>";
    infoWindowPark.setContent(contentString || "");
    infoWindowPark.open(map, marker);
  });

  // add to markers array
  markers.push(marker);
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

