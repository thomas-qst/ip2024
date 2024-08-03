let selectedAlbum : Array<number> = [];

document.addEventListener('DOMContentLoaded', async () => {
    await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }

    if(username == "Admin"){
        document.getElementById("UserManagement")?.classList.remove("d-none");
    }

    await fetchImages();

    document.getElementById("search")?.addEventListener("input",  search);

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
                            const res = await fetch("http://localhost:8888/pictures/"+photoID+"/tags", {
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



    document.getElementById("image-modal")?.addEventListener("show.bs.modal",insertImageDataToModal);

    document.getElementById("image-modal")?.addEventListener("hide.bs.modal",() => {
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

    document.getElementById("addToAlbum-modal")?.addEventListener("show.bs.modal",async (event) => {
        console.log("Added to Album: ", event);
        try{
            const res = await fetch("http://localhost:8888/albums", {
                method: "GET",
                mode: "cors",
                headers:
                    {
                        "Content-Type": "application/json"
                    },
                credentials: "include",
            });
            const data = await res.json();
            if(res.status == 200){
                const albumData = data.data as Array<AlbumData>;
                const container = document.getElementById("addToAlbum-modal-body") as HTMLDivElement;
                for(let i = 0; i < albumData.length; i++){
                    const blankElement = document.getElementById("addToAlbum-modal-blankAlbumElement") as HTMLDivElement;
                    let newElement = blankElement.cloneNode(true) as HTMLDivElement;
                    newElement.id = albumData[i].album_id.toString();
                    newElement.children[0].id = newElement.children[0].id + "-" +newElement.id;
                    //TOD: add EventListener if checkbox is checked
                    (newElement.children[1] as HTMLLabelElement).htmlFor = (newElement.children[1] as HTMLLabelElement).htmlFor + "-" +newElement.id;
                    (newElement.children[2] as HTMLParagraphElement).innerText = albumData[i].title;
                    (newElement.children[3] as HTMLParagraphElement).innerText = albumData[i].date.toString();
                    newElement.classList.remove("d-none");
                    (newElement.children[0]).addEventListener("change",(ev)=>{
                        if((ev.target as HTMLInputElement).checked){
                            addToSelectedAlbums(ev);
                        }else{
                            removeFromSelectedAlbums(ev);
                        }
                    })
                    container.appendChild(newElement);
                }
            }else if(res.status == 401){
                window.location.href = "/index.html";
            }else{
                console.error("failed to fetch Albums!");
            }
        }catch(error){
            console.error("failed to fetch Albums!");
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

    document.getElementById("image-modal-edit")?.addEventListener("click",clickModalEdit);

    function clickModalEdit(ev:Event){
        editButtonToSave(ev);
    }

    document.getElementById("deleteMultiple")?.addEventListener("click", async (ev) => {
        await deleteImages(ev,true);
    });

    document.getElementById("addToAlbum-modal-submit")?.addEventListener("click", async () => {
        try {
            for(let image = 0; image < selected.length; image++){
                for(let album = 0; album < selectedAlbum.length; album++){
                    const res = await fetch("http://localhost:8888/albums/"+selectedAlbum[album]+"/"+selected[image], {
                        method: "PATCH",
                        mode: "cors",
                        headers:
                            {
                                "Content-Type": "application/json"
                            },
                        credentials: "include",
                    });
                    const data = await res.json();
                    if(res.status != 201){
                        console.error("Failed to added images to albums");
                        return;
                    }
                }
            }
        }catch(error){
            console.error("Failed to added images to albums")
        }
        for(const ID of selectedAlbum){
            (document.getElementById("addToAlbum-modal-checkbox-"+ID) as HTMLInputElement).checked = false;
        }
        selectedAlbum = [];
        (document.querySelector("#addToAlbum-modal-close") as HTMLButtonElement).click();
    });



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

function addToSelectedAlbums(ev : Event){
    const splicedString = (ev.target as HTMLImageElement).id.split("-");
    const albumId = splicedString[splicedString.length-1];
    selectedAlbum.push(Number(albumId));
}

function removeFromSelectedAlbums(ev:Event){
    const splicedString = (ev.target as HTMLImageElement).id.split("-");
    const albumId = splicedString[splicedString.length-1];
    const indexOfId = selectedAlbum.indexOf(Number(albumId));
    if(indexOfId > -1){
        selectedAlbum.splice(indexOfId,1);
    }else{
        console.error("Item not found in Index!");
    }
}