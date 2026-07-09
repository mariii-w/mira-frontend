# Demo-Skript: Consumer-Flow (ca. 4 Minuten)

Sprache: B2-Niveau, ruhiges Sprechtempo eingeplant. Zeitangaben sind grobe Richtwerte — bei langsamerem Sprechen einfach die optionalen Technik-Sätze in [ ] weglassen.

Hinweis vorab: Der Flow ist inhaltlich vollständig und zeigt die zentralen Funktionen (öffentlicher Bereich, Registrierung, Buchung mit Kalenderlogik, Provider-Freigabe, Bezahlung, Nachrichten) — das ist mehr als genug für 4 Minuten. Realistisch wird es knapp, wenn alles inklusive Wartezeiten (Stripe-Redirect, Klassenkollegin reagiert) glatt läuft. Zwei Stellen, die man bei Zeitnot kürzen kann, sind unten mit **[kürzbar]** markiert.

---

**(0:00–0:15) Übergabe**
*"Jetzt wechsle ich in einen zweiten Browser und zeige die Seite aus Sicht eines Kunden, der Mira noch nicht kennt."*

---

**(0:15–0:35) Öffentlicher Bereich — nicht eingeloggt**
Aktion: Startseite, dann "Browse Services" / "Find Users" öffnen, eine Anzeige anklicken.

*"Ohne Login sieht man schon einiges: man kann Dienstleistungen und Anbieter durchsuchen und sich eine Anzeige im Detail ansehen. Buchen oder Nachrichten schreiben geht aber erst mit Account — das zeige ich gleich."*

[optional, nur falls Zeit: *"Das läuft komplett ohne Authentifizierung, die Daten kommen über öffentliche API-Endpunkte."*]

---

**(0:35–1:05) Registrierung mit Google**
Aktion: "Login" klicken → Popup öffnet sich → "Continue with Google" wählen → Google-Login → Redirect zurück.

*"Ich melde mich mit Google an. Man wird kurz zu Google weitergeleitet, bestätigt dort den Zugriff, und landet automatisch wieder bei Mira — eingeloggt, aber das Profil ist noch leer."*

---

**(1:05–1:35) Registrierungs-Formular** **[kürzbar: einzelne Schritte nur benennen, nicht jedes Feld erklären]**
Aktion: Durch die Schritte klicken (Name, Adresse, Über mich, Foto, Rolle), am Ende "Fertig"-Seite.

*"Da meine Kollegin den Ablauf beim Provider schon gezeigt hat, gehe ich hier kurz durch: Name und Nutzername, dann Adresse — die wird später für die Umkreissuche gebraucht —, ein kurzer Text über mich, optional ein Profilfoto, und zuletzt wähle ich hier die Rolle 'Consumer'. Fertig — weiter zu den Diensten."*

---

**(1:35–1:55) Listing öffnen**
Aktion: "View services" klicken → Natalias Listing suchen und öffnen.

*"Hier sehe ich das Angebot meiner Kollegin Natalia. Ich öffne die Detailseite und klicke auf 'Buchen'."*

---

**(1:55–2:45) Buchungsseite**
Aktion: Kalender/Slots zeigen, Datum + Uhrzeit wählen, Dauer anpassen (Preis steigt), rechts Ort wählen + Beschreibung eintragen, Übersicht unten, "Send booking request" klicken.

*"Der Kalender zeigt automatisch die freien Zeiten von Natalia — er berücksichtigt sowohl ihre hinterlegten Arbeitszeiten als auch bereits bestehende Buchungen, damit es keine Doppelbelegung gibt. Ich wähle einen Termin und stelle die Dauer ein — der Preis passt sich direkt an. Rechts wähle ich noch, ob der Termin bei mir oder bei Natalia stattfindet, und schreibe kurz, was ich brauche. Unten sehe ich die Zusammenfassung noch einmal komplett, und mit einem Klick sende ich die Buchungsanfrage ab."*

---

**(2:45–3:00) Buchungsstatus: Pending**
Aktion: Redirect zu "My Bookings", Status zeigt "Pending".

*"Ich lande direkt bei meinen Buchungen, der Status steht auf 'Pending' — jetzt muss Natalia die Anfrage erst annehmen oder ablehnen."*

---

**(Wechsel zur Kollegin — sie akzeptiert die Buchung)**

---

**(3:00–3:20) Zahlung mit Stripe**
Aktion: Zurück im eigenen Browser, roter Notification-Punkt zeigt sich, Buchungsstatus jetzt "Awaiting payment", "Pay" klicken → Stripe-Checkout mit Testkarte.

*"Ich bekomme sofort eine Benachrichtigung, dass Natalia zugesagt hat — der Status ist jetzt 'Awaiting payment'. Ich klicke auf 'Pay' und werde zu Stripe weitergeleitet, wo ich mit einer Testkarte bezahle."*

[optional, nur falls Zeit: *"Nach erfolgreicher Zahlung schickt Stripe im Hintergrund ein Webhook-Event an unseren Server, das den Buchungsstatus automatisch aktualisiert."*]

---

**(3:20–3:30) Kalender-Check** **[kürzbar: bei Zeitnot komplett weglassen]**
Aktion: Kurz zu "Calendar" wechseln.

*"Ein kurzer Blick in meinen Kalender — der Termin ist jetzt eingetragen."*

---

**(3:30–4:00) Nachricht an den Provider**
Aktion: Zurück zum Listing, "Message Natalia" klicken, kurze Nachricht schreiben, Antwort abwarten/zeigen.

*"Zum Schluss gehe ich noch einmal zur Anzeige zurück und schreibe Natalia direkt eine Nachricht — zum Beispiel, ob ich noch etwas mitbringen soll. Und da kommt auch schon die Antwort."*

---

**Übergabe / Abschluss**
*"Damit haben wir den kompletten Ablauf aus Kundensicht gezeigt — von der ersten Suche ganz ohne Account bis zur bezahlten, bestätigten Buchung."*

---

## Stripe lokal einrichten (README bereits vorhanden, hier zusammengefasst)

Aus `mira-backend/README.md`:

1. Stripe-Testmodus-Key holen: [dashboard.stripe.com](https://dashboard.stripe.com/) → Developers → API keys → Secret key kopieren → in `.env` als `STRIPE_SECRET_KEY` eintragen.
2. Stripe CLI installieren:
   - macOS: `brew install stripe/stripe-cli/stripe`
   - **Windows** (da du auf Windows arbeitest): entweder `winget install stripe.stripe-cli`, oder das Binary direkt von [github.com/stripe/stripe-cli/releases](https://github.com/stripe/stripe-cli/releases) laden und in den PATH legen.
3. `stripe login` ausführen (öffnet Browser zur Bestätigung).
4. `stripe listen --events checkout.session.completed --forward-to localhost:8081/v1/stripe/webhook` starten und laufen lassen, während der Server läuft — das leitet Stripe-Testevents an deinen lokalen Server weiter.
5. Den Webhook-Signing-Secret, den die CLI dabei ausgibt, in `.env` als `STRIPE_WEBHOOK_SECRET` eintragen.
6. Testkarte beim Checkout: `4242 4242 4242 4242`, Ablaufdatum `12/34`, CVC `123`, beliebige weitere Angaben.

Wichtig: Schritt 4 (`stripe listen`) muss während der gesamten Demo in einem eigenen Terminal offen und aktiv laufen, sonst kommt das Webhook-Event nicht an und der Buchungsstatus bleibt nach der Zahlung auf "Awaiting payment" hängen.
