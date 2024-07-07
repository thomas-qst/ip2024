let username : string;
let selected : Array<number> = [];
const max_ElementDimension = 15;

/**
 * Interface to use the relatedTarget of the BoostrapModalEvent
 */
interface BootstrapModalEvent extends Event {
    relatedTarget: HTMLElement;
}

interface getUsers{
    username: string;
}
/**
 * gets the Username stored in the session from the backend and sets the username variable accordingly.
 * If the fetch fails it redirects to the login page.
 * @return Promise<void>
 * @returns empty Promise
 */
async function getUsername() {
    if(document.cookie.length == 0){
        window.location.href = '/index.html';
        return;
    }
    try{
        const res : Response = await fetch("http://localhost:8888/login/username", {
            method: 'get',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();
        if(res.ok){
            username =  data.data[0].username;
        }else{
            window.location.href = '/index.html';
        }
    }catch(error){
        console.error('Failed to fetch username', error);
        window.location.href = '/index.html';
    }

}

/**
 * function to delete the session from front and backend.
 * Redirects to index page after deletion.
 *
 * @return Promise<void>
 * @returns empty Promise
 */
async function logout(){
    try{
        const res : Response = await fetch("http://localhost:8888/login", {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        window.location.href = '/index.html';
    }catch(error){
        console.error('Failed to delete session', error);
        window.location.href = '/index.html';
    }
}

/**
 * Interface that describes the return of the image data from the backend
 */
interface ImageData {
    photo_id: number;
    title: string;
    photo: string;
    date: Date;
    tags: Array<string>;
}

/**
 * Interface that describes the return of the album data from the backend
 */
interface AlbumData {
    album_id : number;
    date: Date;
    tags: Array<string>;
    title: string;
}

/**
 * removes the d-none class of the label and the title.
 *
 * @param ev
 * @param {boolean}[album]
 */
function imageDivHover(ev : Event,album?:boolean){
    let target = ev.target as HTMLDivElement;
    let label = target.children[0].children[1] as HTMLLabelElement;
    let title = target.children[2] as HTMLDivElement;
    if(album === undefined || !album){
        title.classList.remove("d-none");
    }
    label.classList.remove("d-none");
}

/**
 * Sets the display of the title div to none and the label if the checkbox is unchecked
 *
 * @param ev
 * @param {boolean}[album]
 */
function imageDivLeave(ev : Event,album?:boolean){
    let target = ev.target as HTMLDivElement;
    let label = target.children[0].children[1] as HTMLLabelElement;
    let input = target.children[0].children[0] as HTMLInputElement;
    let title = target.children[2] as HTMLDivElement;
    if(album === undefined || !album){
        title.classList.add("d-none");
    }
    if(!input.checked){
        label.classList.add("d-none");
    }
}

async function fetchAlbums(){
    try{
        const res : Response = await fetch("http://localhost:8888/albums", {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        const data = await res.json();
        if(res.status == 401){
            window.location.href = "/index.html";
        }else if(res.status == 200){
            let array = data.data as Array<AlbumData>;
            const container = document.getElementById("albumContainer") as HTMLDivElement;
            for(let i = 0; i < array.length; i++){
                let divCopy = document.getElementById("BlankAlbumDiv")?.cloneNode(true) as HTMLDivElement;
                divCopy.id = "albumDiv-"+array[i].album_id;
                divCopy.setAttribute("style","height: "+(max_ElementDimension+1)+"rem; width:"+(max_ElementDimension+1)+"rem;");
                container.appendChild(divCopy);
                divCopy = document.getElementById("albumDiv-"+array[i].album_id) as HTMLDivElement;
                divCopy.addEventListener("mouseenter",(ev) => {
                    imageDivHover(ev,true);
                });
                divCopy.addEventListener("mouseleave",(ev) =>{
                    imageDivLeave(ev,true);
                });
                let svg = divCopy.children[1] as SVGElement;
                svg.id = "album-"+array[i].album_id;
                svg.addEventListener("click",(ev) => {
                    fetchImages(ev,array[i].album_id.toString());
                })
                let mainDiv = divCopy.children[2] as HTMLImageElement;
                mainDiv.id = "mainDiv-"+array[i].album_id;
                let buttonDiv = divCopy.children[0] as HTMLDivElement;
                let button = buttonDiv.children[0] as HTMLInputElement;
                let buttonLable = buttonDiv.children[1] as HTMLLabelElement;
                button.id = "checkboxButton-"+array[i].album_id;
                button.addEventListener("change",(ev)=>{
                    if(button.checked){
                        addToSelected(ev);
                    }else{
                        removeFromSelected(ev);
                    }
                })
                buttonLable.htmlFor = button.id;
                let metadataDiv = divCopy.children[3] as HTMLDivElement;
                metadataDiv.id = "albumMetadata-"+array[i].album_id;
                const title = array[i].title;
                const date = array[i].date;
                (metadataDiv.children[1] as HTMLDivElement).innerText = date.toString();
                (metadataDiv.children[0] as HTMLDivElement).innerText = title;
                let metadataTags = metadataDiv.children[2] as HTMLDivElement;
                array[i].tags.forEach(tag => {
                    let p = document.createElement("p");
                    p.innerText = tag;
                    metadataTags.append(p);
                })

                let titlep = document.createElement("p");
                titlep.innerText = title;
                let datep = document.createElement("p");
                let editSVG = document.createElementNS("http://www.w3.org/2000/svg","svg");
                editSVG.setAttribute("width","32");
                editSVG.setAttribute("height","32");
                editSVG.setAttribute("fill","currentColor");
                editSVG.classList.add("bi","bi-pencil");
                editSVG.setAttribute("viewBox","0 0 16 16");
                editSVG.setAttribute("data-bs-toggle","modal");
                editSVG.setAttribute("data-bs-target","#album-modal");
                editSVG.classList.add("position-relative");
                editSVG.setAttribute("style","top: -47%; left: 80%;");
                let editPath = document.createElementNS("http://www.w3.org/2000/svg","path");
                editPath.setAttribute("d","M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325");
                editSVG.append(editPath);
                datep.innerText = date.toString();
                mainDiv.append(titlep,datep);
                divCopy.append(editSVG)
                resizeImage((divCopy.children[1] as HTMLElement),false);
                divCopy.classList.remove("d-none");
            }
        }
    }catch(err){
        console.error('Failed to fetch album', err);
    }
}

/**
 * fetches the images from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 * If the album param is set it only fetches the images contained on the album.
 *
 * @param {Event} [ev]
 * @param {String} [album]
 * @return Promise<void>
 * @returns empty promise
 */
async function fetchImages(ev?:Event, album? : string){
    let res : Response;
    let data;
    let container;
    let isAlbum = false;
    if(typeof album !== 'undefined' && typeof ev !== 'undefined'){
        isAlbum = true;
        const albumContainer = document.getElementById("albumContainer") as HTMLDivElement;
        const pageElements = albumContainer.children;
        while(pageElements.length > 2){
            pageElements[2].remove();
        }
        const albumNameDiv = document.getElementById("albumName") as HTMLDivElement;
        albumNameDiv.classList.remove("d-none");
        (albumNameDiv.children[1] as HTMLHeadElement).innerText = ((ev.target as HTMLElement).nextElementSibling?.children[0] as HTMLParagraphElement).innerText;
        albumNameDiv.children[1].id = "albumID-"+((ev.target as HTMLElement).nextElementSibling as HTMLDivElement).id.split("-")[1];
        try{
            res = await fetch(`http://localhost:8888/albums/${album}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            data = await res.json();
        }catch (error){
            console.error('Failed to fetch images', error);
            return
        }
        container = document.getElementById("albumContainer") as HTMLDivElement;
    }else{
        try{
            res = await fetch("http://localhost:8888/pictures", {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            data = await res.json();
        }
        catch (error){
            console.error('Failed to fetch images', error);
            return;
        }
        container = document.getElementById("imageContainer") as HTMLDivElement;
    }
    if(res.status === 401){
        window.location.href = '/index.html';
    }else if(res.status == 200){
        let array = data.data as Array<ImageData>;
        for(let i = 0; i < array.length; i++){
            let divCopy = document.getElementById("BlankImageDiv")?.cloneNode(true) as HTMLDivElement;
            divCopy.id = "imageDiv-"+array[i].photo_id;
            container.appendChild(divCopy);
            divCopy = document.getElementById("imageDiv-"+array[i].photo_id) as HTMLDivElement;
            divCopy.addEventListener("mouseenter",imageDivHover);
            divCopy.addEventListener("mouseleave",imageDivLeave);
            divCopy.setAttribute("style","height: "+(max_ElementDimension+1)+"rem; width:"+(max_ElementDimension+1)+"rem;");
            let imageCopy = divCopy.children[1] as HTMLImageElement;
            imageCopy.id = "image-"+array[i].photo_id;
            imageCopy.src = array[i].photo;
            let buttonDiv = divCopy.children[0] as HTMLDivElement;
            let button = buttonDiv.children[0] as HTMLInputElement;
            let buttonLable = buttonDiv.children[1] as HTMLLabelElement;
            button.id = "checkboxButton-"+array[i].photo_id;
            button.addEventListener("change",(ev)=>{
                if(button.checked){
                    addToSelected(ev);
                }else{
                    removeFromSelected(ev);
                }
            })
            buttonLable.htmlFor = button.id;
            if(isAlbum){
                buttonDiv.classList.add("d-none");
            }
            let metadataDiv = divCopy.children[2] as HTMLDivElement;
            metadataDiv.id = "imageMetadata-"+array[i].photo_id;
            (metadataDiv.children[1] as HTMLDivElement).innerText = array[i].date.toString();
            (metadataDiv.children[0] as HTMLDivElement).innerText = array[i].title.toString();
            let metadataTags = metadataDiv.children[2] as HTMLDivElement;
            array[i].tags.forEach(tag => {
                let p = document.createElement("p");
                p.innerText = tag;
                metadataTags.append(p);
            })
            divCopy.classList.remove("d-none");
            resizeImage(imageCopy,true);
        }
    }
}

/**
 * Resizes the given ImageElement to the max_ElementDimension specified in the function. (uses rem)
 *
 * @param imageElement
 * @param image
 */
function resizeImage(imageElement : HTMLElement,image? : boolean){
    if(image){
        let height = (imageElement as HTMLImageElement).height;
        let width = (imageElement as HTMLImageElement).width;
        if(height > width){
            imageElement.style.height = `${max_ElementDimension}rem`;
        }else{
            imageElement.style.width = `${max_ElementDimension}rem`;
        }
    }else{
        imageElement.style.width = `${max_ElementDimension}rem`;
        imageElement.style.height = `${max_ElementDimension}rem`;
    }

}

/**
 * adds the selected Element to the selected array.
 * @param ev
 */
function addToSelected(ev : Event){
    const selectedDiv = document.getElementById("selectedDiv") as HTMLDivElement;
    selectedDiv.classList.remove("d-none");
    const imageId = (ev.target as HTMLImageElement).id.split("-")[1];
    selected.push(Number(imageId));
}

/**
 * removes the Element from the selected array.
 * @param ev
 */
function removeFromSelected(ev:Event){
    const imageId = (ev.target as HTMLImageElement).id.split("-")[1];
    const indexOfId = selected.indexOf(Number(imageId));
    if(indexOfId > -1){
        selected.splice(indexOfId,1);
    }else{
        console.error("Item not found in Index!");
    }
    if(selected.length == 0){
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}


document.addEventListener("DOMContentLoaded",() =>{
    document.getElementById("cancelSelect")?.addEventListener("click",(ev)=>{
        for(const ID of selected){
            (document.getElementById("checkboxButton-"+ID) as HTMLInputElement).checked = false;
            (document.getElementById("checkboxButton-"+ID)?.nextElementSibling as HTMLLabelElement).classList.add("d-none");
        }
        selected = [];
        document.getElementById("selectedDiv")?.classList.add("d-none");
    });
    document.getElementById("userManagement-modal")?.addEventListener("show.bs.modal",async (ev) => {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser") as HTMLDivElement;
        try{
            let res = await fetch("http://localhost:8888/users", {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            let data = await res.json();
            if(res.status == 200){
                console.log(data.data);
                for(let i = 0; i < data.data.length; i++){
                    const username = data.data[i].username;
                    let modalBody = blankDiv.parentElement as HTMLDivElement;
                    let newDiv = blankDiv.cloneNode(true) as HTMLDivElement;
                    let rowDiv = newDiv.children[0] as HTMLDivElement;
                    newDiv.id = "userManagement-modal-"+username;
                    (rowDiv.children[0] as HTMLParagraphElement).innerText = username;
                    (rowDiv.children[2] as HTMLButtonElement).id = "userManagement-modal-delete-"+username;
                    (rowDiv.children[2] as HTMLButtonElement).addEventListener("click",deleteUser);
                    newDiv.classList.remove("d-none");
                    modalBody.append(newDiv);
                }
            }

        }catch(e){
            console.error("failed to fetch users, " + e);
        }
    });

    document.getElementById("userManagement-modal")?.addEventListener("hide.bs.modal",async (ev) => {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser") as HTMLDivElement;
        const formDiv = document.getElementById("userManagement-modal-addUserForm") as HTMLFormElement;
        let parentDiv = blankDiv.parentElement as HTMLDivElement;
        parentDiv.innerHTML = "";
        parentDiv.append(formDiv,blankDiv);
    })

    document.getElementById("userManagement-modal-addUserForm")?.addEventListener("submit",async (ev)=>{
        ev.preventDefault();
        const username = (document.getElementById("userManagement-modal-addUserForm-Username") as HTMLInputElement).value;
        const password = (document.getElementById("userManagement-modal-addUserForm-Password") as HTMLInputElement).value;
        (document.getElementById("userManagement-modal-addUserForm-Username") as HTMLInputElement).value = "";
        (document.getElementById("userManagement-modal-addUserForm-Password") as HTMLInputElement).value = "";
        try{
            let res = await fetch("http://localhost:8888/users", {
                method: 'POST',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({"username": username, "password": password})
            });
            let data = await res.json();
            if(res.status == 201){
                document.getElementById("userManagement-modal-close")?.click();
            }
        }catch(e){
            console.error("failed to add user, " + e);
        }
    });
});


async function deleteUser(ev:Event){
    const username = (ev.target as HTMLButtonElement).id.split("-")[3];
    try{
        let res = await fetch("http://localhost:8888/users/"+username, {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        let data = await res.json();
        if(res.status == 200){
            (ev.target as HTMLButtonElement).parentElement?.parentElement?.remove();
        }
    }catch(e){
        console.error("Failed to delete user, " + e);
    }
}


function clickModalEditImage(ev:Event){
    editButtonToSave(ev);
}

function clickModalEditAlbum(ev:Event){
    editButtonToSave(ev,true);
}

function clickModalSaveAlbum(ev:Event){
    saveMetadata(ev,true);
}

function clickModalSaveImage(ev:Event){
    saveMetadata(ev);
}

/**
 * Changes the edit button of the image modal to Save and changes elements to contentEditable plaintext-only.
 * Also add extra input to add tag.
 *
 * @param ev
 * @param {boolean}[album]
 */
function editButtonToSave(ev:Event,album? : boolean){
    let type : string = "image";
    if(album){
        type = "album";
    }
    const button = ev.target as HTMLButtonElement;
    button.id = type+"-modal-edit-save";
    button.classList.remove("btn-secondary");
    button.classList.add("btn-success");
    button.innerText = "Save";
    if(album){
        button.addEventListener("click",clickModalSaveAlbum);
        button.removeEventListener("click",clickModalEditAlbum);
    }else{
        button.addEventListener("click",clickModalSaveImage);
        button.removeEventListener("click",clickModalEditImage);
    }
    const body = button.parentElement?.previousElementSibling as HTMLDivElement;
    console.log(body);
    console.log(button);
    console.log(button.parentElement);
    console.log(button.parentElement?.previousElementSibling);
    const title = body.children[1].children[1] as HTMLParagraphElement;
    title.contentEditable = "plaintext-only";
    const date = body.children[2].children[1] as HTMLParagraphElement;
    date.contentEditable = "plaintext-only";
    const tags = body.children[3] as HTMLDivElement;
    for(let i = 1; i < tags.children.length; i++){
        let child = tags.children[i];
        if(child !== undefined){
            (child as HTMLParagraphElement).contentEditable = "plaintext-only";
        }
    }
    let addTagForm = document.createElement("form");
    let addTagInput = document.createElement("input");
    let addTagButton = document.createElement("button");
    let addTagLabel = document.createElement("label");
    addTagButton.id = type+"-modal-add-tag-button";
    addTagInput.id = type+"-modal-add-tag-input";
    addTagForm.id = type+"-modal-add-tag";
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
    if(album){
        addTagForm.addEventListener("submit",addTagAlbum);

    }else{
        addTagForm.addEventListener("submit",addTagImage);
    }
}

function addTagImage(ev:Event){
    addTag(ev);
}

function addTagAlbum(ev:Event){
    addTag(ev,true);
}

function addTag(ev:Event,album?:boolean){
    let type = "image";
    if(album){
        type = "album";
    }
    ev.preventDefault();
    const tagToAdd = (document.getElementById(type+"-modal-add-tag-input") as HTMLInputElement).value;
    const tagsDiv = document.getElementById(type+"-modal-tags") as HTMLDivElement;
    const para = document.createElement("p");
    para.contentEditable = "plaintext-only";
    para.innerHTML = tagToAdd;
    tagsDiv.appendChild(para);
    (document.getElementById(type+"-modal-add-tag-input") as HTMLInputElement).value = "";
}

/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
async function saveMetadata(ev:Event,album?:boolean){
    let type = "image";
    let url = "http://localhost:8888/pictures/";
    if(album){
        type = "album";
        url = "http://localhost:8888/albums/"
    }
    const title = (document.getElementById(type+"-modal-title")?.children[1] as HTMLParagraphElement).innerText;
    const date = (document.getElementById(type+"-modal-date")?.children[1] as HTMLParagraphElement).innerText;
    const tagsCollection = (document.getElementById(type+"-modal-tags") as HTMLDivElement).children;
    const id = (document.getElementById(type+"-modal-image") as HTMLImageElement).alt.split("-")[1];
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
        const res : Response = await fetch(url+id, {
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

/**
 * Gets the image data from the event context and inserts it to the Image Modal
 * @param event
 */
function insertImageDataToModal(event:Event){
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
}