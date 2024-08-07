import {showPassword} from "./modules/frontendFunctions.js";
import {changePassword} from "./modules/fetches.js";

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("login")?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        document.getElementById("login")?.classList.add("was-validated");
        let password = (document.getElementById("password") as HTMLInputElement).value;
        let password_repeat = (document.getElementById("password_repeat") as HTMLInputElement).value;
        if(password != password_repeat) {
            ((document.getElementById("password_repeat")) as HTMLInputElement).value = "";
            document.getElementById("password_repeat")?.classList.add("is-invalid");
            return;
        }
        document.getElementById("password_repeat")?.classList.remove("is-invalid");
        document.getElementById("password_repeat")?.classList.add("is-valid");

        const res : Response = await changePassword(password);

        if(res.status == 201){
            window.location.href = '/fotos.html';
        }else if(res.status == 401){
            window.location.href = '/index.html';
        }

    })

    document.getElementById("showPassword")?.addEventListener("click", showPassword);
});

export {};