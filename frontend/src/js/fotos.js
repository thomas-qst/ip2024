var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { search, insertImageDataToModal, editButtonToSave, clearSelected, selected, clickModalSaveImage } from "./modules/frontendFunctions.js";
import { addImageToAlbum, addTagsToImage, deleteImage, fetchAlbums, saveImage } from "./modules/fetches.js";
import sharedDOMContent from "./modules/sharedDOMDontent.js";
import { getUsername, fetchImages, logout } from "./modules/backendFunctions.js";
let username;
let selectedAlbum = [];
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    sharedDOMContent();
    username = yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
    if (username == "Admin") {
        (_a = document.getElementById("UserManagement")) === null || _a === void 0 ? void 0 : _a.classList.remove("d-none");
    }
    yield fetchImages();
    (_b = document.getElementById("search")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", search);
    (_c = document.getElementById("logout")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        document.cookie = "";
        yield logout();
    }));
    (_d = document.getElementById("upload")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
    }));
    (_e = document.getElementById("upload-modal-dropcontainer")) === null || _e === void 0 ? void 0 : _e.addEventListener("dragover", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const transfer = event.dataTransfer;
        if (transfer != null) {
            transfer.dropEffect = 'copy';
        }
    });
    (_f = document.getElementById("upload-modal-error-button")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", (event) => {
        var _a;
        event.preventDefault();
        (_a = document.getElementById("upload-modal-error")) === null || _a === void 0 ? void 0 : _a.classList.add("d-none");
    });
    (_g = document.getElementById("upload-modal-dropcontainer")) === null || _g === void 0 ? void 0 : _g.addEventListener("drop", dropImage);
    (_h = document.getElementById("upload-modal-close")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => {
        const fileInput = document.getElementById("upload-modal-input");
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title");
        title.value = "";
        const tags = document.getElementById("upload-modal-tags");
        tags.value = "";
    });
    (_j = document.getElementById("upload-modal-submit")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", uploadImage);
    (_k = document.getElementById("image-modal")) === null || _k === void 0 ? void 0 : _k.addEventListener("show.bs.modal", insertImageDataToModal);
    (_l = document.getElementById("image-modal")) === null || _l === void 0 ? void 0 : _l.addEventListener("hide.bs.modal", () => {
        var _a;
        const tagsDiv = document.getElementById("image-modal-tags");
        tagsDiv.innerHTML = "<h3>Tags</h3>";
        const titleDiv = document.getElementById("image-modal-title");
        titleDiv.innerHTML = "<h3>Title</h3>";
        const dateDiv = document.getElementById("image-modal-date");
        dateDiv.innerHTML = "<h3>Date</h3>";
        const button = document.getElementById("image-modal-edit-save");
        if (button !== null) {
            button.id = "image-modal-edit";
            button.classList.remove("btn-success");
            button.classList.add("btn-secondary");
            button.innerText = "Edit";
            (_a = document.getElementById("image-modal-add-tag")) === null || _a === void 0 ? void 0 : _a.remove();
            button.removeEventListener("click", clickModalSaveImage);
            button.addEventListener("click", editButtonToSave);
        }
    });
    (_m = document.getElementById("addToAlbum-modal")) === null || _m === void 0 ? void 0 : _m.addEventListener("show.bs.modal", showAddToAlbum);
    (_o = document.getElementById("image-modal-download")) === null || _o === void 0 ? void 0 : _o.addEventListener("click", (ev) => {
        var _a, _b;
        const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
        const imageType = image.src.split(";")[0].split("/")[1];
        let a = document.createElement("a");
        a.href = image.src;
        a.download = "Image." + imageType;
        a.click();
    });
    (_p = document.getElementById("image-modal-delete")) === null || _p === void 0 ? void 0 : _p.addEventListener("click", deleteImages);
    (_q = document.getElementById("image-modal-edit")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", clickModalEdit);
    function clickModalEdit(ev) {
        editButtonToSave(ev);
    }
    (_r = document.getElementById("deleteMultiple")) === null || _r === void 0 ? void 0 : _r.addEventListener("click", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteImages(ev, true);
    }));
    (_s = document.getElementById("addToAlbum-modal-submit")) === null || _s === void 0 ? void 0 : _s.addEventListener("click", submitAddToAlbum);
}));
/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
function deleteImages(ev, multiple) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        if (multiple === undefined || !multiple) {
            const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
            const imageID = image.alt.split("-")[1];
            try {
                const res = yield deleteImage(imageID);
                if (res.status == 204) {
                    let closeButton = (_c = ev.target.parentElement) === null || _c === void 0 ? void 0 : _c.children[3];
                    closeButton.click();
                    (_d = document.getElementById("imageDiv-" + imageID)) === null || _d === void 0 ? void 0 : _d.remove();
                }
            }
            catch (err) {
                console.error("Failed to delete Image", err);
            }
        }
        else {
            for (const imageID of selected) {
                try {
                    const res = yield deleteImage(imageID);
                    if (res.status == 204) {
                        (_e = document.getElementById("imageDiv-" + imageID)) === null || _e === void 0 ? void 0 : _e.remove();
                    }
                }
                catch (err) {
                    console.error("Failed to delete Image", err);
                }
            }
            clearSelected();
            (_f = document.getElementById("cancelSelect")) === null || _f === void 0 ? void 0 : _f.click();
            (_g = document.getElementById("selectedDiv")) === null || _g === void 0 ? void 0 : _g.classList.add("d-none");
        }
    });
}
/**
 * adds the selected album to the selected Album array
 * @param ev
 */
