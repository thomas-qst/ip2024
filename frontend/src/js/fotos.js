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
    var _a, _b, _c, _d, _e, _f, _g, _h;
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
        //TODO: add tags upload
        const file = document.getElementById("upload-modal-input").files;
        const title = document.getElementById("upload-modal-title").value;
        const tags = document.getElementById("upload-modal-tags").value;
        const errorElement = document.getElementById("upload-modal-error");
        const tagArray = tags.split(" ");
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
            var _j;
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
                    (_j = document.getElementById("upload-modal-close")) === null || _j === void 0 ? void 0 : _j.click();
                }
            }
            catch (error) {
                console.error("Failed to upload Image", error);
            }
        });
        reader.readAsDataURL(file[0]);
    }));
}));
