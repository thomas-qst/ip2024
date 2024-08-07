export declare let selected: Array<number>;
export declare const max_ElementDimension = 15;
/**
 * removes the d-none class of the label and the title.
 *
 * @param ev
 * @param {boolean}[album]
 */
export declare function imageDivHover(ev: Event, album?: boolean): void;
/**
 * Sets the display of the title div to none and the label if the checkbox is unchecked
 *
 * @param ev
 * @param {boolean}[album]
 */
export declare function imageDivLeave(ev: Event, album?: boolean): void;
/**
 * Resizes the given ImageElement to the max_ElementDimension specified in the function. (uses rem)
 *
 * @param imageElement
 * @param image
 */
export declare function resizeImage(imageElement: HTMLElement, image?: boolean): void;
/**
 * adds the selected Element to the selected array.
 * @param ev
 */
export declare function addToSelected(ev: Event): void;
/**
 * removes the Element from the selected array.
 * @param ev
 */
export declare function removeFromSelected(ev: Event): void;
/**
 * sets the 2. variable of editButtonToSave for Image
 * @param ev
 */
export declare function clickModalEditImage(ev: Event): void;
/**
 * sets the 2. variable of editButtonToSave for Album
 * @param ev
 */
export declare function clickModalEditAlbum(ev: Event): void;
/**
 * sets the 2. variable of saveMetadata for Album
 * @param ev
 */
export declare function clickModalSaveAlbum(ev: Event): void;
/**
 * sets the 2. variable of saveMetadata for Image
 * @param ev
 */
export declare function clickModalSaveImage(ev: Event): void;
/**
 * Changes the edit button of the image modal to Save and changes elements to contentEditable plaintext-only.
 * Also add extra input to add tag.
 *
 * @param ev
 * @param {boolean}[album]
 */
export declare function editButtonToSave(ev: Event, album?: boolean): void;
/**
 * sets the 2. variable of addTag for Image
 * @param ev
 */
export declare function addTagImage(ev: Event): void;
/**
 * sets the 2. variable of addTag for Album
 * @param ev
 */
export declare function addTagAlbum(ev: Event): void;
/**
 * adds the tags from the input to the modal
 * @param ev
 * @param {boolean}[album]
 */
export declare function addTag(ev: Event, album?: boolean): void;
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
 * Function to hide all elements in the main div.
 * @param album
 */
export declare function hideAllElements(album?: boolean): void;
/**
 * Function to allow other modules to clear the selected Array.
 */
export declare function clearSelected(): void;
/**
 * show the password in text form and changes the eye symbol
 */
export declare function showPassword(): void;
