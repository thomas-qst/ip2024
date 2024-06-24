document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username : string = (document.getElementById("username") as HTMLInputElement).value;
        const password : string = (document.getElementById("password") as HTMLInputElement).value;

        const res : Response = await fetch("http://localhost:8888/login", {
            method: 'post',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
        },
            credentials: "include",
            body: JSON.stringify({"username": username, "password_hash": password })
        });

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