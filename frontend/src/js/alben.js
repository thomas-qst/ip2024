var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { insertImageDataToModal, search, editButtonToSave, selected, clearSelected, clickModalSaveAlbum } from "./modules/frontendFunctions.js";
import sharedDOMContent from "./modules/sharedDOMDontent.js";
import { addAlbum as addAlbumToBackend, addTagsToAlbum, removeFromAlbum, deleteAlbum as deleteAlbumFromBackend } from "./modules/fetches.js";
import { getUsername, getAlbums, logout } from "./modules/backendFunctions.js";
let username;
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    sharedDOMContent();
    username = yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
    if (username == "Admin") {
        (_a = document.getElementById("UserManagement")) === null || _a === void 0 ? void 0 : _a.classList.remove("d-none");
    }
    yield getAlbums();
    (_b = document.getElementById("albumSearch")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", search);
    (_c = document.getElementById("logout")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        document.cookie = "";
        yield logout();
    }));
    (_d = document.getElementById("add-modal-submit")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", addAlbum);
    (_e = document.getElementById("deleteMultiple")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteAlbum(ev, true);
    }));
    (_f = document.getElementById("album-modal")) === null || _f === void 0 ? void 0 : _f.addEventListener("show.bs.modal", showAlbumModal);
    (_g = document.getElementById("album-modal")) === null || _g === void 0 ? void 0 : _g.addEventListener("hide.bs.modal", hideAlbumModal);
    (_h = document.getElementById("album-modal-edit")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", clickModalEdit);
    (_j = document.getElementById("album-modal-delete")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", deleteAlbum);
    (_k = document.getElementById("image-modal")) === null || _k === void 0 ? void 0 : _k.addEventListener("show.bs.modal", insertImageDataToModal);
    (_l = document.getElementById("album-back-button")) === null || _l === void 0 ? void 0 : _l.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        let albumContainer = document.getElementById("albumContainer");
        const blankImageDiv = albumContainer.children[0].cloneNode(true);
        const blankAlbumDiv = albumContainer.children[1].cloneNode(true);
        albumContainer.innerHTML = "";
        albumContainer.append(blankImageDiv, blankAlbumDiv);
        const albumName = document.getElementById("albumName");
        albumName.children[1].innerHTML = "";
        albumName.classList.add("d-none");
        yield getAlbums();
    }));
    (_m = document.getElementById("image-modal-removeFromAlbum")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        var _o, _p, _q;
        const imageID = document.getElementById("image-modal-image").alt.split("-")[1];
        const albumID = ((_o = document.getElementById("albumName")) === null || _o === void 0 ? void 0 : _o.children[1]).id.split("-")[1];
        try {
            const res = yield removeFromAlbum(albumID, imageID);
            if (res.ok) {
                (_p = document.getElementById("image-modal-close")) === null || _p === void 0 ? void 0 : _p.click();
                (_q = document.getElementById("imageDiv-" + imageID)) === null || _q === void 0 ? void 0 : _q.remove();
            }
        }
        catch (e) {
            console.error("Failed to remove Image from Album", e);
        }
    }));
}));
/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
function deleteAlbum(ev, multiple) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        if (multiple === undefined || !multiple) {
            const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
            const albumID = image.alt.split("-")[1];
            try {
                const res = yield deleteAlbumFromBackend(albumID);
                if (res.status == 204) {
                    let closeButton = (_c = ev.target.parentElement) === null || _c === void 0 ? void 0 : _c.children[2];
                    closeButton.click();
                    (_d = document.getElementById("albumDiv-" + albumID)) === null || _d === void 0 ? void 0 : _d.remove();
                }
            }
            catch (err) {
                console.error("Failed to delete Album", err);
            }
        }
        else {
            for (const albumID of selected) {
                try {
                    const res = yield deleteAlbumFromBackend(albumID);
                    if (res.status == 204) {
                        (_e = document.getElementById("albumDiv-" + albumID)) === null || _e === void 0 ? void 0 : _e.remove();
                    }
                }
                catch (err) {
                    console.error("Failed to delete Album", err);
                }
            }
            clearSelected();
            (_f = document.getElementById("selectedDiv")) === null || _f === void 0 ? void 0 : _f.classList.add("d-none");
        }
    });
}
/**
 * uploads the album and its metadata
 * @param event
 */
function addAlbum(event) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const title = document.getElementById("upload-modal-title").value;
        const tags = document.getElementById("upload-modal-tags").value;
        try {
            const res = yield addAlbumToBackend(title);
            const data = yield res.json();
            if (res.ok) {
                const albumID = data.album_id;
                if (tags.length != 0) {
                    try {
                        const res = yield addTagsToAlbum(albumID, tags);
                        if (res.ok) {
                            (_a = document.getElementById("upload-modal-close")) === null || _a === void 0 ? void 0 : _a.click();
                            window.location.reload();
                        }
                    }
                    catch (error) {
                        console.error("Failed to upload Tags", error);
                    }
                }
                else {
                    (_b = document.getElementById("upload-modal-close")) === null || _b === void 0 ? void 0 : _b.click();
                    window.location.reload();
                }
            }
        }
        catch (error) {
            console.error("Failed to upload Image", error);
        }
    });
}
/**
 * sets the album modal to the data of the clicked album
 * @param event
 */
function showAlbumModal(event) {
    var _a, _b;
    const ev = event;
    const imageDiv = ev.relatedTarget.parentElement;
    const metadata = imageDiv.children[3];
    const img = (_b = (_a = ev.relatedTarget.previousElementSibling) === null || _a === void 0 ? void 0 : _a.previousElementSibling) === null || _b === void 0 ? void 0 : _b.previousElementSibling;
    const modalTags = document.getElementById("album-modal-tags");
    let modalImage = document.getElementById("album-modal-image");
    modalImage.alt = img.id;
    let modalTitle = document.getElementById("album-modal-title");
    modalTitle.append(document.createElement("p"));
    modalTitle.children[1].textContent = metadata.children[0].innerHTML;
    let modalDate = document.getElementById("album-modal-date");
    modalDate.append(document.createElement("p"));
    modalDate.children[1].textContent = metadata.children[1].innerHTML;
    modalTags.innerHTML = modalTags.innerHTML + metadata.children[2].innerHTML;
}
/**
 * clears the album modal
 */
function hideAlbumModal() {
    var _a;
    const tagsDiv = document.getElementById("album-modal-tags");
    tagsDiv.innerHTML = "<h3>Tags</h3>";
    const titleDiv = document.getElementById("album-modal-title");
    titleDiv.innerHTML = "<h3>Title</h3>";
    const dateDiv = document.getElementById("album-modal-date");
    dateDiv.innerHTML = "<h3>Date</h3>";
    const button = document.getElementById("album-modal-edit-save");
    if (button !== null) {
        button.id = "album-modal-edit";
        button.classList.remove("btn-success");
        button.classList.add("btn-secondary");
        button.innerText = "Edit";
        (_a = document.getElementById("album-modal-add-tag")) === null || _a === void 0 ? void 0 : _a.remove();
        button.removeEventListener("click", clickModalSaveAlbum);
        button.addEventListener("click", clickModalEdit);
    }
}
/**
 * sets the 2. variable of editButtonToSave for album
 * @param ev
 */
function clickModalEdit(ev) {
    editButtonToSave(ev, true);
}
