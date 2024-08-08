var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { deleteLogin, deleteUser as deleteUserFromBackend, fetchAlbums, fetchImagesFromAlbum, fetchImagesFromPictures, fetchUsername, saveAlbumMetadata, savePictureMetadata } from "./fetches.js";
import { addToSelected, imageDivHover, imageDivLeave, max_ElementDimension, removeFromSelected, resizeImage } from "./frontendFunctions.js";
/**
 * gets the Username stored in the session from the backend and sets the username variable accordingly.
 * If the fetch fails it redirects to the login page.
 * @return Promise<any>
 * @returns empty Promise
 */
export function getUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        if (document.cookie.length == 0) {
            window.location.href = '/index.html';
            return;
        }
        try {
            const res = yield fetchUsername();
            const data = yield res.json();
            if (res.ok) {
                return data.data[0].username;
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
export function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield deleteLogin();
            window.location.href = '/index.html';
        }
        catch (error) {
            console.error('Failed to delete session', error);
            window.location.href = '/index.html';
        }
    });
}
/**
 * fetches the albums from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 */
export function getAlbums() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const res = yield fetchAlbums();
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
export function fetchImages(ev, album) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        let res;
        let data;
        let container;
        let isAlbum = false;
        if (typeof album !== 'undefined' && typeof ev !== 'undefined') {
            isAlbum = true;
            const albumContainer = document.getElementById("albumContainer");
            let albumDivCopy = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
            if (ev.target instanceof SVGPathElement) {
                albumDivCopy = (_c = (_b = ev.target.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement) === null || _c === void 0 ? void 0 : _c.cloneNode(true);
            }
            const pageElements = albumContainer.children;
            while (pageElements.length > 2) {
                pageElements[2].remove();
            }
            const albumNameDiv = document.getElementById("albumName");
            albumNameDiv.classList.remove("d-none");
            albumNameDiv.children[1].innerText = albumDivCopy.children[2].children[0].innerText;
            albumNameDiv.children[1].id = "albumID-" + albumDivCopy.children[2].id.split("-")[1];
            try {
                res = yield fetchImagesFromAlbum(album);
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
                res = yield fetchImagesFromPictures();
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
                let divCopy = (_d = document.getElementById("BlankImageDiv")) === null || _d === void 0 ? void 0 : _d.cloneNode(true);
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
 * deletes the user
 * @param ev
 */
export function deleteUser(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const username = ev.target.id.split("-")[3];
        try {
            let res = yield deleteUserFromBackend(username);
            if (res.status == 204) {
                (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.remove();
            }
        }
        catch (e) {
            console.error("Failed to delete user, " + e);
        }
    });
}
/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
export function saveMetadata(ev, album) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let type = "image";
        if (album) {
            type = "album";
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
            let res;
            if (album) {
                res = yield saveAlbumMetadata(id, title, date, tag);
            }
            else {
                res = yield savePictureMetadata(id, title, date, tag);
            }
            if (res.status == 201) {
                window.location.reload();
            }
        }
        catch (err) {
            console.error("Unable to save Metadata");
        }
    });
}
