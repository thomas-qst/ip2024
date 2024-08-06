package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;

/**
 * <p>Service class for User</p>
 * <p>used to handle all database communication related to users</p>
 */
public class UserService {
    private final JDBCPool pool;

    public UserService(JDBCPool pool) {
        this.pool = pool;
    }

    /**
     * Adds the user.
     * @param username
     * @param password
     * @param otp
     * @return Future Void
     */
    public Future<Void> addUser(String username, String password, boolean otp) {
        if(username == null){
            return Future.failedFuture("Username cannot be null");
        }

        if(password == null){
            return Future.failedFuture("Password cannot be null");
        }

        return pool
            .preparedQuery("select * from user where username = (?)")
            .execute(Tuple.of(username))
            .compose(rows -> {
                if (rows.size() > 0) {
                    return Future.failedFuture("User already exists");
                } else {
                    return pool
                        .preparedQuery("INSERT INTO user (username, password_hash, one_time_password) VALUES (?, ?, ?)")
                        .execute(Tuple.of(username, password, otp))
                        .mapEmpty();
                }
            });
    }

    /**
     * Deletes the user and everything the user owns.
     * @param usernameToDelete
     * @return Future Void
     */
    public Future<Void> deleteUser(String usernameToDelete) {

        if(usernameToDelete == null){
            return Future.failedFuture("usernameToDelete cannot be null");
        }

        return pool.getConnection().compose(conn -> {
            return conn.begin().compose(tx -> {
                return conn.preparedQuery("DELETE FROM phototags WHERE photo_id IN (SELECT photo_id FROM photo WHERE username = ?)")
                    .execute(Tuple.of(usernameToDelete))
                    .compose(v1 -> conn.preparedQuery("DELETE FROM albumfoto WHERE photo_id IN (SELECT photo_id FROM photo WHERE username = ?)")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v2 -> conn.preparedQuery("DELETE FROM photo WHERE username = ?")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v3 -> conn.preparedQuery("DELETE FROM albumtags WHERE album_id IN (SELECT album_id FROM album WHERE username = ?)")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v4 -> conn.preparedQuery("DELETE FROM albumfoto WHERE album_id IN (SELECT album_id FROM album WHERE username = ?)")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v5 -> conn.preparedQuery("DELETE FROM album WHERE username = ?")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v6 -> conn.preparedQuery("DELETE FROM user WHERE username = ?")
                        .execute(Tuple.of(usernameToDelete)))
                    .compose(v7 -> {
                        if (v7.rowCount() == 0) {
                            return Future.failedFuture("User not found");
                        }
                        return tx.commit();
                    })
                    .onFailure(e -> tx.rollback().compose(vF -> Future.failedFuture(e)))
                    .onComplete(ar -> conn.close());
            });
        });
    }

    /**
     * Gets all users except the Admin user.
     * @return Future JsonArray - contains all usernames
     */
    public Future<JsonArray> getUsers() {
        JsonArray resultArray = new JsonArray();
        return pool
            .query("SELECT username FROM user WHERE username != 'Admin'")
            .execute()
            .compose(rows -> {
                for (Row row : rows) {
                    JsonObject userJson = new JsonObject();
                    userJson.put("username", row.getString("username"));
                    resultArray.add(userJson);
                }
                return Future.succeededFuture(resultArray);
            })
            .onFailure(err -> Future.failedFuture("Database error"));
    }



}
