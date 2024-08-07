package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import de.thm.informatikprojekt.gruppe16.backend.services.AlbumService;

import java.time.LocalDate;

/**
 * <p>Handler class for Album</p>
 * <p>used to handle all functions related to albums</p>
 * <p>only contains Vertx logic, all database logic is located in {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService}</p>
 */
public class AlbumHandler {
    private final AlbumService albumServices;


    public AlbumHandler(Vertx vertx) {
        this.albumServices = new AlbumService(IJDBCConnection.initConnection(vertx));
    }

    /**
     * <p>Uses getAlbumsByUsername from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to get all albums from one user and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 200 - Albums found + data</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
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

    /**
     * <p>Uses getPicturesFromAlbum from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to get all pictures from one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 404 - No album given</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 200 - Pictures found + data</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
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
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
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

    /**
     * <p>Uses deleteAlbum from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to delete one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 404 - Album not found or user not authorized</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 204 - Album deleted</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleDeleteAlbum(RoutingContext ctx) {
        String albumId = ctx.pathParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
            return;
        }

        albumServices.deleteAlbum(albumId, username)
            .onSuccess(v -> {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(204)
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

    /**
     * <p>Uses deletePictureFromAlbum and checkAlbumOwnership from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to delete one picture from one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 404 - Picture not found in the album</p>
     * <p>Status Code 404 - Album not found or user not authorized</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 204 - Picture removed from album</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleDeletePictureFromAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
            return;
        }

        albumServices.checkAlbumOwnership(albumId, username)
            .compose(ownershipVerified -> albumServices.deletePictureFromAlbum(albumId, pictureId))
            .onComplete(ar -> {
                if (ar.succeeded()) {
                    if (ar.result() > 0) {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(204)
                            .end(Json.encodePrettily(new JsonObject().put("success", "Picture removed from album")));
                    } else {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(404)
                            .end(Json.encodePrettily(new JsonObject().put("error", "Picture not found or user not authorized")));
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

    /**
     * <p>Uses addAlbum from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to add one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 400 - Failed to add Album. Missing Arguments</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 201 - Album added to Database + album id</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
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

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
            return;
        }

        if(title == null || title.isEmpty()){
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

    /**
     * <p>Uses addTagsToAlbum from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to add tags to one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON or missing tags</p>
     * <p>Status Code 400 - Tags cannot be empty</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 404 - Album not found or user not authorized</p>
     * <p>Status Code 201 - Tags added to album</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleAddTagsToAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in")));
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
                    .setStatusCode(201)
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

    /**
     * <p>Uses updateAlbumMetadata from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to change the metadata of one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 404 - Album not found or user not authorized</p>
     * <p>Status Code 201 - Album metadata updated</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleUpdateAlbumMetadata(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in")));
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
                    .setStatusCode(201)
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

    /**
     * <p>Uses addPictureToAlbum from {@link de.thm.informatikprojekt.gruppe16.backend.services.AlbumService} to add on picture to one album and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 404 - Album not found or user not authorized</p>
     * <p>Status Code 404 - Picture not found or user not authorized</p>
     * <p>Status Code 201 - Picture added to album</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleAddPictureToAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in")));
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
