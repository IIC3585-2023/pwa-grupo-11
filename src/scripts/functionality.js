const url = "https://backend-pwa.onrender.com";

let requests = [];

const executeRequestQueue = async () => {
    const requestQueue = requests;
    if(requestQueue.length == 0) return;
    while(requestQueue.length > 0){
        const [request, id] = requestQueue.shift();
        
        let url = request.url;
        if(request.type == "deleteNote"){
            url = request.url + idAssociations[id];
        }

        if(request.type == "editNote"){
            url = request.url + idAssociations[id];
        }

        const req = new Request(url, {
            method: request["method"],
            headers: request["headers"],
            body: request["body"],
        });
        const res = await fetch(req);

        if(res.statusText == "network miss"){
            requestQueue.unshift([request, id]);
            break;
        }
        else{
            console.log("Executed:", request)
        }

        const resBody = await res.json();

        if(request.type == "createNote"){
            const noteID = resBody["noteID"];
            idAssociations[id] = noteID;
        }
    }
    console.log(idAssociations)
}

const executeRequest = async (request, id) => {
    requests.push([request, id]);

    executeRequestQueue();
}

const createNote = async() =>{

    const noteText = document.getElementById("short-note").value;

    const note = newNote(noteText, nextID);
    nextID++;

    const noteListElement = document.getElementById("notes");

    noteListElement.appendChild(note);

    const request = {
        "url": `${url}/notepad/${notepad["notepadName"]}`,
        "method": "POST",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "type": "createNote",
        "body": JSON.stringify({
            "noteText": noteText
        })
    };

    executeRequest(request, nextID - 1);
}

let notepad = {}
let idAssociations = {}
let nextID = 0;

function colorNote(index) {
    classList = document.getElementsByClassName("note")[index]
        .classList

    if (classList.contains("colored-note")){
        classList.remove("colored-note")
    } else {
        classList.add("colored-note")
    }
}

function deleteNote(index) {
    const parent = document.getElementById("notes");
    const children = parent.children;
    const newChildren = [];
    for(let i = 0; i < children.length; i++){
        const child = children[i];
        if(child.id != index) newChildren.push(child)
    }

    const request = {
        "url": `${url}/notepad/${notepad["notepadName"]}/`,
        "method": "DELETE",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "type": "deleteNote"
    };

    parent.replaceChildren(...newChildren);

    executeRequest(request, index);
}

function deleteNotes() {
    const parent = document.getElementById("notes");
    const newChildren = [];

    for(const index in idAssociations){
        const request = {
            "url": `${url}/notepad/${notepad["notepadName"]}/`,
            "method": "DELETE",
            "headers": {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            "type": "deleteNote"
        };

        executeRequest(request, index);
    }

    parent.replaceChildren(...newChildren);
}

const sync = async () => {
    await executeRequestQueue();
    updateState();
}

const loadNotepadData = () => {
    const notepadData = localStorage.getItem("notepadData");
    const boardRequest = JSON.parse(localStorage.getItem("queuedRequests"));

    if(boardRequest.length != 0){
        const request = boardRequest[0];
        const req = new Request(request["url"]);

        req.method = request["method"];
        req.headers = request["headers"];
        req.body = request["body"];
        
        requests.push(req);
    }

    notepad = JSON.parse(notepadData);
}

const setNotepadName = () => {
    const notepadNameElement = document.getElementById("note-name");
    notepadNameElement.value = notepad["notepadName"]; 
}

const setNotepadDescription = () => {
    const descriptionElement = document.getElementById("note-description");
    descriptionElement.value = notepad["description"];
}

const drawNotes = () => {

    const noteTable = document.getElementById("notes");

    const newChildren = [];

    const notes = notepad["notes"];

    for(let key in idAssociations){
        const id = idAssociations[key]
        const note = newNote(notes[id], key);
        newChildren.push(note);
    }
    
    noteTable.replaceChildren(...newChildren);
}

const setNotes = (notepad) => {
    const notes = notepad["notes"];
    nextID = 0;
    idAssociations = {};
    for(key in notes){
        idAssociations[nextID] = key;
        nextID++;
    }
}

const updateState = async () => {
    const res = await fetch(`${url}/notepad/${notepad["notepadName"]}`, {method: "GET"});

    if(res.statusText == "cache-network miss"){
        console.log("No connection couldnt update ");
    }
    else{
        notepad = await res.json();
        setNotepadDescription();
        setNotepadName();
        setNotes(notepad);
        drawNotes();
    }
}

const sendEditRequest = (localID, newText) => {
    console.log(localID, newText)

    const request = {
        "url": `${url}/notepad/${notepad["notepadName"]}/`,
        "method": "PUT",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "type": "editNote",
        "body": JSON.stringify({
            "noteText": newText
        })
    };

    executeRequest(request, localID);
}

const newNote = (noteText, id) => {
    const note = document.createElement("div");
    note.setAttribute("class", "note");
    note.id = id;
        
    // list of icons
    const iconList = document.createElement("div");
    note.appendChild(iconList);
    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-arrows-alt");

    const trash = document.createElement("i");
    trash.setAttribute("class", "far fa-trash-alt");
    trash.setAttribute("onclick", `deleteNote(${id})`);
    iconList.appendChild(trash);

    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-pencil-alt");
    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-palette");

    // checkbox
    checkbox = note.appendChild(document.createElement("input"));
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("onclick", `colorNote(${id})`);

    // p
    // const p = document.createElement("p");
    // p.innerHTML = noteText;
    // note.appendChild(p);
    const noteTextInput = document.createElement("input");
    noteTextInput.setAttribute("type", "text");
    noteTextInput.value = String(noteText);
    noteTextInput.addEventListener("change", (e) => sendEditRequest(id, noteTextInput.value));
    note.appendChild(noteTextInput);

    return note;
}

const handleDescriptionChange = () => {
    const descriptionElement = document.getElementById("note-description");
    const descriptionText = descriptionElement.value;

    const notepadName = notepad["notepadName"];

    const request = {
        "url": `${url}/notepad`,
        "method": "PUT",
        "headers": {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        "type": "editNotepad",
        "body": JSON.stringify({
            "notepadName": notepadName,
            "newNotepadName": notepadName,
            "newDescription": descriptionText
        })
    };

    executeRequest(request, undefined)
}


loadNotepadData();
sync();

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

// function requestPermission() {
messaging.requestPermission()
         .then(() => {
            console.log("Permission Granted");
            return messaging.getToken();
         })
         .then((token) => {
            console.log(token)
         })
         .catch((e) =>{
            console.log("Error", e)
         })
messaging.onMessage((payload) => {
    console.log(payload)
})

// }

// requestPermission();

// document.addEventListener('click', requestPermission);