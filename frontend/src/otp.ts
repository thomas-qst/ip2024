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

        const res : Response = await fetch("http://localhost:8888/login", {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({"password_hash": password })
        });

        if(res.status == 201){
            window.location.href = '/fotos.html';
        }else if(res.status == 401){
            window.location.href = '/index.html';
        }

    })

    document.getElementById("showPassword")?.addEventListener("click", () => {
        let eyeOpen = document.getElementById("eyeOpen") as HTMLElement;
        let eyeClosed = document.getElementById("eyeClosed") as HTMLElement;
        let password = document.getElementById("password") as HTMLInputElement;
        if(eyeOpen.classList.contains("d-none")){
            password.type = "password";
            eyeOpen.classList.remove("d-none");
            eyeClosed.classList.add("d-none");
        }else{
            password.type = "text";
            eyeClosed.classList.remove("d-none");
            eyeOpen.classList.add("d-none");
        }
    })
})