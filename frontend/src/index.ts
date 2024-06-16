document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        //TODO: add hashing
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

        const usernameElement = document.getElementById("username");
        const passwordElement = document.getElementById("password");
        if(res.status == 404) {
            if(usernameElement != null && passwordElement != null){
                usernameElement.innerText = "";
                passwordElement.innerText = "";
                let errorElement = document.createElement("div");
                errorElement.innerText = "Benutzername oder Passwort sind Falsch!";
                passwordElement.insertAdjacentElement("afterend",errorElement);
            }
        }else if(res.status == 201) {
            window.location.href = '/fotos.html';
        }else if(res.status == 200) {
            window.location.href = '/otp.html';
        }
    })
})