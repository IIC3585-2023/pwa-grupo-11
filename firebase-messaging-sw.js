importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/4.2.0/firebase-messaging.js')

const firebaseConfig = {
    apiKey: "AIzaSyCwQAkUO7gIGop8ykEL9oyGuY5376iTSBw",
    authDomain: "anonynoteclone.firebaseapp.com",
    projectId: "anonynoteclone",
    storageBucket: "anonynoteclone.appspot.com",
    messagingSenderId: "285797775898",
    appId: "1:285797775898:web:b7fb75ca0a0eed7441afa3",
    measurementId: "G-R57G8TM40B"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler((payload) => {
    const title = "Anonynote";
    const options = {
        body: payload.data.status
    }
    return self.registration.showNotification(title, options)
})