import {
    search,
    insertImageDataToModal,
    editButtonToSave,
    clearSelected,
    selected,
    clickModalSaveImage
} from "./modules/frontendFunctions.js";
import {addImageToAlbum, addTagsToImage, deleteImage, fetchAlbums, saveImage} from "./modules/fetches.js";
import sharedDOMContent from "./modules/sharedDOMDontent.js";
import {AlbumData} from "./modules/customInterfaces.js";
import {getUsername, fetchImages, logout, saveMetadata} from "./modules/backendFunctions.js"

let username : string
let selectedAlbum : Array<number> = [];

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

    document.getElementById("upload-modal-dropcontainer")?.addEventListener("drop", dropImage);

    document.getElementById("upload-modal-close")?.addEventListener("click", () =>{
        const fileInput = document.getElementById("upload-modal-input") as HTMLInputElement;
        fileInput.files = null;
        const title = document.getElementById("upload-modal-title") as HTMLInputElement;
        title.value = "";
        const tags = document.getElementById("upload-modal-tags") as HTMLInputElement;
        tags.value = "";
    });

    document.getElementById("upload-modal-submit")?.addEventListener("click", uploadImage);
    document.getElementById("image-modal")?.addEventListener("show.bs.modal", insertImageDataToModal);

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
            button.removeEventListener("click",clickModalSaveImage);
            button.addEventListener("click", editButtonToSave);
        }
    });

    document.getElementById("addToAlbum-modal")?.addEventListener("show.bs.modal", showAddToAlbum);

    document.getElementById("addToAlbum-modal")?.addEventListener("hide.bs.modal", () => {
        let body = document.getElementById("addToAlbum-modal-body") as HTMLDivElement;
        const blackElement = body.children[0].cloneNode(true);
        body.innerHTML = "";
        body.appendChild(blackElement);
    })

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

    document.getElementById("addToAlbum-modal-submit")?.addEventListener("click", submitAddToAlbum);
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
        const imageID = image.alt.split("-")[1];
        try{
            const res : Response = await deleteImage(imageID);
            if(res.status == 204){
                let closeButton = (ev.target as HTMLButtonElement).parentElement?.children[3] as HTMLButtonElement;
                closeButton.click();
                document.getElementById("imageDiv-"+imageID)?.remove();
            }
        }catch(err){
            console.error("Failed to delete Image", err);
        }
    }else{
        for (const imageID of selected) {
            try{
                const res : Response = await deleteImage(imageID);
                if(res.status == 204){
                    document.getElementById("imageDiv-"+imageID)?.remove();
                }
            }catch(err){
                console.error("Failed to delete Image", err);
            }
        }
        clearSelected();
        document.getElementById("cancelSelect")?.click();
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}

/**
 * adds the selected album to the selected Album array
 * @param ev
 */
function addToSelectedAlbums(ev : Event){
    const splicedString = (ev.target as HTMLImageElement).id.split("-");
    const albumID = splicedString[splicedString.length-1];
    selectedAlbum.push(Number(albumID));
}

/**
 * removes the selected album to the selected Album array
 * @param ev
 */
function removeFromSelectedAlbums(ev:Event){
    const splicedString = (ev.target as HTMLImageElement).id.split("-");
    const albumID = splicedString[splicedString.length-1];
    const indexOfID = selectedAlbum.indexOf(Number(albumID));
    if(indexOfID > -1){
        selectedAlbum.splice(indexOfID,1);
    }else{
        console.error("Item not found in Index!");
    }
}

/**
 * Uploads the image and its metadata
 */
async function uploadImage(){
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
            const res = await saveImage(title, imageAsText);
            const data = await res.json();
            if (res.ok) {
                const photoID = data.photo_id;
                if(tags.length != 0){
                    try{
                        const res = await addTagsToImage(photoID, tags);
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
}

/**
 * handles the "drop image" feature
 * @param event
 */
function dropImage(event:DragEvent){
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
    }
    event.preventDefault();
}

/**
 * loads all albums from the user and displays them in the add-to-album modal
 */
async function showAddToAlbum() {
    try {
        const res = await fetchAlbums();
        const data = await res.json();
        if (res.status == 200) {
            const albumData = data.data as Array<AlbumData>;
            const container = document.getElementById("addToAlbum-modal-body") as HTMLDivElement;
            for (let i = 0; i < albumData.length; i++) {
                const blankElement = document.getElementById("addToAlbum-modal-blankAlbumElement") as HTMLDivElement;
                let newElement = blankElement.cloneNode(true) as HTMLDivElement;
                newElement.id = albumData[i].album_id.toString();
                newElement.children[0].id = newElement.children[0].id + "-" + newElement.id;
                //TOD: add EventListener if checkbox is checked
                (newElement.children[1] as HTMLLabelElement).htmlFor = (newElement.children[1] as HTMLLabelElement).htmlFor + "-" + newElement.id;
                (newElement.children[2] as HTMLParagraphElement).innerText = albumData[i].title;
                (newElement.children[3] as HTMLParagraphElement).innerText = albumData[i].date.toString();
                newElement.classList.remove("d-none");
                (newElement.children[0]).addEventListener("change", (ev) => {
                    if ((ev.target as HTMLInputElement).checked) {
                        addToSelectedAlbums(ev);
                    } else {
                        removeFromSelectedAlbums(ev);
                    }
                })
                container.appendChild(newElement);
            }
        } else if (res.status == 401) {
            window.location.href = "/index.html";
        } else {
            console.error("failed to fetch Albums!");
        }
    } catch (error) {
        console.error("failed to fetch Albums!");
    }
}

/**
 * adds the images to the selected albums
 */
async function submitAddToAlbum(){
    try {
        for(let image = 0; image < selected.length; image++){
            for(let album = 0; album < selectedAlbum.length; album++){
                const res = await addImageToAlbum(selectedAlbum[album], selected[image]);
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
    (document.querySelector('#cancelSelect') as HTMLButtonElement).click();
}

export {};