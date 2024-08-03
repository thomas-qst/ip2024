package de.thm.informatikprojekt.gruppe16.backend.router;

import de.thm.informatikprojekt.gruppe16.backend.handler.LoginHandler;
import de.thm.informatikprojekt.gruppe16.backend.handler.UserHandler;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

public class LoginRouter {
    private final Vertx vertx;
    private final LoginHandler loginHandler;

    public LoginRouter(Vertx vertx) {
        this.vertx = vertx;
        this.loginHandler = new LoginHandler(vertx);
    }

    public void route(Router router) {
        router.get("/login/username").handler(loginHandler::handleGetUsernameFromSession);
        router.delete("/login").handler(loginHandler::deleteSession);
        router.post("/login").handler(loginHandler::login);
        router.patch("/login").handler(loginHandler::changePassword);

    }
}
