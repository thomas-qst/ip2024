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
    var _a, _b, _c, _d, _e, _f, _g;
    yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
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
    (_d = document.getElementById("upload-modal-dropcontainer")) === null || _d === void 0 ? void 0 : _d.addEventListener("drop", (event) => {
        const fileInput = document.getElementById("upload-modal-input");
        if (event.dataTransfer != null) {
            let alert = false;
            if (event.dataTransfer.files.length > 1) {
                window.alert("Es ist nur 1. Datei Erlaubt!");
                return;
            }
            if (event.dataTransfer.files[0].name.endsWith(".jpg") || event.dataTransfer.files[0].name.endsWith(".jpeg") || event.dataTransfer.files[0].name.endsWith(".png")) {
                fileInput.files = event.dataTransfer.files;
            }
            else {
                window.alert("Dateiformat nicht erlaubt! Erlaubte Dateiformate: .jpg, .jpeg, .png");
                return;
            }
            console.log(event.dataTransfer.files);
        }
        event.preventDefault();
    });
    (_e = document.getElementById("upload-modal-close")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
        const fileInput = document.getElementById("upload-modal-input");
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title");
        title.value = "";
        const tags = document.getElementById("upload-modal-tags");
        tags.value = "";
    });
    (_f = document.getElementById("upload-modal-input")) === null || _f === void 0 ? void 0 : _f.addEventListener("change", (event) => __awaiter(void 0, void 0, void 0, function* () {
    }));
    (_g = document.getElementById("upload-modal-submit")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        //TODO: add tags upload
        const file = document.getElementById("upload-modal-input").files;
        const title = document.getElementById("upload-modal-title").value;
        const tags = document.getElementById("upload-modal-tags").value;
        const tagArray = tags.split(" ");
        let imageblob;
        if (file == null) {
            window.alert("Es wurde keine Datei hochgeladen!");
            return;
        }
        file[0].arrayBuffer().then((arrayBuffer) => __awaiter(void 0, void 0, void 0, function* () {
            var _h;
            imageblob = new Blob([new Uint8Array(arrayBuffer)], { type: file[0].type });
            console.log(imageblob);
            try {
                console.log(file[0]);
                const res = yield fetch("http://localhost:8888/pictures", {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ "title": title, "photo": imageblob })
                });
                const data = yield res.json();
                if (res.ok) {
                    (_h = document.getElementById("upload-modal-close")) === null || _h === void 0 ? void 0 : _h.click();
                }
            }
            catch (error) {
                console.error("Failed to upload Image", error);
            }
        }));
    }));
}));
