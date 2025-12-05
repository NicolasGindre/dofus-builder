# Tutorial

Dieses Tutorial wurde mit ChatGPT übersetzt und enthält daher wahrscheinlich Fehler. Die englischen und französischen Tutorials wurden manuell geschrieben, nutze also nach Möglichkeit diese Versionen.

**Dofus MinMax** ist eine Anwendung, die die besten Builds in Dofus berechnet.  
Sie ist in 3 Bereiche aufgeteilt:

- **Gewicht / Min / Max (Parameter):** Definiere, was du in deinem Build haben möchtest.
- **Objektauswahl:** Wähle die Objekte, die in die Kombinationsberechnung einfließen sollen.
- **Build-Ergebnisse:** Zeigt die besten berechneten Objektkombinationen an.

Die Idee dahinter: Wenn du nur die interessantesten Objekte für die gewünschten Eigenschaften auswählst, kann die App alle möglichen Kombinationen daraus berechnen und die besten Builds finden.

Mein Ziel ist, dass diese Anwendung so vollständig wie möglich ist, aber ich möchte auch, dass Gelegenheitsspieler sie nutzen können. Hier also das

## TL;DR

- Klicke auf die Gewichtungsfelder der Werte, die du in deinem Build haben möchtest
- Gib dein Level an
- Klicke auf **„Beste Objekte berechnen“**
- Klicke auf **„Schnellauswahl“**
- Füge bei Bedarf Exos für AP / BP / Reichweite hinzu
- Klicke auf **„Beste Builds berechnen“** … und warte
- Vergleiche die Ergebnisse
- Wiederhole den Vorgang, bis du zufrieden bist

---

# Grundlegende Nutzung

## Gewicht / Min / Max – Parameter

Die **Gewichte** werden genutzt, um den Wert von Objekten, Sets und Builds zu berechnen.  
Jede Eigenschaft wird mit ihrem Gewicht multipliziert (0, wenn kein Gewicht gesetzt ist), um den finalen Wert zu erhalten.

Es werden nur die maximal möglichen Werte der Objekte berücksichtigt.  
Abgeleitete Werte wie Tackling, Flucht, Initiative usw. werden beim Laden für jedes Objekt und jedes Set berechnet. Das bedeutet: Du solltest nur dann ein Gewicht für eine Eigenschaft setzen, wenn dir ihr **direkter Effekt** wichtig ist – nicht ihre abgeleiteten Werte.  
Zum Beispiel: Setze nur ein Gewicht auf Weisheit, wenn dir der Bonus auf Erfahrung wichtig ist. Ein Gewicht auf einem abgeleiteten Wert wirkt ohnehin indirekt zurück auf seinen Ursprungswert.

**Min** ist eine harte Grenze: Wenn der finale Wert eines Builds unter dem Min-Wert liegt, wird der Build ignoriert (und sein Wert wird 0).  
**Max** ist eine weiche Grenze: Wenn ein Wert Max überschreitet, wird er auf diesen Max-Wert gedeckelt, wodurch sein Beitrag zum Build-Wert natürlich begrenzt wird.

Klicke auf das Gewicht einer Eigenschaft, um den Standardwert einzutragen. Wenn du schon eine grobe Vorstellung hast, kannst du ihn anpassen. Wenn nicht, kannst du das später jederzeit ändern.  
Du kannst ein Gewicht auch entfernen, indem du **doppelt** darauf klickst.

Die **Min-Parameter für AP, BP und Reichweite** sind am wichtigsten, wenn du genau weißt, was du brauchst.

Sobald du deine Gewichte und Min/Max-Grenzen festgelegt hast, klicke auf **„Beste Objekte berechnen“**.  
Vergiss nicht, auch dein gewünschtes Level zu setzen.

---

## Objektauswahl

Die komplette Datenbank aller Objekte und Sets wird als Grundlage verwendet, sobald du auf **„Beste Objekte berechnen“** klickst.

Die Objekte mit dem höchsten Wert pro Kategorie werden in der **ersten Spalte** angezeigt.  
Wenn ein Objekt zu einem Set gehört, wird außerdem der Wert **„Mit Set“** angezeigt.  
Wenn du mit der Maus über ein Objekt fährst, siehst du seine Details.  
Wenn du auf ein Objekt klickst, wird es zur Auswahl hinzugefügt.

Wenn ein Objekt unter deinem gewünschten Level liegt, wird es ignoriert.  
Ein Objekt mit einer Bedingung beeinflusst seinen Wert nicht direkt. Wenn aber eine AP-/BP-Bedingung mit einem Min-Parameter nicht kompatibel ist, wird das Objekt ignoriert.  
Zum Beispiel:

- Min AP = 11 → Objekte mit AP < 11 werden ignoriert
- Min AP = 12 und Min BP = 6 → Objekte mit AP < 12 oder BP < 6 werden ignoriert

Spezialeffekte von Objekten haben keinen Einfluss auf ihren Wert. Wenn ein großer Teil der Stärke eines Objekts aus einem Spezialeffekt kommt, kann es nötig sein, dieses Objekt zu **locken**, damit Builds berechnet werden, die es verwenden.

