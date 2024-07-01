let username : string;
let selected : Array<number> = [];
/**
 * Interface to use the relatedTarget of the BoostrapModalEvent
 */
interface BootstrapModalEvent extends Event {
    relatedTarget: HTMLElement;
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
 * removes the d-none class of the label and the title.
 *
 * @param ev
 */
function imageDivHover(ev : Event){
    let target = ev.target as HTMLDivElement;
    let label = target.children[0].children[1] as HTMLLabelElement;
    let title = target.children[2] as HTMLDivElement;
    title.classList.remove("d-none");
    label.classList.remove("d-none");
}

/**
 * Sets the display of the title div to none and the label if the checkbox is unchecked
 *
 * @param ev
 */
function imageDivLeave(ev : Event){
    let target = ev.target as HTMLDivElement;
    let label = target.children[0].children[1] as HTMLLabelElement;
    let input = target.children[0].children[0] as HTMLInputElement;
    let title = target.children[2] as HTMLDivElement;
    title.classList.add("d-none");
    if(!input.checked){
        label.classList.add("d-none");
    }
}

/**
 * fetches the images from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 * If the album param is set it only fetches the images contained on the album.
 *
 * @param {String} [album]
 * @return Promise<void>
 * @returns empty promise
 */
async function fetchImages(album? : string){
    //TODO: add function fetching by album
    if(typeof album !== 'undefined'){
    }else{
        try{
            const res : Response = await fetch("http://localhost:8888/pictures", {
                method: 'GET',
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });
            const data = await res.json();
            if(res.status == 401){
                window.location.href = '/index.html';
            }else if(res.status == 200){
                let array = data.data as Array<ImageData>;
                const container = document.getElementById("imageContainer") as HTMLDivElement;
                for(let i = 0; i < array.length; i++){
                    let divCopy = document.getElementById("BlankImageDiv")?.cloneNode(true) as HTMLDivElement;
                    divCopy.id = "imageDiv-"+array[i].photo_id;
                    container.appendChild(divCopy);
                    divCopy = document.getElementById("imageDiv-"+array[i].photo_id) as HTMLDivElement;
                    divCopy.addEventListener("mouseenter",imageDivHover);
                    divCopy.addEventListener("mouseleave",imageDivLeave);
                    let imageCopy = divCopy.children[1] as HTMLImageElement;
                    imageCopy.id = "image-"+array[i].photo_id;
                    imageCopy.src = array[i].photo;
                    let buttonDiv = divCopy.children[0] as HTMLDivElement;
                    let button = buttonDiv.children[0] as HTMLInputElement;
                    let buttonLable = buttonDiv.children[1] as HTMLLabelElement;
                    button.id = "imageButton-"+array[i].photo_id;
                    button.addEventListener("change",(ev)=>{
                        if(button.checked){
                            addToSelected(ev);
                        }else{
                            removeFromSelected(ev);
                        }
                    })
                    buttonLable.htmlFor = button.id;
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
                    resizeImage(imageCopy);
                }
                //(document.getElementById("testImage") as HTMLImageElement).src = image;
                //resizeImage(document.getElementById("testImage") as HTMLImageElement);
            }
        }
        catch (error){
            console.error('Failed to fetch images', error);
        }
    }
}

/**
 * Resizes the given ImageElement to the max_dimension specified in the function.
 *
 * @param imageElement
 */
function resizeImage(imageElement : HTMLImageElement){
    const max_dimension = 250;
    let height = imageElement.height;
    let width = imageElement.width;
    if(height > width){
        imageElement.style.height = `${max_dimension}px`;
    }else{
        imageElement.style.width = `${max_dimension}px`;
    }
}


function addToSelected(ev : Event){
    const selectedDiv = document.getElementById("selectedDiv") as HTMLDivElement;
    selectedDiv.classList.remove("d-none");
    const imageId = (ev.target as HTMLImageElement).id.split("-")[1];
    selected.push(Number(imageId));
    console.log(selected);
}

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