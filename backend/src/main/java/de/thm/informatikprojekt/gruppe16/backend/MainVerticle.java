package de.thm.informatikprojekt.gruppe16.backend;

import de.thm.informatikprojekt.gruppe16.backend.router.AlbumRouter;
import de.thm.informatikprojekt.gruppe16.backend.router.LoginRouter;
import de.thm.informatikprojekt.gruppe16.backend.router.PictureRouter;
import de.thm.informatikprojekt.gruppe16.backend.router.UserRouter;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;

import java.util.HashSet;
import java.util.Set;


public class MainVerticle extends AbstractVerticle {

    @Override
    public void start(Promise<Void> startPromise) throws Exception {
        Router router = Router.router(vertx);

        Set<String> allowedHeaders = new HashSet<>();
        allowedHeaders.add("x-requested-with");
        allowedHeaders.add("Access-Control-Allow-Origin");
        allowedHeaders.add("origin");
        allowedHeaders.add("Content-Type");
        allowedHeaders.add("accept");
        allowedHeaders.add("X-PINGARUNER");

        Set<HttpMethod> allowedMethods = new HashSet<>();
        allowedMethods.add(HttpMethod.GET);
        allowedMethods.add(HttpMethod.POST);
        allowedMethods.add(HttpMethod.OPTIONS);
        allowedMethods.add(HttpMethod.DELETE);
        allowedMethods.add(HttpMethod.PATCH);
        allowedMethods.add(HttpMethod.PUT);

        router.route().handler(CorsHandler.create("http://localhost:(63343|8080)").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods).allowCredentials(true));
        router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));
        router.route().handler(BodyHandler.create());


        UserRouter userRouter = new UserRouter(vertx);
        userRouter.route(router);

        AlbumRouter albumRouter = new AlbumRouter(vertx);
        albumRouter.route(router);

        PictureRouter pictureRouter = new PictureRouter(vertx);
        pictureRouter.route(router);

        LoginRouter loginRouter = new LoginRouter(vertx);
        loginRouter.route(router);


        vertx.createHttpServer().requestHandler(router).listen(8888, http -> {
            if (http.succeeded()) {
                startPromise.complete();
            } else {
                startPromise.fail(http.cause());
            }
        });
    }

}
