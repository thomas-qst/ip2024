import {sendLogin} from "./modules/fetches.js";
import {showPassword} from "./modules/frontendFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username : string = (document.getElementById("username") as HTMLInputElement).value;
        const password : string = (document.getElementById("password") as HTMLInputElement).value;

        const res : Response = await sendLogin(username,password);

        const usernameElement = document.getElementById("username") as HTMLInputElement;
        const passwordElement = document.getElementById("password") as HTMLInputElement;
        if(res.status == 404) {
            usernameElement.value = "";
            passwordElement.value = "";
            document.getElementById("login")?.classList.add("was-validated");
        }else if(res.status == 201) {
            window.location.href = '/fotos.html';
        }else if(res.status == 200) {
            window.location.href = '/otp.html';
        }
    })

    document.getElementById("showPassword")?.addEventListener("click", showPassword)
});

export {};