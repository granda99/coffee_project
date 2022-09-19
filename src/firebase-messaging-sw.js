import { getMessaging, getToken } from "firebase/messaging";

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
const messaging = getMessaging();

getToken(messaging, { vapidKey: "BNzxvMAh4NumW2_cO7boBH2XtyU_YD3w0afwwoJueb8S-anx7GfRUplcpdx8deWWNwOrfGSbmZ9SgiCbJ4la7lc" }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});
