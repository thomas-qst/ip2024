"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let username;
let selected = [];
const max_ElementDimension = 15;
/**
 * gets the Username stored in the session from the backend and sets the username variable accordingly.
 * If the fetch fails it redirects to the login page.
 * @return Promise<void>
 * @returns empty Promise
 */
function getUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        if (document.cookie.length == 0) {
            window.location.href = '/index.html';
            return;
        }
        try {
            const res = yield fetch("http://localhost:8888/login/username", {
                method: 'get',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            const data = yield res.json();
            if (res.ok) {
                username = data.data[0].username;
            }
            else {
                window.location.href = '/index.html';
            }
        }
        catch (error) {
            console.error('Failed to fetch username', error);
            window.location.href = '/index.html';
        }
    });
}
/**
 * function to delete the session from front and backend.
 * Redirects to index page after deletion.
 *
 * @return Promise<void>
 * @returns empty Promise
 */
function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch("http://localhost:8888/login", {
                method: 'delete',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            window.location.href = '/index.html';
        }
        catch (error) {
            console.error('Failed to delete session', error);
            window.location.href = '/index.html';
        }
    });
}
/**
 * removes the d-none class of the label and the title.
 *
 * @param ev
 * @param {boolean}[album]
 */
function imageDivHover(ev, album) {
    let target = ev.target;
    let label = target.children[0].children[1];
    let title = target.children[2];
    if (album === undefined || !album) {
        title.classList.remove("d-none");
    }
    label.classList.remove("d-none");
}
/**
 * Sets the display of the title div to none and the label if the checkbox is unchecked
 *
 * @param ev
 * @param {boolean}[album]
 */
function imageDivLeave(ev, album) {
    let target = ev.target;
    let label = target.children[0].children[1];
    let input = target.children[0].children[0];
    let title = target.children[2];
    if (album === undefined || !album) {
        title.classList.add("d-none");
    }
    if (!input.checked) {
        label.classList.add("d-none");
    }
}
function fetchAlbums() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const res = yield fetch("http://localhost:8888/albums", {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            const data = yield res.json();
            if (res.status == 401) {
                window.location.href = "/index.html";
            }
            else if (res.status == 200) {
                let array = data.data;
                const container = document.getElementById("albumContainer");
                for (let i = 0; i < array.length; i++) {
                    let divCopy = (_a = document.getElementById("BlankAlbumDiv")) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
                    divCopy.id = "albumDiv-" + array[i].album_id;
                    divCopy.setAttribute("style", "height: " + (max_ElementDimension + 1) + "rem; width:" + (max_ElementDimension + 1) + "rem;");
                    container.appendChild(divCopy);
                    divCopy = document.getElementById("albumDiv-" + array[i].album_id);
                    divCopy.addEventListener("mouseenter", (ev) => {
                        imageDivHover(ev, true);
                    });
                    divCopy.addEventListener("mouseleave", (ev) => {
                        imageDivLeave(ev, true);
                    });
                    let svg = divCopy.children[1];
                    svg.id = "album-" + array[i].album_id;
                    svg.addEventListener("click", (ev) => {
                        fetchImages(ev, array[i].album_id.toString());
                    });
                    let mainDiv = divCopy.children[2];
                    mainDiv.id = "mainDiv-" + array[i].album_id;
                    let buttonDiv = divCopy.children[0];
                    let button = buttonDiv.children[0];
                    let buttonLable = buttonDiv.children[1];
                    button.id = "checkboxButton-" + array[i].album_id;
                    button.addEventListener("change", (ev) => {
                        if (button.checked) {
                            addToSelected(ev);
                        }
                        else {
                            removeFromSelected(ev);
                        }
                    });
                    buttonLable.htmlFor = button.id;
                    let metadataDiv = divCopy.children[3];
                    metadataDiv.id = "albumMetadata-" + array[i].album_id;
                    const title = array[i].title;
                    const date = array[i].date;
                    metadataDiv.children[1].innerText = date.toString();
                    metadataDiv.children[0].innerText = title;
                    let metadataTags = metadataDiv.children[2];
                    array[i].tags.forEach(tag => {
                        let p = document.createElement("p");
                        p.innerText = tag;
                        metadataTags.append(p);
                    });
                    let titlep = document.createElement("p");
                    titlep.innerText = title;
                    let datep = document.createElement("p");
                    let editSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    editSVG.setAttribute("width", "32");
                    editSVG.setAttribute("height", "32");
                    editSVG.setAttribute("fill", "currentColor");
                    editSVG.classList.add("bi", "bi-pencil");
                    editSVG.setAttribute("viewBox", "0 0 16 16");
                    editSVG.setAttribute("data-bs-toggle", "modal");
                    editSVG.setAttribute("data-bs-target", "#album-modal");
                    editSVG.classList.add("position-relative");
                    editSVG.setAttribute("style", "top: -47%; left: 80%;");
                    let editPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    editPath.setAttribute("d", "M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325");
                    editSVG.append(editPath);
                    datep.innerText = date.toString();
                    mainDiv.append(titlep, datep);
                    divCopy.append(editSVG);
                    resizeImage(divCopy.children[1], false);
                    divCopy.classList.remove("d-none");
                }
            }
        }
        catch (err) {
            console.error('Failed to fetch album', err);
        }
    });
}
/**
 * fetches the images from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 * If the album param is set it only fetches the images contained on the album.
 *
 * @param {Event} [ev]
 * @param {String} [album]
 * @return Promise<void>
 * @returns empty promise
 */
