package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Tuple;
import io.vertx.sqlclient.Row;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>Service class for Picture</p>
 * <p>used to handle all database communication related to pictures</p>
 */
public class PictureService {
    private final JDBCPool pool;

    public PictureService(JDBCPool pool) {
        this.pool = pool;
    }

    /**
     * Adds the tags to the picture if the user owns the picture.
     * @param username
     * @param pictureId
     * @param batch
     * @return Future Void
     */
    public Future<Void> addTagsToPicture(String username, String pictureId, List<Tuple> batch) {
        if(pictureId == null || pictureId.isEmpty()){
            return Future.failedFuture("Picture ID cannot be empty");
        }
        if(batch == null || batch.isEmpty()){
            return Future.failedFuture("Batch cannot be empty");
        }
        if(username == null || username.isEmpty()){
            return Future.failedFuture("Username cannot be empty");
        }

        return pool.preparedQuery("SELECT 1 FROM photo WHERE photo_id = ? AND username = ?")
            .execute(Tuple.of(pictureId, username))
            .compose(v -> {
               if(v.iterator().hasNext()){
                   return pool.preparedQuery("INSERT INTO phototags (photo_id, tag) VALUES (?, ?)")
                       .executeBatch(batch)
                       .mapEmpty();
               }else{
                   return Future.failedFuture("Picture not found or username not authorized");
               }
            });
    }

    /**
     * Adds the Picture.
     * @param username
     * @param title
     * @param photo
     * @param date
     * @return Future Integer - photo ID
     */
    public Future<Integer> addPicture(String username, String title, String photo, LocalDate date){
        if(username == null || username.isEmpty()){
            return Future.failedFuture("User cannot be empty");
        }
        if(title == null || title.isEmpty()){
            return Future.failedFuture("Title cannot be empty");
        }
        if(photo  == null || photo.isEmpty()){
            return Future.failedFuture("Photo cannot be empty");
        }
        if(date == null){
            return Future.failedFuture("Date cannot be empty");
        }

        return pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("INSERT INTO photo (title, photo, date, username) VALUES (?, ?, ?, ?)")
                    .execute(Tuple.of(title, photo, date, username))
                    .compose(insertResult ->
                        conn.query("SELECT LAST_INSERT_ID() AS photo_id")
                            .execute()
                            .compose(selectResult -> {
                                tx.commit();
                                Row row = selectResult.iterator().next();
                                conn.close();
                                int photoId = row.getInteger("photo_id");
                                return Future.succeededFuture(photoId);
                            })
                    ).onFailure(e -> {
                        tx.rollback();
                        conn.close();
                    })
            )
        );

    }

    /**
     * Deletes the picture if the username owns the picture.
     * @param username
     * @param pictureId
     * @return Future Void
     */
    public Future<Void> deletePicture(String username, String pictureId){
        if(pictureId == null || pictureId.isEmpty()){
            return Future.failedFuture("Picture ID cannot be empty");
        }

        if(username == null || username.isEmpty()){
            return Future.failedFuture("User cannot be empty");
        }

        return pool.getConnection().compose(conn ->
            conn.begin().compose(tx ->
                conn.preparedQuery("SELECT 1 FROM photo WHERE photo_id = ? AND username = ?")
                    .execute(Tuple.of(pictureId, username))
                    .compose(rows -> {
                        if (rows.iterator().hasNext()) {
                            return Future.succeededFuture();
                        }
                        return Future.failedFuture("Picture not found or username not authorized");
                    })
                    .compose(v -> conn.preparedQuery("DELETE FROM phototags WHERE photo_id = ?")
                        .execute(Tuple.of(pictureId)))
                    .compose(v -> conn.preparedQuery("DELETE FROM albumfoto WHERE photo_id = ?")
                        .execute(Tuple.of(pictureId)))
                    .compose(v -> conn.preparedQuery("DELETE FROM photo WHERE photo_id = ?")
                        .execute(Tuple.of(pictureId)))
                    .compose(v -> tx.commit())
                    .onFailure(e -> tx.rollback().compose(v -> Future.failedFuture(e)))
                    .onComplete(ar -> conn.close())
            )
        );
    }

    /**
     * Gets all picture from the username.
     * @param username
     * @return Future JsonArray - contains the photo data
     */
    public Future<JsonArray> getPictures(String username){
        if (username == null) {
            return Future.failedFuture(new JsonObject().put("error", "No username found!").encode());
        }
        JsonArray ja = new JsonArray();
        return pool
            .preparedQuery("SELECT * FROM photo WHERE username = (?) ORDER BY photo_id DESC")
            .execute(Tuple.of(username))
            .compose(rows -> {
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
                        .preparedQuery("SELECT tag FROM phototags WHERE photo_id = (?)")
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
                            ja.add(picture);
                        }
                        return Future.succeededFuture(ja);
                    } else {
                        return Future.failedFuture("Failed to fetch tags");
                    }
                });
            });
    }

    /**
     * Updates the picture metadata given in the body if the username owns the picture.
     * @param username
     * @param photoId
     * @param body Json request body
     * @return Future Void
     */
    public Future<Void> updatePictureMetadata(String username, String photoId, JsonObject body) {
        if (photoId == null) {
            return Future.failedFuture(new JsonObject().put("error", "No photoId found!").encode());
        }
        if (body == null) {
            return Future.failedFuture(new JsonObject().put("error", "No body found!").encode());
        }

        List<Object> updateParams = new ArrayList<>();
        StringBuilder updateQuery = new StringBuilder("UPDATE photo SET");

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

        updateQuery.append(" WHERE photo_id = ? AND username = ?");
        updateParams.add(photoId);
        updateParams.add(username);

        Future<Void> updatePhotoFuture = pool
            .preparedQuery(updateQuery.toString())
            .execute(Tuple.wrap(updateParams.toArray()))
            .compose(rows -> {
                if (!rows.iterator().hasNext()) {
                    return Future.failedFuture("Photo not found or user not authorized");
                }
                return Future.succeededFuture();
            });

        if (body.containsKey("tags")) {
            String[] tagsArray = body.getString("tags").split(" ");
            List<Tuple> batch = new ArrayList<>();
            for (String tag : tagsArray) {
                batch.add(Tuple.of(photoId, tag));
            }

            Future<Void> deleteTagsFuture = pool
                .preparedQuery("DELETE FROM phototags WHERE photo_id = ?")
                .execute(Tuple.of(photoId))
                .compose(rows -> Future.succeededFuture());

            updatePhotoFuture = updatePhotoFuture
                .compose(v -> deleteTagsFuture)
                .compose(v -> pool
                    .preparedQuery("INSERT INTO phototags (photo_id, tag) VALUES (?, ?)")
                    .executeBatch(batch)
                    .compose(rows -> Future.succeededFuture())
                );
        }

        return updatePhotoFuture;
    }
}
