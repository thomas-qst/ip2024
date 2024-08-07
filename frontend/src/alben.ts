import {
    insertImageDataToModal,
    search,
    editButtonToSave,
    selected,
    clearSelected,
    clickModalSaveAlbum
} from "./modules/frontendFunctions.js";
import sharedDOMContent from "./modules/sharedDOMDontent.js";
import {BootstrapModalEvent} from "./modules/customInterfaces.js";
import {addAlbum as addAlbumToBackend, addTagsToAlbum, removeFromAlbum, deleteAlbum as deleteAlbumFromBackend} from "./modules/fetches.js";
import {getUsername, getAlbums, logout, saveMetadata} from "./modules/backendFunctions.js";

let username : string

document.addEventListener('DOMContentLoaded', async () => {
    sharedDOMContent();
    username = await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }
    if(username == "Admin"){
        document.getElementById("UserManagement")?.classList.remove("d-none");
    }
    await getAlbums();

    document.getElementById("albumSearch")?.addEventListener("input",  search);
    document.getElementById("logout")?.addEventListener("click", async (event)=>{
        event.preventDefault();
        document.cookie = "";
        await logout();
    })

    document.getElementById("add-modal-submit")?.addEventListener("click", addAlbum);
    document.getElementById("deleteMultiple")?.addEventListener("click", async (ev) => {
        await deleteAlbum(ev,true);
    });

    document.getElementById("album-modal")?.addEventListener("show.bs.modal", showAlbumModal);
    document.getElementById("album-modal")?.addEventListener("hide.bs.modal", hideAlbumModal);
    document.getElementById("album-modal-edit")?.addEventListener("click", clickModalEdit);
    document.getElementById("album-modal-delete")?.addEventListener("click", deleteAlbum);
    document.getElementById("image-modal")?.addEventListener("show.bs.modal",insertImageDataToModal);

    document.getElementById("album-back-button")?.addEventListener("click",async () => {
        let albumContainer = document.getElementById("albumContainer") as HTMLDivElement;
        const blankImageDiv = albumContainer.children[0].cloneNode(true);
        const blankAlbumDiv = albumContainer.children[1].cloneNode(true);
        albumContainer.innerHTML = "";
        albumContainer.append(blankImageDiv,blankAlbumDiv)
        const albumName = document.getElementById("albumName") as HTMLDivElement;
        albumName.children[1].innerHTML = "";
        albumName.classList.add("d-none");
        await getAlbums();
    });

    document.getElementById("image-modal-removeFromAlbum")?.addEventListener("click", async () => {
        const imageID = (document.getElementById("image-modal-image") as HTMLImageElement).alt.split("-")[1];
        const albumID = (document.getElementById("albumName")?.children[1] as HTMLParagraphElement).id.split("-")[1];
        try {
            const res = await removeFromAlbum(albumID,imageID);
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
        const albumID = image.alt.split("-")[1];
        try{
            const res : Response = await deleteAlbumFromBackend(albumID);
            if(res.status == 204){
                let closeButton = (ev.target as HTMLButtonElement).parentElement?.children[2] as HTMLButtonElement;
                closeButton.click();
                document.getElementById("albumDiv-"+albumID)?.remove();
            }
        }catch(err){
            console.error("Failed to delete Album", err);
        }
    }else{
        for (const albumID of selected) {
            try{
                const res : Response = await deleteAlbumFromBackend(albumID);
                if(res.status == 204){
                    document.getElementById("albumDiv-"+albumID)?.remove();
                }
            }catch(err){
                console.error("Failed to delete Album", err);
            }
        }
        clearSelected();
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}

/**
 * uploads the album and its metadata
 * @param event
 */
async function addAlbum(event:Event){
    event.preventDefault();
    const title = (document.getElementById("upload-modal-title") as HTMLInputElement).value;
    const tags = (document.getElementById("upload-modal-tags") as HTMLInputElement).value;
    try {
        const res = await addAlbumToBackend(title);
        const data = await res.json();
        if (res.ok) {
            const albumID = data.album_id;
            if(tags.length != 0){
                try{
                    const res = await addTagsToAlbum(albumID,tags);
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

/**
 * sets the album modal to the data of the clicked album
 * @param event
 */
function showAlbumModal(event:Event){
    const ev = event as BootstrapModalEvent;
    const imageDiv = ev.relatedTarget.parentElement as HTMLDivElement;
    const metadata = imageDiv.children[3];
    const img = ((ev.relatedTarget as HTMLElement).previousElementSibling?.previousElementSibling?.previousElementSibling as HTMLElement);
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
}

/**
 * clears the album modal
 */
function hideAlbumModal(){
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
        button.removeEventListener("click",clickModalSaveAlbum);
        button.addEventListener("click", clickModalEdit);
    }
}

/**
 * sets the 2. variable of editButtonToSave for album
 * @param ev
 */
function clickModalEdit(ev:Event)  {
    editButtonToSave(ev,true);
}

export {};