function fetchImages(ev, album) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let res;
        let data;
        let container;
        let isAlbum = false;
        if (typeof album !== 'undefined' && typeof ev !== 'undefined') {
            isAlbum = true;
            const albumContainer = document.getElementById("albumContainer");
            const pageElements = albumContainer.children;
            while (pageElements.length > 2) {
                pageElements[2].remove();
            }
            const albumNameDiv = document.getElementById("albumName");
            albumNameDiv.classList.remove("d-none");
            albumNameDiv.children[1].innerText = ((_a = ev.target.nextElementSibling) === null || _a === void 0 ? void 0 : _a.children[0]).innerText;
            albumNameDiv.children[1].id = "albumID-" + ev.target.nextElementSibling.id.split("-")[1];
            try {
                res = yield fetch(`http://localhost:8888/albums/${album}`, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                data = yield res.json();
            }
            catch (error) {
                console.error('Failed to fetch images', error);
                return;
            }
            container = document.getElementById("albumContainer");
        }
        else {
            try {
                res = yield fetch("http://localhost:8888/pictures", {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                data = yield res.json();
            }
            catch (error) {
                console.error('Failed to fetch images', error);
                return;
            }
            container = document.getElementById("imageContainer");
        }
        if (res.status === 401) {
            window.location.href = '/index.html';
        }
        else if (res.status == 200) {
            let array = data.data;
            for (let i = 0; i < array.length; i++) {
                let divCopy = (_b = document.getElementById("BlankImageDiv")) === null || _b === void 0 ? void 0 : _b.cloneNode(true);
                divCopy.id = "imageDiv-" + array[i].photo_id;
                container.appendChild(divCopy);
                divCopy = document.getElementById("imageDiv-" + array[i].photo_id);
                divCopy.addEventListener("mouseenter", imageDivHover);
                divCopy.addEventListener("mouseleave", imageDivLeave);
                divCopy.setAttribute("style", "height: " + (max_ElementDimension + 1) + "rem; width:" + (max_ElementDimension + 1) + "rem;");
                let imageCopy = divCopy.children[1];
                imageCopy.id = "image-" + array[i].photo_id;
                imageCopy.src = array[i].photo;
                let buttonDiv = divCopy.children[0];
                let button = buttonDiv.children[0];
                let buttonLable = buttonDiv.children[1];
                button.id = "checkboxButton-" + array[i].photo_id;
                button.addEventListener("change", (ev) => {
                    if (button.checked) {
                        addToSelected(ev);
                    }
                    else {
                        removeFromSelected(ev);
                    }
                });
                buttonLable.htmlFor = button.id;
                if (isAlbum) {
                    buttonDiv.classList.add("d-none");
                }
                let metadataDiv = divCopy.children[2];
                metadataDiv.id = "imageMetadata-" + array[i].photo_id;
                metadataDiv.children[1].innerText = array[i].date.toString();
                metadataDiv.children[0].innerText = array[i].title.toString();
                let metadataTags = metadataDiv.children[2];
                array[i].tags.forEach(tag => {
                    let p = document.createElement("p");
                    p.innerText = tag;
                    metadataTags.append(p);
                });
                divCopy.classList.remove("d-none");
                resizeImage(imageCopy, true);
            }
        }
    });
}
/**
 * Resizes the given ImageElement to the max_ElementDimension specified in the function. (uses rem)
 *
 * @param imageElement
 * @param image
 */
function resizeImage(imageElement, image) {
    if (image) {
        let height = imageElement.height;
        let width = imageElement.width;
        if (height > width) {
            imageElement.style.height = `${max_ElementDimension}rem`;
        }
        else {
            imageElement.style.width = `${max_ElementDimension}rem`;
        }
    }
    else {
        imageElement.style.width = `${max_ElementDimension}rem`;
        imageElement.style.height = `${max_ElementDimension}rem`;
    }
}
/**
 * adds the selected Element to the selected array.
 * @param ev
 */
