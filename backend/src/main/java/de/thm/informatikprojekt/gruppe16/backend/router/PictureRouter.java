package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.PictureHandler;
import de.thm.informatikprojekt.gruppe16.backend.handler.UserHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class PictureRouter {
    private final Vertx vertx;
    private final PictureHandler pictureHandler;

    public PictureRouter(Vertx vertx) {
        this.vertx = vertx;
        this.pictureHandler = new PictureHandler(vertx);
    }

    public void route(Router router) {
        router.post("/pictures").handler(pictureHandler::HandleAddPicture);
        router.delete("/pictures/:picture_id").handler(pictureHandler::HandleDeletePictures);
        router.get("/pictures").handler(pictureHandler::HandleGetPictures);
        router.put("/pictures/:picture_id/tags").handler(pictureHandler::HandleAddTagsToPicture);
        router.put("/pictures/:picture_id").handler(pictureHandler::HandleUpdatePictureMetadata);
    }
}
