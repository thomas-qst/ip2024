package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.LoginService;
import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.mindrot.jbcrypt.BCrypt;

public class LoginHandler {
    private final LoginService loginServices;

    public LoginHandler(Vertx vertx) {
        loginServices = new LoginService(IJDBCConnection.initConnection(vertx));
    }

    public void handleGetUsernameFromSession(RoutingContext ctx) {
        String username = ctx.session().get("user");

        loginServices.getUsernameFromSession(username).onComplete(ar -> {
            if (ar.succeeded()) {
                JsonObject result = ar.result();
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(result.encodePrettily());
            } else {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end(ar.cause().getMessage());
            }
        });
    }

    public void handleDeleteSession(RoutingContext ctx) {
        ctx.session().destroy();
        ctx.response()
            .putHeader("content-type", "application/json")
            .setStatusCode(204)
            .end();
    }

    public void handleLogin(RoutingContext ctx) {
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

        String finalUsername = username;

        loginServices.login(username,password).onComplete(res -> {
            if (res.succeeded() && res.result()) {
                ctx.session().put("user", finalUsername);
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "User added to session")));
            } else if (res.succeeded() && !res.result()) {
                ctx.session().put("user", finalUsername);
                ctx.session().put("OTP", true);
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "User added to session, OTP detected!")));
            } else{
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
            }
        });


    }

    public void handleChangePassword(RoutingContext ctx) {
        JsonObject jObj = ctx.getBodyAsJson();
        if (jObj == null) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
            return;
        }
        String password_hash = BCrypt.hashpw(jObj.getString("password_hash"), BCrypt.gensalt());
        String username = ctx.session().get("user");
        if (username == null || username.isEmpty()) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "You need to be logged in")));
        }

        loginServices.changePassword(username,password_hash)
            .onSuccess(v -> {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(201)
                    .end(Json.encodePrettily(new JsonObject().put("success", "Password updated")));
            })
            .onFailure(v -> {
                v.printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            });
    }
}
