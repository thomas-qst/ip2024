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
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    yield getUsername();
    const userElement = document.getElementById("user");
    if (userElement != null) {
        userElement.innerText = username;
    }
}));
