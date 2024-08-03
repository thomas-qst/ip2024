package de.thm.informatikprojekt.gruppe16.backend.utils;

import io.vertx.core.Vertx;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.PoolOptions;
import io.vertx.jdbcclient.JDBCConnectOptions;

public interface IJDBCConnection {
    static JDBCPool initConnection(Vertx vertx){
        return JDBCPool.pool(
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
