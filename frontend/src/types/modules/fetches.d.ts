/**
 * fetch albums from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export declare function fetchAlbums(): Promise<Response>;
/**
 * fetch current username from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export declare function fetchUsername(): Promise<Response>;
/**
 * fetch to delete the login/session from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export declare function deleteLogin(): Promise<Response>;
/**
 * fetch all images of the given albumid from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - ID of the album
 */
export declare function fetchImagesFromAlbum(albumID: string): Promise<Response>;
/**
 * fetch all images of the user from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export declare function fetchImagesFromPictures(): Promise<Response>;
/**
 * fetch all users from host
 * @return Promise<Response>
 * @returns Response from the server
 */
export declare function getAllUsers(): Promise<Response>;
/**
 * fetch to add a user to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password of the new user
 * @param username - username of the new user
 */
export declare function addUser(username: string, password: string): Promise<Response>;
/**
 * fetch to delete a user from host
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - user to delete
 */
export declare function deleteUser(username: string): Promise<Response>;
/**
 * fetch to save the picture metadata to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param id - id of the picture
 * @param title - new title of the picture
 * @param date - new date of the picture
 * @param tag - new tags of the picture
 */
export declare function savePictureMetadata(id: string, title: string, date: string, tag: string): Promise<Response>;
/**
 * fetch to save the album metadata to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param id - id of the picture
 * @param title - new title of the picture
 * @param date - new date of the picture
 * @param tag - new tags of the picture
 */
export declare function saveAlbumMetadata(id: string, title: string, date: string, tag: string): Promise<Response>;
/**
 * fetch to save the picture to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the picture
 * @param imageAsText - image as base64 URI
 */
export declare function saveImage(title: string, imageAsText: string | ArrayBuffer | null): Promise<Response>;
/**
 * fetch to save tags to a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param photoID - id of the picture
 * @param tags - tags as a string seperated by ' '
 */
export declare function addTagsToImage(photoID: string, tags: string): Promise<Response>;
/**
 * fetch to add a picture to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param album - id of the album
 * @param image - id of the picture
 */
export declare function addImageToAlbum(album: number, image: number): Promise<Response>;
/**
 * fetch to delete a picture
 * @return Promise<Response>
 * @returns Response from the server
 * @param imageID - id of the image
 */
export declare function deleteImage(imageID: string | number): Promise<Response>;
/**
 * fetch to add an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param title - title of the album
 */
export declare function addAlbum(title: string): Promise<Response>;
/**
 * fetch to save tags to an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param tags - tags as a string seperated by ' '
 */
export declare function addTagsToAlbum(albumID: number | string, tags: string): Promise<Response>;
/**
 * fetch to remove an image from an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 * @param imageID - id of the image
 */
export declare function removeFromAlbum(albumID: string | number, imageID: string | number): Promise<Response>;
/**
 * fetch to delete an album
 * @return Promise<Response>
 * @returns Response from the server
 * @param albumID - id of the album
 */
export declare function deleteAlbum(albumID: string | number): Promise<Response>;
/**
 * sends the login information to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param username - username
 * @param password - password
 */
export declare function sendLogin(username: string, password: string): Promise<Response>;
/**
 * sends the new password to the server
 * @return Promise<Response>
 * @returns Response from the server
 * @param password - password
 */
export declare function changePassword(password: string): Promise<Response>;
