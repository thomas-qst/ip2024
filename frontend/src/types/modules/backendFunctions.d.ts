/**
 * gets the Username stored in the session from the backend and sets the username variable accordingly.
 * If the fetch fails it redirects to the login page.
 * @return Promise<any>
 * @returns empty Promise
 */
export declare function getUsername(): Promise<any>;
/**
 * function to delete the session from front and backend.
 * Redirects to index page after deletion.
 *
 * @return Promise<void>
 * @returns empty Promise
 */
export declare function logout(): Promise<void>;
/**
 * fetches the albums from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 */
export declare function getAlbums(): Promise<void>;
/**
 * fetches the images from the backend and loads them on the page by copying the BlankDiv and adjusting the ids etc.
 * If the album param is set it only fetches the images contained on the album.
 *
 * @param {Event} [ev]
 * @param {String} [album]
 * @return Promise<void>
 * @returns empty promise
 */
export declare function fetchImages(ev?: Event, album?: string): Promise<void>;
/**
 * deletes the user
 * @param ev
 */
export declare function deleteUser(ev: Event): Promise<void>;
/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
export declare function saveMetadata(ev: Event, album?: boolean): Promise<void>;
