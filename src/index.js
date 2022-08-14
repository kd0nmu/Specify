

// Import from "@inrupt/solid-client-authn-browser" TO BE USED CLIENT-SIDE ONLY
import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
  fetch
} from "@inrupt/solid-client-authn-browser";

// Import from "@inrupt/solid-client"
import {
  addUrl,
  addStringNoLocale,
  createSolidDataset,
  createThing,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  getStringNoLocale,
  removeThing,
  saveSolidDatasetAt,
  setThing
} from "@inrupt/solid-client";

import { SCHEMA_INRUPT, RDF, AS } from "@inrupt/vocab-common-rdf";

const selectorIdP = document.querySelector("#select-idp");
const selectorPod = document.querySelector("#select-pod");
const buttonLogin = document.querySelector("#btnLogin");
const buttonRead = document.querySelector("#btnRead");
const buttonCreate = document.querySelector("#btnCreate");
const labelCreateStatus = document.querySelector("#labelCreateStatus");
const buttonGetOsmLocation = document.querySelector("#btnGetOsmLocation");

buttonRead.setAttribute("disabled", "disabled");
buttonLogin.setAttribute("disabled", "disabled");
buttonCreate.setAttribute("disabled", "disabled");
//buttonGetOsmLocation.setAttribute("disabled", "disabled");

// 1a. Start Login Process. Call login() function.
function loginToSelectedIdP() {
  const SELECTED_IDP = document.getElementById("select-idp").value;// This is the drop down menu at the top.There is only SOLID IdP for now, but you could add other servers

  return login({
    oidcIssuer: SELECTED_IDP,
    redirectUrl: window.location.href,// I think this is where the user will be returned to after login. I suspect I could specify another page, if I moved the 'handleIncomingRedirect()' to that page.
    clientName: "Specify"//What is to prevent client name from being used by another web app?
    //should I look into a security protocol to ensure that only the Specify web app accesses Specify dataSets?
  });
}

// 1b. Login Redirect. Call handleIncomingRedirect() function.
// When redirected after login, finish the process by retrieving session information.
async function handleRedirectAfterLogin() {
  await handleIncomingRedirect();

  const session = getDefaultSession();
  if (session.info.isLoggedIn) {
    // Update the page with the status.
    document.getElementById("myWebID").value = session.info.webId;

    // Enable Read button to read Pod URL
    buttonRead.removeAttribute("disabled");
  }
}

// The example has the login redirect back to the index.html.
// This calls the function to process login information.
// If the function is called when not part of the login redirect, the function is a no-op.
handleRedirectAfterLogin();

// 2. Get Pod(s) associated with the WebID
async function getMyPods() {
  const webID = document.getElementById("myWebID").value;
  const mypods = await getPodUrlAll(webID, { fetch: fetch });

  // Update the page with the retrieved values.

  mypods.forEach((mypod) => {
    let podOption = document.createElement("option");
    podOption.textContent = mypod;
    podOption.value = mypod;
    selectorPod.appendChild(podOption);
  });
}

// 3. Create the Reading List
async function createList() {
  labelCreateStatus.textContent = "";
  const SELECTED_POD = document.getElementById("select-pod").value;

  // For simplicity and brevity, this tutorial hardcodes the  SolidDataset URL.
  // In practice, you should add in your profile a link to this resource
  // such that applications can follow to find your list.
  const readingListUrl = `${SELECTED_POD}getting-started/readingList/myList`;

  let titles = document.getElementById("titles").value.split("\n");

  // Fetch or create a new reading list.
  let myReadingList;

  try {
    // Attempt to retrieve the reading list in case it already exists.
    myReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });
    // Clear the list to override the whole list
    let items = getThingAll(myReadingList);
    items.forEach((item) => {
      myReadingList = removeThing(myReadingList, item);
    });
  } catch (error) {
    if (typeof error.statusCode === "number" && error.statusCode === 404) {
      // if not found, create a new SolidDataset (i.e., the reading list)
      myReadingList = createSolidDataset();
    } else {
      console.error(error.message);
    }
  }

  // Add titles to the Dataset
  let i = 0;
  titles.forEach((title) => {
    if (title.trim() !== "") {
      let item = createThing({ name: "title" + i });
      item = addUrl(item, RDF.type, AS.Article);
      item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
      myReadingList = setThing(myReadingList, item);
      i++;
    }
  });

  try {
    // Save the SolidDataset
    let savedReadingList = await saveSolidDatasetAt(
      readingListUrl,
      myReadingList,
      { fetch: fetch }
    );

    labelCreateStatus.textContent = "Saved";

    // Refetch the Reading List
    savedReadingList = await getSolidDataset(readingListUrl, { fetch: fetch });

    let items = getThingAll(savedReadingList);

    let listcontent = "";
    for (let i = 0; i < items.length; i++) {
      let item = getStringNoLocale(items[i], SCHEMA_INRUPT.name);
      if (item !== null) {
        listcontent += item + "\n";
      }
    }

    document.getElementById("savedtitles").value = listcontent;
  } catch (error) {
    console.log(error);
    labelCreateStatus.textContent = "Error" + error;
    labelCreateStatus.setAttribute("role", "alert");
  }
}

