var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { addUser, getAllUsers } from "./fetches.js";
import { clearSelected, selected } from "./frontendFunctions.js";
import { deleteUser } from "./backendFunctions.js";
export default function sharedDOMContent() {
    var _a, _b, _c, _d, _e;
    (_a = document.getElementById("cancelSelect")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (ev) => {
        var _a, _b;
        for (const ID of selected) {
            document.getElementById("checkboxButton-" + ID).checked = false;
            ((_a = document.getElementById("checkboxButton-" + ID)) === null || _a === void 0 ? void 0 : _a.nextElementSibling).classList.add("d-none");
        }
        clearSelected();
        (_b = document.getElementById("selectedDiv")) === null || _b === void 0 ? void 0 : _b.classList.add("d-none");
    });
    (_b = document.getElementById("searchForm")) === null || _b === void 0 ? void 0 : _b.addEventListener("submit", (e) => {
        e.preventDefault();
    });
    (_c = document.getElementById("userManagement-modal")) === null || _c === void 0 ? void 0 : _c.addEventListener("show.bs.modal", (ev) => __awaiter(this, void 0, void 0, function* () {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser");
        try {
            let res = yield getAllUsers();
            let data = yield res.json();
            if (res.status == 200) {
                for (let i = 0; i < data.data.length; i++) {
                    const username = data.data[i].username;
                    let modalBody = blankDiv.parentElement;
                    let newDiv = blankDiv.cloneNode(true);
                    let rowDiv = newDiv.children[0];
                    newDiv.id = "userManagement-modal-" + username;
                    rowDiv.children[0].innerText = username;
                    rowDiv.children[2].id = "userManagement-modal-delete-" + username;
                    rowDiv.children[2].addEventListener("click", deleteUser);
                    newDiv.classList.remove("d-none");
                    modalBody.append(newDiv);
                }
            }
        }
        catch (e) {
            console.error("failed to fetch users, " + e);
        }
    }));
    (_d = document.getElementById("userManagement-modal")) === null || _d === void 0 ? void 0 : _d.addEventListener("hide.bs.modal", (ev) => __awaiter(this, void 0, void 0, function* () {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser");
        const formDiv = document.getElementById("userManagement-modal-addUserForm");
        let parentDiv = blankDiv.parentElement;
        parentDiv.innerHTML = "";
        parentDiv.append(formDiv, blankDiv);
    }));
    (_e = document.getElementById("userManagement-modal-addUserForm")) === null || _e === void 0 ? void 0 : _e.addEventListener("submit", (ev) => __awaiter(this, void 0, void 0, function* () {
        var _f;
        ev.preventDefault();
        const username = document.getElementById("userManagement-modal-addUserForm-Username").value;
        const password = document.getElementById("userManagement-modal-addUserForm-Password").value;
        document.getElementById("userManagement-modal-addUserForm-Username").value = "";
        document.getElementById("userManagement-modal-addUserForm-Password").value = "";
        try {
            let res = yield addUser(username, password);
            let data = yield res.json();
            if (res.status == 201) {
                (_f = document.getElementById("userManagement-modal-close")) === null || _f === void 0 ? void 0 : _f.click();
            }
        }
        catch (e) {
            console.error("failed to add user, " + e);
        }
    }));
}
