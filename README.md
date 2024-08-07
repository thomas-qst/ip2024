# README

## Informationen zur Inbetriebnahme der Anwendung
Wie gewohnt mit den Befehlen aus README.adoc, die Anwendung erstmal testen, packagen und dann starten. Das alles im Terminal in dem backend Verzeichnis. Dann am besten im fronted Verzeichnis, mit einem Pythonbefehl aus der server.bat einen Server starten, damit alles richtig läuft. Dann nur noch Browser öffnen und Localhost:8080 eingeben.  

## DDL Skript

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
- Der Nutzer mit der Rolle Admin verwaltet erfolgreich Nutzerkonten (Anzeigen, Suchen, Hinzufügen, Bearbeiten, Löschen).
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

#### Kurzgesagt: 
Alle geforderten Anforderungen wurden vollständig und vollfunktionstüchtig umgesetzt.