function addToSelected(ev) {
    const selectedDiv = document.getElementById("selectedDiv");
    selectedDiv.classList.remove("d-none");
    const imageId = ev.target.id.split("-")[1];
    selected.push(Number(imageId));
}
/**
 * removes the Element from the selected array.
 * @param ev
 */
function removeFromSelected(ev) {
    var _a;
    const imageId = ev.target.id.split("-")[1];
    const indexOfId = selected.indexOf(Number(imageId));
    if (indexOfId > -1) {
        selected.splice(indexOfId, 1);
    }
    else {
        console.error("Item not found in Index!");
    }
    if (selected.length == 0) {
        (_a = document.getElementById("selectedDiv")) === null || _a === void 0 ? void 0 : _a.classList.add("d-none");
    }
}
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c, _d;
    (_a = document.getElementById("cancelSelect")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (ev) => {
        var _a, _b;
        for (const ID of selected) {
            document.getElementById("checkboxButton-" + ID).checked = false;
            ((_a = document.getElementById("checkboxButton-" + ID)) === null || _a === void 0 ? void 0 : _a.nextElementSibling).classList.add("d-none");
        }
        selected = [];
        (_b = document.getElementById("selectedDiv")) === null || _b === void 0 ? void 0 : _b.classList.add("d-none");
    });
    (_b = document.getElementById("userManagement-modal")) === null || _b === void 0 ? void 0 : _b.addEventListener("show.bs.modal", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser");
        try {
            let res = yield fetch("http://localhost:8888/users", {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = yield res.json();
            if (res.status == 200) {
                console.log(data.data);
                for (let i = 0; i < data.data.length; i++) {
                    const username = data.data[i].username;
                    let modalBody = blankDiv.parentElement;
                    let newDiv = blankDiv.cloneNode(true);
                    let rowDiv = newDiv.children[0];
                    newDiv.id = "userManagement-modal-" + username;
                    rowDiv.children[0].innerText = username;
                    rowDiv.children[2].id = "userManagement-modal-delete-" + username;
                    rowDiv.children[2].addEventListener("click", deleteUser);
                    newDiv.classList.remove("d-none");
                    modalBody.append(newDiv);
                }
            }
        }
        catch (e) {
            console.error("failed to fetch users, " + e);
        }
    }));
    (_c = document.getElementById("userManagement-modal")) === null || _c === void 0 ? void 0 : _c.addEventListener("hide.bs.modal", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser");
        const formDiv = document.getElementById("userManagement-modal-addUserForm");
        let parentDiv = blankDiv.parentElement;
        parentDiv.innerHTML = "";
        parentDiv.append(formDiv, blankDiv);
    }));
    (_d = document.getElementById("userManagement-modal-addUserForm")) === null || _d === void 0 ? void 0 : _d.addEventListener("submit", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        ev.preventDefault();
        const username = document.getElementById("userManagement-modal-addUserForm-Username").value;
        const password = document.getElementById("userManagement-modal-addUserForm-Password").value;
        document.getElementById("userManagement-modal-addUserForm-Username").value = "";
        document.getElementById("userManagement-modal-addUserForm-Password").value = "";
        try {
            let res = yield fetch("http://localhost:8888/users", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ "username": username, "password": password })
            });
            let data = yield res.json();
            if (res.status == 201) {
                (_e = document.getElementById("userManagement-modal-close")) === null || _e === void 0 ? void 0 : _e.click();
            }
        }
        catch (e) {
            console.error("failed to add user, " + e);
        }
    }));
});
function deleteUser(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const username = ev.target.id.split("-")[3];
        try {
            let res = yield fetch("http://localhost:8888/users/" + username, {
                method: 'delete',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = yield res.json();
            if (res.status == 200) {
                (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.remove();
            }
        }
        catch (e) {
            console.error("Failed to delete user, " + e);
        }
    });
}
function clickModalEditImage(ev) {
    editButtonToSave(ev);
}
function clickModalEditAlbum(ev) {
    editButtonToSave(ev, true);
}
function clickModalSaveAlbum(ev) {
    saveMetadata(ev, true);
}
function clickModalSaveImage(ev) {
    saveMetadata(ev);
}
/**
 * Changes the edit button of the image modal to Save and changes elements to contentEditable plaintext-only.
 * Also add extra input to add tag.
 *
 * @param ev
 * @param {boolean}[album]
 */
function editButtonToSave(ev, album) {
    var _a, _b;
    let type = "image";
    if (album) {
        type = "album";
    }
    const button = ev.target;
    button.id = type + "-modal-edit-save";
    button.classList.remove("btn-secondary");
    button.classList.add("btn-success");
    button.innerText = "Save";
    if (album) {
        button.addEventListener("click", clickModalSaveAlbum);
        button.removeEventListener("click", clickModalEditAlbum);
    }
    else {
        button.addEventListener("click", clickModalSaveImage);
        button.removeEventListener("click", clickModalEditImage);
    }
    const body = (_a = button.parentElement) === null || _a === void 0 ? void 0 : _a.previousElementSibling;
    console.log(body);
    console.log(button);
    console.log(button.parentElement);
    console.log((_b = button.parentElement) === null || _b === void 0 ? void 0 : _b.previousElementSibling);
    const title = body.children[1].children[1];
    title.contentEditable = "plaintext-only";
    const date = body.children[2].children[1];
    date.contentEditable = "plaintext-only";
    const tags = body.children[3];
    for (let i = 1; i < tags.children.length; i++) {
        let child = tags.children[i];
        if (child !== undefined) {
            child.contentEditable = "plaintext-only";
        }
    }
    let addTagForm = document.createElement("form");
    let addTagInput = document.createElement("input");
    let addTagButton = document.createElement("button");
    let addTagLabel = document.createElement("label");
    addTagButton.id = type + "-modal-add-tag-button";
    addTagInput.id = type + "-modal-add-tag-input";
    addTagForm.id = type + "-modal-add-tag";
    addTagForm.classList.add("form-floating");
    addTagLabel.htmlFor = addTagInput.id;
    addTagLabel.innerText = "Tag";
    addTagButton.classList.add("btn", "btn-success", "mx-2");
    addTagButton.innerText = "Add Tag";
    addTagButton.type = "submit";
    addTagInput.type = "text";
    addTagInput.classList.add("form-control");
    addTagInput.style.width = "20%";
    addTagInput.style.display = "inline";
    addTagInput.placeholder = "Tag";
    addTagForm.append(addTagInput, addTagLabel, addTagButton);
    body.append(addTagForm);
    if (album) {
        addTagForm.addEventListener("submit", addTagAlbum);
    }
    else {
        addTagForm.addEventListener("submit", addTagImage);
    }
}
function addTagImage(ev) {
    addTag(ev);
}
function addTagAlbum(ev) {
    addTag(ev, true);
}
function addTag(ev, album) {
    let type = "image";
    if (album) {
        type = "album";
    }
    ev.preventDefault();
    const tagToAdd = document.getElementById(type + "-modal-add-tag-input").value;
    const tagsDiv = document.getElementById(type + "-modal-tags");
    const para = document.createElement("p");
    para.contentEditable = "plaintext-only";
    para.innerHTML = tagToAdd;
    tagsDiv.appendChild(para);
    document.getElementById(type + "-modal-add-tag-input").value = "";
}
/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
function saveMetadata(ev, album) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let type = "image";
        let url = "http://localhost:8888/pictures/";
        if (album) {
            type = "album";
            url = "http://localhost:8888/albums/";
        }
        const title = ((_a = document.getElementById(type + "-modal-title")) === null || _a === void 0 ? void 0 : _a.children[1]).innerText;
        const date = ((_b = document.getElementById(type + "-modal-date")) === null || _b === void 0 ? void 0 : _b.children[1]).innerText;
        const tagsCollection = document.getElementById(type + "-modal-tags").children;
        const id = document.getElementById(type + "-modal-image").alt.split("-")[1];
        let tag = "";
        for (let i = 1; i < tagsCollection.length; i++) {
            let text = tagsCollection[i].innerText;
            text = text.trim();
            if (text.length > 0) {
                tag += (tagsCollection[i].innerText + " ");
            }
        }
        tag = tag.trim();
        try {
            const res = yield fetch(url + id, {
                method: 'put',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ "title": title, "date": date, "tags": tag })
            });
            const data = yield res.json();
            if (res.status == 200) {
                window.location.reload();
            }
        }
        catch (err) {
            console.error("Unable to save Metadata");
        }
    });
}
/**
 * Gets the image data from the event context and inserts it to the Image Modal
 * @param event
 */
function insertImageDataToModal(event) {
    const ev = event;
    const imageDiv = ev.relatedTarget.parentElement;
    const img = ev.relatedTarget;
    const metadata = imageDiv.children[2];
    const modalTags = document.getElementById("image-modal-tags");
    let modalImage = document.getElementById("image-modal-image");
    modalImage.src = img.src;
    modalImage.alt = img.id;
    let modalTitle = document.getElementById("image-modal-title");
    modalTitle.append(document.createElement("p"));
    modalTitle.children[1].textContent = metadata.children[0].innerHTML;
    let modalDate = document.getElementById("image-modal-date");
    modalDate.append(document.createElement("p"));
    modalDate.children[1].textContent = metadata.children[1].innerHTML;
    modalTags.innerHTML = modalTags.innerHTML + metadata.children[2].innerHTML;
}
