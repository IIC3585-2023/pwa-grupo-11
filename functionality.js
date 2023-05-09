function createNote() {
    const note = document.createElement("div")
    note.setAttribute("class", "note")
    
    index = document.getElementById("notes").children.length;
    
    // list of icons
    const iconList = document.createElement("div")
    note.appendChild(iconList)
    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-arrows-alt")

    const trash = document.createElement("i")
    trash.setAttribute("class", "far fa-trash-alt")
    trash.setAttribute("onclick", `deleteNote(${index})`)
    iconList.appendChild(trash)

    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-pencil-alt")
    iconList.appendChild(document.createElement("i"))
        .setAttribute("class", "fas fa-palette")

    // checkbox
    checkbox = note.appendChild(document.createElement("input"))
    checkbox.setAttribute("type", "checkbox")
    checkbox.setAttribute("onclick", `colorNote(${index})`)

    // p
    const p = document.createElement("p")
    p.innerHTML = "hello"
    note.appendChild(p)

    document.getElementById("notes")
        .appendChild(note)
}

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
    const res = fetch(`${sampleApiURL}/facts`)
    console.log(res)
}


const registerSW = async () => {
    // await sampleFetch();

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('serviceWorker.js', {scope: './'});
            if (registration.installing) {
            console.log('Service worker installing');
            } else if (registration.waiting) {
            console.log('Service worker installed');
            } else if (registration.active) {
            console.log('Service worker active');
            }

        } catch (error) {
            console.log('SW failed');

        }
    }
};

registerSW();

const button = document.getElementById("fetchButton")

button.addEventListener('click', () => {
    sampleFetch()
})