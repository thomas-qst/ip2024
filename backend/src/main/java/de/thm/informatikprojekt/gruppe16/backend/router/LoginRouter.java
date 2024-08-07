package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.LoginHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

/**
 * <p>Router class for login</p>
 * <p>used to route all routes related to/starting with login</p>
 */
public class LoginRouter {
    private final LoginHandler loginHandler;

    public LoginRouter(Vertx vertx) {
        this.loginHandler = new LoginHandler(vertx);
    }

    /**
     * <p>Contains all routs related to/starting with login and uses the appropriate Handler function in {@link de.thm.informatikprojekt.gruppe16.backend.handler.LoginHandler} class for the rout</p>
     * @param router
     */
    public void route(Router router) {
        router.get("/login").handler(loginHandler::handleGetUsernameFromSession);
        router.delete("/login").handler(loginHandler::handleDeleteSession);
        router.post("/login").handler(loginHandler::handleLogin);
        router.patch("/login").handler(loginHandler::handleChangePassword);

    }
}
