// Use the current host when the frontend is served by the API, with a local
// development fallback for opening the static files directly.
const API_BASE_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : `${window.location.origin}/api`;
