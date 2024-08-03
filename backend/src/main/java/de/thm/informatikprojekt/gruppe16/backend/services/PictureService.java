package de.thm.informatikprojekt.gruppe16.backend.services;

import io.vertx.core.Future;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.Tuple;

import java.util.List;

public class PictureService {
    private final JDBCPool pool;

    public PictureService(JDBCPool pool) {
        this.pool = pool;
    }

    public Future<Void> addTagsToPicture(String pictureId, List<Tuple> batch) {
        return pool.preparedQuery("INSERT INTO phototags (photo_id, tag) VALUES (?, ?)")
            .executeBatch(batch)
            .mapEmpty();
    }
}
