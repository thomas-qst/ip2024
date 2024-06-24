document.addEventListener('DOMContentLoaded', async () => {
    await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }

    await fetchImages();

    document.getElementById("logout")?.addEventListener("click", async (event)=>{
        event.preventDefault();
        document.cookie = "";
        await logout();
    });

    document.getElementById("upload")?.addEventListener("click", async (event)=>{
        event.preventDefault();

    });
    document.getElementById("upload-modal-dropcontainer")?.addEventListener("dragover", (event)=>{
        event.stopPropagation();
        event.preventDefault();
        const transfer = event.dataTransfer
        if(transfer != null){
            transfer.dropEffect = 'copy';
        }
    });

    document.getElementById("upload-modal-error-button")?.addEventListener("click", (event)=>{
        event.preventDefault();
        document.getElementById("upload-modal-error")?.classList.add("d-none");
    })

    document.getElementById("upload-modal-dropcontainer")?.addEventListener("drop", (event)=>{
        const fileInput = document.getElementById("upload-modal-input") as HTMLInputElement;
        const errorElement = document.getElementById("upload-modal-error") as HTMLElement;
        if(event.dataTransfer != null){
            let alert = false;
            if(event.dataTransfer.files.length > 1){
                let button = errorElement.firstElementChild as HTMLElement;
                errorElement.innerHTML = "";
                errorElement.append(button,"Es ist nur ein Bild Erlaubt pro Upload!");
                errorElement?.classList.remove("d-none");
                return;
            }
            if(event.dataTransfer.files[0].type.startsWith("image/")){
                fileInput.files = event.dataTransfer.files;
            }else {
                let button = errorElement.firstElementChild as HTMLElement;
                errorElement.innerHTML = "";
                errorElement.append(button,"Dateiformat nicht erlaubt! Erlaubte sind nur Bildformate! Zum Beispiel: .png, .jpg, .gif");
                errorElement?.classList.remove("d-none");
                return;
            }
            console.log(event.dataTransfer.files);
        }
        event.preventDefault();
    });

    document.getElementById("upload-modal-close")?.addEventListener("click", () =>{
        const fileInput = document.getElementById("upload-modal-input") as HTMLInputElement;
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title") as HTMLInputElement;
        title.value = "";
        const tags = document.getElementById("upload-modal-tags") as HTMLInputElement;
        tags.value = "";
    });

    document.getElementById("upload-modal-input")?.addEventListener("change", async (event)=>{

    });

    document.getElementById("upload-modal-submit")?.addEventListener("click", async () => {
        //TODO: add tags upload
        const file = (document.getElementById("upload-modal-input") as HTMLInputElement).files;
        const title = (document.getElementById("upload-modal-title") as HTMLInputElement).value;
        const tags = (document.getElementById("upload-modal-tags") as HTMLInputElement).value;
        const errorElement = document.getElementById("upload-modal-error") as HTMLElement;
        const tagArray = tags.split(" ");
        let imageAsText;
        const reader = new FileReader();
        if(file ==  null){
            let button = errorElement.firstElementChild as HTMLElement;
            errorElement.innerHTML = "";
            errorElement.append(button,"Es wurde keine Datei hochgeladen!");
            errorElement?.classList.remove("d-none");
            return;
        }
        reader.onload = async (event) => {
            imageAsText = reader.result;
            try {
                console.log(imageAsText);
                const res = await fetch("http://localhost:8888/pictures", {
                    method: "POST",
                    mode: "cors",
                    headers:
                        {
                            "Content-Type": "application/json"
                        },
                    credentials: "include",
                    body: JSON.stringify({"title": title,"photo": imageAsText})
                });
                const data = await res.json();
                if (res.ok) {
                    document.getElementById("upload-modal-close")?.click();
                }
            } catch (error) {
                console.error("Failed to upload Image", error);
            }
        }
        reader.readAsDataURL(file[0]);

    });
});