Die Sets mit dem höchsten **Score** (die Funktion wird weiter unten erklärt) werden in der **zweiten Spalte** angezeigt.  
Wenn du mit der Maus über ein Set fährst, siehst du seine Set-Boni und den Wert, den jeder Bonus für jede Anzahl an getragenen Teilen bringt.  
Die angezeigten Werte sind **inkrementell**: Sie zeigen den zusätzlichen Wert, den jedes weitere Teil bringt.

Standardmäßig werden die **Top 20 Sets** angezeigt.  
Wenn du ein Objekt auswählst, das zu einem Set außerhalb der Top 20 gehört, wird dieses Set trotzdem unten in der Spalte angezeigt.  
Wenn du neben dem Top-20-Bereich auf **„Ausgewählt“** klickst, werden nur noch Sets angezeigt, die mindestens ein ausgewähltes Objekt enthalten.

Die **dritte Spalte** zeigt die ausgewählten Objekte nach Kategorie. Aus dieser Auswahl werden dann **alle möglichen Kombinationen** getestet.  
Unten in dieser Spalte siehst du die Gesamtzahl der Kombinationen sowie die geschätzte Rechenzeit (K = Tausend, M = Million, B = Milliarde, T = Billion).

Das **Augen-Symbol** scrollt automatisch zu dem entsprechenden Objekt in den anderen Spalten.

Jedes Objekt kann **gelockt** werden. Ein gelocktes Objekt ist in **allen** berechneten Kombinationen enthalten. Das kann die Anzahl der Kombinationen enorm reduzieren.  
Es kann immer nur **ein** Objekt pro Kategorie gelockt werden (zwei bei Ringen, sechs bei Dofus).

Das Ziel ist, so viele interessante Objekte und Sets wie möglich auszuwählen, ohne dass die Anzahl der Kombinationen explodiert.

Es gibt zwei Herangehensweisen:

- **„Schnellauswahl“ nutzen:**  
  Fügt alle sichtbaren Objekte der sichtbaren Sets hinzu **plus** das Objekt mit dem höchsten Wert pro Kategorie (außer Dofus/Trophäen).  
  → Schneller, aber eventuell etwas weniger optimal.
- **Manuell auswählen:**  
  Wähle gezielt die Objekte und Sets, die für deine Suche sinnvoll erscheinen.

Danach solltest du die Gesamtzahl der Kombinationen prüfen. Entferne ggf. Sets mit niedrigem Score, wenn die Zahl zu hoch ist.  
Für den Anfang: Halte sie unter **100 Millionen**.  
Es ist grundsätzlich kein Problem, sehr viele Kombinationen zu berechnen – es dauert nur länger und lässt deinen Rechner warm werden.

Unten in der ersten Spalte kannst du angeben, ob du in deinem Build Exos für **AP/BP/Reichweite** einplanst.

Dann klicke auf **„Beste Builds berechnen“**.

Während der Berechnung werden **Fortschritt** und **Geschwindigkeit** angezeigt.  
Du kannst die Geschwindigkeit speichern, um zukünftige Berechnungen besser abschätzen zu können.

Sobald die Berechnung abgeschlossen ist, erscheinen die Ergebnisse im Bereich **Builds**.

---

## Builds

Die **500 besten Ergebnisse** werden angezeigt, sortiert nach ihrem Wert.  
Wenn kein Ergebnis alle Min-Parameter bzw. Bedingungen erfüllt, bleibt die Liste leer.

Wenn eine Eigenschaft und ihr Gewicht beide 0 sind, wird diese Eigenschaft nicht angezeigt.  
Wenn eine Eigenschaft ≠ 0 ist, aber ein Gewicht von 0 hat, wird sie mit niedriger Deckkraft angezeigt – das bedeutet, sie beeinflusst den Build-Wert nicht.

Die Eigenschaften sind in drei Gruppen sortiert:

- **Utility**
- **Offensiv**
- **Defensiv**

Die Werte in jeder Gruppe werden addiert und oben in der jeweiligen Gruppe angezeigt.

Wenn eine Eigenschaft ihren Max-Parameter überschreitet, wird sie gedeckelt; ein grauer Pfeil zeigt ihren ursprünglichen Wert an.  
Wenn eine Eigenschaft unter ihrem Min-Parameter liegt, wird sie **rot** angezeigt und der Build-Wert wird **0**.

Eine der wichtigsten Funktionen in diesem Bereich ist der **Build-Vergleich**.  
Wenn du einen Build als Referenz markierst, zeigen alle anderen Builds nur noch die Unterschiede zu diesem Referenz-Build an. Angezeigt werden die Differenzen bei:

- Gesamtwert des Builds
- Wert der einzelnen Eigenschafts-Gruppen
- Einzelwerten
- Objekten
- Sets

Die Bedingungen eines Builds werden unter den Eigenschaften angezeigt. Wenn eine Bedingung von einer anderen „abgedeckt“ wird, wird sie entfernt.  
Beispiel: AP < 11 und AP < 10 → bleibt nur **AP < 10**.

