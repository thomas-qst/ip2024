package de.thm.informatikprojekt.gruppe16.backend;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;
import io.vertx.jdbcclient.JDBCConnectOptions;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.PoolOptions;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;
import org.mindrot.jbcrypt.BCrypt;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class MainVerticle extends AbstractVerticle {

    public JDBCPool pool;

    @Override
    public void start(Promise<Void> startPromise) throws Exception {
        Router router = Router.router(vertx);
        Set<String> allowedHeaders = new HashSet<>();
        allowedHeaders.add("x-requested-with");
        allowedHeaders.add("Access-Control-Allow-Origin");
        allowedHeaders.add("origin");
        allowedHeaders.add("Content-Type");
        allowedHeaders.add("accept");
        allowedHeaders.add("X-PINGARUNER");

        Set<HttpMethod> allowedMethods = new HashSet<>();
        allowedMethods.add(HttpMethod.GET);
        allowedMethods.add(HttpMethod.POST);
        allowedMethods.add(HttpMethod.OPTIONS);
        allowedMethods.add(HttpMethod.DELETE);
        allowedMethods.add(HttpMethod.PATCH);
        allowedMethods.add(HttpMethod.PUT);

        initConnection();

        router.route().handler(CorsHandler.create("http://localhost:(63343|8080)").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods).allowCredentials(true));
        router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));
        router.route().handler(BodyHandler.create());

        router.get("/pictures").handler(this::getPicturesByUsername);
        router.get("/albums").handler(this::getAlbumsByUsername);
        router.get("/users").handler(this::getUsers);
        router.get("/login/username").handler(this::getUsernameFromSession);
        router.get("/albums/:album_id").handler(this::getPicturesFromAlbum);

        router.delete("/users/:username").handler(this::deleteUser);
        router.delete("/pictures/:picture_id").handler(this::deletePicture);
        router.delete("/albums/:album_id").handler(this::deleteAlbum);
        router.delete("/login").handler(this::deleteSession);
        router.delete("/albums/:album_id/:picture_id").handler(this::deletePictureFromAlbum);

        router.post("/login").handler(this::login);
        router.post("/users").handler(this::addUser);
        router.post("/pictures").handler(this::addPicture);
        router.post("/albums").handler(this::addAlbum);

        router.put("/tags/pictures/:picture_id").handler(this::addTagsToPicture);
        router.put("/tags/albums/:album_id").handler(this::addTagsToAlbum);
        router.put("/pictures/:picture_id").handler(this::updatePictureMetadata);
        router.put("/albums/:album_id").handler(this::updateAlbumMetadata);

        router.patch("/albums/:album_id/:picture_id").handler(this::addPictureToAlbum);
        router.patch("/login").handler(this::changePassword);


        vertx.createHttpServer().requestHandler(router).listen(8888, http -> {
            if (http.succeeded()) {
                startPromise.complete();
            } else {
                startPromise.fail(http.cause());
            }
        });
    }

    public void getUsernameFromSession(RoutingContext ctx) {
        final String username = ctx.session().get("user");
        //TODO check if user is sill in database
        if (username != null) {
            JsonArray ja = new JsonArray();
            JsonObject jo = new JsonObject();
            jo.put("username", username);
            ja.add(jo);
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(200)
                .end(Json.encodePrettily(new JsonObject().put("success", "User found in session").put("data", ja)));
        } else {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(404)
                .end(Json.encodePrettily(new JsonObject().put("error", "No User found in session")));
        }

    }

    public void getPicturesFromAlbum(RoutingContext ctx) {
        String albumId = ctx.request().getParam("album_id");
        String username = ctx.session().get("user");
        if (albumId == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(404)
                .end(Json.encodePrettily(new JsonObject().put("error", "No album given!")));
        }
        if (username == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "No user found!")));
        }

        JsonArray ja = new JsonArray();
        pool
            .preparedQuery("SELECT * FROM photo join fotoapplication.albumfoto on photo.photo_id = albumfoto.photo_id WHERE user = ? and album_id = ? ORDER BY photo.photo_id DESC")
            .execute(Tuple.of(username, albumId))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                List<Future> tagFutures = new ArrayList<>();
                List<JsonObject> photoList = new ArrayList<>();

                for (Row row : rows) {
                    JsonObject photoJson = new JsonObject();
                    int photoId = row.getInteger("photo_id");
                    photoJson
                        .put("photo_id", photoId)
                        .put("title", row.getString("title"))
                        .put("photo", row.getString("photo"))
                        .put("date", row.getLocalDate("date").format(formatter));

                    Future<Void> tagFuture = pool
                        .preparedQuery("SELECT tag FROM phototags WHERE photo_id = ?")
                        .execute(Tuple.of(photoId))
                        .compose(tagRows -> {
                            JsonArray tags = new JsonArray();
                            for (Row tagRow : tagRows) {
                                tags.add(tagRow.getString("tag"));
                            }
                            photoJson.put("tags", tags);
                            photoList.add(photoJson);
                            return Future.succeededFuture();
                        });

                    tagFutures.add(tagFuture);
                }

                CompositeFuture.all(tagFutures).onComplete(ar -> {
                    if (ar.succeeded()) {
                        // Sort the photoList by photo_id in descending order
                        photoList.sort((a, b) -> Integer.compare(b.getInteger("photo_id"), a.getInteger("photo_id")));
                        for (JsonObject photo : photoList) {
                            ja.add(photo);
                        }
                        ctx.response()
                            .setStatusCode(200)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("success", "Pictures found").put("data", ja)));
                    } else {
                        ar.cause().printStackTrace();
                        ctx.response()
                            .setStatusCode(500)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("error", "Failed to fetch tags")));
                    }
                });
            });
    }

    public String passwordHash(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public void login(RoutingContext ctx) {
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String username = jObj.getString("username");
        String password = jObj.getString("password_hash");


        if (username != null && password != null) {
            username = username.replaceAll("\\s+", "");
            password = password.replaceAll("\\s+", "");
        }

        if (username == null || password == null || username.isEmpty() || password.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add User. Missing Arguments")));
            return;
        }

        final String finalUsername = username;
        final String finalPassword = password;

        pool
            .preparedQuery("SELECT password_hash,one_time_password from user where username = (?)")
            .execute(Tuple.of(finalUsername, finalPassword))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                if (rows.size() == 1) {
                    Row row = rows.iterator().next();
                    if (BCrypt.checkpw(finalPassword, row.getString("password_hash"))) {
                        if (row.getBoolean("one_time_password")) {
                            ctx.session().put("user", finalUsername);
                            ctx.session().put("OTP", true);
                            ctx.response()
                                .setStatusCode(200)
                                .putHeader("content-type", "application/json")
                                .end(Json.encodePrettily(new JsonObject().put("success", "User added to session, OTP detected!")));
                        } else {
                            ctx.session().put("user", finalUsername);
                            ctx.response()
                                .setStatusCode(201)
                                .putHeader("content-type", "application/json")
                                .end(Json.encodePrettily(new JsonObject().put("success", "User added to session")));
                        }
                    } else {
                        ctx.response()
                            .putHeader("content-type", "application/json")
                            .setStatusCode(404)
                            .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
                    }
                } else {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(404)
                        .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
                }
            });
    }

    public void deleteSession(RoutingContext ctx) {
        ctx.session().destroy();
        ctx.response()
            .putHeader("content-type", "application/json")
            .setStatusCode(204)
            .end();
    }

    public void deletePictureFromAlbum(RoutingContext ctx) {
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

        Future<Boolean> checkOwnershipFuture = pool
            .preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
            .execute(Tuple.of(albumId, username))
            .compose(albumRows -> {
                if (albumRows.size() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture(true);
            });

        checkOwnershipFuture.compose(v ->
            pool
                .preparedQuery("DELETE FROM albumfoto WHERE album_id = ? AND photo_id = ?")
                .execute(Tuple.of(albumId, pictureId))
        ).onComplete(ar -> {
            if (ar.succeeded()) {
                if (ar.result().rowCount() > 0) {
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

    public void getPicturesByUsername(RoutingContext ctx) {
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

        final String finalUsername = username;

        JsonArray ja = new JsonArray();
        pool
            .preparedQuery("SELECT * FROM photo WHERE user = ? ORDER BY photo_id DESC")
            .execute(Tuple.of(finalUsername))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                List<Future> tagFutures = new ArrayList<>();
                List<JsonObject> photoList = new ArrayList<>();

                for (Row row : rows) {
                    JsonObject photoJson = new JsonObject();
                    int photoId = row.getInteger("photo_id");
                    photoJson
                        .put("photo_id", photoId)
                        .put("title", row.getString("title"))
                        .put("photo", row.getString("photo"))
                        .put("date", row.getLocalDate("date").format(formatter));

                    Future<Void> tagFuture = pool
                        .preparedQuery("SELECT tag FROM phototags WHERE photo_id = ?")
                        .execute(Tuple.of(photoId))
                        .compose(tagRows -> {
                            JsonArray tags = new JsonArray();
                            for (Row tagRow : tagRows) {
                                tags.add(tagRow.getString("tag"));
                            }
                            photoJson.put("tags", tags);
                            photoList.add(photoJson);
                            return Future.succeededFuture();
                        });

                    tagFutures.add(tagFuture);
                }

                CompositeFuture.all(tagFutures).onComplete(ar -> {
                    if (ar.succeeded()) {
                        // Sort the photoList by photo_id in descending order
                        photoList.sort((a, b) -> Integer.compare(b.getInteger("photo_id"), a.getInteger("photo_id")));
                        for (JsonObject photo : photoList) {
                            ja.add(photo);
                        }
                        ctx.response()
                            .setStatusCode(200)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("success", "Pictures found").put("data", ja)));
                    } else {
                        ar.cause().printStackTrace();
                        ctx.response()
                            .setStatusCode(500)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("error", "Failed to fetch tags")));
                    }
                });
            });
    }

    public void getAlbumsByUsername(RoutingContext ctx) {
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

        final String finalUsername = username;

        JsonArray ja = new JsonArray();
        pool
            .preparedQuery("SELECT * FROM album WHERE username = (?) ORDER BY album_id DESC")
            .execute(Tuple.of(finalUsername))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                List<Future> tagFutures = new ArrayList<>();
                List<JsonObject> albumList = new ArrayList<>();

                for (Row row : rows) {
                    JsonObject albumJson = new JsonObject();
                    int albumId = row.getInteger("album_id");
                    albumJson
                        .put("album_id", albumId)
                        .put("title", row.getString("title"))
                        .put("date", row.getLocalDate("date").format(formatter));

                    Future<Void> tagFuture = pool
                        .preparedQuery("SELECT tag FROM albumtags WHERE album_id = (?)")
                        .execute(Tuple.of(albumId))
                        .compose(tagRows -> {
                            JsonArray tags = new JsonArray();
                            for (Row tagRow : tagRows) {
                                tags.add(tagRow.getString("tag"));
                            }
                            albumJson.put("tags", tags);
                            albumList.add(albumJson);
                            return Future.succeededFuture();
                        });

                    tagFutures.add(tagFuture);
                }

                CompositeFuture.all(tagFutures).onComplete(ar -> {
                    if (ar.succeeded()) {
                        // Sort the photoList by photo_id in descending order
                        albumList.sort((a, b) -> Integer.compare(b.getInteger("album_id"), a.getInteger("album_id")));
                        for (JsonObject album : albumList) {
                            ja.add(album);
                        }
                        ctx.response()
                            .setStatusCode(200)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("success", "Albums found").put("data", ja)));
                    } else {
                        ar.cause().printStackTrace();
                        ctx.response()
                            .setStatusCode(500)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("error", "Failed to fetch tags")));
                    }
                });
            });
    }

    public void getUsers(RoutingContext ctx) {
        String username = ctx.session().get("user");
        if (!Objects.equals(username, "Admin")) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Unauthorized")));
            return;
        }

        JsonArray ja = new JsonArray();
        pool
            .query("SELECT username from user where username != 'Admin'")
            .execute()
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                for (Row row : rows) {
                    JsonObject userJson = new JsonObject();
                    userJson
                        .put("username", row.getString("username"));
                    ja.add(userJson);
                }
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "Users found").put("data", ja)));
            });
    }

    public void deleteUser(RoutingContext ctx) {
        String usernameToDelete = ctx.pathParam("username");
        String requestingUser = ctx.session().get("user");

        if (requestingUser == null || requestingUser.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        if (Objects.equals(usernameToDelete, "Admin")) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "unauthorized")));
        }

        // Check if the requesting user is an admin
        pool.preparedQuery("SELECT username FROM user WHERE username = ?")
            .execute(Tuple.of(requestingUser))
            .compose(rows -> {
                if (rows.size() == 0) {
                    return Future.failedFuture("Requesting user not found");
                }
                return Future.succeededFuture();
            })
            .compose(v -> {
                // Start a transaction
                return pool.getConnection().compose(conn -> {
                    return conn.begin().compose(tx -> {
                        // Delete user's photos and related data
                        return conn.preparedQuery("DELETE FROM phototags WHERE photo_id IN (SELECT photo_id FROM photo WHERE user = ?)")
                            .execute(Tuple.of(usernameToDelete))
                            .compose(v1 -> conn.preparedQuery("DELETE FROM albumfoto WHERE photo_id IN (SELECT photo_id FROM photo WHERE user = ?)")
                                .execute(Tuple.of(usernameToDelete)))
                            .compose(v2 -> conn.preparedQuery("DELETE FROM photo WHERE user = ?")
                                .execute(Tuple.of(usernameToDelete)))
                            // Delete user's albums and related data
                            .compose(v3 -> conn.preparedQuery("DELETE FROM albumtags WHERE album_id IN (SELECT album_id FROM album WHERE username = ?)")
                                .execute(Tuple.of(usernameToDelete)))
                            .compose(v4 -> conn.preparedQuery("DELETE FROM albumfoto WHERE album_id IN (SELECT album_id FROM album WHERE username = ?)")
                                .execute(Tuple.of(usernameToDelete)))
                            .compose(v5 -> conn.preparedQuery("DELETE FROM album WHERE username = ?")
                                .execute(Tuple.of(usernameToDelete)))
                            // Finally, delete the user
                            .compose(v6 -> conn.preparedQuery("DELETE FROM user WHERE username = ?")
                                .execute(Tuple.of(usernameToDelete)))
                            .compose(v7 -> {
                                if (v7.rowCount() == 0) {
                                    return Future.failedFuture("User not found");
                                }
                                return tx.commit();
                            })
                            .onComplete(ar -> {
                                conn.close();
                                if (ar.succeeded()) {
                                    ctx.response()
                                        .putHeader("content-type", "application/json")
                                        .setStatusCode(200)
                                        .end(Json.encodePrettily(new JsonObject().put("success", "User deleted")));
                                } else {
                                    tx.rollback();
                                    String errorMessage = ar.cause().getMessage();
                                    if ("User not found".equals(errorMessage)) {
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
                    });
                });
            })
            .onFailure(e -> {
                String errorMessage = e.getMessage();
                if ("Requesting user not found".equals(errorMessage)) {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(403)
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

    public void deletePicture(RoutingContext ctx) {
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
        final String username = contextUsername;

        Future<Void> deleteTagsFuture = pool
            .preparedQuery("DELETE FROM phototags WHERE photo_id = ?")
            .execute(Tuple.of(pictureId))
            .compose(rows -> Future.succeededFuture());

        Future<Void> deletePhotoFuture = deleteTagsFuture.compose(v ->
            pool
                .preparedQuery("DELETE FROM photo WHERE user = ? AND photo_id = ?")
                .execute(Tuple.of(username, pictureId))
                .compose(rows -> {
                    if (rows.rowCount() > 0) {
                        return Future.succeededFuture();
                    } else {
                        return Future.failedFuture("Picture not found");
                    }
                })
        );

        deletePhotoFuture.onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "Picture deleted!")));
            } else if ("Picture not found".equals(ar.cause().getMessage())) {
                ctx.response()
                    .setStatusCode(404)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Picture not found!")));
            } else {
                ar.cause().printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });
    }

    public void deleteAlbum(RoutingContext ctx) {
        String albumId = ctx.pathParam("album_id");
        String username = ctx.session().get("user");

        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        pool.getConnection()
            .compose(conn -> {
                return conn.begin().compose(tx -> {
                    // Check if the user owns the album
                    return conn.preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
                        .execute(Tuple.of(albumId, username))
                        .compose(rows -> {
                            if (rows.size() == 0) {
                                return Future.failedFuture("Album not found or user not authorized");
                            }
                            return Future.succeededFuture();
                        })
                        .compose(v -> {
                            // Delete tags associated with the album
                            return conn.preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                                .execute(Tuple.of(albumId));
                        })
                        .compose(v -> {
                            // Delete photo associations with the album
                            return conn.preparedQuery("DELETE FROM albumfoto WHERE album_id = ?")
                                .execute(Tuple.of(albumId));
                        })
                        .compose(v -> {
                            // Delete the album itself
                            return conn.preparedQuery("DELETE FROM album WHERE album_id = ?")
                                .execute(Tuple.of(albumId));
                        })
                        .compose(v -> {
                            // Commit the transaction
                            return tx.commit();
                        })
                        .onComplete(ar -> {
                            // Always close the connection
                            conn.close();
                            if (ar.succeeded()) {
                                ctx.response()
                                    .putHeader("content-type", "application/json")
                                    .setStatusCode(200)
                                    .end(Json.encodePrettily(new JsonObject().put("success", "Album deleted")));
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
                });
            })
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database connection error")));
            });
    }

    public void addUser(RoutingContext ctx) {
        String requestUser = ctx.session().get("user");
        if (!Objects.equals(requestUser, "Admin")) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "unauthorized")));
        }

        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String username = jObj.getString("username");
        String password_hash = passwordHash(jObj.getString("password"));
        boolean otp;
        if (!jObj.containsKey("OTP")) {
            otp = true;
        } else {
            otp = jObj.getBoolean("OTP");
        }

        if (username != null && password_hash != null) {
            username = username.replaceAll("\\s+", "");
            password_hash = password_hash.replaceAll("\\s+", "");
        }

        if (username == null || password_hash == null || username.isEmpty() || password_hash.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add User. Missing Arguments")));
            return;
        }

        final String finalUsername = username;
        final String finalPassword_hash = password_hash;

        pool
            .preparedQuery("select * from user where username = (?)")
            .execute(Tuple.of(finalUsername))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> {
                if (rows.size() > 0) {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(400)
                        .end(Json.encodePrettily(new JsonObject().put("error", "Username already in Database")));
                } else {
                    pool
                        .preparedQuery("INSERT INTO user (username, password_hash, one_time_password) VALUES (?, ?, ?)")
                        .execute(Tuple.of(finalUsername, finalPassword_hash, otp))
                        .onFailure(e -> {
                            e.printStackTrace();
                            ctx.response()
                                .setStatusCode(500)
                                .putHeader("content-type", "application/json")
                                .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                        })
                        .onSuccess(insertRows -> ctx.response()
                            .setStatusCode(201)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("success", "User added to Database"))));
                }
            });
    }

    public void addPicture(RoutingContext ctx) {
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
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

        final String finalUsername = username;

        pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("INSERT INTO photo (title, photo, date, user) VALUES (?, ?, ?, ?)")
                    .execute(Tuple.of(title, photo, date, finalUsername))
                    .compose(insertResult ->
                        conn.query("SELECT LAST_INSERT_ID() AS photo_id")
                            .execute()
                            .compose(selectResult -> {
                                tx.commit();
                                Row row = selectResult.iterator().next();
                                int photoId = row.getInteger("photo_id");
                                ctx.response()
                                    .setStatusCode(201)
                                    .putHeader("content-type", "application/json")
                                    .end(Json.encodePrettily(new JsonObject().put("success", "Photo added to Database").put("photo_id", photoId)));
                                return conn.close();
                            })
                    ).onFailure(e -> {
                        tx.rollback();
                        conn.close();
                        e.printStackTrace();
                        ctx.response()
                            .setStatusCode(500)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                    })
            )
        ).onFailure(e -> {
            e.printStackTrace();
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
        });
    }

    public void addAlbum(RoutingContext ctx) {
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

        final String finalUsername = username;
        pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("INSERT INTO album (title, date, username) VALUES (?, ?, ?)")
                    .execute(Tuple.of(title, date, finalUsername))
                    .compose(insertResult ->
                        conn.query("SELECT LAST_INSERT_ID() AS album_id")
                            .execute()
                            .compose(selectResult -> {
                                tx.commit();
                                Row row = selectResult.iterator().next();
                                int albumId = row.getInteger("album_id");
                                ctx.response()
                                    .setStatusCode(201)
                                    .putHeader("content-type", "application/json")
                                    .end(Json.encodePrettily(new JsonObject().put("success", "Album added to Database").put("album_id", albumId)));
                                return conn.close();
                            })
                    ).onFailure(e -> {
                        tx.rollback();
                        conn.close();
                        e.printStackTrace();
                        ctx.response()
                            .setStatusCode(500)
                            .putHeader("content-type", "application/json")
                            .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
                    })
            )
        ).onFailure(e -> {
            e.printStackTrace();
            ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
        });

    }

    public void addTagsToPicture(RoutingContext ctx) {
        String pictureId = ctx.request().getParam("picture_Id");
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

        pool
            .preparedQuery("INSERT INTO phototags (photo_id, tag) VALUES (?, ?)")
            .executeBatch(batch)
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(rows -> ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(201)
                .end(Json.encodePrettily(new JsonObject().put("success", "Tags added to database"))));
    }

    public void addTagsToAlbum(RoutingContext ctx) {
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

        pool.preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
            .execute(Tuple.of(albumId, username))
            .compose(rows -> {
                if (rows.size() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture();
            })
            .compose(v -> {
                // Delete existing tags for this album
                return pool.preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                    .execute(Tuple.of(albumId));
            })
            .compose(v -> {
                // Insert new tags
                String[] tagsArray = tags.split(" ");
                List<Tuple> batch = new ArrayList<>();
                for (String tag : tagsArray) {
                    batch.add(Tuple.of(albumId, tag));
                }
                return pool.preparedQuery("INSERT INTO albumtags (album_id, tag) VALUES (?, ?)")
                    .executeBatch(batch);
            })
            .onComplete(ar -> {
                if (ar.succeeded()) {
                    ctx.response()
                        .putHeader("content-type", "application/json")
                        .setStatusCode(200)
                        .end(Json.encodePrettily(new JsonObject().put("success", "Tags added to album")));
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

    public void updatePictureMetadata(RoutingContext ctx) {
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

        List<Object> updateParams = new ArrayList<>();
        StringBuilder updateQuery = new StringBuilder("UPDATE photo SET");

        if (jObj.containsKey("title")) {
            updateQuery.append(" title = ?,");
            updateParams.add(jObj.getString("title"));
        }

        if (jObj.containsKey("date")) {
            updateQuery.append(" date = ?,");
            updateParams.add(LocalDate.parse(jObj.getString("date")));
        }

        if (updateParams.isEmpty() && !jObj.containsKey("tags")) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "No fields to update")));
            return;
        }

        // Remove the last comma
        if (updateQuery.charAt(updateQuery.length() - 1) == ',') {
            updateQuery.deleteCharAt(updateQuery.length() - 1);
        }

        updateQuery.append(" WHERE photo_id = ? AND user = ?");
        updateParams.add(pictureId);
        updateParams.add(username);

        Future<Void> updatePhotoFuture = pool
            .preparedQuery(updateQuery.toString())
            .execute(Tuple.wrap(updateParams.toArray()))
            .compose(rows -> {
                if (rows.rowCount() == 0) {
                    return Future.failedFuture("Photo not found or user not authorized");
                }
                return Future.succeededFuture();
            });

        if (jObj.containsKey("tags")) {
            String[] tagsArray = jObj.getString("tags").split(" ");
            List<Tuple> batch = new ArrayList<>();
            for (String tag : tagsArray) {
                batch.add(Tuple.of(pictureId, tag));
            }

            Future<Void> deleteTagsFuture = pool
                .preparedQuery("DELETE FROM phototags WHERE photo_id = ?")
                .execute(Tuple.of(pictureId))
                .compose(rows -> Future.succeededFuture());

            updatePhotoFuture = updatePhotoFuture.compose(v -> deleteTagsFuture)
                .compose(v -> pool
                    .preparedQuery("INSERT INTO phototags (photo_id, tag) VALUES (?, ?)")
                    .executeBatch(batch)
                    .compose(rows -> Future.succeededFuture())
                );
        }

        updatePhotoFuture.onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
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

    public void updateAlbumMetadata(RoutingContext ctx) {
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

        List<Object> updateParams = new ArrayList<>();
        StringBuilder updateQuery = new StringBuilder("UPDATE album SET");

        if (jObj.containsKey("title")) {
            updateQuery.append(" title = ?,");
            updateParams.add(jObj.getString("title"));
        }

        if (jObj.containsKey("date")) {
            updateQuery.append(" date = ?,");
            updateParams.add(LocalDate.parse(jObj.getString("date")));
        }

        if (updateParams.isEmpty() && !jObj.containsKey("tags")) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "No fields to update")));
            return;
        }

        // Remove the last comma
        if (updateQuery.charAt(updateQuery.length() - 1) == ',') {
            updateQuery.deleteCharAt(updateQuery.length() - 1);
        }

        updateQuery.append(" WHERE album_id = ? AND username = ?");
        updateParams.add(albumId);
        updateParams.add(username);

        Future<Void> updatePhotoFuture = pool
            .preparedQuery(updateQuery.toString())
            .execute(Tuple.wrap(updateParams.toArray()))
            .compose(rows -> {
                if (rows.rowCount() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture();
            });

        if (jObj.containsKey("tags")) {
            String[] tagsArray = jObj.getString("tags").split(" ");
            List<Tuple> batch = new ArrayList<>();
            for (String tag : tagsArray) {
                batch.add(Tuple.of(albumId, tag));
            }

            Future<Void> deleteTagsFuture = pool
                .preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                .execute(Tuple.of(albumId))
                .compose(rows -> Future.succeededFuture());

            updatePhotoFuture = updatePhotoFuture.compose(v -> deleteTagsFuture)
                .compose(v -> pool
                    .preparedQuery("INSERT INTO albumtags (album_id, tag) VALUES (?, ?)")
                    .executeBatch(batch)
                    .compose(rows -> Future.succeededFuture())
                );
        }

        updatePhotoFuture.onComplete(ar -> {
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

    public void addPictureToAlbum(RoutingContext ctx) {
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

        Future<Boolean> checkOwnershipFuture = pool
            .preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
            .execute(Tuple.of(albumId, username))
            .compose(albumRows -> {
                if (albumRows.size() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return pool
                    .preparedQuery("SELECT 1 FROM photo WHERE photo_id = ? AND user = ?")
                    .execute(Tuple.of(pictureId, username));
            })
            .compose(photoRows -> {
                if (photoRows.size() == 0) {
                    return Future.failedFuture("Picture not found or user not authorized");
                }
                return Future.succeededFuture(true);
            });

        checkOwnershipFuture.compose(v ->
            pool
                .preparedQuery("INSERT INTO albumfoto (album_id, photo_id) VALUES (?, ?)")
                .execute(Tuple.of(albumId, pictureId))
        ).onComplete(ar -> {
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


    public void changePassword(RoutingContext ctx) {
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String password_hash = passwordHash(jObj.getString("password_hash"));
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "You need to be logged in")));
        }

        pool.preparedQuery("update user set password_hash = ?,one_time_password = false where username = ?")
            .execute(Tuple.of(password_hash, username))
            .onFailure(e -> {
                e.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(updateRows -> ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(201)
                .end(Json.encodePrettily(new JsonObject().put("success", "Password updated"))));

    }

    public void initConnection() {
        pool = JDBCPool.pool(
            vertx,
            // configure the connection
            new JDBCConnectOptions()
                // H2 connection string
                .setJdbcUrl("jdbc:mariadb://localhost:3306/fotoapplication")
                // username
                .setUser("FotoApplication")
                // password
                .setPassword("1234"),
            // configure the pool
            new PoolOptions()
                .setMaxSize(16)
                .setName("pool")
        );
    }

}