function addToSelectedAlbums(ev) {
    const splicedString = ev.target.id.split("-");
    const albumID = splicedString[splicedString.length - 1];
    selectedAlbum.push(Number(albumID));
}
/**
 * removes the selected album to the selected Album array
 * @param ev
 */
function removeFromSelectedAlbums(ev) {
    const splicedString = ev.target.id.split("-");
    const albumID = splicedString[splicedString.length - 1];
    const indexOfID = selectedAlbum.indexOf(Number(albumID));
    if (indexOfID > -1) {
        selectedAlbum.splice(indexOfID, 1);
    }
    else {
        console.error("Item not found in Index!");
    }
}
/**
 * Uploads the image and its metadata
 */
function uploadImage() {
    return __awaiter(this, void 0, void 0, function* () {
        const file = document.getElementById("upload-modal-input").files;
        const title = document.getElementById("upload-modal-title").value;
        const tags = document.getElementById("upload-modal-tags").value;
        const errorElement = document.getElementById("upload-modal-error");
        let imageAsText;
        const reader = new FileReader();
        if (file == null) {
            let button = errorElement.firstElementChild;
            errorElement.innerHTML = "";
            errorElement.append(button, "Es wurde keine Datei hochgeladen!");
            errorElement === null || errorElement === void 0 ? void 0 : errorElement.classList.remove("d-none");
            return;
        }
        reader.onload = (event) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            imageAsText = reader.result;
            try {
                const res = yield saveImage(title, imageAsText);
                const data = yield res.json();
                if (res.ok) {
                    const photoID = data.photo_id;
                    if (tags.length != 0) {
                        try {
                            const res = yield addTagsToImage(photoID, tags);
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
        reader.readAsDataURL(file[0]);
    });
}
/**
 * handles the "drop image" feature
 * @param event
 */
function dropImage(event) {
    const fileInput = document.getElementById("upload-modal-input");
    const errorElement = document.getElementById("upload-modal-error");
    if (event.dataTransfer != null) {
        if (event.dataTransfer.files.length > 1) {
            let button = errorElement.firstElementChild;
            errorElement.innerHTML = "";
            errorElement.append(button, "Es ist nur ein Bild Erlaubt pro Upload!");
            errorElement === null || errorElement === void 0 ? void 0 : errorElement.classList.remove("d-none");
            return;
        }
        if (event.dataTransfer.files[0].type.startsWith("image/")) {
            fileInput.files = event.dataTransfer.files;
        }
        else {
            let button = errorElement.firstElementChild;
            errorElement.innerHTML = "";
            errorElement.append(button, "Dateiformat nicht erlaubt! Erlaubte sind nur Bildformate! Zum Beispiel: .png, .jpg, .gif");
            errorElement === null || errorElement === void 0 ? void 0 : errorElement.classList.remove("d-none");
            return;
        }
    }
    event.preventDefault();
}
/**
 * loads all albums from the user and displays them in the add-to-album modal
 */
function showAddToAlbum() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetchAlbums();
            const data = yield res.json();
            if (res.status == 200) {
                const albumData = data.data;
                const container = document.getElementById("addToAlbum-modal-body");
                for (let i = 0; i < albumData.length; i++) {
                    const blankElement = document.getElementById("addToAlbum-modal-blankAlbumElement");
                    let newElement = blankElement.cloneNode(true);
                    newElement.id = albumData[i].album_id.toString();
                    newElement.children[0].id = newElement.children[0].id + "-" + newElement.id;
                    //TOD: add EventListener if checkbox is checked
                    newElement.children[1].htmlFor = newElement.children[1].htmlFor + "-" + newElement.id;
                    newElement.children[2].innerText = albumData[i].title;
                    newElement.children[3].innerText = albumData[i].date.toString();
                    newElement.classList.remove("d-none");
                    (newElement.children[0]).addEventListener("change", (ev) => {
                        if (ev.target.checked) {
                            addToSelectedAlbums(ev);
                        }
                        else {
                            removeFromSelectedAlbums(ev);
                        }
                    });
                    container.appendChild(newElement);
                }
            }
            else if (res.status == 401) {
                window.location.href = "/index.html";
            }
            else {
                console.error("failed to fetch Albums!");
            }
        }
        catch (error) {
            console.error("failed to fetch Albums!");
        }
    });
}
/**
 * adds the images to the selected albums
 */
function submitAddToAlbum() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (let image = 0; image < selected.length; image++) {
                for (let album = 0; album < selectedAlbum.length; album++) {
                    const res = yield addImageToAlbum(selectedAlbum[album], selected[image]);
                    if (res.status != 201) {
                        console.error("Failed to added images to albums");
                        return;
                    }
                }
            }
        }
        catch (error) {
            console.error("Failed to added images to albums");
        }
        for (const ID of selectedAlbum) {
            document.getElementById("addToAlbum-modal-checkbox-" + ID).checked = false;
        }
        selectedAlbum = [];
        document.querySelector("#addToAlbum-modal-close").click();
        document.querySelector('#cancelSelect').click();
    });
}