Wenn ein Build eine Bedingung bei **Vitalität, Stärke, Glück, Intelligenz, Beweglichkeit oder Weisheit** nicht erfüllt, wird diese Bedingung mit **gelbem Hintergrund** angezeigt.  
Wenn er eine Bedingung zu **Level** oder **Set-Bonus < 3** nicht erfüllt → Bedingung mit **rotem Hintergrund** und Wert = 0.  
Alle anderen Bedingungen (AP, BP, [AP oder BP], Reichweite, Beschwörungen) verhalten sich wie ein Max-Parameter: Der Wert wird gedeckelt.

Du kannst einen Build nach **DofusDB** oder **DofusBook** exportieren.

Die 500 Builds werden **dynamisch neu berechnet**, wenn du Gewichte, Min/Max, Level oder Exos veränderst.  
Ein strengerer Min-Parameter kann Builds ungültig machen, ihren Wert auf 0 setzen und sie dadurch an das Ende der Liste verschieben.

Diese dynamische Neuberechnung verhindert, dass du für jede kleine Anpassung eine große Kombinationsberechnung neu starten musst.  
Aber Achtung: Wenn du die Parameter stark veränderst, kann es nötig sein, die **besten Objekte** neu zu berechnen, da andere Objekte oder Kombinationen dann besser sein könnten.

---

## Navigation

Jede Spalte hat ihren eigenen Scroll-Bereich. Wenn du mit der Maus über einer Spalte bist, scrollst du nur diese Spalte.  
Um die ganze Seite zu scrollen, bewege den Cursor weg von den Spalten oder benutze die Navigationsleiste links.

Die Tooltips von Objekten/Sets werden scrollbar, wenn sie zu groß sind. In diesem Fall scrollst du in der Tooltip-Box und nicht auf der Seite.

In den Ergebnissen kannst du mit **↑ / ↓** schnell durch die Liste navigieren und mit **← / →** die Seite wechseln.

---

# Gespeicherte Builds

Du kannst einen Build speichern. Gespeicherte Builds erscheinen im Build-Bereich neben **„Ergebnisse“**.  
Wie bei den normalen Ergebnissen werden ihre Werte dynamisch entsprechend deinen aktuellen Parametern aktualisiert.

Wenn ein gespeicherter Build identisch zu einem Ergebnis einer neuen Suche ist, übernimmt er automatisch den gespeicherten Namen.

Du kannst außerdem einen gespeicherten Build als Referenz-Build zum Vergleich auswählen.

---

# Gespeicherte Suchen

Alle Suchparameter sind in der **URL kodiert**.  
Du kannst die URL also kopieren, in einem neuen Tab öffnen und anpassen, um zwei Suchen zu vergleichen.

Gespeicherte Builds werden zwischen deinen Tabs synchronisiert.  
So kannst du z. B. in einem zweiten Tab eine Variante deiner Suche ausführen, einen Build speichern und ihn dann im ersten Tab vergleichen.

Du kannst eine Suche in der oberen Leiste speichern. Gib ihr einen Namen (z. B. **„Panda Tank“**). Der Seitentitel wird mit diesem Namen aktualisiert.  
Wenn du die Suche veränderst, wird der Name **orange**. Speicherst du sie erneut, wird er wieder **grün**.

Um eine Suche zu laden, klicke oben links auf den Namen der Suche, um alle gespeicherten Suchen anzuzeigen.  
Beim Laden der Seite: Wenn die URL genau einer gespeicherten Suche entspricht, wird diese automatisch geladen.

**Wichtig:** Gespeicherte Suchen und Builds werden nur im **lokalen Speicher deines Browsers** abgelegt. Wenn du diesen leerst, können sie verloren gehen.

Um eine Suche nicht zu verlieren:  
→ Speichere die URL in deinen Favoriten.

Um einen Build nicht zu verlieren:  
→ Exportiere ihn auf deine bevorzugte Dofus-Seite.  
Du kannst einen Build auch als neue Suche exportieren und die URL dieser Suche in deinen Favoriten speichern.

Eine Suche wird in deinem Browserverlauf gespeichert, wenn du:

- auf **„Beste Objekte berechnen“** oder **„Beste Builds berechnen“** klickst
- eine Suche **erstellst**, **lädst**, **speicherst** oder **teilst**

Du kannst zu einer früheren Version deiner Suche zurückspringen, indem du im Verlauf zurückgehst. Die Suchergebnisse bleiben dabei erhalten.

---

# Sets

## Wert pro Objekt

Um den Wert zu bestimmen, den ein Set einem Objekt bringt, wird wie folgt vorgegangen:

- Für jeden Set-Bonus wird sein Wert berechnet.
- Dieser Wert wird durch die Anzahl an Set-Teilen geteilt, die für diesen Bonus benötigt wird.
- Die beste durchschnittliche **„Wert pro Objekt“**-Kombination wird genommen.

Dieser Wert wird als **„Bester Wert pro Objekt“** angezeigt und jedem Objekt des Sets hinzugefügt.

In den meisten Fällen entspricht dieser Maximalwert dem kompletten Set, aber manchmal kann ein Zwischenbonus eine bessere Durchschnittsleistung haben.

## Score

Um die besten Sets zu bestimmen, wird eine **Score-Funktion** verwendet. Du musst sie nicht unbedingt im Detail verstehen, aber hier die Erklärung:

