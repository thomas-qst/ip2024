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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
    yield fetchImages();
    (_a = document.getElementById("logout")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        document.cookie = "";
        yield logout();
    }));
    (_b = document.getElementById("upload")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
    }));
    (_c = document.getElementById("upload-modal-dropcontainer")) === null || _c === void 0 ? void 0 : _c.addEventListener("dragover", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const transfer = event.dataTransfer;
        if (transfer != null) {
            transfer.dropEffect = 'copy';
        }
    });
    (_d = document.getElementById("upload-modal-error-button")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (event) => {
        var _a;
        event.preventDefault();
        (_a = document.getElementById("upload-modal-error")) === null || _a === void 0 ? void 0 : _a.classList.add("d-none");
    });
    (_e = document.getElementById("upload-modal-dropcontainer")) === null || _e === void 0 ? void 0 : _e.addEventListener("drop", (event) => {
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
    (_f = document.getElementById("upload-modal-close")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
        const fileInput = document.getElementById("upload-modal-input");
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title");
        title.value = "";
        const tags = document.getElementById("upload-modal-tags");
        tags.value = "";
    });
    (_g = document.getElementById("upload-modal-input")) === null || _g === void 0 ? void 0 : _g.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    }));
    (_h = document.getElementById("upload-modal-submit")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
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
            var _r, _s;
            imageAsText = reader.result;
            try {
                console.log(imageAsText);
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
                                (_r = document.getElementById("upload-modal-close")) === null || _r === void 0 ? void 0 : _r.click();
                                window.location.reload();
                            }
                        }
                        catch (error) {
                            console.error("Failed to upload Tags", error);
                        }
                    }
                    else {
                        (_s = document.getElementById("upload-modal-close")) === null || _s === void 0 ? void 0 : _s.click();
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
    (_j = document.getElementById("image-modal")) === null || _j === void 0 ? void 0 : _j.addEventListener("show.bs.modal", (event) => {
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
    });
    (_k = document.getElementById("image-modal")) === null || _k === void 0 ? void 0 : _k.addEventListener("hide.bs.modal", (ev) => {
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
    (_l = document.getElementById("image-modal-download")) === null || _l === void 0 ? void 0 : _l.addEventListener("click", (ev) => {
        var _a, _b;
        const image = (_b = (_a = ev.target.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.children[1].children[0];
        const imageType = image.src.split(";")[0].split("/")[1];
        let a = document.createElement("a");
        a.href = image.src;
        a.download = "Image." + imageType;
        a.click();
    });
    (_m = document.getElementById("image-modal-delete")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", deleteImages);
    (_o = document.getElementById("image-modal-edit")) === null || _o === void 0 ? void 0 : _o.addEventListener("click", editButtonToSave);
    (_p = document.getElementById("cancelSelect")) === null || _p === void 0 ? void 0 : _p.addEventListener("click", (ev) => {
        var _a, _b;
        for (const imageId of selected) {
            console.log(imageId);
            document.getElementById("imageButton-" + imageId).checked = false;
            ((_a = document.getElementById("imageButton-" + imageId)) === null || _a === void 0 ? void 0 : _a.nextElementSibling).classList.add("d-none");
        }
        selected = [];
        (_b = document.getElementById("selectedDiv")) === null || _b === void 0 ? void 0 : _b.classList.add("d-none");
    });
    (_q = document.getElementById("deleteMultiple")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        yield deleteImages(ev, true);
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
function editButtonToSave(ev) {
    var _a, _b;
    const button = document.getElementById("image-modal-edit");
    button.id = "image-modal-edit-save";
    button.classList.remove("btn-secondary");
    button.classList.add("btn-success");
    button.innerText = "Save";
    button.addEventListener("click", saveMetadata);
    button.removeEventListener("click", editButtonToSave);
    const title = (_a = document.getElementById("image-modal-title")) === null || _a === void 0 ? void 0 : _a.children[1];
    title.contentEditable = "plaintext-only";
    const date = (_b = document.getElementById("image-modal-date")) === null || _b === void 0 ? void 0 : _b.children[1];
    date.contentEditable = "plaintext-only";
    const tags = document.getElementById("image-modal-tags");
    for (let i = 1; i < tags.children.length; i++) {
        let child = tags.children[i];
        if (child !== undefined) {
            child.contentEditable = "plaintext-only";
        }
    }
    const body = document.getElementById("image-modal-body");
    let addTagForm = document.createElement("form");
    let addTagInput = document.createElement("input");
    let addTagButton = document.createElement("button");
    let addTagLabel = document.createElement("label");
    addTagButton.id = "image-modal-add-tag-button";
    addTagInput.id = "image-modal-add-tag-input";
    addTagForm.id = "image-modal-add-tag";
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
    addTagForm.addEventListener("submit", addTag);
}
function saveMetadata(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const title = ((_a = document.getElementById("image-modal-title")) === null || _a === void 0 ? void 0 : _a.children[1]).innerText;
        const date = ((_b = document.getElementById("image-modal-date")) === null || _b === void 0 ? void 0 : _b.children[1]).innerText;
        const tagsCollection = document.getElementById("image-modal-tags").children;
        const imageId = document.getElementById("image-modal-image").alt.split("-")[1];
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
            const res = yield fetch("http://localhost:8888/pictures/" + imageId, {
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
function addTag(ev) {
    ev.preventDefault();
    const tagToAdd = document.getElementById("image-modal-add-tag-input").value;
    const tagsDiv = document.getElementById("image-modal-tags");
    const para = document.createElement("p");
    para.contentEditable = "plaintext-only";
    para.innerHTML = tagToAdd;
    tagsDiv.appendChild(para);
    document.getElementById("image-modal-add-tag-input").value = "";
}
