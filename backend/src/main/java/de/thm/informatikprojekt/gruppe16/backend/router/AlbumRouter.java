package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.AlbumHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class AlbumRouter {
    private final Vertx vertx;
    private final AlbumHandler albumHandler;

    public AlbumRouter(Vertx vertx) {
        this.vertx = vertx;
        this.albumHandler = new AlbumHandler(vertx);
    }

    public void route(Router router) {
        router.get("/albums").handler(albumHandler::handleGetAlbumsByUsername);
        router.get("/albums/:album_id").handler(albumHandler::handleGetPicturesFromAlbum);
        router.delete("/albums/:album_id").handler(albumHandler::handleDeleteAlbum);
        router.delete("/albums/:album_id/:picture_id").handler(albumHandler::handleDeletePictureFromAlbum);
        router.post("/albums").handler(albumHandler::handleAddAlbum);
        router.put("/albums/:album_id/tags").handler(albumHandler::handleAddTagsToAlbum);
        router.put("/albums/:album_id").handler(albumHandler::handleUpdateAlbumMetadata);
        router.patch("/albums/:album_id/:picture_id").handler(albumHandler::handleAddPictureToAlbum);
    }
}
