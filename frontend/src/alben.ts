document.addEventListener('DOMContentLoaded', async () => {
    await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }

    if(username == "Admin"){
        document.getElementById("UserManagement")?.classList.remove("d-none");
    }

    await fetchAlbums();

    document.getElementById("logout")?.addEventListener("click", async (event)=>{
        event.preventDefault();
        document.cookie = "";
        await logout();
    })


    document.getElementById("add-modal-submit")?.addEventListener("click", async (event)=>{
        event.preventDefault();
        const title = (document.getElementById("upload-modal-title") as HTMLInputElement).value;
        const tags = (document.getElementById("upload-modal-tags") as HTMLInputElement).value;
        try {
            const res = await fetch("http://localhost:8888/albums", {
                method: "POST",
                mode: "cors",
                headers:
                    {
                        "Content-Type": "application/json"
                    },
                credentials: "include",
                body: JSON.stringify({"title": title})
            });
            const data = await res.json();
            if (res.ok) {
                const albumId = data.album_id;
                if(tags.length != 0){
                    try{
                        const res = await fetch("http://localhost:8888/tags/albums/"+albumId, {
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
    });

    document.getElementById("deleteMultiple")?.addEventListener("click", async (ev) => {
        await deleteAlbum(ev,true);
    });

    document.getElementById("album-modal")?.addEventListener("show.bs.modal",(event) => {
        const ev = event as BootstrapModalEvent;
        const imageDiv = ev.relatedTarget.parentElement as HTMLDivElement;
        const metadata = imageDiv.children[3];
        const img = ((ev.relatedTarget as HTMLElement).previousElementSibling?.previousElementSibling?.previousElementSibling as HTMLElement);
        console.log(img);
        const modalTags = document.getElementById("album-modal-tags") as HTMLParagraphElement;
        let modalImage = document.getElementById("album-modal-image") as HTMLImageElement;
        modalImage.alt = img.id;
        let modalTitle = document.getElementById("album-modal-title") as HTMLDivElement;
        modalTitle.append(document.createElement("p"));
        (modalTitle.children[1] as HTMLParagraphElement).textContent = metadata.children[0].innerHTML;
        let modalDate = document.getElementById("album-modal-date") as HTMLParagraphElement;
        modalDate.append(document.createElement("p"));
        (modalDate.children[1] as HTMLParagraphElement).textContent = metadata.children[1].innerHTML;
        modalTags.innerHTML = modalTags.innerHTML + metadata.children[2].innerHTML;
    });

    document.getElementById("album-modal")?.addEventListener("hide.bs.modal",(ev:Event) => {
        const tagsDiv = document.getElementById("album-modal-tags") as HTMLDivElement;
        tagsDiv.innerHTML = "<h3>Tags</h3>";
        const titleDiv = document.getElementById("album-modal-title") as HTMLDivElement;
        titleDiv.innerHTML = "<h3>Title</h3>";
        const dateDiv = document.getElementById("album-modal-date") as HTMLDivElement;
        dateDiv.innerHTML = "<h3>Date</h3>";

        const button = document.getElementById("album-modal-edit-save");
        if(button !== null){
            button.id = "album-modal-edit";
            button.classList.remove("btn-success");
            button.classList.add("btn-secondary");
            button.innerText = "Edit";
            document.getElementById("album-modal-add-tag")?.remove();
            button.removeEventListener("click",saveMetadata);
            button.addEventListener("click", clickModalEdit);
        }
    });

    document.getElementById("album-modal-edit")?.addEventListener("click", clickModalEdit);

    function clickModalEdit(ev:Event)  {
        editButtonToSave(ev,true);
    }

    document.getElementById("album-modal-delete")?.addEventListener("click", deleteAlbum);

    document.getElementById("image-modal")?.addEventListener("show.bs.modal",insertImageDataToModal);

    document.getElementById("album-back-button")?.addEventListener("click",(ev) => {
        let albumContainer = document.getElementById("albumContainer") as HTMLDivElement;
        for(let i = 2; i < albumContainer.children.length; i++){
            albumContainer.children[i].remove();
        }
        const albumName = document.getElementById("albumName") as HTMLDivElement;
        albumName.classList.add("d-none");
        fetchAlbums();
    })

    document.getElementById("image-modal-removeFromAlbum")?.addEventListener("click", async (ev) => {
        const album = (document.getElementById("albumName")?.children[1] as HTMLParagraphElement).innerText;
        const imageID = (document.getElementById("image-modal-image") as HTMLImageElement).alt.split("-")[1];
        const albumID = (document.getElementById("albumName")?.children[1] as HTMLParagraphElement).id.split("-")[1];
        try {
            const res = await fetch("http://localhost:8888/albums/"+albumID+"/"+imageID, {
                method: "delete",
                mode: "cors",
                headers:
                    {
                        "Content-Type": "application/json"
                    },
                credentials: "include"
            });
            const data = await res.json();
            if(res.ok){
                document.getElementById("image-modal-close")?.click();
                document.getElementById("imageDiv-"+imageID)?.remove();
            }
        }catch (e){
            console.error("Failed to remove Image from Album", e);
        }
    });


});

/**
 * if boolean is not set, then it deletes the image from the context of the event.
 * if boolean is true, delete every Image inside the selected global array.
 * @param {Event} ev
 * @param {boolean}[multiple]
 */
async function deleteAlbum(ev:Event,multiple?:boolean){
    if(multiple === undefined || !multiple){
        const image = (ev.target as HTMLButtonElement).parentElement?.parentElement?.children[1].children[0] as HTMLImageElement;
        const albumId = image.alt.split("-")[1];
        console.log(albumId);
        try{
            const res : Response = await fetch("http://localhost:8888/albums/"+albumId, {
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
                document.getElementById("albumDiv-"+albumId)?.remove();
            }
        }catch(err){
            console.error("Failed to delete Album", err);
        }
    }else{
        for (const albumId of selected) {
            try{
                const res : Response = await fetch("http://localhost:8888/albums/"+albumId, {
                    method: 'delete',
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                });
                const data = await res.json();
                if(res.status == 200){
                    document.getElementById("albumDiv-"+albumId)?.remove();
                }
            }catch(err){
                console.error("Failed to delete Album", err);
            }
        }
        selected = [];
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}