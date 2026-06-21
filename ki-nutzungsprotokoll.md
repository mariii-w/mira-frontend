# KI-Nutzungsprotokoll zur Studienarbeit

## Angaben zur Arbeit

- Gruppenname: Mudkip
- Titel der Studienarbeit: Mira
- KI genutzt: ja
- Verwendete KI-Werkzeuge: Claude, ChatGPT 

Wenn keine KI genutzt wurde, reicht hier die Angabe "nein". In diesem Fall müssen die folgenden Abschnitte nicht ausgefüllt werden.

## Kurz-Erklärung

Dieses Protokoll wird als Markdown-Datei im Git-Repository der Gruppe geführt.
Wesentliche KI-Nutzungen werden hier kurz und zeitnah dokumentiert.
Die Nachvollziehbarkeit über Versionen ergibt sich aus der Git-Historie dieser Datei.

Für diese Studienarbeit wurden KI-Werkzeuge als Unterstützung verwendet.
Die wesentlichen Nutzungen sind unten dokumentiert.
Alle übernommenen Inhalte wurden fachlich geprüft, bei Bedarf angepasst und in die Arbeit eigenverantwortlich integriert.

## Übersicht der KI-Nutzung

Tragen Sie hier die wesentlichen Nutzungen ein.
Wenn ähnliche Nutzungen in engem Zusammenhang stehen, können Sie sie zusammenfassen.
Pflegen Sie das Protokoll möglichst zeitnah, damit die Git-Historie die Entwicklung nachvollziehbar macht. Nutzen Sie KI, um Ihren Promtverlauf entsprechnd dieser Vorlage festzuhalten.  

