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
let selectedAlbum = [];
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    yield getUsername();
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
    (_g = document.getElementById("upload-modal-dropcontainer")) === null || _g === void 0 ? void 0 : _g.addEventListener("drop", (event) => {
        const fileInput = document.getElementById("upload-modal-input");
        const errorElement = document.getElementById("upload-modal-error");
        if (event.dataTransfer != null) {
            let alert = false;
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
            console.log(event.dataTransfer.files);
        }
        event.preventDefault();
    });
    (_h = document.getElementById("upload-modal-close")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => {
        const fileInput = document.getElementById("upload-modal-input");
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title");
        title.value = "";
        const tags = document.getElementById("upload-modal-tags");
        tags.value = "";
    });
    (_j = document.getElementById("upload-modal-input")) === null || _j === void 0 ? void 0 : _j.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    }));
    (_k = document.getElementById("upload-modal-submit")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
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
        reader.onload = (event) => __awaiter(void 0, void 0, void 0, function* () {
            var _u, _v;
            imageAsText = reader.result;
            try {
                const res = yield fetch("http://localhost:8888/pictures", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ "title": title, "photo": imageAsText })
                });
                const data = yield res.json();
                if (res.ok) {
                    const photoID = data.photo_id;
                    if (tags.length != 0) {
                        try {
                            const res = yield fetch("http://localhost:8888/tags/pictures/" + photoID, {
                                method: "put",
                                mode: "cors",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                credentials: "include",
                                body: JSON.stringify({ "tags": tags })
                            });
                            const data = yield res.json();
                            if (res.ok) {
                                (_u = document.getElementById("upload-modal-close")) === null || _u === void 0 ? void 0 : _u.click();
                                window.location.reload();
                            }
                        }
                        catch (error) {
                            console.error("Failed to upload Tags", error);
                        }
                    }
                    else {
                        (_v = document.getElementById("upload-modal-close")) === null || _v === void 0 ? void 0 : _v.click();
                        window.location.reload();
                    }
                }
            }
            catch (error) {
                console.error("Failed to upload Image", error);
            }
        });
        reader.readAsDataURL(file[0]);
    }));
    (_l = document.getElementById("image-modal")) === null || _l === void 0 ? void 0 : _l.addEventListener("show.bs.modal", insertImageDataToModal);
    (_m = document.getElementById("image-modal")) === null || _m === void 0 ? void 0 : _m.addEventListener("hide.bs.modal", (ev) => {
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
            button.removeEventListener("click", saveMetadata);
            button.addEventListener("click", editButtonToSave);
        }
    });
    (_o = document.getElementById("addToAlbum-modal")) === null || _o === void 0 ? void 0 : _o.addEventListener("show.bs.modal", (event) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Added to Album: ", event);
        try {
            const res = yield fetch("http://localhost:8888/albums", {
                method: "GET",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });
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
    }));
    (_p = document.getElementById("image-modal-download")) === null || _p === void 0 ? void 0 : _p.addEventListener("click", (ev) => {
        var _a, _b;
        const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
        const imageType = image.src.split(";")[0].split("/")[1];
        let a = document.createElement("a");
        a.href = image.src;
        a.download = "Image." + imageType;
        a.click();
    });
    (_q = document.getElementById("image-modal-delete")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", deleteImages);
    (_r = document.getElementById("image-modal-edit")) === null || _r === void 0 ? void 0 : _r.addEventListener("click", clickModalEdit);
    function clickModalEdit(ev) {
        editButtonToSave(ev);
    }
    (_s = document.getElementById("deleteMultiple")) === null || _s === void 0 ? void 0 : _s.addEventListener("click", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteImages(ev, true);
    }));
    (_t = document.getElementById("addToAlbum-modal-submit")) === null || _t === void 0 ? void 0 : _t.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            for (let image = 0; image < selected.length; image++) {
                for (let album = 0; album < selectedAlbum.length; album++) {
                    const res = yield fetch("http://localhost:8888/albums/" + selectedAlbum[album] + "/" + selected[image], {
                        method: "PATCH",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include",
                    });
                    const data = yield res.json();
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
    }));
}));
/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
function deleteImages(ev, multiple) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (multiple === undefined || !multiple) {
            const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
            const imageId = image.alt.split("-")[1];
            console.log(imageId);
            try {
                const res = yield fetch("http://localhost:8888/pictures/" + imageId, {
                    method: 'delete',
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                const data = yield res.json();
                if (res.status == 200) {
                    let closeButton = (_c = ev.target.parentElement) === null || _c === void 0 ? void 0 : _c.children[3];
                    closeButton.click();
                    (_d = document.getElementById("imageDiv-" + imageId)) === null || _d === void 0 ? void 0 : _d.remove();
                }
            }
            catch (err) {
                console.error("Failed to delete Image", err);
            }
        }
        else {
            for (const imageId of selected) {
                try {
                    const res = yield fetch("http://localhost:8888/pictures/" + imageId, {
                        method: 'delete',
                        mode: 'cors',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include"
                    });
                    const data = yield res.json();
                    if (res.status == 200) {
                        (_e = document.getElementById("imageDiv-" + imageId)) === null || _e === void 0 ? void 0 : _e.remove();
                    }
                }
                catch (err) {
                    console.error("Failed to delete Image", err);
                }
            }
            selected = [];
            (_f = document.getElementById("selectedDiv")) === null || _f === void 0 ? void 0 : _f.classList.add("d-none");
        }
    });
}
function addToSelectedAlbums(ev) {
    const splicedString = ev.target.id.split("-");
    const albumId = splicedString[splicedString.length - 1];
    selectedAlbum.push(Number(albumId));
}
function removeFromSelectedAlbums(ev) {
    const splicedString = ev.target.id.split("-");
    const albumId = splicedString[splicedString.length - 1];
    const indexOfId = selectedAlbum.indexOf(Number(albumId));
    if (indexOfId > -1) {
        selectedAlbum.splice(indexOfId, 1);
    }
    else {
        console.error("Item not found in Index!");
    }
}
