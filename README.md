# README

## Informationen zur Inbetriebnahme der Anwendung
Als ersten Schritt, sollte die database.sql, innerhalb des backend Ordner geladen werden oder das identische Skript, welches sich im nächsten Abschnitt befindet, danach wie gewohnt mit den Befehlen aus README.adoc, die Anwendung erstmal testen, packagen und dann starten. Dies muss alles in einem Terminal in dem backend Verzeichnis gemacht werden. Dann am besten im fronted Verzeichnis, mit einem Pythonbefehl einen HTTP Server starten, damit alles richtig läuft. Das starten, mit der Webstorm preview funktioniert nur bedingt. Dann nur noch Browser öffnen und Localhost:8080 eingeben.

```shell
// backend
./mvnw clean compile exec:java

// frontend (weicht je nach python installation ab)
python -m http.server 8080
python3 -m http.server 8080
```

Der Admin Benutzer, welcher standardmäßig, mit der Ausführung des DDL Skripts hinzugefügt wird, hat folgende Login Informationen:

Username: Admin

Password: AdminUserPassword

## DDL Skript
```mariadb
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

```
## ERM-Diagramm:
![ERM der Datenbank](ERM.png)

### Erklärung:
Alle Attribute sind gegeben und entsprechend gekennzeichnet, Primärschlüssel sind unterstrichen und Fremdschlüssel haben ein ^ vor ihnen.
Die Tag Entitäten brauchen jeweils, die entsprechenden IDs als Fremdschlüssel. AlbumFoto braucht beide IDs, da die Entität die Schnittstelle zwischen ihnen darstellt.
### Beziehungen
Die Tags haben auf ihrer Seite immer eine 1,n Beziehung, da sie zu mindestens einem gehören müssen. Auf der anderen Seite muss ein Foto kein Tag haben, kann aber beliebig viele haben, deswegen 0,n.
Von dem User gehen zwei 0,n Beziehungen aus, da ein User theoretisch keine Alben oder Fotos hinzufügen muss, aber wenn dann beliebig viele.
Auf der Seite von Photo und Album geht jeweils eine 0,n Beziehung zu AlbumFoto aus, denn ein Foto muss nicht in einem Album sein und andererseits kann das Album leer sein.
Zurück geht zu beiden eine 1,n Beziehung, da wenn ein AlbumFoto existiert, dann muss es in einem Album sein(1,n), aber muss nicht außerhalb eines Albums als Foto geben(0,n).

## Beschreibung der RESTful-API
### Alben
| Route                         | HTTP Methode | Rückgabe                                                                                                                                                                                                                                                          |
|-------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| /albums                       | GET          | <p>401 - error User is not logged in!</p><p>200 - success Albums found & data</p><p>500 - error Database error</p>                                                                                                                                                |
| /albums                       | POST         | <p>400 - error Invalid JSON</p><p>401 - error User is not logged in!</p><p>400 - error Failed to add Album. Missing Arguments</p><p>201 - success Album added to Database & data</p><p>500 - error Database error</p>                                             |
| /albums/:album_id             | GET          | <p>404 - error No album given!</p><p>401 - error User is not logged in!</p><p>200 - success Pictures found & data</p><p>500 - error Database error</p>                                                                                                            |
| /albums/:album_id             | DELETE       | <p>401 - error User is not logged in!</p><p>204</p><p>404 - error Album not found or user not authorized</p><p>500 - error Database error</p>                                                                                                                     |
| /albums/:album_id             | PUT          | <p>401 - error User is not logged in!</p><p>400 - error Invalid JSON</p><p>201 - success Album metadata updated</p><p>404 - error Album not found or user not authorized</p><p>500 - error Database error</p>                                                     |
| /albums/:album_id/:picture_id | DELETE       | <p>401 - error User is not logged in!</p><p>204</p><p>404 - error Picture not found or user not authorized</p><p>404 - error Album not found or user not authorized</p><p>500 - error Database error</p>                                                          |
| /albums/:album_id/:picture_id | PATCH        | <p>401 - error User is not logged in!</p><p>201 - success Picture added to album</p><p>404 - error Picture not found or user not authorized</p><p>404 - error Album not found or user not authorized</p><p>500 - error Database error</p>                         |
| /albums/:album_id/tags        | PUT          | <p>401 - error User is not logged in!</p><p>400 - error Invalid JSON or missing tags</p><p>400 - error Tags cannot be empty</p><p>201 - success Tags added to album</p><p>404 - error Album not found or user not authorized</p><p>500 - error Database error</p> |

### Picture
| Route                      | HTTP Methode | Rückgabe                                                                                                                                                                                                                  |
|----------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| /pictures                  | GET          | <p>401 - error User is not logged in!</p><p>200 - success Pictures found & data</p><p>500 - error Database error</p>                                                                                                      |
| /pictures                  | POST         | <p>401 - error User is not logged in!</p><p>400 - error Invalid JSON</p><p>400 - error Failed to add Image. Missing Arguments</p><p>201 - success Photo added to Database & photo_id</p><p>500 - error Database error</p> |
| /pictures/:picture_id      | DELETE       | <p>401 - error User is not logged in!</p><p>204</p><p>404 - error Picture not found or user not authorized</p><p>500 - error Database error</p>                                                                           |
| /pictures/:picture_id      | PUT          | <p>401 - error User is not logged in!</p><p>400 - error Invalid JSON</p><p>201 - success Photo metadata updated</p><p>404 - error Photo not found or user not authorized</p><p>500 - error Database error</p>             |
| /pictures/:picture_id/tags | PUT          | <p>401 - error User is not logged in!</p><p>400 - error Invalid JSON</p><p>201 - success Tags added to database</p><p>404 - error Photo not found or user not authorized</p><p>500 - error Database error</p>             |