Für jedes Objekt des Sets wird die Differenz zwischen seinem Wert und dem Wert des besten Objekts derselben Kategorie berechnet.  
Das ist der **Verlust**, den du hast, wenn du nicht das beste Einzelobjekt trägst.  
Diese Verluste werden von der größten zur kleinsten sortiert.

Für jeden Set-Bonus wird dann berechnet:

1. Wert des Set-Bonus
2. minus die Summe der Verluste der X ersten Objekte, die für diesen Bonus nötig sind
3. geteilt durch die Gesamtzahl der Teile des Sets

Der beste so erhaltene Wert ist der **Score** des Sets.

Die Idee: Sets danach zu sortieren, welchen maximalen Mehrwert sie bringen können – unter Berücksichtigung der Verluste, weil du nicht überall das beste Einzelobjekt nimmst.

Ein negativer Score bedeutet **nicht automatisch**, dass ein Set schlecht ist. Es kann zum Beispiel:

- nötig sein, um einen Min-Parameter zu erfüllen (oft AP),
- helfen, einen Max-Parameter nicht zu überschreiten,
- eine wichtige Bedingung erfüllen.

Ein Nachteil dieser Score-Funktion ist, dass das beste Objekt einer Kategorie vielleicht zu teuer oder einfach nicht gewünscht ist.  
In solchen Fällen kann ein Set, das ein Objekt dieser Kategorie enthält, im Score schlechter erscheinen, obwohl es für deine Suche sehr sinnvoll wäre.

Nimm diese Score-Funktion also nicht als absolute Wahrheit.  
Es kann sinnvoll sein, Sets mit niedrigem Score zusätzlich aufzunehmen – oder Sets mit hohem Score zu entfernen, wenn sie für deine Suche keinen Sinn ergeben.

## Teilweise auswählbare Sets

Wenn ein Set ein Objekt enthält, das nicht auswählbar ist, weil:

- ein Objekt über deinem zulässigen Level liegt
- ein Objekt mit Voraussetzungen nicht mit deinen Min-Parametern kompatibel ist
- ein Objekt in einer bereits gelockten Kategorie liegt

dann berücksichtigen die Funktionen **Wert pro Objekt** und **Score** das automatisch: Es werden nur die möglichen Kombinationen behalten.

Wenn nur **ein Teil (oder gar keiner)** auswählbar ist, wird der Score = **−∞**, und das Set wird nicht angezeigt.

Nachdem du ein Objekt gelockt hast, kann es sinnvoll sein, erneut die **besten Objekte** zu berechnen, um aktualisierte Scores zu bekommen.  
Die Aussage ist dann etwa: „Ausgehend von den Objekten, die du gelockt hast, sind dies die besten übrigen Objekte und Sets, die in die freien Slots passen“.  
Du kannst so schrittweise einen Build aufbauen, indem du nach und nach Objekte oder Sets lockst und dann jeweils neu die besten Objekte berechnest.

## Schnellauswahl

Die **Schnellauswahl** fügt alle Gegenstände aus den Sets im **Top X** hinzu. Wenn ein Gegenstand nicht auswählbar ist (Stufe oder Min-Parameter nicht kompatibel), wird er nicht hinzugefügt.

Du kannst die Anzahl der angezeigten Sets (Top 20) anpassen, um mehr oder weniger Gegenstände hinzuzufügen. Achtung: Die Anzahl der Kombinationen steigt exponentiell.

Die Schnellauswahl fügt außerdem Gegenstände hinzu, deren Wert nahe am höchsten Wert ihrer jeweiligen Kategorie liegt.

Schließlich werden, wenn der niedrigste Wert unter den ausgewählten Set-Scores negativ ist, auch alle Gegenstände hinzugefügt, bei denen die Differenz zwischen ihrem Wert und dem Wert des besten Gegenstands ihrer Kategorie _kleiner ist als dieser negative Score_.

Nur das beste Pet wird zur Auswahl hinzugefügt. **Dofus / Trophäen** werden ignoriert.

## Momore-Set

Das **Momore-Set** ist das einzige Set mit Bedingungen. Es funktioniert wie die Bedingungen von Objekten:

Wenn deine Min-Parameter für BP / Reichweite / Beschwörungen mit dem Set-Bonus nicht kompatibel sind, berücksichtigen die Funktionen für Score und Wert pro Objekt das und schließen die entsprechenden Kombinationen aus.

Andernfalls wird der **finale Wert des Builds** an den Set-Bonus gedeckelt.  
Wenn du Builds vergleichen willst, die dieses Set enthalten, ist es empfehlenswert, das Gewicht für die durch das Set gedeckelten Eigenschaften niedrig oder 0 zu setzen.

---

# Dofus / Trophäen

**Dofus** und **Trophäen** können in die Kombinationsberechnung einbezogen werden.  
Ihr Hauptnutzen ist es, Builds zu bewerten, die durch natürliche Caps beeinflusst werden (Ocre, Vulbis, Sylvestre usw.).

## Kombinationen

