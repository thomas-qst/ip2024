var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const host = "http://localhost:8888";
/**
 * fetch albums from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export function fetchAlbums() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch current username from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export function fetchUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/login/username`, {
            method: 'get',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch to delete the login/session from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export function deleteLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/login`, {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch all images of the given albumid from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - ID of the album
 */
export function fetchImagesFromAlbum(albumID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums/${albumID}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch all images of the user from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export function fetchImagesFromPictures() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/pictures`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch all users from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/users`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch to add a user to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password of the new user
 * @param username - username of the new user
 */
export function addUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/users`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "username": username, "password": password })
        });
    });
}
/**
 * fetch to delete a user from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - user to delete
 */
export function deleteUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/users/${username}`, {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
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
export function savePictureMetadata(id, title, date, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/pictures/${id}`, {
            method: 'put',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "title": title, "date": date, "tags": tag })
        });
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
export function saveAlbumMetadata(id, title, date, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums/${id}`, {
            method: 'put',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "title": title, "date": date, "tags": tag })
        });
    });
}
/**
 * fetch to save the picture to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the picture
 * @param imageAsText - image as base64 URI
 */
export function saveImage(title, imageAsText) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/pictures`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "title": title, "photo": imageAsText })
        });
    });
}
/**
 * fetch to save tags to a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param photoID - id of the picture
 * @param tags - tags as a string seperated by ' '
 */
export function addTagsToImage(photoID, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/pictures/${photoID}/tags`, {
            method: "put",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "tags": tags })
        });
    });
}
/**
 * fetch to add a picture to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param album - id of the album
 * @param image - id of the picture
 */
export function addImageToAlbum(album, image) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums/${album}/${image}`, {
            method: "PATCH",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
        });
    });
}
/**
 * fetch to delete a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param imageID - id of the image
 */
export function deleteImage(imageID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/pictures/${imageID}`, {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch to add an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the album
 */
export function addAlbum(title) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "title": title })
        });
    });
}
/**
 * fetch to save tags to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param tags - tags as a string seperated by ' '
 */
export function addTagsToAlbum(albumID, tags) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch("http://localhost:8888/albums/" + albumID + "/tags", {
            method: "put",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "tags": tags })
        });
    });
}
/**
 * fetch to remove an image from an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param imageID - id of the image
 */
export function removeFromAlbum(albumID, imageID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums/${albumID}/${imageID}`, {
            method: "delete",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * fetch to delete an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 */
export function deleteAlbum(albumID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/albums/${albumID}`, {
            method: 'delete',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
    });
}
/**
 * sends the login information to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - username
 * @param password - password
 */
export function sendLogin(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(`${host}/login`, {
            method: 'post',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "username": username, "password_hash": password })
        });
    });
}
/**
 * sends the new password to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password
 */
export function changePassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(host + "/login", {
            method: 'PATCH',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ "password_hash": password })
        });
    });
}
