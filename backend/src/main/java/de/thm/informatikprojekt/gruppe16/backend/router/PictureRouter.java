package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.PictureHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

/**
 * <p>Router class for Picture</p>
 * <p>used to route all routes related to/starting with pictures</p>
 */
public class PictureRouter {
    private final PictureHandler pictureHandler;

    public PictureRouter(Vertx vertx) {
        this.pictureHandler = new PictureHandler(vertx);
    }

    /**
     * <p>Contains all routs related to/starting with pictures and uses the appropriate Handler function in {@link de.thm.informatikprojekt.gruppe16.backend.handler.PictureHandler} class for the rout</p>
     * @param router
     */
    public void route(Router router) {
        router.post("/pictures").handler(pictureHandler::HandleAddPicture);
        router.delete("/pictures/:picture_id").handler(pictureHandler::HandleDeletePictures);
        router.get("/pictures").handler(pictureHandler::HandleGetPictures);
        router.put("/pictures/:picture_id/tags").handler(pictureHandler::HandleAddTagsToPicture);
        router.put("/pictures/:picture_id").handler(pictureHandler::HandleUpdatePictureMetadata);
    }
}