Es ist möglich, mehrere Kombinationen von Dofus/Trophäen zu berechnen – aber Vorsicht: Die Anzahl wächst **exponentiell** und ist in der Regel nur in Spezialfällen wirklich interessant.  
Im Normalfall ist es einfacher und empfehlenswert, pro Suche nur **eine** Kombination von Dofus/Trophäen zu haben.

- Auswahl ≤ 6 → 1 Kombination
- 7 ausgewählt → 7 Kombinationen
- 8 ausgewählt → 28 Kombinationen
- 9 ausgewählt → 84 Kombinationen

Ein sinnvoller Anwendungsfall: Du willst verschiedene Builds vergleichen, bei denen du dir beim letzten oder bei den letzten beiden Slots unsicher bist.  
Dafür kannst du die Dofus/Trophäen, die du **auf jeden Fall** verwenden willst, **locken**, und ein paar andere un-gelockt lassen.

Beispiel:  
Du lockst 5 Dofus/Trophäen und lässt **Turbulenter** (+1 AP, −1 BP) sowie eine weitere für deinen Build nützliche Trophäe offen.  
So entstehen nur 2 Kombinationen – mit und ohne Turbulenter – und du kannst sie in einer einzigen Suche direkt vergleichen.

## Trophäen mit „Set-Bonus < 3“

Wenn du mindestens eine Trophäe auswählst, die die Bedingung **Set-Bonus < 3** hat, werden zwei **Gruppen** von Kombinationen erstellt:

- **Gruppe 1:** Nur „klassische“ Dofus/Trophäen
- **Gruppe 2:** Trophäen mit „Set-Bonus < 3“ haben Priorität

Die Idee: Du möchtest Builds vergleichen, die die Bedingung **„Set-Bonus < 3“** haben, mit Builds ohne diese Bedingung.  
Ein Build mit so einer einschränkenden Bedingung ist meist weniger optimal. Es ist also logisch, darin möglichst viele Trophäen mit **„Set-Bonus < 3“** unterzubringen – sie haben in diesem Kontext mehr Wert.

Die erste Gruppe („klassisch“) entspricht den Kombinationen nur mit normalen Dofus/Trophäen **ohne** diese speziellen Trophäen.  
Sie kann leer sein, wenn nur Trophäen mit „Set-Bonus < 3“ ausgewählt wurden.

Die zweite Gruppe mit „Set-Bonus < 3“ wird folgendermaßen gebaut:

1. Zuerst werden alle gelockten „klassischen“ Dofus/Trophäen übernommen.
2. Wenn es genauso viele oder mehr „Set-Bonus < 3“-Trophäen gibt wie freie Slots → es werden nur Kombinationen mit diesen Trophäen gebildet → fertig.
3. Andernfalls werden alle „Set-Bonus < 3“-Trophäen in die freien Slots gesetzt.
4. Wenn danach noch freie Slots übrig sind und es noch ungelockte klassische Trophäen gibt → werden mit diesen die verbleibenden Slots kombiniert → fertig.

Am einfachsten ist es, pro Gruppe nur **eine** Kombination (6 Objekte) zu haben.  
Dafür:

- Wähle 6 „klassische“ Dofus/Trophäen aus.
- Locke diejenigen, die du auf jeden Fall willst.
- Wähle dann **[6 − Anzahl gelockter klassischer Dofus/Trophäen]** Trophäen mit „Set-Bonus < 3“.

Beispiel:  
Du wählst 6 klassische Trophäen, davon 2 gelockt → dann wählst du zusätzlich 4 Trophäen mit „Set-Bonus < 3“.

Wenn du komplexere Kombinationen bauen willst, beginne damit, nur Dofus/Trophäen auszuwählen, und beobachte die Anzahl der Kombinationen.  
Du kannst auch die **besten Builds nur mit diesen** berechnen – also ohne andere Objekte –, um zu überprüfen, ob die generierten Kombinationen deinem Plan entsprechen (entferne dafür alle Min-Parameter, damit du auf jeden Fall Ergebnisse bekommst).

Diese Gruppierung findet **nicht** statt, wenn du mindestens **eine** Trophäe mit „Set-Bonus < 3“ lockst.  
In diesem Fall werden **alle Kombinationen normal gemischt**.  
Wenn du also einfach nur Builds mit dieser Bedingung erkunden willst, kannst du eine solche Trophäe locken. Das ist oft einfacher, wenn dir diese Gruppierungslogik etwas kompliziert vorkommt (was absolut verständlich ist).

---

# Wie man gute Parameter festlegt

## Gewichte

Die Standardgewichte basieren hauptsächlich auf den **Rune-/Puit-Kosten** der Eigenschaften, wurden aber angepasst, wenn sie zu hoch oder zu niedrig wirkten.  
Ich habe zudem Pets und Transzendenz-Runen verglichen, um genauere Gewichte zu erhalten.

Ein Gewicht hat nur **im Verhältnis zu den anderen Gewichten** eine Bedeutung.  
Wenn du z. B. ein Gewicht von 1 für Tackling und 2 für Heilung setzt, ist das exakt dasselbe wie 2 für Tackling und 4 für Heilung.  
Wichtig ist nur das **Verhältnis** zwischen den Gewichten.

Eine gute Methode ist:

