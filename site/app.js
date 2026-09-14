import {
  USERS,
  STATIC_LOCATIONS,
  parseLocation,
  formatTimestamp,
  freshnessClass,
  googleMapsUrl,
  detectPlatform,
  accuracyLabel,
  layoutLabels
} from "./js/core.mjs";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const firebaseConfig = {
  apiKey: "AIzaSyBOtxlG3Wvf2ZUF_KbZ7wlCiDHqJ5RMrvY",
  authDomain: "handleliste-3bdaa.firebaseapp.com",
  databaseURL: "https://handleliste-3bdaa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "handleliste-3bdaa",
  storageBucket: "handleliste-3bdaa.appspot.com",
  messagingSenderId: "193993736216",
  appId: "1:193993736216:web:ac36bb1f7010918c5f836d"
};

const currentKey = window.__HVA_KEY__;
const currentUser = USERS[currentKey];
const identity = document.querySelector("#identity");
const status = document.querySelector("#status");
const map = L.map("map", { zoomControl: true });
const markerLayer = L.layerGroup().addTo(map);
const labelOverlay = document.createElement("div");
labelOverlay.className = "marker-label-overlay";
labelOverlay.setAttribute("aria-hidden", "true");
map.getContainer().append(labelOverlay);
let records = {};
let labelItems = [];
let labelFrame = null;
let captureNeeded = true;
let captureInFlight = false;
let dataReference = null;
let dataCallback = null;

L.tileLayer(TILE_URL, {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

map.setView([50.0523, 19.9170], 12);
identity.textContent = `Bruker: ${currentUser}`;

function showStatus(message, isError = false, autoHide = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.classList.remove("hidden");
  if (autoHide) setTimeout(() => status.classList.add("hidden"), 2800);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function markerIcon(kind) {
  return L.divIcon({
    className: "",
    html: `<span class="map-marker ${kind}" aria-hidden="true"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -24]
  });
}

function renderLabels() {
  labelFrame = null;
  labelOverlay.replaceChildren();
  if (!labelItems.length) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("marker-label-lines");
  labelOverlay.append(svg);

  const elements = labelItems.map(item => {
    const point = map.latLngToContainerPoint([item.lat, item.lng]);
    const label = document.createElement("span");
    label.className = `marker-label ${item.kind}`;
    label.textContent = item.name;
    labelOverlay.append(label);
    const box = label.getBoundingClientRect();
    return { ...item, x: point.x, y: point.y - 11, width: box.width, height: box.height, label };
  });

  const size = map.getSize();
  const positions = layoutLabels(elements, size.x, size.y);
  elements.forEach((item, index) => {
    const position = positions[index];
    item.label.style.left = `${position.left}px`;
    item.label.style.top = `${position.top}px`;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("marker-label-line", item.kind);
    line.setAttribute("x1", item.x);
    line.setAttribute("y1", item.y);
    line.setAttribute("x2", position.edgeX);
    line.setAttribute("y2", position.edgeY);
    svg.append(line);
  });
}

function scheduleLabelRender() {
  if (labelFrame !== null) return;
  labelFrame = requestAnimationFrame(renderLabels);
}

function renderMarkers() {
  markerLayer.clearLayers();
  labelItems = [];
  const combined = { ...STATIC_LOCATIONS, ...records };
  const bounds = [];

  for (const record of Object.values(combined)) {
    if (!record || typeof record !== "object") continue;
    const location = parseLocation(record.Location);
    if (!location || typeof record.userID !== "string" || !record.userID.trim()) continue;

    const isStatic = record.Platform === "Static";
    const kind = isStatic ? "static" : freshnessClass(record.Timestamp);
    const marker = L.marker([location.lat, location.lng], {
      icon: markerIcon(kind),
      title: record.userID,
      alt: record.userID,
      keyboard: true
    });
    const timeText = isStatic ? "Fast sted" : `Sist sett: ${record.Timestamp || "Ukjent"}`;
    marker.bindPopup(`<p class="marker-name">${escapeHtml(record.userID)}</p><p class="marker-time">${escapeHtml(timeText)}</p>`);
    marker.on("click", () => {
      marker.openPopup();
      window.open(googleMapsUrl(location.lat, location.lng), "_blank", "noopener,noreferrer");
    });
    marker.addTo(markerLayer);
    labelItems.push({ name: record.userID, lat: location.lat, lng: location.lng, kind });
    bounds.push([location.lat, location.lng]);
  }

  if (bounds.length === 1) map.setView(bounds[0], 15);
  else if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
  scheduleLabelRender();
}

function terminateApp() {
  if (dataReference && dataCallback) dataReference.off("value", dataCallback);
  document.documentElement.textContent = "";
  window.close();
  location.replace("about:blank");
}

function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000
    });
  });
}

async function capturePositionOnce() {
  if (!captureNeeded || captureInFlight || document.visibilityState !== "visible") return;
  captureNeeded = false;
  captureInFlight = true;
  showStatus("Henter nøyaktig posisjon …");

  try {
    if (!navigator.geolocation) throw new Error("Geolocation støttes ikke av denne enheten.");
    const position = await getPosition();
    const { latitude, longitude, accuracy } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Enheten returnerte en ugyldig posisjon.");

    await firebase.database().ref(`hvoreralle/${currentKey}`).update({
      userID: currentUser,
      Location: `${latitude}, ${longitude}`,
      Timestamp: formatTimestamp(),
      Platform: detectPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints),
      Accuracy: accuracyLabel(accuracy)
    });
    showStatus("Posisjonen er oppdatert", false, true);
  } catch (error) {
    if (error?.code === 1) {
      terminateApp();
      return;
    }
    captureNeeded = true;
    showStatus(error?.message || "Kunne ikke hente posisjonen.", true);
  } finally {
    captureInFlight = false;
  }
}

function armNextCapture() {
  captureNeeded = true;
}

async function authenticate() {
  if (!window.firebase) throw new Error("Firebase SDK ble ikke lastet.");
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

  const decode = value => atob(value);
  await firebase.auth().signInWithEmailAndPassword(
    decode("bW9ydGVuLnN0ZWllbkBnZXRtYWlsLm5v"),
    decode("cFRrQWN5WDhkOQ==")
  );
}

async function start() {
  try {
    showStatus("Logger inn …");
    await authenticate();
    dataReference = firebase.database().ref("hvoreralle");
    dataCallback = snapshot => {
      records = snapshot.val() || {};
      renderMarkers();
    };
    dataReference.on("value", dataCallback, error => showStatus(`Databasefeil: ${error.message}`, true));

    window.addEventListener("blur", armNextCapture);
    window.addEventListener("focus", capturePositionOnce);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") armNextCapture();
      else capturePositionOnce();
    });
    await capturePositionOnce();
  } catch (error) {
    showStatus(`Oppstart feilet: ${error.message}`, true);
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}

setInterval(renderMarkers, 60000);
map.on("move zoom resize", scheduleLabelRender);
start();
