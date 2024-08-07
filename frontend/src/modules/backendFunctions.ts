import {
    deleteLogin,
    deleteUser as deleteUserFromBackend,
    fetchAlbums,
    fetchImagesFromAlbum,
    fetchImagesFromPictures,
    fetchUsername, saveAlbumMetadata, savePictureMetadata
} from "./fetches.js";
import {AlbumData, ImageData} from "./customInterfaces";
import {
    addToSelected,
    imageDivHover,
    imageDivLeave,
    max_ElementDimension,
    removeFromSelected, resizeImage
} from "./frontendFunctions.js";

/**
 * gets the Username stored in the session from the backend and sets the username variable accordingly.
 * If the fetch fails it redirects to the login page.
 * @return Promise<any>
 * @returns empty Promise
 */
export async function getUsername() {
    if(document.cookie.length == 0){
        window.location.href = '/index.html';
        return;
    }
    try{
        const res : Response = await fetchUsername();
        const data = await res.json();
        if(res.ok){
            return data.data[0].username;
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
export async function logout(){
    try{
        const res : Response = await deleteLogin();
        window.location.href = '/index.html';
    }catch(error){
        console.error('Failed to delete session', error);
        window.location.href = '/index.html';
    }
}

/**
 * fetches the albums from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 */
export async function getAlbums(){
    try{
        const res : Response = await fetchAlbums();
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
export async function fetchImages(ev?:Event, album? : string){
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
            res = await fetchImagesFromAlbum(album);
            data = await res.json();
        }catch (error){
            console.error('Failed to fetch images', error);
            return
        }
        container = document.getElementById("albumContainer") as HTMLDivElement;
    }else{
        try{
            res = await fetchImagesFromPictures();
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
 * deletes the user
 * @param ev
 */
export async function deleteUser(ev:Event){
    const username = (ev.target as HTMLButtonElement).id.split("-")[3];
    try{
        let res = await deleteUserFromBackend(username);
        if(res.status == 204){
            (ev.target as HTMLButtonElement).parentElement?.parentElement?.remove();
        }
    }catch(e){
        console.error("Failed to delete user, " + e);
    }
}


/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
export async function saveMetadata(ev:Event,album?:boolean){
    let type = "image";
    if(album){
        type = "album";
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
        let res : Response;
        if(album){
            res = await saveAlbumMetadata(id, title, date, tag);
        }else{
            res = await savePictureMetadata(id, title, date, tag);
        }
        if(res.status == 201){
            window.location.reload();
        }
    }catch(err){
        console.error("Unable to save Metadata");
    }
}