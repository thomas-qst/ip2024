package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.UserHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class UserRouter {

    private final Vertx vertx;
    private final UserHandler userHandler;

    public UserRouter(Vertx vertx) {
        this.vertx = vertx;
        this.userHandler = new UserHandler(vertx);
    }

    public void route(Router router) {
        router.post("/users").handler(userHandler::handleAddUser);
        router.delete("/users/:username").handler(userHandler::handleDeleteUser);
        router.get("/users").handler(userHandler::handleGetUsers);
    }
}
