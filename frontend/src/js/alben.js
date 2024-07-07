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
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
    if (username == "Admin") {
        (_a = document.getElementById("UserManagement")) === null || _a === void 0 ? void 0 : _a.classList.remove("d-none");
    }
    yield fetchAlbums();
    (_b = document.getElementById("logout")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        document.cookie = "";
        yield logout();
    }));
    (_c = document.getElementById("add-modal-submit")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _k, _l;
        event.preventDefault();
        const title = document.getElementById("upload-modal-title").value;
        const tags = document.getElementById("upload-modal-tags").value;
        try {
            const res = yield fetch("http://localhost:8888/albums", {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ "title": title })
            });
            const data = yield res.json();
            if (res.ok) {
                const albumId = data.album_id;
                if (tags.length != 0) {
                    try {
                        const res = yield fetch("http://localhost:8888/tags/albums/" + albumId, {
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
                            (_k = document.getElementById("upload-modal-close")) === null || _k === void 0 ? void 0 : _k.click();
                            window.location.reload();
                        }
                    }
                    catch (error) {
                        console.error("Failed to upload Tags", error);
                    }
                }
                else {
                    (_l = document.getElementById("upload-modal-close")) === null || _l === void 0 ? void 0 : _l.click();
                    window.location.reload();
                }
            }
        }
        catch (error) {
            console.error("Failed to upload Image", error);
        }
    }));
    (_d = document.getElementById("deleteMultiple")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteAlbum(ev, true);
    }));
    (_e = document.getElementById("album-modal")) === null || _e === void 0 ? void 0 : _e.addEventListener("show.bs.modal", (event) => {
        var _a, _b;
        const ev = event;
        const imageDiv = ev.relatedTarget.parentElement;
        const metadata = imageDiv.children[3];
        const img = (_b = (_a = ev.relatedTarget.previousElementSibling) === null || _a === void 0 ? void 0 : _a.previousElementSibling) === null || _b === void 0 ? void 0 : _b.previousElementSibling;
        console.log(img);
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
    });
    (_f = document.getElementById("album-modal")) === null || _f === void 0 ? void 0 : _f.addEventListener("hide.bs.modal", (ev) => {
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
            button.removeEventListener("click", saveMetadata);
            button.addEventListener("click", clickModalEdit);
        }
    });
    (_g = document.getElementById("album-modal-edit")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", clickModalEdit);
    function clickModalEdit(ev) {
        editButtonToSave(ev, true);
    }
    (_h = document.getElementById("album-modal-delete")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", deleteAlbum);
    (_j = document.getElementById("image-modal")) === null || _j === void 0 ? void 0 : _j.addEventListener("show.bs.modal", insertImageDataToModal);
}));
/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
function deleteAlbum(ev, multiple) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (multiple === undefined || !multiple) {
            const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
            const albumId = image.alt.split("-")[1];
            console.log(albumId);
            try {
                const res = yield fetch("http://localhost:8888/albums/" + albumId, {
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
                    (_d = document.getElementById("albumDiv-" + albumId)) === null || _d === void 0 ? void 0 : _d.remove();
                }
            }
            catch (err) {
                console.error("Failed to delete Album", err);
            }
        }
        else {
            for (const albumId of selected) {
                try {
                    const res = yield fetch("http://localhost:8888/albums/" + albumId, {
                        method: 'delete',
                        mode: 'cors',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        credentials: "include"
                    });
                    const data = yield res.json();
                    if (res.status == 200) {
                        (_e = document.getElementById("albumDiv-" + albumId)) === null || _e === void 0 ? void 0 : _e.remove();
                    }
                }
                catch (err) {
                    console.error("Failed to delete Album", err);
                }
            }
            selected = [];
            (_f = document.getElementById("selectedDiv")) === null || _f === void 0 ? void 0 : _f.classList.add("d-none");
        }
    });
}
