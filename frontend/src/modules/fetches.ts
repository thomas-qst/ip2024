const host = "http://localhost:8888";

/**
 * fetch albums from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export async function fetchAlbums() : Promise<Response> {
    return await fetch(`${host}/albums`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch current username from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export async function fetchUsername() {
    return await fetch(`${host}/login`, {
        method: 'get',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch to delete the login/session from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export async function deleteLogin(){
    return await fetch(`${host}/login`, {
        method: 'delete',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch all images of the given albumid from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - ID of the album
 */
export async function fetchImagesFromAlbum(albumID: string) : Promise<Response> {
    return await fetch(`${host}/albums/${albumID}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch all images of the user from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export async function fetchImagesFromPictures() {
    return await fetch(`${host}/pictures`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch all users from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export async function getAllUsers(){
    return await fetch(`${host}/users`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch to add a user to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password of the new user
 * @param username - username of the new user
 */
export async function addUser(username: string, password: string) {
    return await fetch(`${host}/users`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({"username": username, "password": password})
    });
}

/**
 * fetch to delete a user from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - user to delete
 */
export async function deleteUser(username: string) {
    return await fetch(`${host}/users/${username}`, {
        method: 'delete',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch to save the picture metadata to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param id - id of the picture
 * @param title - new title of the picture
 * @param date - new date of the picture
 * @param tag - new tags of the picture
 */
export async function savePictureMetadata(id: string, title: string, date: string, tag: string) : Promise<Response> {
    return await fetch(`${host}/pictures/${id}`, {
        method: 'put',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({"title": title, "date": date, "tags": tag })
    });
}

/**
 * fetch to save the album metadata to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param id - id of the picture
 * @param title - new title of the picture
 * @param date - new date of the picture
 * @param tag - new tags of the picture
 */
export async function saveAlbumMetadata(id: string, title: string, date: string, tag: string){
    return await fetch(`${host}/albums/${id}`, {
        method: 'put',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({"title": title, "date": date, "tags": tag })
    });
}

/**
 * fetch to save the picture to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the picture
 * @param imageAsText - image as base64 URI
 */
export async function saveImage(title: string, imageAsText: string | ArrayBuffer | null) {
    return await fetch(`${host}/pictures`, {
        method: "POST",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include",
        body: JSON.stringify({"title": title,"photo": imageAsText})
    });
}

/**
 * fetch to save tags to a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param photoID - id of the picture
 * @param tags - tags as a string seperated by ' '
 */
export async function addTagsToImage(photoID: string, tags : string) {
    return await fetch(`${host}/pictures/${photoID}/tags`, {
        method: "put",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include",
        body: JSON.stringify({"tags": tags})
    });
}

/**
 * fetch to add a picture to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param album - id of the album
 * @param image - id of the picture
 */
export async function addImageToAlbum(album: number, image: number){
    return await fetch(`${host}/albums/${album}/${image}`, {
        method: "PATCH",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include",
    });
}

/**
 * fetch to delete a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param imageID - id of the image
 */
export async function deleteImage(imageID: string | number){
    return await fetch(`${host}/pictures/${imageID}`, {
        method: 'delete',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * fetch to add an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the album
 */
export async function addAlbum(title: string){
    return await fetch(`${host}/albums`, {
        method: "POST",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include",
        body: JSON.stringify({"title": title})
    });
}

/**
 * fetch to save tags to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param tags - tags as a string seperated by ' '
 */
export async function addTagsToAlbum(albumID: number| string,tags: string){
    return await fetch("http://localhost:8888/albums/"+albumID+"/tags", {
        method: "put",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include",
        body: JSON.stringify({"tags": tags})
    });
}

/**
 * fetch to remove an image from an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param imageID - id of the image
 */
export async function removeFromAlbum(albumID: string|number, imageID: string|number){
    return await fetch(`${host}/albums/${albumID}/${imageID}`, {
        method: "delete",
        mode: "cors",
        headers:
            {
                "Content-Type": "application/json"
            },
        credentials: "include"
    });
}

/**
 * fetch to delete an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 */
export async function deleteAlbum(albumID: string|number){
    return await fetch(`${host}/albums/${albumID}`, {
        method: 'delete',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });
}

/**
 * sends the login information to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - username
 * @param password - password
 */
export async function sendLogin(username: string, password: string){
    return await fetch(`${host}/login`, {
        method: 'post',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({"username": username, "password_hash": password })
    });
}

/**
 * sends the new password to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password
 */
export async function changePassword(password: string){
    return await fetch(host+"/login", {
        method: 'PATCH',
        mode: 'cors',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({"password_hash": password })
    });
}