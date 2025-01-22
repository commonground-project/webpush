const VapidPublicKey = "BCWPohXk_M13Y8Mj8TenEgzINHJNxj1IxTZ0F-GqBSCQWPAyeI7-Dw5c1sZKKYH8j1OcIM9fP24w7g-cwWBBKM8";
isSubscribed = false;

$(document).ready(function() {
    // register Service Worker
    registerServiceWorker();
    // ask for permission
    if (Notification.permission !== 'granted') {
        askPermission();
    }
});

function toggleSubscription() {
  if (isSubscribed) {
    unsubscribe();
  } else {
    subscribe();
  }
}

function subscribe() {
    console.log('Subscribing user to push...');

    return navigator.serviceWorker
      .register('./sw.js')
      .then(function (registration) {
        console.log('Service Worker registered with scope:', registration.scope);
            
        // confirm permission
        if (Notification.permission !== 'granted') {
          throw new Error('Permission not granted for Notification');
        }
  
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(VapidPublicKey),
        });
      }).then(function (pushSubscription) {
        console.log(
          'Received PushSubscription: ',
          JSON.stringify(pushSubscription),
        );
        sendSubscriptionToBackEnd(pushSubscription);
      });
}

function unsubscribe() {
  navigator.serviceWorker.ready.then(function (registration) {
    registration.pushManager.getSubscription().then(function (subscription) {
      sendUnsubscriptionToBackEnd(subscription);
      subscription.unsubscribe().then(function () {
        console.log('Unsubscribed.');
      }).catch(function (e) {
        console.error('Unsubscription error: ', e);
      })
    }).catch(function (e) {
      console.error('Error thrown while unsubscribing.', e);
    });
  });
}

function sendSubscriptionToBackEnd(subscription) {
    console.log('Sending subscription to back-end.');
    return fetch('http://localhost:8080/api/subscription/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(this.String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth"))))
        }
      }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Bad status code from server.');
        }
        isSubscribed = true;
        $('#btnPushNotifications').addClass('btn-danger').removeClass('btn-primary');
        return response.json();
      })
      .then(function (responseData) {
        if (!(responseData.data && responseData.data.success)) {
          throw new Error('Bad response from server.');
        }
    });
}

function sendUnsubscriptionToBackEnd(subscription) {
  console.log('Sending unsubscription to back-end.');
  return fetch('http://localhost:8080/api/subscription/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(this.String.fromCharCode.apply(null, new Uint8Array(subscription.getKey("auth"))))
      }
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
      isSubscribed = false;
      $('#btnPushNotifications').addClass('btn-primary').removeClass('btn-danger');
      return response.json();
    })
    .then(function (responseData) {
      if (!(responseData.data && responseData.data.success)) {
        throw new Error('Bad response from server.');
      }
  });
}

function registerServiceWorker() {
    return navigator.serviceWorker
      .register('./sw.js')
      .then(function (registration) {
        console.log('Service worker successfully registered.');
        return registration;
      })
      .catch(function (err) {
        console.error('Unable to register service worker.', err);
      });
}

function askPermission() {
    Notification.requestPermission().then(function (permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error("We weren't granted permission.");
      }
    });
}



// base64 url convert to Uint8Array
function urlB64ToUint8Array(base64) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64Encoded = (base64 + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64Encoded);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