### Login
| Route  | HTTP Methode | Rückgabe                                                                                                                                                                                                                                                                 |
|--------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| /login | GET          | <p>404 - error No User found in session</p><p>404 - error User does not exist</p><p>200 - success User found in session & Username</p><p>500 - error Database error</p>                                                                                                  |
| /login | DELETE       | <p>204</p>                                                                                                                                                                                                                                                               |
| /login | PATCH        | <p>400 - error Invalid JSON</p><p>401 - error User is not logged in!</p><p>201 - success Password updated</p><p>500 - error Database error</p>                                                                                                                           |
| /login | POST         | <p>400 - error Invalid JSON</p><p>400 - error Failed to add User. Missing Arguments</p><p>200 - success User added to session, OTP detected!</p><p>201 - success User added to session</p><p>404 - error Wrong username or password</p><p>500 - error Database error</p> |

### User
| Route            | HTTP Methode | Rückgabe                                                                                                                                                                                                                                          |
|------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| /users           | GET          | <p>401 - error unauthorized</p><p>200 success Users found & Usernames</p><p>500 error Database error</p>                                                                                                                                          |
| /users           | POST         | <p>401 - error unauthorized</p><p>400 - error Invalid JSON</p><p>400 - error Failed to add User. Missing Arguments</p><p>400 - error Username already in Database</p><p>201 - success User added to Database</p><p>500 - error Database error</p> |
| /users/:username | DELETE       | <p>401 - error unauthorized</p><p>400 - error Admin user cannot be deleted</p><p>404 - error User not found</p><p>204</p><p>500 - error Database error</p>                                                                                        |


## Auflistung der erfüllten und nicht erfüllten Anforderungen

### Erfüllt:

#### Login
- Der Einstiegspunkt in die Anwendung ist die Loginseite, auf der sich Nutzer erfolgreich mit ihrem Nutzernamen und Passwort anmelden können.
- Die eingegebenen Werte werden von der Anwendung validiert. Bei fehlerhaften Eingaben erhalten die Nutzer entsprechende Hinweise.
- Bei erfolgreicher Anmeldung werden die Nutzer automatisch zu ihrer Fotoalbumansicht weitergeleitet.
- Bei fehlgeschlagener Anmeldung verbleiben die Nutzer auf der Loginseite und erhalten eine entsprechende Fehlermeldung.
- Bei Abmeldung (Logout) werden die Nutzer automatisch wieder zur Loginseite weitergeleitet.
#### Benutzerverwaltung (Rolle Admin)
- Ein Admin wurde bei der ersten Nutzung der Anwendung in der Datenbank über ein DDL-Skript angelegt.
- Der Nutzer mit der Rolle Admin verwaltet erfolgreich Nutzerkonten (Anzeigen, Hinzufügen, Löschen).
- Es können keine weiteren Admins erstellt werden.
- Nutzerkonten enthalten mindestens einen eindeutigen Nutzernamen, ein Passwort und eine Rolle (Nutzer oder Admin).
- Passwörter werden gehasht in der Datenbank gespeichert.
#### Fotos
- Die Anwendung erlaubt das Verwalten (Anzeigen, Suchen, Hinzufügen, Bearbeiten, Löschen) von Fotos.
- Jedes Foto enthält einen Titel und ein Datum der Aufnahme als Pflichtfelder.
- Fotos können optional beliebig viele Schlagwörter enthalten, die zusätzlich zum Titel bei einer Suche berücksichtigt werden.
- Titel, Datum und Schlagworte sind änderbar.
- Jedes Foto gehört einem Nutzer, und jeder Nutzer sieht nur seine eigenen Fotos.
#### Fotoalben
- Die Anwendung erlaubt die Verwaltung (Anzeigen, Suchen, Hinzufügen, Bearbeiten, Löschen) von Fotoalben.
- Jedes Fotoalbum enthält einen Titel als Pflichtfeld.
- Fotoalben können optional beliebig viele Schlagwörter enthalten, die zusätzlich zum Titel bei einer Suche berücksichtigt werden.
- Titel und Schlagworte sind änderbar.
- Jedes Fotoalbum enthält beliebig viele Fotos, wobei jedes Foto in beliebig vielen Alben vorkommen kann.
- Jedes Fotoalbum gehört einem Nutzer, und jeder Nutzer sieht nur seine eigenen Alben.
- Eine Suchfunktion für Fotoalben ist bereitgestellt, über die Nutzer ein Album aus den Suchergebnissen auswählen und die zugehörigen Fotos anzeigen können.

### Nicht erfüllt:
#### Admin
- Der Nutzer mit der Rolle Admin verwaltet erfolgreich Nutzerkonten.
  - Suchen: Da die Browser suche funktioniert, haben wir diese Funktion nicht beachtet
  - Bearbeiten: Aufgrund unserer OTP Funktion, liegt die verantwortung bei dem Benutzer, des Weitern würde das ändern des Passworts vom Admin, die Möglichkeit eröffnen, dass der Admin jederzeit auf die Bilder der Benutzer zugreiffen kann.
#### Zusammengefasst: 
Nahezu alle geforderten Anforderungen wurden vollständig und voll funktionstüchtig umgesetzt.


#### Optional (Nicht Teil der optionalen Bonusaufgaben!):
- Design
- One-Time-Password funktionalität. Wenn ein benutzer angelegt wird, wird sein Password als One-Time-Password behandelt und er wird beim Login dazu aufgefordert, sein Passwort zu ändern.