package de.thm.informatikprojekt.gruppe16.backend.handler;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class UserHandler {
    private final Vertx vertx;

    public UserHandler(Vertx vertx) {
        this.vertx = vertx;
    }

    public void addUser(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void deleteUser(RoutingContext ctx) {
        //TODO: reimplement function
    }

    public void getUsers(RoutingContext ctx) {
        //TODO: reimplement function
    }
}
