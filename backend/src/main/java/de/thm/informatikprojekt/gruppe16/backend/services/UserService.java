package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

public class UserService {

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



}
