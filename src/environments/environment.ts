// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

var local = false,
host = '';

// If this is an HTTPS connection, we have to use a secure WebSocket
// connection too, so add another "s" to the scheme.

if (local) {
  host = "ws://localhost:8090";
}else{
  host = 'ws://172.16.33.64:8090';
}
export const environment = {
  production: false,
  ws: host
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