1. Wähle eine Eigenschaft als Basis mit Gewicht 1, z. B. **Stärke**.
2. Gehe dann die anderen Eigenschaften durch und frage dich:  
   „Wie viel Stärke ist diese Eigenschaft wert?  
   Habe ich lieber 100 Stärke oder 20 Tackling?“
3. Wenn es für dich gleichwertig ist, dann sind 5 Stärke = 1 Tackling ⇒ das Tackling-Gewicht wäre 5.

Wenn du dir bei einem Verhältnis sicher bist, kannst du den gleichen Prozess mit dieser neuen Basis-Eigenschaft wiederholen, um weitere Verhältnisse zu finden oder vorhandene zu überprüfen.

Wenn du dir bei einer Eigenschaft unsicher bist, ist es besser, ihr Gewicht leer oder niedrig zu lassen.  
Du kannst es später immer noch erhöhen und die Ergebnisse vergleichen.

## Offensiv-Gewichte

Das Gewicht von **Power** sollte immer gleich der **Summe der Gewichte von Stärke, Intelligenz, Glück und Beweglichkeit** sein.  
Das Gewicht von **Schaden** sollte immer gleich der **Summe der Gewichte von Neutral-, Erd-, Feuer-, Wasser- und Luftschaden** sein.  
Die Anwendung summiert diese Werte automatisch, solange du **„Automatische Gewichtsberechnung“** nicht deaktiviert hast.

Neutral-Schaden sollte wahrscheinlich auf 0 oder eher niedrig bleiben, weil nur wenige Zauber eine neutrale Schadenslinie haben und die meisten Items, die Erdschaden erhöhen, auch Neutral-Schaden erhöhen – sonst würde ihr Wert doppelt gezählt.

Wenn du einen **Krit-Build** spielst, sollte das Gewicht der **kritischen Schäden** immer **unterhalb** des Gewichts der normalen Schäden liegen.  
Wenn du 100 % Kritchance hast, sind kritische Schäden in etwa gleich viel wert wie normale – mit dem Unterschied, dass sie von **kritischer Resistenz** beeinflusst werden.

Das optimale Verhältnis **elementarer Schaden / Power** kann man exakt berechnen, wenn man die Zauber kennt, die man spielen will.

Das optimale Verhältnis **Schaden / Power** folgt ungefähr der Formel:

> **100 / durchschnittlicher Grundschaden des Zaubers**

Je höher der Basis-Schaden eines Zaubers, desto weniger Gewicht sollte in Schaden gehen.

Beispiel:  
Du nutzt nur den Sacrieur-Zauber „Dezimierung“: Er macht 29 bis 32 Erdschaden, also im Schnitt 30,5.  
Das Verhältnis wäre also 100 / 30,5 ≈ 3,3.  
Wenn du ein Gewicht von 1 für Stärke hast, solltest du ein Gewicht von 3,3 für Erdschaden setzen.

Allgemein gilt für typische 1-Linien-Damage-Zauber ohne Zusatz-Effekt:

- Verhältnis zwischen **2 und 3** bei **4-AP-Zaubern**
- Verhältnis zwischen **3 und 4** bei **3-AP-Zaubern**
- Verhältnis zwischen **4 und 5** bei **2-AP-Zaubern**

Zauber mit Zusatz-Effekten haben meist niedrigeren Grundschaden und somit ein höheres optimales Schaden/Power-Verhältnis.

Ein Krit-Treffer erhöht in den meisten Fällen den Basis-Schaden eines Zaubers um den Faktor **1,2**.  
Das Schaden/Power-Verhältnis sollte daher durch 1,2 geteilt werden, wenn du einen Krit-Build spielst.

Das Gewicht für **Krit-Chance** ist etwas komplizierter zu bestimmen.  
Am einfachsten ist es, vorher zu entscheiden, ob du **auf Krit gehen willst**, und dann lieber:

- einen **Min-Parameter** für Kritchance zu setzen  
  oder
- ein hohes Gewicht **und** einen Min-Parameter zu verwenden.

## Defensiv-Gewichte

Die Gewichte der **fixen Resistenzen** und der **elementaren %‑Resistenzen** sind synchron, wenn **„Automatische Gewichtsberechnung“** aktiviert ist.

Das Verhältnis **%‑Resistenzen / fixe Resistenzen** ist proportional zum eingehenden Schaden und folgt:

> **Verhältnis %‑Resist / fixe Resist = eingehender Schaden / 100**

- Bei 100 eingehendem Schaden ⇒ Verhältnis = 1 ⇒  
  Gewicht der elementaren %‑Resistenzen = Gewicht der fixen Resistenzen
- Bei 300 eingehendem Schaden ⇒ Verhältnis = 3 ⇒  
  Gewicht der elementaren %‑Resistenzen = 3 × Gewicht der fixen Resistenzen (Standard)

Viele Level-200-Items haben keine fixen Resistenzen, daher ist es für High-Level-Builds oft nicht so sinnvoll, dort viel Gewicht zu investieren.

Die **Summe** der Gewichte aller elementaren %‑Resistenzen sollte gleich der Summe der Gewichte der **Nahkampf- und Distanz-%‑Resistenzen** sein.  
10 % Resistenz in allen Elementen entspricht grob 10 % Nahkampf- und 10 % Distanzresistenz.