| Datum | Anwender der KI | Werkzeug | Nutzung kurz beschrieben | Übernahme und Anpassung kurz beschrieben |
| --- | --- | --- | --- | --- |
| 2026-04-20 | Marija Voloder | ChatGPT | Farbpalette aus dem Figma-Styleguide auf Kontrastverhältnisse und Barrierefreiheit geprüft. | Als Referenzcheck genutzt; Farbentscheidungen wurden eigenständig getroffen und durch das Feedback bestätigt. |
| 2026-04-20 | Marija Voloder | ChatGPT | Schriftkombination und typografische Skalierung (Schriftart, Gewichtung, Größen) auf Lesbarkeit geprüft. | Schriften wurden selbst ausgewählt; KI-Feedback hat die Eignung der Wahl bestätigt. |
| 2026-04-25 | Marija Voloder | ChatGPT | Platzhaltertexte und Beispielbilder für UI-Mockup-Screens generiert. | Texte wurden übernommen und in die Mockups integriert. |
| 2026-05-05 | Marija Voloder | ChatGPT | Design-Tokens als CSS Custom Properties in `globals.css` auf Basis des selbst erstellten Styleguides generiert. | Token-Struktur und Benennung wurden selbst vorgegeben; KI hat fehlende Werte ergänzt und die Datei konsistent formatiert. |
| 2026-05-05 | Marija Voloder | ChatGPT | Einrichtung von TanStack Router (dateibasiertes Routing), als neu eingesetzte Bibliothek wenig vertraut damit. | Als Einstiegshilfe verwendet; Konfiguration und Routenstruktur wurden an das Projekt angepasst. |
| 2026-05-05 | Marija Voloder | Claude | Unterstützung bei der Strukturierung der `Button`-Komponente mit Varianten, Größen und Icon-Unterstützung. | Vorschläge geprüft und integriert; visuelle Gestaltung und Komponentenlogik selbst festgelegt. |
| 2026-05-05 | Marija Voloder | Claude | Unterstützung beim Schreiben der Unit-Tests für Input- und Textarea-Komponenten. | Tests geprüft und an Props und Validierungsverhalten angepasst. |
| 2026-05-06 | Marija Voloder | Claude | Unterstützung beim Entwurf des `AccessibilityProvider`: React Context mit localStorage-Persistenz und Synchronisierung von `prefers-reduced-motion` auf HTML-Datenattribute. | Kontextstruktur und localStorage-Logik übernommen; Media-Query-Fallback und Datenattribute geprüft und eingebaut. |
| 2026-05-06 | Marija Voloder | Claude | Hilfe beim Aufbau der `AccessibilityPanel`-UI mit Radix UI Popover und Switch, verbunden mit dem Provider. | Komponentenstruktur und ARIA-Setup als Grundlage genutzt; Beschriftungen und Styling selbst festgelegt. |
| 2026-05-07 | Marija Voloder | Claude | Radix UI entfernt; KI nach ARIA-Mustern für eigene barrierefreie Switch- und Popover-Komponenten gefragt. | ARIA-Attributstruktur als Referenz genutzt; Animation und Styling separat umgesetzt. |
| 2026-05-07 | Marija Voloder | Claude | Hilfe beim Entwurf des `getPageItems`-Algorithmus: Berechnung, welche Seitenzahlen und Ellipsis-Marker basierend auf aktueller Seite, Gesamtseitenanzahl und Sibling-Count angezeigt werden. | Algorithmus-Logik übernommen; Styling und ARIA-Labels der Komponente separat umgesetzt. |
| 2026-05-08 | Marija Voloder | Claude | Accessibility-State auf einen Zustand-Store mit `persist`-Middleware migriert; KI zum Einstieg in die Bibliothek genutzt, da neu. | Store-Struktur und Persist-Konfiguration übernommen; Einbindung ins Panel mit KI-Unterstützung umgesetzt. |
| 2026-05-10 | Marija Voloder | ChatGPT | Gefragt, wie Test- und Coverage-Berichte in der GitLab-CI-Pipeline eingebunden werden. | Coverage-Konfiguration in die bestehende Pipeline integriert und an das Vitest-Setup des Projekts angepasst. |
| 2026-05-11 | Marija Voloder | Claude | Hilfe beim Hinzufügen eines barrierefreien Fehlerzustands zur `Input`-Komponente mit Fehlermeldung unterhalb des Felds und korrekter ARIA-Verknüpfung. | Error-Prop und `aria-describedby`-Muster übernommen; visuelle Gestaltung angepasst. |
| 2026-05-11 | Marija Voloder | Claude | Unterstützung beim Einbinden von Live-Validierungslogik im Styleguide für Benutzername- und Titelfelder. | Validierungsansatz übernommen und an die bestehende Input-Komponenten-API angepasst. |
| 2026-05-16 | Marija Voloder | Claude | Unterstützung beim Aufbau des Zustand-Auth-Stores: Token-State und Benutzerprofil in getrennte Slices aufgeteilt, JWT-Decode-Helper zum Auslesen der Claims aus dem Access-Token hinzugefügt. | Store-Struktur übernommen; Auth-Flow auf Basis der API-Spec selbst definiert. |
| 2026-05-16 | Marija Voloder | ChatGPT | Nach dem Muster für einen `authFetch`-Wrapper gefragt, der den Bearer-Token an jede Anfrage hängt und bei 401 automatisch wiederholt. | Wrapper-Muster als Referenz genutzt; an das Fetch-Setup und die QueryClient-Konfiguration des Projekts angepasst. |
| 2026-05-16 | Marija Voloder | Claude | Hilfe beim Aufbau des mehrstufigen Refresh-Flows: Refresh-Cookie gegen Access-Token tauschen, JWT-Claims dekodieren, Account per ID abrufen, dann vollständiges Benutzerprofil laden. | Flow-Logik übernommen und an die Backend-API-Endpunkte angepasst. |
| 2026-05-18 | Marija Voloder | ChatGPT | Gefragt, wie `/v1`-Aufrufe über Vite proxiert werden, um Cookie-Probleme mit `credentials: 'include'` über Origins hinweg zu lösen. | Proxy-Konfiguration in `vite.config.ts` eingebunden; Pfade und Ziel an das Projekt angepasst. |
| 2026-05-18 | Marija Voloder | Claude | Gefragt, wie ein mehrstufiger Registrierungsassistent mit verschachtelten Routen und einem gemeinsamen Layout in TanStack Router aufgebaut wird. | Routing-Ansatz als Ausgangspunkt genutzt; Schrittreihenfolge, Layout und Guard-Logik separat festgelegt. |
| 2026-05-18 | Marija Voloder | ChatGPT | Regex-Muster für Vor- und Nachnamenvalidierung auf Basis der Backend-API-Spec angefragt: deutsche Umlaute, keine Ziffern, keine führenden oder abschließenden Leerzeichen. | Muster geprüft und an die tatsächlichen Feldanforderungen angepasst. |
| 2026-05-18 | Marija Voloder | ChatGPT | Validierungsregeln für deutsche Adressfelder auf Basis der Backend-API-Spec angefragt: Straßenname, Hausnummernformat (z.B. 43a), 5-stellige Postleitzahl, Stadtname. | Regeln geprüft und angepasst; Ziffernfilterung für die Postleitzahl separat hinzugefügt. |
| 2026-05-18 | Marija Voloder | Claude | Gefragt, wie der Schrittstatus (erledigt / aktuell / ausstehend) aus den Benutzerdaten für die Fortschrittsanzeige im Registrierungs-Sidebar berechnet wird. | Logik als Referenz genutzt; Bedingungen an das tatsächliche Benutzerdatenmodell angepasst. |
| 2026-05-18 | Marija Voloder | ChatGPT | Gefragt, wie ein Benutzer beim Aufrufen einer Route automatisch zum ersten unvollständigen Registrierungsschritt weitergeleitet wird. | Weiterleitungslogik als Referenz genutzt; an TanStack Router und die Schritt-Abschlussprüfungen angepasst. |
| 2026-05-18 | Marija Voloder | Claude | Gefragt, wie der `patchUser`-Helper mit typisierter Fehlerbehandlung für Backend-Validierungsantworten aufgebaut wird. | Helperstruktur als Grundlage genutzt; Fehlertyp und Feldzuordnung anhand der API-Spec definiert. |
| 2026-05-19 | Marija Voloder | ChatGPT | Gefragt, wie eine Live-Avatar-Vorschau vor dem Upload mit der FileReader-API umgesetzt wird. | Ansatz als Referenz genutzt; in den Foto-Schritt mit den bestehenden Komponenten eingebunden. |
| 2026-05-19 | Marija Voloder | ChatGPT | Nach dem `onError`-Muster gefragt, um bei einem fehlerhaften Profilbild-URL auf Initialen zurückzufallen. | Muster übernommen und in die Avatar-Komponente eingebunden. |
| 2026-05-19 | Marija Voloder | Claude | Gefragt, wie das Tagline-Feld nur für Anbieter angezeigt und als Pflichtfeld markiert wird, für Kunden aber ausgeblendet bleibt. | Logik als Referenz genutzt; im About-Schritt anhand des Benutzertyps aus dem Auth-Store eingebunden. |
| 2026-05-19 | Marija Voloder | ChatGPT | Nach dem Muster für einen Live-Zeichenzähler in einem Textarea-Feld mit 2000-Zeichen-Limit gefragt. | Muster als Referenz genutzt; im Bio-Feld des About-Schritts eingebunden. |
| 2026-06-21 | Marija Voloder | Claude | Als Sparringspartner beim Aufbau der Profil-bearbeiten-Seite genutzt: eigene Ideen zu den Feldern, dem Popup-Verhalten und der Layout-Skizze durchgesprochen, außerdem um Hilfe gebeten, um herauszufinden, warum die Seite nach dem Verknüpfen des Buttons nicht aufging. | Entscheidungen zu Feldauswahl und Layout selbst getroffen, die Seite über mehrere Durchgänge geschrieben und angepasst und nur übernommen, was meiner Vorstellung entsprach. Alles gegen die bestehenden Backend-Routen und Validierungsregeln geprüft, bevor es übernommen wurde. Ergebnis im Browser getestet und erst nach Korrektheit committet. |

## Optionale ergänzende Hinweise

Hier können Sie bei Bedarf kurz ergänzen,

- wie Sie mit fehlerhaften KI-Antworten umgegangen sind,
- welche Vorschläge Sie bewusst verworfen haben,
- in welchen Fällen die KI nur als Sparringspartner diente.

## Eigenständigkeit und Verantwortung

Wir bestätigen, dass die KI-Nutzung in dieser Arbeit vollständig und nach bestem Wissen dokumentiert wurde.
Wir übernehmen die Verantwortung für die fachliche Richtigkeit, die Auswahl der übernommenen Inhalte und die gesamte abgegebene Arbeit.

- Datum:
- Gruppenname: Mudkip