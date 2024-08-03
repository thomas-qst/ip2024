package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.AlbumService;
import de.thm.informatikprojekt.gruppe16.backend.services.PictureService;
import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.sqlclient.Tuple;

import java.util.ArrayList;
import java.util.List;

public class PictureHandler {
    private final Vertx vertx;
    private final PictureService pictureService;

    public PictureHandler(Vertx vertx) {
        this.vertx = vertx;
        this.pictureService = new PictureService(IJDBCConnection.initConnection(vertx));
    }

    public void HandleAddPicture(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void HandleDeletePictures(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void HandleGetPictures(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void HandleAddTagsToPicture(RoutingContext ctx) {
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String tags = jObj.getString("tags");
        if (tags == null || tags.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String[] tagsArray = tags.split(" ");
        List<Tuple> batch = new ArrayList<>();
        for (String tag : tagsArray) {
            batch.add(Tuple.of(pictureId, tag));
        }

        pictureService.addTagsToPicture(pictureId, batch)
            .onSuccess(v -> ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(201)
                .end(Json.encodePrettily(new JsonObject().put("success", "Tags added to database"))))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            });
    }

    public void HandleUpdatePictureMetadata(RoutingContext ctx) {
        //TODO: reimplement function
    }
}
