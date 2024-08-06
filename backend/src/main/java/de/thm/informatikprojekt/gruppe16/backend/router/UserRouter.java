package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.UserHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

/**
 * <p>Router class for User</p>
 * <p>used to route all routes related to/starting with users</p>
 */
public class UserRouter {

    private final UserHandler userHandler;

    public UserRouter(Vertx vertx) {
        this.userHandler = new UserHandler(vertx);
    }

    /**
     * <p>Contains all routs related to/starting with users and uses the appropriate Handler function in {@link de.thm.informatikprojekt.gruppe16.backend.handler.UserHandler} class for the rout</p>
     * @param router
     */
    public void route(Router router) {
        router.post("/users").handler(userHandler::handleAddUser);
        router.delete("/users/:username").handler(userHandler::handleDeleteUser);
        router.get("/users").handler(userHandler::handleGetUsers);
    }
}
