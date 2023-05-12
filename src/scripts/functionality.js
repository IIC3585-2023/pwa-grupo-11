const url = "https://backend-pwa.onrender.com";

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

    //Send note
    const res = await fetch(`${request["url"]}`, {
        method: request["method"],
        headers: request["headers"],
        body: request["body"],
        id: nextID - 1
    });

    if(res.statusText == "network miss"){
        console.log("miss")
        const queuedRequests = JSON.parse(localStorage.getItem("queuedRequests"));
        console.log(queuedRequests)
        localStorage.setItem("queuedRequests", JSON.stringify([...queuedRequests, request]));
    }
    else{
        console.log(await res.json())
    }
}

//desc, notes
let notepad = {}
//id_local: id_remote
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
    var parent = document.getElementById("notes");
    var child = parent.children[index];
    parent.removeChild(child);
    updateTrashIconsOnClick(parent);
    updateCheckBoxesIndex(parent, index);
}

function updateTrashIconsOnClick(parent) {
    const trashIcons = parent.querySelectorAll('.far.fa-trash-alt');
    trashIcons.forEach((icon, index) => {
        icon.setAttribute('onclick', `deleteNote(${index})`);
    });
}

function updateCheckBoxesIndex(parent, deletedIndex) {
    const checkBoxes = parent.querySelectorAll('input[type="checkbox"]');
    checkBoxes.forEach((checkBox, index) => {
        if (index >= deletedIndex) {
            checkBox.setAttribute('onclick', `colorNote(${index})`);
            checkBox.setAttribute('id', `note-${index}`);
        }
    });
}

function deleteNotes() {
    const parent = document.getElementById("notes");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const sampleApiURL = "https://cat-fact.herokuapp.com"
sampleFetch = async () => {
    const res = fetch(`${sampleApiURL}/facts`, {})
    console.log(res)
}

const sync = async () => {
    const queuedRequests = JSON.parse(localStorage.getItem("queuedRequests"));

    while (queuedRequests.length > 0) {
        const request = queuedRequests.shift();

        const res = await fetch(`${request["url"]}`, {
            method: request["method"],
            headers: request["headers"],
            body: request["body"]
        });

        const body = {}

        try{
            body = await res.json()
        }
        catch{
            
        }

        if(res.statusText == "network miss"){
            //Notify user he lost connection
            console.log("Lost internet connection while syncing");
            queuedRequests.unshift(request);
            break;
        }

        if(request["type"] == "createBoard"){
            if(res.status == 200){
                //Pop up catastrophic failure
                window.location.replace("../../index.html");
            }
        }

        if(request["type"] == "createNote"){
            if(res.status == 200){
                const noteID = body["noteID"];
                idAssociations[request["id"]] = noteID;
            }
        }

        //editNote
        //deleteNote
    }
    
    //Get updated state
    updateState();
}

const loadNotepadData = () => {
    const notepadData = localStorage.getItem("notepadData");
    notepad = JSON.parse(notepadData);

    const notes = notepad["notes"];
    let idx = 0;
    for(key in notes){
        idAssociations[idx] = key;
        idx++;
    }
    nextID = idx;

    setNotepadName();
    setNotepadDescription();
    setNotes();
}

const setNotepadName = () => {
    const notepadNameElement = document.getElementById("note-name");
    notepadNameElement.value = notepad["notepadName"]; 
}

const setNotepadDescription = () => {
    const descriptionElement = document.getElementById("note-description");
    descriptionElement.value = notepad["description"];
}

const setNotes = () => {

    const noteTable = document.getElementById("notes");

    const newChildren = [];

    const notes = notepad["notes"];
    console.log(notes);
    for(let key in idAssociations){
        const id = idAssociations[key]
        const note = newNote(notes[id], key);
        newChildren.push(note);
    }
    
    noteTable.replaceChildren(...newChildren);
}

const updateState = async () => {
    const res = await fetch(`${url}/notepad/${notepad["notepadName"]}`, {method: "GET"});

    if(res.statusText == "cache-network miss"){
        //Couldnt get updated state
        console.log("errorcirijillo");
    }
    else{
        notepad = await res.json();
    }
}

const newNote = (noteText, id) => {
    console.log(noteText)
    const note = document.createElement("div");
    note.setAttribute("class", "note");
        
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
    const p = document.createElement("p");
    p.innerHTML = noteText;
    note.appendChild(p);

    return note;
}

const sendDescriptionChanges = async () => {
}

const sendNoteChanges = async () => {
}

const button = document.getElementById("fetchButton")

button.addEventListener('click', () => {
    sampleFetch()
})


loadNotepadData();