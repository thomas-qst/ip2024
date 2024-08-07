var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showPassword } from "./modules/frontendFunctions.js";
import { changePassword } from "./modules/fetches.js";
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    (_a = document.getElementById("login")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", (ev) => __awaiter(void 0, void 0, void 0, function* () {
        var _c, _d, _e, _f;
        ev.preventDefault();
        (_c = document.getElementById("login")) === null || _c === void 0 ? void 0 : _c.classList.add("was-validated");
        let password = document.getElementById("password").value;
        let password_repeat = document.getElementById("password_repeat").value;
        if (password != password_repeat) {
            (document.getElementById("password_repeat")).value = "";
            (_d = document.getElementById("password_repeat")) === null || _d === void 0 ? void 0 : _d.classList.add("is-invalid");
            return;
        }
        (_e = document.getElementById("password_repeat")) === null || _e === void 0 ? void 0 : _e.classList.remove("is-invalid");
        (_f = document.getElementById("password_repeat")) === null || _f === void 0 ? void 0 : _f.classList.add("is-valid");
        const res = yield changePassword(password);
        if (res.status == 201) {
            window.location.href = '/fotos.html';
        }
        else if (res.status == 401) {
            window.location.href = '/index.html';
        }
    }));
    (_b = document.getElementById("showPassword")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", showPassword);
}));
