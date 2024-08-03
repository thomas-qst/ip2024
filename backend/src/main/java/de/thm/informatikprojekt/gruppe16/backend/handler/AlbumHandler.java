package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import de.thm.informatikprojekt.gruppe16.backend.services.AlbumService;

import java.time.LocalDate;

public class AlbumHandler {
    private final Vertx vertx;
    private final AlbumService albumServices;


    public AlbumHandler(Vertx vertx) {
        this.vertx = vertx;
        this.albumServices = new AlbumService(IJDBCConnection.initConnection(vertx));
    }

    public void handleGetAlbumsByUsername(RoutingContext ctx) {
        String username = ctx.session().get("user");

        if (username != null) {
            username = username.replaceAll("\\s+", "");
        }

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
            return;
        }
        albumServices.getAlbumsByUsername(username).onComplete(result -> {
            if (result.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Albums found").put("data", result.result())));
            } else {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });

    }

    public void handleGetPicturesFromAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String username = ctx.session().get("user");

        if (albumId == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(404)
                .end(Json.encodePrettily(new JsonObject().put("error", "No album given!")));
            return;
        }

        if (username == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "No user found!")));
            return;
        }

        albumServices.getPicturesFromAlbum(albumId, username).onComplete(result -> {
            if (result.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Pictures found").put("data", result.result())));
            } else {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });
    }

    public void handleDeleteAlbum(RoutingContext ctx) {
        String albumId = ctx.pathParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        albumServices.deleteAlbum(albumId, username)
            .onSuccess(v -> {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Album deleted")));
            })
            .onFailure(e -> {
                String errorMessage = e.getMessage();
                if ("Album not found or user not authorized".equals(errorMessage)) {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(404)
                        .end(Json.encodePrettily(new JsonObject().put("error", errorMessage)));
                } else {
                    e.printStackTrace();
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(500)
                        .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                }
            });


    }

    public void handleDeletePictureFromAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        albumServices.checkAlbumOwnership(albumId, username)
            .compose(ownershipVerified -> albumServices.deletePictureFromAlbum(albumId, pictureId))
            .onComplete(ar -> {
                if (ar.succeeded()) {
                    if (ar.result() > 0) {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(200)
                            .end(Json.encodePrettily(new JsonObject().put("success", "Picture removed from album")));
                    } else {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(404)
                            .end(Json.encodePrettily(new JsonObject().put("error", "Picture not found in the album")));
                    }
                } else {
                    String errorMessage = ar.cause().getMessage();
                    if ("Album not found or user not authorized".equals(errorMessage)) {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(404)
                            .end(Json.encodePrettily(new JsonObject().put("error", errorMessage)));
                    } else {
                        ar.cause().printStackTrace();
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(500)
                            .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                    }
                }
            });

    }

    public void handleAddAlbum(RoutingContext ctx) {
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }

        final String title = (String) jObj.getString("title");
        final LocalDate date = LocalDate.now();
        String username = ctx.session().get("user");

        if (username != null) {
            username = username.replaceAll("\\s+", "");
        }

        if (username == null || username.isEmpty() || title == null || title.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add Album. Missing Arguments")));
            return;
        }

        albumServices.addAlbum(title, date, username)
            .onSuccess(albumId -> {
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "Album added to Database").put("album_id", albumId)));
            })
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            });


    }

    public void handleAddTagsToAlbum(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void handleUpdateAlbumMetadata(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void handleAddPictureToAlbum(RoutingContext ctx) {
        //TODO: reimplement function
    }
}
