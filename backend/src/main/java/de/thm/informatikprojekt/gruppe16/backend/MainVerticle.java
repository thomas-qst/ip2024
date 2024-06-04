package de.thm.informatikprojekt.gruppe16.backend;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.core.http.Cookie;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.handler.ChainAuthHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;

import java.util.Map;
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

    router.route().handler(CorsHandler.create("http://localhost:63343").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods));
    router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));

    router.get("login/:username").handler(this::login);
    router.get("pictures/:username").handler(this::getPicturesByUsername);
    router.get("albums/:username").handler(this::getAlbumsByUsername);
    router.get("users").handler(this::getUsers);

    router.delete("users/delete/:username").handler(this::deleteUser);
    router.delete("pictures/delete/:picture_id").handler(this::deletePicture);
    router.delete("albums/delete/:album_id").handler(this::deleteAlbum);

    router.post("users").handler(this::addUser);
    router.post("pictures").handler(this::addPicture);
    router.post("album").handler(this::addAlbum);

    router.put("tags/pictures/:picture_id").handler(this::addTagsToPicture);
    router.put("tags/album/:picture_id").handler(this::addTagsToAlbum);

    router.patch("albums/:album_id/:picture_id").handler(this::addPictureToAlbum);

    router.route().handler(BodyHandler.create());

    vertx.createHttpServer().requestHandler(router).listen(8888, http ->{
      if (http.succeeded()) {
        startPromise.complete();
      }else{
        startPromise.fail(http.cause());
      }
    });
  }

  public void login(RoutingContext ctx){
    //TODO add function
  }

  public void getPicturesByUsername(RoutingContext ctx){
    //TODO add function
  }

  public void getAlbumsByUsername(RoutingContext ctx){
    //TODO add function
  }

  public void getUsers(RoutingContext ctx){
    //TODO add function
  }

  public void deleteUser(RoutingContext ctx){
    //TODO add function
  }

  public void deletePicture(RoutingContext ctx){
    //TODO add function
  }

  public void deleteAlbum(RoutingContext ctx){
    //TODO add function
  }

  public void addUser(RoutingContext ctx){
    //TODO add function
  }

  public void addPicture(RoutingContext ctx){
    //TODO add function
  }

  public void addAlbum(RoutingContext ctx){
    //TODO add function
  }

  public void addTagsToPicture(RoutingContext ctx){
    //TODO add function
  }

  public void addTagsToAlbum(RoutingContext ctx){
    //TODO add function
  }

  public void addPictureToAlbum(RoutingContext ctx){
    //TODO add function
  }

}
