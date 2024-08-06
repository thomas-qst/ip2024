package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;
import org.mindrot.jbcrypt.BCrypt;

/**
 * <p>Service class for Login</p>
 * <p>used to handle all database communication related to logins</p>
 */
public class LoginService {
    private final JDBCPool pool;

    public LoginService(JDBCPool pool) {
        this.pool = pool;
    }

    /**
     * Checks if the given username still exists in the database
     * @param username
     * @return Future JsonObject
     */
    public Future<String> getUsernameFromSession(String username) {
        if(username == null || username.isEmpty()) {
            return Future.failedFuture("Username cannot be null or empty");
        }

        return pool.preparedQuery("SELECT 1 from user where username = ?")
            .execute(Tuple.of(username))
            .compose(v -> {
                if(v.rowCount() == 0){
                    return Future.failedFuture("User does not exist");
                }
                return Future.succeededFuture(username);
            });
    }

    /**
     * Checks if the password and username are correct
     * @param username
     * @param password
     * @return Future Boolean - false -> OTP; true -> normal login
     */
    public Future<Boolean> login(String username, String password) {
        if(username == null){
            return Future.failedFuture("Username is null");
        }
        if(password == null){
            return Future.failedFuture("Password is null");
        }

        return pool
            .preparedQuery("SELECT password_hash,one_time_password from user where username = (?)")
            .execute(Tuple.of(username, password))
            .compose(rows -> {
                if (rows.size() == 1) {
                    Row row = rows.iterator().next();
                    if (BCrypt.checkpw(password, row.getString("password_hash"))) {
                        if (row.getBoolean("one_time_password")) {
                            return Future.succeededFuture(false);
                        } else {
                            return Future.succeededFuture(true);
                        }
                    } else {
                        return Future.failedFuture("Wrong username or password");
                    }
                } else {
                    return Future.failedFuture("Wrong username or password");
                }
            });

    }

    /**
     * Changes the password of the given user to the given password and sets one_time_password = false
     * @param username
     * @param password
     * @return Future Void
     */
    public Future<Void> changePassword(String username, String password) {
        if(username == null){
            return Future.failedFuture("Username is null");
        }
        if(password == null){
            return Future.failedFuture("Password is null");
        }

        return pool.preparedQuery("update user set password_hash = ?,one_time_password = false where username = ?")
            .execute(Tuple.of(password, username))
            .mapEmpty();
    }
}
