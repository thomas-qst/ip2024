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
document.addEventListener("DOMContentLoaded", () => {
    var _a;
    (_a = document.getElementById("login")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
        event.preventDefault();
        //TODO: add hashing
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const res = yield fetch("http://localhost:8888/login", {
            method: 'post',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "username": username, "password_hash": password })
        });
        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");
        if (res.status == 404) {
            if (usernameElement != null && passwordElement != null) {
                usernameElement.innerText = "";
                passwordElement.innerText = "";
                let errorElement = document.createElement("div");
                errorElement.innerText = "Benutzername oder Passwort sind Falsch!";
                passwordElement.insertAdjacentElement("afterend", errorElement);
            }
        }
        else if (res.status == 201) {
            window.location.href = '/fotos.html';
        }
        else if (res.status == 200) {
            window.location.href = '/otp.html';
        }
    }));
});
