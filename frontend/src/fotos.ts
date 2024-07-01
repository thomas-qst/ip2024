
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
                    if(tags.length != 0){
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
                                window.location.reload();
                            }
                        }catch(error){
                            console.error("Failed to upload Tags", error);
                        }
                    }else{
                        document.getElementById("upload-modal-close")?.click();
                        window.location.reload();
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
        let modalTitle = document.getElementById("image-modal-title") as HTMLDivElement;
        modalTitle.append(document.createElement("p"));
        (modalTitle.children[1] as HTMLParagraphElement).textContent = metadata.children[0].innerHTML;
        let modalDate = document.getElementById("image-modal-date") as HTMLParagraphElement;
        modalDate.append(document.createElement("p"));
        (modalDate.children[1] as HTMLParagraphElement).textContent = metadata.children[1].innerHTML;
        modalTags.innerHTML = modalTags.innerHTML + metadata.children[2].innerHTML;
    });

    document.getElementById("image-modal")?.addEventListener("hide.bs.modal",(ev:Event) => {
        const tagsDiv = document.getElementById("image-modal-tags") as HTMLDivElement;
        tagsDiv.innerHTML = "<h3>Tags</h3>";
        const titleDiv = document.getElementById("image-modal-title") as HTMLDivElement;
        titleDiv.innerHTML = "<h3>Title</h3>";
        const dateDiv = document.getElementById("image-modal-date") as HTMLDivElement;
        dateDiv.innerHTML = "<h3>Date</h3>";

        const button = document.getElementById("image-modal-edit-save");
        if(button !== null){
            button.id = "image-modal-edit";
            button.classList.remove("btn-success");
            button.classList.add("btn-secondary");
            button.innerText = "Edit";
            document.getElementById("image-modal-add-tag")?.remove();
            button.removeEventListener("click",saveMetadata);
            button.addEventListener("click", editButtonToSave);
        }
    });

    document.getElementById("image-modal-download")?.addEventListener("click", (ev) =>{
        const image = (ev.target as HTMLButtonElement).parentElement?.parentElement?.children[1].children[0] as HTMLImageElement;
        const imageType = image.src.split(";")[0].split("/")[1];
        let a = document.createElement("a");
        a.href = image.src;
        a.download = "Image."+imageType;
        a.click();
    });

    document.getElementById("image-modal-delete")?.addEventListener("click", deleteImages);

    document.getElementById("image-modal-edit")?.addEventListener("click", editButtonToSave);

    document.getElementById("cancelSelect")?.addEventListener("click",(ev)=>{
        for(const imageId of selected){
            console.log(imageId);
            (document.getElementById("imageButton-"+imageId) as HTMLInputElement).checked = false;
            (document.getElementById("imageButton-"+imageId)?.nextElementSibling as HTMLLabelElement).classList.add("d-none");
        }
        selected = [];
        document.getElementById("selectedDiv")?.classList.add("d-none");
    })

    document.getElementById("deleteMultiple")?.addEventListener("click", async (ev) => {
        await deleteImages(ev,true);
    })

});


/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
async function deleteImages(ev:Event,multiple?:boolean){
    if(multiple === undefined || !multiple){
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
    }else{
        for (const imageId of selected) {
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
                    document.getElementById("imageDiv-"+imageId)?.remove();
                }
            }catch(err){
                console.error("Failed to delete Image", err);
            }
        }
        selected = [];
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}


function editButtonToSave(ev:Event){
    const button = document.getElementById("image-modal-edit") as HTMLButtonElement;
    button.id = "image-modal-edit-save";
    button.classList.remove("btn-secondary");
    button.classList.add("btn-success");
    button.innerText = "Save";
    button.addEventListener("click",saveMetadata);
    button.removeEventListener("click",editButtonToSave);

    const title = document.getElementById("image-modal-title")?.children[1] as HTMLParagraphElement;
    title.contentEditable = "plaintext-only";
    const date = document.getElementById("image-modal-date")?.children[1] as HTMLParagraphElement;
    date.contentEditable = "plaintext-only";
    const tags = document.getElementById("image-modal-tags") as HTMLDivElement;
    for(let i = 1; i < tags.children.length; i++){
        let child = tags.children[i];
        if(child !== undefined){
            (child as HTMLParagraphElement).contentEditable = "plaintext-only";
        }
    }
    const body = document.getElementById("image-modal-body") as HTMLDivElement;
    let addTagForm = document.createElement("form");
    let addTagInput = document.createElement("input");
    let addTagButton = document.createElement("button");
    let addTagLabel = document.createElement("label");
    addTagButton.id = "image-modal-add-tag-button";
    addTagInput.id = "image-modal-add-tag-input";
    addTagForm.id = "image-modal-add-tag";
    addTagForm.classList.add("form-floating");
    addTagLabel.htmlFor = addTagInput.id;
    addTagLabel.innerText = "Tag";
    addTagButton.classList.add("btn","btn-success","mx-2");
    addTagButton.innerText = "Add Tag";
    addTagButton.type = "submit";
    addTagInput.type = "text";
    addTagInput.classList.add("form-control");
    addTagInput.style.width = "20%";
    addTagInput.style.display = "inline";
    addTagInput.placeholder = "Tag";
    addTagForm.append(addTagInput, addTagLabel, addTagButton);
    body.append(addTagForm);
    addTagForm.addEventListener("submit",addTag);
}

async function saveMetadata(ev:Event){
    const title = (document.getElementById("image-modal-title")?.children[1] as HTMLParagraphElement).innerText;
    const date = (document.getElementById("image-modal-date")?.children[1] as HTMLParagraphElement).innerText;
    const tagsCollection = (document.getElementById("image-modal-tags") as HTMLDivElement).children;
    const imageId = (document.getElementById("image-modal-image") as HTMLImageElement).alt.split("-")[1];
    let tag = "";
    for(let i = 1; i < tagsCollection.length; i++){
        let text = (tagsCollection[i] as HTMLParagraphElement).innerText;
        text = text.trim();
        if(text.length > 0){
            tag += ((tagsCollection[i] as HTMLParagraphElement).innerText + " ");
        }
    }
    tag = tag.trim()
    try{
        const res : Response = await fetch("http://localhost:8888/pictures/"+imageId, {
            method: 'put',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({"title": title, "date": date, "tags": tag })
        });
        const data = await res.json();
        if(res.status == 200){
            window.location.reload();
        }
    }catch(err){
        console.error("Unable to save Metadata");
    }
}


function addTag(ev:Event){
    ev.preventDefault();
    const tagToAdd = (document.getElementById("image-modal-add-tag-input") as HTMLInputElement).value;
    const tagsDiv = document.getElementById("image-modal-tags") as HTMLDivElement;
    const para = document.createElement("p");
    para.contentEditable = "plaintext-only";
    para.innerHTML = tagToAdd;
    tagsDiv.appendChild(para);
    (document.getElementById("image-modal-add-tag-input") as HTMLInputElement).value = "";
}





