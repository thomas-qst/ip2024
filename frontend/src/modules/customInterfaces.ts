/**
 * Interface to use the relatedTarget of the BoostrapModalEvent
 */
export interface BootstrapModalEvent extends Event {
    relatedTarget: HTMLElement;
}

/**
 * Interface that describes the return of the user data from the backend
 */
export interface getUsers{
    username: string;
}


/**
 * Interface that describes the return of the image data from the backend
 */
export interface ImageData {
    photo_id: number;
    title: string;
    photo: string;
    date: Date;
    tags: Array<string>;
}

/**
 * Interface that describes the return of the album data from the backend
 */
export interface AlbumData {
    album_id : number;
    date: Date;
    tags: Array<string>;
    title: string;
}