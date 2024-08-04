package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
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

                return CompositeFuture.all(tagFutures).compose(ar -> {
                    if (ar.succeeded()) {
                        albumList.sort((a, b) -> Integer.compare(b.getInteger("album_id"), a.getInteger("album_id")));
                        for (JsonObject album : albumList) {
                            ja.add(album);
                        }
                        return Future.succeededFuture(ja);
                    } else {
                        return Future.failedFuture("Failed to fetch tags");
                    }
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
            .preparedQuery("SELECT * FROM photo JOIN fotoapplication.albumfoto ON photo.photo_id = albumfoto.photo_id WHERE username = ? AND album_id = ? ORDER BY photo.photo_id DESC")
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

                return CompositeFuture.all(tagFutures).compose(ar -> {
                    if (ar.succeeded()) {
                        photoList.sort((a, b) -> Integer.compare(b.getInteger("photo_id"), a.getInteger("photo_id")));
                        for (JsonObject picture : photoList) {
                            photosArray.add(picture);
                        }
                        return Future.succeededFuture(photosArray);
                    } else {
                        return Future.failedFuture("Failed to fetch tags");
                    }
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


    public Future<Void> addTagsToAlbum(String albumId, String tags, String username) {
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }
        if (tags == null) {
            return Future.failedFuture(new JsonObject().put("error", "No tags found!").encode());
        }
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }

        return pool.preparedQuery("SELECT 1 FROM album WHERE album_id = ? AND username = ?")
            .execute(Tuple.of(albumId, username))
            .compose(rows -> {
                if (rows.size() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture();
            })
            .compose(v -> pool.preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                .execute(Tuple.of(albumId)))
            .compose(v -> {
                String[] tagsArray = tags.split(" ");
                List<Tuple> batch = new ArrayList<>();
                for (String tag : tagsArray) {
                    batch.add(Tuple.of(albumId, tag));
                }
                return pool.preparedQuery("INSERT INTO albumtags (album_id, tag) VALUES (?, ?)")
                    .executeBatch(batch)
                    .mapEmpty();
            });

    }


    public Future<Void> updateAlbumMetadata(String username, String albumId, JsonObject body) {
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }
        if (body == null) {
            return Future.failedFuture(new JsonObject().put("error", "No body found!").encode());
        }

        List<Object> updateParams = new ArrayList<>();
        StringBuilder updateQuery = new StringBuilder("UPDATE album SET");

        if (body.containsKey("title")) {
            updateQuery.append(" title = ?,");
            updateParams.add(body.getString("title"));
        }

        if (body.containsKey("date")) {
            updateQuery.append(" date = ?,");
            updateParams.add(LocalDate.parse(body.getString("date")));
        }

        if (updateParams.isEmpty() && !body.containsKey("tags")) {
            return Future.failedFuture("No fields to update");
        }

        if (updateQuery.charAt(updateQuery.length() - 1) == ',') {
            updateQuery.deleteCharAt(updateQuery.length() - 1);
        }

        updateQuery.append(" WHERE album_id = ? AND username = ?");
        updateParams.add(albumId);
        updateParams.add(username);

        Future<Void> updateAlbumFuture = pool
            .preparedQuery(updateQuery.toString())
            .execute(Tuple.wrap(updateParams.toArray()))
            .compose(rows -> {
                if (rows.rowCount() == 0) {
                    return Future.failedFuture("Album not found or user not authorized");
                }
                return Future.succeededFuture();
            });

        if (body.containsKey("tags")) {
            String[] tagsArray = body.getString("tags").split(" ");
            List<Tuple> batch = new ArrayList<>();
            for (String tag : tagsArray) {
                batch.add(Tuple.of(albumId, tag));
            }

            Future<Void> deleteTagsFuture = pool
                .preparedQuery("DELETE FROM albumtags WHERE album_id = ?")
                .execute(Tuple.of(albumId))
                .compose(rows -> Future.succeededFuture());

            updateAlbumFuture = updateAlbumFuture.compose(v -> deleteTagsFuture)
                .compose(v -> pool
                    .preparedQuery("INSERT INTO albumtags (album_id, tag) VALUES (?, ?)")
                    .executeBatch(batch)
                    .compose(rows -> Future.succeededFuture())
                );
        }

        return updateAlbumFuture;
    }


    public Future<Void> addPictureToAlbum(String albumId, String pictureId, String username) {
        if (albumId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No albumId found!").encode());
        }
        if (pictureId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No pictureId found!").encode());
        }
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No user found!").encode());
        }

        return checkAlbumOwnership(albumId, username)
            .compose(v -> {
                if(v){
                    return pool
                        .preparedQuery("SELECT 1 FROM photo WHERE photo_id = ? AND username = ?")
                        .execute(Tuple.of(pictureId, username));
                }else{
                    return Future.failedFuture("Album not found or user not authorized");
                }
            })
            .compose(photoRows -> {
                if (photoRows.size() == 0) {
                    return Future.failedFuture("Picture not found or user not authorized");
                }
                return Future.succeededFuture(true);
            })
            .compose(v ->
                pool
                    .preparedQuery("INSERT INTO albumfoto (album_id, photo_id) VALUES (?, ?)")
                    .execute(Tuple.of(albumId, pictureId))
                    .mapEmpty());

    }
}
