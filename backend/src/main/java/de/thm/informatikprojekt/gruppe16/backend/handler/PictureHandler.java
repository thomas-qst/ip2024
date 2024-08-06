package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.PictureService;
import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.sqlclient.Tuple;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>Handler class for Picture</p>
 * <p>used to handle all functions related to pictures</p>
 * <p>only contains Vertx logic, all database logic is located in {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService}</p>
 */
public class PictureHandler {
    private final PictureService pictureServices;

    public PictureHandler(Vertx vertx) {
        this.pictureServices = new PictureService(IJDBCConnection.initConnection(vertx));
    }

    /**
     * <p>Uses addPicture from {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService} to add one picture and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 400 - Failed to add Image. Missing Arguments</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 201 - Photo added to Database + photo ID</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void HandleAddPicture(RoutingContext ctx) {
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in")));
        }
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }

        final String title = jObj.getString("title");
        final String photo = jObj.getString("photo");
        final LocalDate date = LocalDate.now();

        if (username != null) {
            username = username.replaceAll("\\s+", "");
        }

        if (username == null || username.isEmpty() || title == null || title.isEmpty() || photo.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add Image. Missing Arguments")));
            return;
        }

        pictureServices.addPicture(username,title,photo,date).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(201)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Photo added to Database").put("photo_id", ar.result())));
            } else{
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database Error")));
            }
        });


    }

    /**
     * <p>Uses deletePicture from {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService} to delete one picture and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 404 - Picture not found or user not authorized</p>
     * <p>Status Code 204 - Picture deleted</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void HandleDeletePictures(RoutingContext ctx) {
        String contextUsername = ctx.session().get("user");
        String pictureId = ctx.pathParam("picture_id");

        if (contextUsername == null || contextUsername.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
            return;
        }

        contextUsername = contextUsername.replaceAll("\\s+", "");

        pictureServices.deletePicture(contextUsername, pictureId)
            .onSuccess(v -> {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(204)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Picture deleted")));
            })
            .onFailure(e -> {
                String errorMessage = e.getMessage();
                if ("Picture not found or username not authorized".equals(errorMessage)) {
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
     * <p>Uses getPictures from {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService} to get all picture from the current user and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 200 - Picture found + Pictures</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void HandleGetPictures(RoutingContext ctx) {
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

        pictureServices.getPictures(username).onComplete(result -> {
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
     * <p>Uses addTagsToPicture from {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService} to add tags to one picture and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 404 - Picture not found or user not authorized</p>
     * <p>Status Code 201 - Tags added to database</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void HandleAddTagsToPicture(RoutingContext ctx) {
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
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

        pictureServices.addTagsToPicture(username, pictureId, batch)
            .onSuccess(v -> ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(201)
                .end(Json.encodePrettily(new JsonObject().put("success", "Tags added to database"))))
            .onFailure(e -> {
                if(e.getMessage().equals("Picture not found or username not authorized")){
                    ctx.response()
                        .setStatusCode(404)
                        .putHeader("content-type", "application/json")
                        .end(Json.encodePrettily(new JsonObject().put("error", "Picture not found or user not authorized")));
                }else{
                    e.printStackTrace();
                    ctx.response()
                        .setStatusCode(500)
                        .putHeader("content-type", "application/json")
                        .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                }
            });
    }

    /**
     * <p>Uses updatePictureMetadata from {@link de.thm.informatikprojekt.gruppe16.backend.services.PictureService} to update metadata of one picture and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 404 - Photo not found or user not authorized</p>
     * <p>Status Code 201 - Photo metadata updated</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void HandleUpdatePictureMetadata(RoutingContext ctx) {
        String pictureId = ctx.request().getParam("picture_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
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

        pictureServices.updatePictureMetadata(username, pictureId, jObj).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(201)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Photo metadata updated")));
            } else if ("Photo not found or user not authorized".equals(ar.cause().getMessage())) {
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
}
