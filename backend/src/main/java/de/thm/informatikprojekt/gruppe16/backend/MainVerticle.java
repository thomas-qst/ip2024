package de.thm.informatikprojekt.gruppe16.backend;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.http.HttpMethod;

import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.SessionHandler;
import io.vertx.ext.web.sstore.LocalSessionStore;

import io.vertx.jdbcclient.JDBCConnectOptions;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.PoolOptions;
import io.vertx.sqlclient.Row;
import io.vertx.sqlclient.Tuple;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

import java.time.LocalDate;

import org.mindrot.jbcrypt.BCrypt;

public class MainVerticle extends AbstractVerticle {

  public JDBCPool pool;

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

    initConnection();

    router.route().handler(CorsHandler.create("http://localhost:(63343|8080)").allowedHeaders(allowedHeaders).allowedMethods(allowedMethods).allowCredentials(true));
    router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)));
    router.route().handler(BodyHandler.create());

    router.get("/pictures").handler(this::getPicturesByUsername);
    router.get("/albums/:username").handler(this::getAlbumsByUsername);
    router.get("/users").handler(this::getUsers);
    router.get("/users/:username").handler(this::getUserbyUsername);
    router.get("/login/username").handler(this::getUsernameFromSession);

    router.delete("/users/delete/:username").handler(this::deleteUser);
    router.delete("/pictures/delete/:picture_id").handler(this::deletePicture);
    router.delete("/albums/delete/:album_id").handler(this::deleteAlbum);
    router.delete("/login").handler(this::deleteSession);

    router.post("/login").handler(this::login);
    router.post("/users").handler(this::addUser);
    router.post("/pictures").handler(this::addPicture);
    router.post("/album").handler(this::addAlbum);

    router.put("/tags/pictures/:picture_id").handler(this::addTagsToPicture);
    router.put("/tags/album/:picture_id").handler(this::addTagsToAlbum);

    router.patch("/albums/:album_id/:picture_id").handler(this::addPictureToAlbum);
    router.patch("/login").handler(this::changePassword);



    vertx.createHttpServer().requestHandler(router).listen(8888, http ->{
      if (http.succeeded()) {
        startPromise.complete();
      }else{
        startPromise.fail(http.cause());
      }
    });
  }

  public void getUsernameFromSession(RoutingContext ctx){
    final String username = ctx.session().get("user");
    //TODO check if user is sill in database
    if(username != null){
      JsonArray ja = new JsonArray();
      JsonObject jo = new JsonObject();
      jo.put("username", username);
      ja.add(jo);
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(200)
        .end(Json.encodePrettily(new JsonObject().put("success", "User found in session").put("data", ja)));
    }else{
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(404)
        .end(Json.encodePrettily(new JsonObject().put("error", "No User found in session")));
    }

  }

  public String passwordHash(String password) {
    return BCrypt.hashpw(password, BCrypt.gensalt());
  }

  public void login(RoutingContext ctx){
    JsonObject jObj = ctx.getBodyAsJson();
    if(jObj == null){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
      return;
    }
    String username = (String) jObj.getString("username");
    String password = (String) jObj.getString("password_hash");


    if(username != null && password != null){
      username = username.replaceAll("\\s+","");
      password = password.replaceAll("\\s+","");
    }

    if(username == null || password == null || username.isEmpty() || password.isEmpty()){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add User. Missing Arguments")));
      return;
    }

    final String finalUsername = username;
    final String finalPassword = password;

    pool
      .preparedQuery("SELECT password_hash,one_time_password from user where username = (?)")
      .execute(Tuple.of(finalUsername,finalPassword))
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
      })
      .onSuccess(rows -> {
        if(rows.size() == 1){
          Row row = rows.iterator().next();
          if(BCrypt.checkpw(finalPassword,row.getString("password_hash"))){
            if(row.getBoolean("one_time_password")){
              ctx.session().put("user", finalUsername);
              ctx.session().put("OTP", true);
              ctx.response()
                .setStatusCode(200)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("success", "User added to session, OTP detected!")));
            }else{
              ctx.session().put("user", finalUsername);
              ctx.response()
                .setStatusCode(201)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("success", "User added to session")));
            }
          }else{
            ctx.response()
              .putHeader("content-type", "application/json")
              .setStatusCode(404)
              .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
          }
        }else{
          ctx.response()
            .putHeader("content-type", "application/json")
            .setStatusCode(404)
            .end(Json.encodePrettily(new JsonObject().put("error", "Wrong username or password")));
        }
      });
  }

  public void deleteSession(RoutingContext ctx){
    ctx.session().destroy();
    ctx.response()
      .putHeader("content-type","application/json")
      .setStatusCode(204)
      .end();
  }

  public void getPicturesByUsername(RoutingContext ctx){
    String username = ctx.session().get("user");

    if(username != null){
      username = username.replaceAll("\\s+","");
    }

    if(username == null || username.isEmpty()){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(401)
        .end(Json.encodePrettily(new JsonObject().put("error", "User is not logged in!")));
      return;
    }

    final String finalUsername = username;

    JsonArray ja = new JsonArray();
    pool
      .preparedQuery("SELECT * from photo where user = (?)")
      .execute(Tuple.of(finalUsername))
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
      })
      .onSuccess(rows -> {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for(Row row: rows){
          JsonObject photoJson = new JsonObject();
          photoJson
            .put("photo_id", row.getInteger("photo_id"))
            .put("title", row.getString("title"))
            .put("photo", row.getString("photo"))
            .put("date", row.getLocalDate("date").format(formatter));
          ja.add(photoJson);
        }
        ctx.response()
          .setStatusCode(200)
          .putHeader("content-type","application/json")
          .end(Json.encodePrettily(new JsonObject().put("success","Pictures found").put("data", ja)));
      });
  }

  public void getAlbumsByUsername(RoutingContext ctx){
    //TODO add function
  }

  public void getUsers(RoutingContext ctx){
    //TODO add auth
    JsonArray ja = new JsonArray();
    pool
      .query("SELECT username,is_Admin from user")
      .execute()
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
      })
      .onSuccess(rows -> {
        for(Row row: rows){
          JsonObject userJson = new JsonObject();
          userJson
            .put("username", row.getString("username"))
            .put("is_Admin", row.getString("is_Admin"));
          ja.add(userJson);
        }
        ctx.response()
          .setStatusCode(200)
          .putHeader("content-type","application/json")
          .end(Json.encodePrettily(new JsonObject().put("success","Users found").put("data", ja)));
      });
  }

  public void getUserbyUsername(RoutingContext ctx){
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
    //TODO add auth
    JsonObject jObj = ctx.getBodyAsJson();
    if(jObj == null){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
      return;
    }
    String username = (String) jObj.getString("username");
    String password_hash = passwordHash((String) jObj.getString("password_hash"));
    boolean otp;
    if(!jObj.containsKey("OTP")){
      otp = true;
    }else{
      otp = jObj.getBoolean("OTP");
    }

    if(username != null && password_hash != null){
      username = username.replaceAll("\\s+","");
      password_hash = password_hash.replaceAll("\\s+","");
    }

    if(username == null || password_hash == null || username.isEmpty() || password_hash.isEmpty()){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add User. Missing Arguments")));
      return;
    }

    final String finalUsername = username;
    final String finalPassword_hash = password_hash;

    pool
      .preparedQuery("select * from user where username = (?)")
      .execute(Tuple.of(finalUsername))
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
        return;
      })
      .onSuccess(rows -> {
        if(rows.size() > 0){
          ctx.response()
            .putHeader("content-type", "application/json")
            .setStatusCode(400)
            .end(Json.encodePrettily(new JsonObject().put("error", "Username already in Database")));
        } else {
          pool
            .preparedQuery("INSERT INTO user (username, password_hash, one_time_password, is_Admin) VALUES (?, ?, ?, ?)")
            .execute(Tuple.of(finalUsername, finalPassword_hash, otp, false))
            .onFailure(e -> {
              e.printStackTrace();
              ctx.response()
                .setStatusCode(500)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
            })
            .onSuccess(insertRows -> {
              ctx.response()
                .setStatusCode(201)
                .putHeader("content-type", "application/json")
                .end(Json.encodePrettily(new JsonObject().put("success", "User added to Database")));
            });
        }
      });
  }

  public void addPicture(RoutingContext ctx){
    //TODO add auth
    JsonObject jObj = ctx.getBodyAsJson();
    if(jObj == null){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
      return;
    }

    final String title = (String) jObj.getString("title");
    final String photo = (String)jObj.getString("photo");
    final LocalDate date = LocalDate.now();
    String username = ctx.session().get("user");

    if(username != null){
      username = username.replaceAll("\\s+","");
    }

    if(username == null || username.isEmpty() || title == null || title.isEmpty() || photo.isEmpty()){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Failed to add Image. Missing Arguments")));
      return;
    }

    final String finalUsername = username;

    pool
      .preparedQuery("INSERT INTO photo (title, photo, date, user) VALUES (?, ?, ?, ?)")
      .execute(Tuple.of(title, photo, date, finalUsername))
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
      })
      .onSuccess(insertRows -> {
        ctx.response()
          .setStatusCode(201)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("success", "Photo added to Database")));
      });
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


  public void changePassword(RoutingContext ctx){
    JsonObject jObj = ctx.getBodyAsJson();
    if(jObj == null){
      ctx.response()
        .putHeader("content-type", "application/json")
        .setStatusCode(400)
        .end(Json.encodePrettily(new JsonObject().put("error", "Invalid JSON")));
      return;
    }
    String password_hash = passwordHash((String) jObj.getString("password_hash"));
    String username = ctx.session().get("user");
    if(username == null){
      ctx.response()
        .setStatusCode(401)
        .putHeader("content-type", "application/json")
        .end(Json.encodePrettily(new JsonObject().put("error", "You need to be logged in")));
    }

    pool.preparedQuery("update user set password_hash = ?,one_time_password = false where username = ?")
      .execute(Tuple.of(password_hash, username))
      .onFailure(e -> {
        e.printStackTrace();
        ctx.response()
          .setStatusCode(500)
          .putHeader("content-type", "application/json")
          .end(Json.encodePrettily(new JsonObject().put("error", "Database error")));
      })
      .onSuccess(updateRows -> {
        ctx.response()
          .putHeader("content-type", "application/json")
          .setStatusCode(201)
          .end(Json.encodePrettily(new JsonObject().put("success", "Password updated")));
      });

  }

  public void initConnection(){
    pool = JDBCPool.pool(
      vertx,
      // configure the connection
      new JDBCConnectOptions()
        // H2 connection string
        .setJdbcUrl("jdbc:mariadb://localhost:3306/fotoapplication")
        // username
        .setUser("FotoApplication")
        // password
        .setPassword("1234"),
      // configure the pool
      new PoolOptions()
        .setMaxSize(16)
        .setName("pool")
    );
  }

}
