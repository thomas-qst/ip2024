package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;
import org.mindrot.jbcrypt.BCrypt;

public class LoginService {
    private final JDBCPool pool;

    public LoginService(JDBCPool pool) {
        this.pool = pool;
    }

    public Future<JsonObject> getUsernameFromSession(String username) {
        // TODO: Überprüfen, ob der Benutzer noch in der Datenbank existiert
        if (username != null) {
            JsonArray ja = new JsonArray();
            JsonObject jo = new JsonObject();
            jo.put("username", username);
            ja.add(jo);

            JsonObject response = new JsonObject()
                .put("success", "User found in session")
                .put("data", ja);
            return Future.succeededFuture(response);
        } else {
            JsonObject response = new JsonObject()
                .put("error", "No User found in session");
            return Future.failedFuture(response.encode());
        }
    }

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
