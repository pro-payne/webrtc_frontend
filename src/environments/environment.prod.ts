var scheme = "ws";

// If this is an HTTPS connection, we have to use a secure WebSocket
// connection too, so add another "s" to the scheme.

if (document.location.protocol === "https:") {
  scheme += "s";
}

var host = 'wss://b9d17553.ngrok.io';
export const environment = {
  production: true,
  ws: host
};
