package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.LoginService;
import de.thm.informatikprojekt.gruppe16.backend.utils.IJDBCConnection;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import org.mindrot.jbcrypt.BCrypt;

/**
 * <p>Handler class for Login</p>
 * <p>used to handle all functions related to login</p>
 * <p>only contains Vertx logic, all database logic is located in {@link de.thm.informatikprojekt.gruppe16.backend.services.LoginService}</p>
 */
public class LoginHandler {
    private final LoginService loginServices;

    public LoginHandler(Vertx vertx) {
        loginServices = new LoginService(IJDBCConnection.initConnection(vertx));
    }

    /**
     * <p>Uses getUsernameFromSession from {@link de.thm.informatikprojekt.gruppe16.backend.services.LoginService} to get the current Username from the current session and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 404 - No User found in session</p>
     * <p>Status Code 404 - User does not exist</p>
     * <p>Status Code 200 - User found in session + Username</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleGetUsernameFromSession(RoutingContext ctx) {
        String username = ctx.session().get("user");
        if(username == null || username.isEmpty()) {
            ctx.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(404)
                .end(Json.encodePrettily(new JsonObject().put("error", "Username not found")));
            return;
        }

        loginServices.getUsernameFromSession(username).onComplete(ar -> {
            if (ar.succeeded()) {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(new JsonObject().put("success", "User found in session").put("data", new JsonArray().add(new JsonObject().put("username", ar.result())))));
            } else if(ar.cause().getMessage().equals("User does not exist")){
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end(Json.encodePrettily(new JsonObject().put("error", ar.cause().getMessage())));
            } else{
                ar.cause().printStackTrace();
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });
    }

    /**
     * <p>Deletes the current session</p>
     * <p>Status Code 204</p>
     * @param ctx Vertx RoutingContext
     */
    public void handleDeleteSession(RoutingContext ctx) {
        ctx.session().destroy();
        ctx.response()
            .putHeader("content-type", "application/json")
            .setStatusCode(204)
            .end();
    }

    /**
     * <p>Uses login from {@link de.thm.informatikprojekt.gruppe16.backend.services.LoginService} to add the user to the session and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 400 - Failed to add User. Missing Arguments</p>
     * <p>Status Code 200 - User added to session, OTP detected!</p>
     * <p>Status Code 201 - User added to session</p>
     * <p>Status Code 404 - Wrong username or password</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
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
                ctx.response()
                    .setStatusCode(200)
                    .putHeader("content-type", "application/json")
                    .end(Json.encodePrettily(new JsonObject().put("success", "User added to session, OTP detected!")));
            } else if (res.failed() && res.cause().getMessage().equals("Wrong username or password")){
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
            } else {
                ctx.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(500)
                    .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            }
        });


    }

    /**
     * <p>Uses changePassword from {@link de.thm.informatikprojekt.gruppe16.backend.services.LoginService} to change the password of the user in the session and gives the appropriate response to the RoutingContext</p>
     * <p>Status Code 400 - Invalid JSON</p>
     * <p>Status Code 401 - User is not logged in</p>
     * <p>Status Code 201 - Password updated</p>
     * <p>Status Code 500 - Database error</p>
     * @param ctx Vertx RoutingContext
     */
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
                .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in")));
            return;
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
