export declare let selected: Array<number>;
export declare const max_ElementDimension = 15;
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
export declare function deleteUser(ev: Event): Promise<void>;
/**
 * Changes the edit button of the image modal to Save and changes elements to contentEditable plaintext-only.
 * Also add extra input to add tag.
 *
 * @param ev
 * @param {boolean}[album]
 */
export declare function editButtonToSave(ev: Event, album?: boolean): void;
/**
 * Gets the Metadata from the Modal and sends a put request to the backend
 * if album is true, Metadata is treated as album Metadata.
 * @param ev
 * @param {boolean}[album]
 */
export declare function saveMetadata(ev: Event, album?: boolean): Promise<void>;
/**
 * Gets the image data from the event context and inserts it to the Image Modal
 * @param event
 */
export declare function insertImageDataToModal(event: Event): void;
/**
 * Used for the search bar. Hides Elements which don't meet the search.
 * @param ev
 */
export declare function search(ev: Event): void;
/**
 * Function to allow other modules to clear the selected Array.
 */
export declare function clearSelected(): void;
