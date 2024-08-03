package de.thm.informatikprojekt.gruppe16.backend.handler;

import de.thm.informatikprojekt.gruppe16.backend.services.UserService;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class LoginHandler {
    private final Vertx vertx;
    private UserService userService;

    public LoginHandler(Vertx vertx) {
        this.vertx = vertx;
        userService = new UserService();
    }

    public void handleGetUsernameFromSession(RoutingContext ctx) {
        String username = ctx.session().get("user");

        userService.getUsernameFromSession(username).onComplete(ar -> {
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

    public void deleteSession(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void login(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void changePassword(RoutingContext ctx) {
        //TODO: reimplement function
    }
}
