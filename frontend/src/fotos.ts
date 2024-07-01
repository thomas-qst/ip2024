
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
        const file = (document.getElementById("upload-modal-input") as HTMLInputElement).files;
        const title = (document.getElementById("upload-modal-title") as HTMLInputElement).value;
        const tags = (document.getElementById("upload-modal-tags") as HTMLInputElement).value;
        const errorElement = document.getElementById("upload-modal-error") as HTMLElement;
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
                    const photoID = data.photo_id;
                    try{
                        const res = await fetch("http://localhost:8888/tags/pictures/"+photoID, {
                            method: "put",
                            mode: "cors",
                            headers:
                                {
                                    "Content-Type": "application/json"
                                },
                            credentials: "include",
                            body: JSON.stringify({"tags": tags})
                        });
                        const data = await res.json();
                        if(res.ok){
                            document.getElementById("upload-modal-close")?.click();
                        }
                    }catch(error){
                        console.error("Failed to upload Tags", error);
                    }
                }
            } catch (error) {
                console.error("Failed to upload Image", error);
            }
        }
        reader.readAsDataURL(file[0]);

    });



    document.getElementById("image-modal")?.addEventListener("show.bs.modal",(event) => {
        const ev = event as BootstrapModalEvent;
        const imageDiv = ev.relatedTarget.parentElement as HTMLDivElement;
        const img = ev.relatedTarget as HTMLImageElement;
        const metadata = imageDiv.children[2];
        const modalTags = document.getElementById("image-modal-tags") as HTMLParagraphElement;
        let modalImage = document.getElementById("image-modal-image") as HTMLImageElement;
        modalImage.src = img.src;
        modalImage.alt = img.id;
        let modalTitle = document.getElementById("image-modal-title") as HTMLParagraphElement;
        modalTitle.innerText = "Title: " + metadata.children[0].innerHTML;
        let modalDate = document.getElementById("image-modal-date") as HTMLParagraphElement;
        modalDate.innerText = "Date: " + metadata.children[1].innerHTML;
        modalTags.innerHTML = "Tags: " + metadata.children[2].innerHTML;
    });

    document.getElementById("image-modal-download")?.addEventListener("click", (ev) =>{
        const image = (ev.target as HTMLButtonElement).parentElement?.parentElement?.children[1].children[0] as HTMLImageElement;
        const imageType = image.src.split(";")[0].split("/")[1];
        let a = document.createElement("a");
        a.href = image.src;
        a.download = "Image."+imageType;
        a.click();
    });

    document.getElementById("image-modal-delete")?.addEventListener("click", async (ev) =>{
        const image = (ev.target as HTMLButtonElement).parentElement?.parentElement?.children[1].children[0] as HTMLImageElement;
        const imageId = image.alt.split("-")[1];
        console.log(imageId);
        try{
            const res : Response = await fetch("http://localhost:8888/pictures/"+imageId, {
                method: 'delete',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            const data = await res.json();
            if(res.status == 200){
                let closeButton = (ev.target as HTMLButtonElement).parentElement?.children[3] as HTMLButtonElement;
                closeButton.click();
                document.getElementById("imageDiv-"+imageId)?.remove();
            }
        }catch(err){
            console.error("Failed to delete Image", err);
        }
    })

});





