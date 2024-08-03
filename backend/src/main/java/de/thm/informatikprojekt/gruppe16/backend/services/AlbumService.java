package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class AlbumService {
    private final JDBCPool pool;

    public AlbumService(JDBCPool pool) {
        this.pool = pool;
    }

    public Future<Boolean> checkAlbumOwnership(String albumId, String username) {
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }

        return pool.preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
            .execute(Tuple.of(albumId, username))
            .compose(albumRows -> {
                if (albumRows.size() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture(true);
            });
    }

    public Future<Void> deleteAlbum(String albumId, String username) {
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }

        return pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
                    .execute(Tuple.of(albumId, username))
                    .compose(rows -> {
                        if (rows.size() == 0) {
                            return Future.failedFuture("Album not found or user not authorized");
                        }
                        return Future.succeededFuture();
                    })
                    .compose(v -> conn.preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                        .execute(Tuple.of(albumId)))
                    .compose(v -> conn.preparedQuery("DELETE FROM albumfoto WHERE album_id = ?")
                        .execute(Tuple.of(albumId)))
                    .compose(v -> conn.preparedQuery("DELETE FROM album WHERE album_id = ?")
                        .execute(Tuple.of(albumId)))
                    .compose(v -> tx.commit())
                    .onFailure(e -> tx.rollback().compose(v -> Future.failedFuture(e)))
                    .onComplete(ar -> conn.close())
            )
        );

    }

    public Future<JsonArray> getAlbumsByUsername(String username){
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }
        JsonArray ja = new JsonArray();
        return pool
            .preparedQuery("SELECT * FROM album WHERE username = (?) ORDER BY album_id DESC")
            .execute(Tuple.of(username))
            .compose(rows -> {
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

                return Future.succeededFuture(tagFutures).compose(futures -> {
                    CompositeFuture.all(futures).onComplete(ar -> {
                        if (ar.succeeded()) {
                            albumList.sort((a, b) -> Integer.compare(b.getInteger("album_id"), a.getInteger("album_id")));
                            for (JsonObject album : albumList) {
                                ja.add(album);
                            }
                        }
                    });
                    return Future.succeededFuture(ja);
                });
            });
    }


    public Future<JsonArray> getPicturesFromAlbum(String username, String albumId) {
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No album given!").encode());
        }

        JsonArray photosArray = new JsonArray();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return pool
            .preparedQuery("SELECT * FROM photo JOIN fotoapplication.albumfoto ON photo.photo_id = albumfoto.photo_id WHERE user = ? AND album_id = ? ORDER BY photo.photo_id DESC")
            .execute(Tuple.of(username, albumId))
            .compose(rows -> {
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

                return Future.succeededFuture(tagFutures).compose(futures -> {
                    CompositeFuture.all(futures).onComplete(ar -> {
                        if (ar.succeeded()) {
                            photoList.sort((a, b) -> Integer.compare(b.getInteger("photo_id"), a.getInteger("photo_id")));
                            for (JsonObject photo : photoList) {
                                photosArray.add(photo);
                            }
                        }
                    });
                    return Future.succeededFuture(photosArray);
                });
            });
    }

    public Future<Integer> deletePictureFromAlbum(String albumId, String pictureId) {
        if (pictureId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No pictureId found!").encode());
        }
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }

        return pool.preparedQuery("DELETE FROM albumfoto WHERE album_id = ? AND photo_id = ?")
            .execute(Tuple.of(albumId, pictureId))
            .map(res -> res.rowCount());
    }

    public Future<Integer> addAlbum(String title, LocalDate date, String username) {
        if (title == null) {
            return Future.failedFuture(new JsonObject().put("error", "No title found!").encode());
        }
        if (date == null) {
            return Future.failedFuture(new JsonObject().put("error", "No date found!").encode());
        }
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }


        return pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("INSERT INTO album (title, date, username) VALUES (?, ?, ?)")
                    .execute(Tuple.of(title, date, username))
                    .compose(insertResult ->
                        conn.query("SELECT LAST_INSERT_ID() AS album_id")
                            .execute()
                            .compose(selectResult -> {
                                Row row = selectResult.iterator().next();
                                int albumId = row.getInteger("album_id");
                                return tx.commit()
                                    .compose(v -> conn.close().map(albumId))
                                    .onFailure(commitFail -> conn.close().compose(v -> Future.failedFuture(commitFail)));
                            })
                    )
                    .onFailure(e -> tx.rollback()
                        .compose(v -> conn.close())
                        .onFailure(rollbackFail -> conn.close())
                        .compose(v -> Future.failedFuture(e))
                    )
            )
        ).onFailure(Future::failedFuture);
    }
}
