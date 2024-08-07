import {BootstrapModalEvent} from "./customInterfaces.js";
import {saveMetadata} from "./backendFunctions.js";

export let selected : Array<number> = [];
export const max_ElementDimension = 15;

/**
 * removes the d-none class of the label and the title.
 *
 * @param ev
 * @param {boolean}[album]
 */
export function imageDivHover(ev : Event,album?:boolean){
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
export function imageDivLeave(ev : Event,album?:boolean){
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

/**
 * Resizes the given ImageElement to the max_ElementDimension specified in the function. (uses rem)
 *
 * @param imageElement
 * @param image
 */
export function resizeImage(imageElement : HTMLElement,image? : boolean){
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
export function addToSelected(ev : Event){
    const selectedDiv = document.getElementById("selectedDiv") as HTMLDivElement;
    selectedDiv.classList.remove("d-none");
    const imageID = (ev.target as HTMLImageElement).id.split("-")[1];
    selected.push(Number(imageID));
}

/**
 * removes the Element from the selected array.
 * @param ev
 */
export function removeFromSelected(ev:Event){
    const imageID = (ev.target as HTMLImageElement).id.split("-")[1];
    const indexOfID = selected.indexOf(Number(imageID));
    if(indexOfID > -1){
        selected.splice(indexOfID,1);
    }else{
        console.error("Item not found in Index!");
    }
    if(selected.length == 0){
        document.getElementById("selectedDiv")?.classList.add("d-none");
    }
}

/**
 * sets the 2. variable of editButtonToSave for Image
 * @param ev
 */
export function clickModalEditImage(ev:Event){
    editButtonToSave(ev);
}

/**
 * sets the 2. variable of editButtonToSave for Album
 * @param ev
 */
export function clickModalEditAlbum(ev:Event){
    editButtonToSave(ev,true);
}

/**
 * sets the 2. variable of saveMetadata for Album
 * @param ev
 */
export function clickModalSaveAlbum(ev:Event){
    saveMetadata(ev,true);
}

/**
 * sets the 2. variable of saveMetadata for Image
 * @param ev
 */
export function clickModalSaveImage(ev:Event){
    saveMetadata(ev);
}

/**
 * Changes the edit button of the image modal to Save and changes elements to contentEditable plaintext-only.
 * Also add extra input to add tag.
 *
 * @param ev
 * @param {boolean}[album]
 */
export function editButtonToSave(ev:Event,album? : boolean){
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

/**
 * sets the 2. variable of addTag for Image
 * @param ev
 */
export function addTagImage(ev:Event){
    addTag(ev);
}

/**
 * sets the 2. variable of addTag for Album
 * @param ev
 */
export function addTagAlbum(ev:Event){
    addTag(ev,true);
}

/**
 * adds the tags from the input to the modal
 * @param ev
 * @param {boolean}[album]
 */
export function addTag(ev:Event,album?:boolean){
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
 * Gets the image data from the event context and inserts it to the Image Modal
 * @param event
 */
export function insertImageDataToModal(event:Event){
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

/**
 * Used for the search bar. Hides Elements which don't meet the search.
 * @param ev
 */
export function search(ev:Event){
    let metadataIndex = 2;
    let childIndex = 0;
    let startIndex = 1;
    if((ev.target as HTMLInputElement).id.startsWith("album")){
        if((document.getElementById("albumName")?.children[1] as HTMLParagraphElement).innerText !== ""){
            startIndex = 2;
            childIndex = 1;
        }else{
            metadataIndex = 3;
            childIndex = 1;
            startIndex = 2;
        }
    }
    const mainDiv = document.getElementById("main") as HTMLElement;
    const container = mainDiv.children[childIndex];
    const inputText = (ev.target as HTMLInputElement).value;
    let searchElements = [];
    for(let i = startIndex; i < container.children.length; i++){
        let child = container.children[i];
        let metadataTopLevel = child.children[metadataIndex];
        let title = (metadataTopLevel.children[0] as HTMLDivElement).innerText;
        let metadataDiv = metadataTopLevel.children[2] as HTMLDivElement;
        if(title.toUpperCase().includes(inputText.toUpperCase())){
            searchElements.push(child);
            continue;
        }
        for(let j = 0; j < metadataDiv.children.length; j++){
            let tag = (metadataDiv.children[j] as HTMLParagraphElement).innerText;
            if(tag.toUpperCase().includes(inputText.toUpperCase())){
                searchElements.push(child);
            }
        }
    }

    hideAllElements((ev.target as HTMLInputElement).id.startsWith("album"));
    if(inputText.length == 0){
        for(let i = 0; i < container.children.length; i++){
            if(container.children[i].id.startsWith("Blank")) continue;
            container.children[i].classList.remove("d-none");
        }
    }
    for(let i = 0; i< searchElements.length; i++){
        if(searchElements[i].id.startsWith("Blank")){
            continue;
        }
        searchElements[i].classList.remove("d-none");
    }

}

/**
 * Function to hide all elements in the main div.
 * @param album
 */
export function hideAllElements(album?:boolean){
    let childIndex = 0;
    if(album){
        childIndex = 1;
    }
    const mainDiv = document.getElementById("main") as HTMLElement;
    const container = mainDiv.children[childIndex];
    for(let i = 0; i < container.children.length; i++){
        container.children[i].classList.add("d-none");
    }
}

/**
 * Function to allow other modules to clear the selected Array.
 */
export function clearSelected(){
    selected = [];
}

/**
 * show the password in text form and changes the eye symbol
 */
export function showPassword(){
    let eyeOpen = document.getElementById("eyeOpen") as HTMLElement;
    let eyeClosed = document.getElementById("eyeClosed") as HTMLElement;
    let password = document.getElementById("password") as HTMLInputElement;
    if(eyeOpen.classList.contains("d-none")){
        password.type = "password";
        eyeOpen.classList.remove("d-none");
        eyeClosed.classList.add("d-none");
    }else{
        password.type = "text";
        eyeClosed.classList.remove("d-none");
        eyeOpen.classList.add("d-none");
    }
}