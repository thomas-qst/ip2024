package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import de.thm.informatikprojekt.gruppe16.backend.services.AlbumService;

import java.time.LocalDate;

public class AlbumHandler {
    private final AlbumService albumServices;


    public AlbumHandler(Vertx vertx) {
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

        albumServices.getPicturesFromAlbum(username, albumId).onComplete(result -> {
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

        final String title = jObj.getString("title");
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
        String albumId = ctx.request().getParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null || !jObj.containsKey("tags")) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON or missing tags")));
            return;
        }

        String tags = jObj.getString("tags");
        if (tags == null || tags.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Tags cannot be empty")));
            return;
        }

        albumServices.addTagsToAlbum(albumId, tags, username)
            .onSuccess(v -> {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Tags added to album")));
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

    public void handleUpdateAlbumMetadata(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
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

        albumServices.updateAlbumMetadata(username, albumId, jObj).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Album metadata updated")));
            } else if ("Album not found or user not authorized".equals(ar.cause().getMessage())) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end(Json.encodePrettily(new JsonObject().put("error", ar.cause().getMessage())));
            } else {
                ar.cause().printStackTrace();
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });

    }

    public void handleAddPictureToAlbum(RoutingContext ctx) {
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


        albumServices.addPictureToAlbum(albumId, pictureId, username).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(201)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Picture added to album")));
            } else {
                String errorMessage = ar.cause().getMessage();
                if ("Album not found or user not authorized".equals(errorMessage) ||
                    "Picture not found or user not authorized".equals(errorMessage)) {
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
}
