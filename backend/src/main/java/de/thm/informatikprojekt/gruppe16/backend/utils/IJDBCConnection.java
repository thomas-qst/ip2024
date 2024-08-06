package de.thm.informatikprojekt.gruppe16.backend.utils;

import io.vertx.core.Vertx;
import io.vertx.jdbcclient.JDBCPool;
import io.vertx.sqlclient.PoolOptions;
import io.vertx.jdbcclient.JDBCConnectOptions;

/**
 * Public interface for JDBC Connections
 */
public interface IJDBCConnection {
    /**
     * initializes a JDBCPool connection to the local server and returns the pool
     * @param vertx
     * @return JDBCPool with connection to the local Server.
     */
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