Allerdings wird %‑Resistenz **stärker**, je höher sie ist.  
Ohne ins Detail zu gehen: Von 49 % auf 50 % zu gehen, ist fast doppelt so stark wie von 0 % auf 1 %.  
Wenn du also einen Build mit sehr vielen elementaren Resistenzen willst, kannst du mehr Gewicht in elementare Resistenzen packen als in Nah-/Distanzresistenzen – sie sind schließlich schwerer zu maximieren.  
Die Summe der elementaren Resistenz-Gewichte sollte im Extremfall aber **nicht mehr als doppelt so hoch** wie die Summe der Nah-/Distanz-Gewichte sein.

## Min / Max

Der Wert vieler Eigenschaften steigt nicht linear.  
Beispiele:

- sehr hohe **Prospektion** wird relativ weniger wertvoll
- sehr hohe **Resistenzen** (fix und %) werden immer wertvoller

Außerdem hängt der Wert mancher Eigenschaften stark von anderen ab.  
Zum Beispiel:

- der Wert kritischer Schäden hängt stark von der Kritchance ab
- und umgekehrt

Das bedeutet:

- Ein Build mit einer extrem hohen Einzel-Eigenschaft kann Builds „überstrahlen“, die insgesamt besser verteilt sind.
- Du kannst Builds erhalten mit 200 kritischen Schäden, aber 0 % Kritchance – was praktisch keinen Sinn ergibt.

Um dieses Problem zu umgehen, solltest du sinnvolle **Min- und Max-Parameter** setzen, damit jeder Wert in einem Bereich bleibt, in dem er die anderen nicht völlig dominiert (oder von ihnen dominiert wird).

## Voraussetzungen mit Min-Parametern

Voraussetzungen in **Vitalität, Intelligenz, Stärke, Glück, Beweglichkeit und Weisheit** werden **nicht** in die Suche nach dem besten Build einbezogen, da man diese Werte im Nachhinein stark durch Levelpunkte anheben kann.

Wenn du aber unbedingt ein Item mit einer sehr hohen Voraussetzung nutzen willst, kannst du:

- dieses Objekt **locken**
- und einen passenden **Min-Parameter** setzen, damit nur Builds angezeigt werden, die diese Bedingung erfüllbar machen.

Beispiel:  
Die „Fell des Gargandyas“ verlangt mindestens **5000 Vitalität auf Level 200**.  
Wenn du maximal 600 Levelpunkte in Vitalität investieren willst und bereits voll auf Vitalität gescrollt bist, kannst du:

- 5000 − 600 − 100 = **4300** als Min-Vitalität setzen

Der nächste sinnvolle Schwellenwert darunter ist **4200**, also nimm diesen Wert.  
Du kannst auch Over-Vitalität auf Items nutzen, um die Bedingung zu erreichen.

---

# Minmaxing

Wenn du Gewichte gefunden hast, die sich für dich stimmig anfühlen, kannst du eine **größere Kombinationsberechnung** starten, indem du deutlich mehr Objekte und Sets auswählst – für den Fall, dass es irgendwo eine versteckte, besonders gute Kombination gibt.  
Behalte im Hinterkopf: Je schwächer die Objekte/Sets sind, die du zusätzlich hineinpackst, desto niedriger die Chance, dass dadurch wirklich ein besserer Build entsteht.

Die Kombinationsberechnung ist sehr aggressiv optimiert.  
Wenn du geduldig bist, kannst du der App eine beeindruckende Menge an Objekten und Sets geben, um den perfekten Build zu finden.

Wenn die Berechnung irgendwann **zu lange braucht**, kannst du deine Suche in **Teilsuchen** aufsplitten.  
Es ist fast garantiert, dass die besten Builds einer Suche **mindestens ein Set** enthalten.  
Du kannst also:

- nacheinander die besten Sets für deinen Build **locken**
- und jeweils eine eigene Suche starten

Das schließt zwar alle Builds **ohne** Set aus, erfordert aber mehr Handarbeit.  
Dafür kannst du durch das Locken von zwei oder drei Objekten die Anzahl der Kombinationen drastisch verringern und viel mehr Objekte in die Auswahl aufnehmen.

Du kannst außerdem nach jedem neuen Locken von Sets die **besten Objekte neu berechnen** und wie oben beschrieben eine immer feinere Vorauswahl treffen.

## Minmaxing mit Begleitern

Begleiter, die **gedeckelte Eigenschaften** beeinflussen, können einen großen Einfluss auf die besten Builds haben – insbesondere **elementare %‑Resistenzen**.

Diese Eigenschaften sind interessant, weil ihr Wert mit der Höhe der Resistenzen stark zunimmt.  
Allerdings führt das zu vielen möglichen Kombinationen, denn:

- Resistenzen sind gedeckelt,
- es gibt viele Begleiter – und sogar Dofus/Trophäen – die sie erhöhen.

Dadurch wächst die Zahl der Kombinationen im Vergleich zu einer Suche mit nur wenigen Begleitern sehr stark.

Begleiter, die elementare %‑Resistenzen erhöhen:

