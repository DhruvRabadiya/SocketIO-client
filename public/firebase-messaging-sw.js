// This file must be in the `public` directory

importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCVC1MLXSlqwgT-va1GrtSoqTPV_PM1t6A",
  authDomain: "sendnotification-0.firebaseapp.com",
  projectId: "sendnotification-0",
  storageBucket: "sendnotification-0.firebasestorage.app",
  messagingSenderId: "302964290219",
  appId: "1:302964290219:web:7a37b5954e3ec70e463dee",
  measurementId: "G-ZB5TJ5970X",
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// This function runs when a notification is received while the app is in the background
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.svg", // An icon from your public folder
    data: payload.data, // This attaches your custom data (like URLs) to the notification
  };

  // This line is what actually shows the notification on the user's screen
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// This function runs when the user clicks on the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Close the notification

  const data = event.notification.data;
  const urlToOpen = new URL(self.location.origin).href; // Your app's base URL

  let finalUrl = urlToOpen;

  if (data.type === "group") {
    finalUrl = `${urlToOpen}group/${data.conversationId}`;
  } else if (data.type === "dm") {
    finalUrl = `${urlToOpen}chat/${data.senderId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // If a window for your app is already open, focus it.
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});
