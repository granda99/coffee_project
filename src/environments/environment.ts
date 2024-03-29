// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDa9dMIBTNrEkmszen5rFsR92iPx7CRG_0",
  vapiKey: "BNzxvMAh4NumW2_cO7boBH2XtyU_YD3w0afwwoJueb8S-anx7GfRUplcpdx8deWWNwOrfGSbmZ9SgiCbJ4la7lc",
  authDomain: "coffe-ish.firebaseapp.com",
  databaseURL: "https://coffe-ish-default-rtdb.firebaseio.com",
  refreshTokenUrl: "https://securetoken.googleapis.com/v1/token?key=",
  projectId: "coffe-ish",
  storageBucket: "coffe-ish.appspot.com",
  messagingSenderId: "500110513659",
  appId: "1:500110513659:web:328239780b8da7e87ca75e",
  measurementId: "G-M6S1Y5702H"
}

export const environment = {
  production: false,
  hostApi: '',
  firebaseConfig: firebaseConfig,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