buttonLogin.onclick = function () {
  loginToSelectedIdP();
};

buttonRead.onclick = function () {
  getMyPods();
};

buttonCreate.onclick = function () {
  createList();
};

buttonGetOsmLocation.onclick = function () {
  //getLocation(event);
  navigator.geolocation.getCurrentPosition((position) => {
  var mLoc= L.marker({lat:position.coords.latitude, lon: position.coords.longitude, icon:greenIcon});
  mLoc.bindPopup('Zenith',{icon:greenIcon}).addTo(map);
  //marker.bindPopup('<p>Your Zenith</p>').openPopup();
  });
}


selectorIdP.addEventListener("change", idpSelectionHandler);
function idpSelectionHandler() {
  if (selectorIdP.value === "") {
    buttonLogin.setAttribute("disabled", "disabled");
  } else {
    buttonLogin.removeAttribute("disabled");
  }
}

selectorPod.addEventListener("change", podSelectionHandler);
function podSelectionHandler() {
  if (selectorPod.value === "") {
    buttonCreate.setAttribute("disabled", "disabled");
  } else {
    buttonCreate.removeAttribute("disabled");
  }
}



// initialize Leaflet
var map = L.map('map').setView({lon: -104.886, lat: 40.132}, 9);

// add the OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

// show the scale bar on the lower left corner
L.control.scale({imperial: true, metric: true}).addTo(map);

// show a marker on the map
var greenIcon = L.icon({
    iconUrl: 'leaf-green.png',
    shadowUrl: 'leaf-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.marker({lon: -105.1171, lat: 40.5054}).bindPopup('Fort Collins Recycling Center').addTo(map);
L.marker({lon: -105.109, lat: 40.39572}).bindPopup('Loveland Recycling Center').addTo(map);
L.marker({lon: -105.09183, lat: 40.1612}).bindPopup('Longmont Recycling Center').addTo(map);
L.marker({lon: -105.09007, lat: 39.91704}).bindPopup('Broomfield Recycling Center').addTo(map);
L.marker({lon: -105.54084, lat: 40.36801}).bindPopup('Estes Park Residential Recycling Center').addTo(map);
L.marker({lon: -105.2109, lat: 40.01814}).bindPopup('Boulder County Recycling Center').addTo(map);

function getLocation(e) { 
  e.preventDefault();
  if (!navigator.geolocation) {
    alert("Browser doesn't support geolocation");
  } else {
    navigator.geolocation.getCurrentPosition(success, error);
    console.log('getLocation has run successfully');
  }
}

// Get current position successfully
function success(position) {
  console.log('called success function');
  var map, marker,
      latitude = position.coords.latitude,
      longitude = position.coords.longitude;

  var map = L.map('map').setView({lon: -104.886, lat: 40.132}, 9);

  // Marker using leaflet
  marker = L.marker([latitude, longitude]).addTo(map);
  console.log('variable marker assigned');

  // Popup in leaflet
  marker.bindPopup('<p>Your location</p>').openPopup();
  console.log('openPopUp called');
}

// Get current position fail
function error() {
  alert('Get current position fail. Please access codepen to get geolocation.');
}

var greenIcon = L.icon({
    iconUrl: 'leaf-green.png',
    shadowUrl: 'leaf-shadow.png',

    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});