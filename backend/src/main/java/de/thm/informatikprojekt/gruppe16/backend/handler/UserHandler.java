package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.UserService;
import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.mindrot.jbcrypt.BCrypt;

import java.util.Objects;

public class UserHandler {
    private final UserService userServices;

    public UserHandler(Vertx vertx) {
        this.userServices = new UserService(IJDBCConnection.initConnection(vertx));
    }

    public void handleAddUser(RoutingContext ctx) {
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
        String password_hash = BCrypt.hashpw(jObj.getString("password"), BCrypt.gensalt());
        boolean otp;
        if (!jObj.containsKey("OTP")) {
            otp = true;
        } else {
            otp = jObj.getBoolean("OTP");
        }

        if (username != null) {
            username = username.replaceAll("\\s+", "");
        }

        if (username == null || password_hash == null || username.isEmpty() || password_hash.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(400)
                .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add User. Missing Arguments")));
            return;
        }

        userServices.addUser(username,password_hash,otp).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .setStatusCode(201)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "User added to Database")));
            } else if (ar.failed() && ar.cause().getMessage().equals("User already exists")) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(400)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Username already in Database")));
            } else {
                ar.cause().printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));

            }
        });
    }

    public void handleDeleteUser(RoutingContext ctx) {
        String usernameToDelete = ctx.pathParam("username");
        String requestingUser = ctx.session().get("user");

        if (requestingUser == null || requestingUser.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(401)
                .end(Json.encodePrettily(new JsonObject().put("error", "Login required!")));
            return;
        }

        if ("Admin".equals(usernameToDelete)) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "unauthorized")));
        }

        if("Admin".equals(usernameToDelete)) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Admin user cannot be deleted!")));
        }


        userServices.deleteUser(usernameToDelete).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "User deleted")));
            } else if (ar.cause().getMessage().equals("User not found")) {
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

    public void handleGetUsers(RoutingContext ctx) {
        String username = ctx.session().get("user");
        if (!"Admin".equals(username)) {
            ctx.response()
                .setStatusCode(401)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Unauthorized")));
            return;
        }

        userServices.getUsers().onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "Users found").put("data", ar.result())));
            } else {
                ar.cause().printStackTrace();
                ctx.response()
                    .setStatusCode(500)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });
    }
}
