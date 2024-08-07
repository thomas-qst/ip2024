var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { sendLogin } from "./modules/fetches.js";
import { showPassword } from "./modules/frontendFunctions.js";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    (_a = document.getElementById("login")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        event.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const res = yield sendLogin(username, password);
        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");
        if (res.status == 404) {
            usernameElement.value = "";
            passwordElement.value = "";
            (_c = document.getElementById("login")) === null || _c === void 0 ? void 0 : _c.classList.add("was-validated");
        }
        else if (res.status == 201) {
            window.location.href = '/fotos.html';
        }
        else if (res.status == 200) {
            window.location.href = '/otp.html';
        }
    }));
    (_b = document.getElementById("showPassword")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", showPassword);
});
