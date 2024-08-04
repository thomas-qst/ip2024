CREATE DATABASE FotoApplication;
use FotoApplication;

CREATE TABLE User (
    username VARCHAR(32) PRIMARY KEY NOT NULL,
    password_hash VARCHAR(61) NOT NULL,
    one_time_password boolean NOT NULL
);

CREATE TABLE Album(
    album_id int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    title VARCHAR(50) NOT NULL,
    date date not NULL,
    username VARCHAR(32) NOT NULL,
    FOREIGN KEY (username) references User(username)
);

CREATE TABLE Photo (
    photo_id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    title VARCHAR(32) NOT NULL,
    photo LONGTEXT NOT NULL,
    date date NOT NULL,
    username VARCHAR(32) NOT NULL,
    FOREIGN KEY (username) references User(username)
);

CREATE TABLE PhotoTags(
    photo_id INT,
    tag VARCHAR(32) NOT NULL,
    FOREIGN KEY (photo_id) REFERENCES Photo(photo_id)
);

CREATE TABLE AlbumTags(
    album_id INT,
    tag VARCHAR(32) NOT NULL,
    FOREIGN KEY (album_id) references Album(album_id)
);

CREATE TABLE AlbumFoto(
    album_id int,
    photo_id int,
    FOREIGN KEY (album_id) REFERENCES Album(album_id),
    FOREIGN KEY (photo_id) REFERENCES Photo(photo_id)
);

use FotoApplication;
create user 'FotoApplication'@'localhost' IDENTIFIED by '1234';
grant all privileges on FotoApplication to 'FotoApplication'@'localhost';
grant all privileges on FotoApplication.* to 'FotoApplication'@'localhost';
flush privileges;

INSERT INTO User (username, password_hash, one_time_password) VALUES ("Admin","$2a$10$cSf1hx0I.Yc8sPaz00B0G.LsToAjFlP2RJlMnNQBq.cbPxrOYnG3a",true);
