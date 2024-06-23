document.addEventListener('DOMContentLoaded', async () => {
    await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }

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

    document.getElementById("upload-modal-dropcontainer")?.addEventListener("drop", (event)=>{
        const fileInput = document.getElementById("upload-modal-input") as HTMLInputElement;
        if(event.dataTransfer != null){
            let alert = false;
            if(event.dataTransfer.files.length > 1){
                window.alert("Es ist nur 1. Datei Erlaubt!");
                return;
            }
            if(event.dataTransfer.files[0].name.endsWith(".jpg") || event.dataTransfer.files[0].name.endsWith(".jpeg") || event.dataTransfer.files[0].name.endsWith(".png")){
                fileInput.files = event.dataTransfer.files;
            }else {
                window.alert("Dateiformat nicht erlaubt! Erlaubte Dateiformate: .jpg, .jpeg, .png");
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
        const tagArray = tags.split(" ");
        let imageblob;
        if(file ==  null){
            window.alert("Es wurde keine Datei hochgeladen!");
            return;
        }
        file[0].arrayBuffer().then(async (arrayBuffer) => {
            imageblob = new Blob([new Uint8Array(arrayBuffer)], {type: file[0].type});
            console.log(imageblob);
            try {
                console.log(file[0]);
                const res = await fetch("http://localhost:8888/pictures", {
                    method: "POST",
                    mode: "cors",
                    headers:
                        {
                            "Content-Type": "application/json"
                        },
                    credentials: "include",
                    body: JSON.stringify({"title": title, "photo": imageblob})
                });
                const data = await res.json();
                if (res.ok) {
                    document.getElementById("upload-modal-close")?.click();
                }

            } catch (error) {
                console.error("Failed to upload Image", error);
            }
        });


    })
});