**Bwaks, Croum, El Scarador**

- Begleiter mit **50 Power + 25 % Resistenzen** (insgesamt 5)
- Begleiter mit **50 Power + 5 % Resistenzen auf alle Elemente** (insgesamt 1)

Diese Begleiter sind sehr wertvoll, wenn du auch Power in deinem Build möchtest, und sollten wahrscheinlich in jeder auf hohe Resistenzen ausgerichteten Kombinationssuche enthalten sein.

**Naskäfers**

- 1 AP + 12 % Resistenzen (4 Stück)
- 1 AP + 6 % + 6 % Resistenzen (6 Stück)
- 1 AP + eine andere Eigenschaft + 6 % Resistenzen (4 Stück)

Sie sind etwas weniger stark als die vorher genannten Begleiter, aber der zusätzliche **AP** kann enormen Unterschied machen und sie bieten sehr flexible Eigenschaften.  
Das Problem ist, dass du alle **14** Naskäfers hinzufügen müsstest, wenn du sie vollständig testen willst – das führt zu einer sehr großen Suche.  
Oft reicht es, nur die 4 Naskäfers mit „1 AP + eine andere Eigenschaft + 6 % Resist“ hinzuzufügen, vor allem, wenn dir diese andere Eigenschaft wichtiger ist als weitere 6 % Resistenzen.

**Seequaggas**

- 1 BP + 16 % Resistenzen (4 Stück)
- 1 BP + 8 % + 8 % Resistenzen (6 Stück)
- 1 BP + eine andere Eigenschaft + 8 % Resistenzen (4 Stück)

Gleiches Prinzip wie bei den Naskäfers, nur mit etwas besserem Wert.  
Da es normalerweise leicht ist, das Cap von **6 BP** zu erreichen, empfehle ich, diese Begleiter nur zu testen, wenn du Items verwendest, die BP senken, oder wenn du eine sehr konkrete Idee im Kopf hast.

Zusätzlich zu diesen Begleitern empfehle ich, **einen Begleiter ohne elementare Resistenzen** aufzunehmen, der aber trotzdem gut zu deinem Build passt.  
So kann dieser Begleiter im Build landen, wenn alle elementaren Resistenzen bereits gedeckelt sind.

Dieser Begleiter sollte etwas weniger Wert haben als die Resistenz-Begleiter, sonst wird er bevorzugt – auch wenn die Resistenzen noch nicht am Limit sind.  
Wenn du Naskäfers aufgenommen hast, ist es außerdem sinnvoll, einen anderen Begleiter mit **AP** hinzuzufügen, um einen besseren Vergleich zu haben.

---

# Nutzung der Grafikkarte – GPU

Es ist möglich, die Grafikkarte (GPU) statt der CPU zu verwenden, um die besten Builds zu berechnen. Je nach Grafikkarte kann das die Rechengeschwindigkeit stark erhöhen.

Achtung: Die Nutzung der GPU im Browser ist eine relativ neue Technologie und noch nicht vollständig stabil. Es wird empfohlen, dein Betriebssystem, deinen Browser und den Treiber deiner Grafikkarte zu aktualisieren, wenn du sie verwenden möchtest. Diese Funktionalität funktioniert im Normalfall in Chromium-basierten Browsern (Chrome, Edge, Safari...), wird aber Stand heute (Dezember 2025) noch nicht vollständig von Firefox unterstützt.

Wenn du einen Laptop verwendest und eine integrierte Grafikkarte hast, nutzt dein Browser sehr wahrscheinlich diese deutlich schwächere integrierte GPU anstelle deiner dedizierten Grafikkarte. Du musst deinem Betriebssystem sagen, dass es die leistungsstarke Grafikkarte verwenden soll. Unter Windows kannst du das im Nvidia-/AMD-Control Panel oder in den Windows-Einstellungen machen:

- Windows-Einstellungen → System → Anzeige
- Nach unten scrollen, bis du **Grafikeinstellungen** findest
- Eine App auswählen (**Durchsuchen/Browse**)
- Die ausführbare Datei deines Browsers auswählen. Zum Beispiel:  
  `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Dann die Option **„Hohe Leistung“** aktivieren
- Den Browser neu starten

Die Nutzung der GPU bringt zwei Einschränkungen mit sich:

- Die Anzahl der ausgewählten Sets ist auf maximal **64** begrenzt
- Die Anzahl der zu berechnenden Kombinationen muss unter einem bestimmten Wert bleiben, der je nach Auswahl variiert und ungefähr bei **1 Billion** Kombinationen erreicht wird

Diese Limits sind sehr hoch und sollten in der Praxis praktisch nie erreicht werden.

---

# Fazit

Wenn du die Anwendung richtig nutzt, ist sie in der Lage, den **perfekten Build** für deine Ziele zu finden – egal, wie speziell sie sind.  
Alle möglichen Objektkombinationen und alle Bedingungen werden berücksichtigt.

Wie sicher du dir sein kannst, dass es **keinen besseren alternativen Build** gibt, hängt am Ende von deiner Geduld ab, wirklich alle sinnvollen Möglichkeiten durchzutesten.

**Viel Spaß beim Minmaxen!**
