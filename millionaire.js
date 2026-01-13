/* =========================================
   Millionär Quiz Spiel
   Beantworte Fragen richtig und gewinne Punkte
   ========================================= */

import * as UI from './ui.js';

// Fragen nach Schwierigkeitsstufe
const QUESTIONS_BY_LEVEL = {
    1: [
        { question: 'Welcher Planet ist am nächsten zur Sonne?', answers: ['Venus', 'Merkur', 'Mars', 'Jupiter'], correct: 1 },
        { question: 'Wie viele Kontinente gibt es?', answers: ['5', '6', '7', '8'], correct: 2 },
        { question: 'Was ist die Hauptstadt von Frankreich?', answers: ['Lyon', 'Paris', 'Marseille', 'Nizza'], correct: 1 },
        { question: 'Welcher Ozean ist der größte?', answers: ['Atlantik', 'Indik', 'Pazifik', 'Arktis'], correct: 2 },
        { question: 'Wie viele Seiten hat ein Würfel?', answers: ['4', '6', '8', '12'], correct: 1 },
        { question: 'In welchem Land befindet sich die Statue of Liberty?', answers: ['England', 'Kanada', 'USA', 'Frankreich'], correct: 2 },
        { question: 'Welche Farbe ist das Blut von Oktopussen?', answers: ['Blau', 'Grün', 'Rot', 'Gelb'], correct: 0 },
        { question: 'Wie viele Stunden hat ein Tag?', answers: ['20', '24', '28', '30'], correct: 1 },
        { question: 'Welcher Berg ist der höchste der Welt?', answers: ['K2', 'Mount Everest', 'Kilimandscharo', 'Denali'], correct: 1 },
        { question: 'Wie viele Flossen hat ein Fisch normalerweise?', answers: ['2', '3', '4', '5'], correct: 2 },
        { question: 'Was ist die Hauptstadt von Japan?', answers: ['Osaka', 'Kyoto', 'Tokio', 'Yokohama'], correct: 2 },
        { question: 'Wie viele Beine hat eine Katze?', answers: ['2', '3', '4', '6'], correct: 2 },
        { question: 'Welche Farbe hat der Schnee?', answers: ['Gelb', 'Grau', 'Weiß', 'Blau'], correct: 2 },
        { question: 'Wie viele Minuten hat eine Stunde?', answers: ['50', '60', '70', '80'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Italien?', answers: ['Mailand', 'Rom', 'Venedig', 'Florenz'], correct: 1 },
        { question: 'Welche Farbe hat eine Banane?', answers: ['Rot', 'Orange', 'Gelb', 'Grün'], correct: 2 },
        { question: 'Wie viele Tage hat eine Woche?', answers: ['5', '6', '7', '8'], correct: 2 },
        { question: 'Was ist die Hauptstadt von Spanien?', answers: ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'], correct: 1 },
        { question: 'Welche Farbe hat das Gras?', answers: ['Braun', 'Grün', 'Gelb', 'Rot'], correct: 1 },
        { question: 'Wie viele Räder hat ein Auto?', answers: ['2', '3', '4', '6'], correct: 2 },
        { question: 'Was ist die Hauptstadt von England?', answers: ['Manchester', 'Liverpool', 'London', 'Birmingham'], correct: 2 },
        { question: 'Welche Farbe hat der Himmel?', answers: ['Gelb', 'Grün', 'Blau', 'Rosa'], correct: 2 },
        { question: 'Wie viele Seiten hat ein Dreieck?', answers: ['2', '3', '4', '5'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Deutschland?', answers: ['München', 'Hamburg', 'Berlin', 'Köln'], correct: 2 },
        { question: 'Wie viele Buchstaben hat das Alphabet?', answers: ['22', '24', '26', '28'], correct: 2 },
        { question: 'Welches Tier macht "Muh"?', answers: ['Schaf', 'Kuh', 'Schwein', 'Ziege'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Österreich?', answers: ['Salzburg', 'Wien', 'Innsbruck', 'Linz'], correct: 1 },
        { question: 'Wie viele Finger hat eine Hand?', answers: ['4', '5', '6', '7'], correct: 1 },
        { question: 'Welches Tier fliegt?', answers: ['Fisch', 'Vogel', 'Wal', 'Schlange'], correct: 1 },
        { question: 'Was ist die Hauptstadt der Schweiz?', answers: ['Zürich', 'Genf', 'Bern', 'Basel'], correct: 2 },
        { question: 'Wie viele Jahreszeiten gibt es?', answers: ['2', '3', '4', '5'], correct: 2 },
        { question: 'Welche Farbe hat Blut?', answers: ['Blau', 'Gelb', 'Rot', 'Grün'], correct: 2 },
        { question: 'Wie viele Tage hat der Monat Februar normalerweise?', answers: ['27', '28', '29', '30'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Belgien?', answers: ['Antwerpen', 'Brüssel', 'Gent', 'Lüttich'], correct: 1 },
        { question: 'Welches Tier legt Eier?', answers: ['Hund', 'Vogel', 'Katze', 'Kaninchen'], correct: 1 },
        { question: 'Wie viele Ohren hat ein Mensch?', answers: ['1', '2', '3', '4'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Portugal?', answers: ['Porto', 'Lissabon', 'Covilhã', 'Braga'], correct: 1 },
        { question: 'Welche Farbe hat die Sonne?', answers: ['Orange', 'Rot', 'Gelb', 'Weiß'], correct: 2 },
        { question: 'Wie viele Augen hat ein Frog?', answers: ['1', '2', '3', '4'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Norwegen?', answers: ['Bergen', 'Oslo', 'Trondheim', 'Stavanger'], correct: 1 },
        { question: 'Welches Tier schwimmt?', answers: ['Adler', 'Fisch', 'Specht', 'Reh'], correct: 1 },
        { question: 'Wie viele Seiten hat ein Pentagon?', answers: ['4', '5', '6', '7'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Griechenland?', answers: ['Thessaloniki', 'Athen', 'Patras', 'Larissa'], correct: 1 },
        { question: 'Welche Farbe hat eine Zitrone?', answers: ['Orange', 'Grün', 'Gelb', 'Rot'], correct: 2 },
        { question: 'Wie viele Kontinente hat die Erde?', answers: ['5', '6', '7', '8'], correct: 2 },
        { question: 'Was ist die Hauptstadt von Polen?', answers: ['Krakau', 'Warschau', 'Danzig', 'Posen'], correct: 1 },
        { question: 'Welches Tier brüllt?', answers: ['Katze', 'Löwe', 'Hund', 'Esel'], correct: 1 },
        { question: 'Wie viele Zehen hat ein Fuß normalerweise?', answers: ['4', '5', '6', '7'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Tschechien?', answers: ['Brünn', 'Prag', 'Pilsen', 'Olmütz'], correct: 1 },
        { question: 'Welche Farbe hat eine Karotte?', answers: ['Rot', 'Orange', 'Gelb', 'Grün'], correct: 1 },
        { question: 'Wie viele Seiten hat ein Quadrat?', answers: ['3', '4', '5', '6'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Ungarn?', answers: ['Debrecen', 'Budapest', 'Szeged', 'Miskolc'], correct: 1 }
    ],
    2: [
        { question: 'Wer schrieb "Romeo und Julia"?', answers: ['Christopher Marlowe', 'William Shakespeare', 'Ben Jonson', 'John Webster'], correct: 1 },
        { question: 'In welchem Jahr fiel die Berliner Mauer?', answers: ['1987', '1988', '1989', '1990'], correct: 2 },
        { question: 'Was ist das chemische Symbol für Gold?', answers: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
        { question: 'Wie viele Saiten hat eine Violine?', answers: ['3', '4', '5', '6'], correct: 1 },
        { question: 'Welcher Künstler malte die Sternennacht?', answers: ['Pablo Picasso', 'Vincent van Gogh', 'Andy Warhol', 'Salvador Dalí'], correct: 1 },
        { question: 'In welchem Jahr begann der Zweite Weltkrieg?', answers: ['1937', '1938', '1939', '1940'], correct: 2 },
        { question: 'Wie heißt das größte Organ des menschlichen Körpers?', answers: ['Herz', 'Lunge', 'Haut', 'Leber'], correct: 2 },
        { question: 'Welcher Fluss ist der längste der Welt?', answers: ['Nilfluss', 'Amazonas', 'Jangtsekiang', 'Nil'], correct: 0 },
        { question: 'In welchem Land wurde der Kaffee ursprünglich angebaut?', answers: ['Brasilien', 'Kolumbien', 'Äthiopien', 'Indonesien'], correct: 2 },
        { question: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise?', answers: ['28', '30', '32', '34'], correct: 2 },
        { question: 'Wer erfand die Glühbirne?', answers: ['Nikola Tesla', 'Thomas Edison', 'Alexander Bell', 'Benjamin Franklin'], correct: 1 },
        { question: 'Wie viele Saiten hat eine Gitarre?', answers: ['4', '5', '6', '7'], correct: 2 },
        { question: 'In welchem Land befindet sich die Chinesische Mauer?', answers: ['Japan', 'Mongolei', 'China', 'Korea'], correct: 2 },
        { question: 'Wie viele Tasten hat ein Klavier normalerweise?', answers: ['66', '78', '88', '100'], correct: 2 },
        { question: 'Wer schrieb "Hamlet"?', answers: ['Christopher Marlowe', 'William Shakespeare', 'Ben Jonson', 'John Webster'], correct: 1 },
        { question: 'In welchem Jahr landete Neil Armstrong auf dem Mond?', answers: ['1967', '1968', '1969', '1970'], correct: 2 },
        { question: 'Welcher Künstler schnitt sich ein Ohr ab?', answers: ['Pablo Picasso', 'Vincent van Gogh', 'Andy Warhol', 'Salvador Dalí'], correct: 1 },
        { question: 'Wie viele Farben hat ein Regenbogen?', answers: ['5', '6', '7', '8'], correct: 2 },
        { question: 'Was ist das chemische Symbol für Silber?', answers: ['Si', 'Ag', 'Au', 'Cu'], correct: 1 },
        { question: 'Wer war der erste Präsident von Südafrika nach der Apartheid?', answers: ['F.W. de Klerk', 'Nelson Mandela', 'Thabo Mbeki', 'Jacob Zuma'], correct: 1 },
        { question: 'In welchem Jahr wurde die Titanic versenkt?', answers: ['1910', '1911', '1912', '1913'], correct: 2 },
        { question: 'Wie viele Saiten hat eine Harfe normalerweise?', answers: ['20', '40', '46', '60'], correct: 2 },
        { question: 'Wer schrieb "Faust"?', answers: ['Friedrich Schiller', 'Johann Wolfgang von Goethe', 'Heinrich Heine', 'Bertolt Brecht'], correct: 1 },
        { question: 'In welchem Jahrhundert lebte Leonardo da Vinci?', answers: ['14.', '15.', '16.', '17.'], correct: 1 },
        { question: 'Wie viele Millionen Menschen sprechen Englisch?', answers: ['500', '800', '1000', '1500'], correct: 2 },
        { question: 'Wer malte die Sixtinische Kapelle?', answers: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Botticelli'], correct: 1 },
        { question: 'In welchem Land befindet sich das Taj Mahal?', answers: ['Pakistan', 'Bangladesch', 'Indien', 'Nepal'], correct: 2 },
        { question: 'Wie viele Bücher hat die Odyssee?', answers: ['20', '22', '24', '26'], correct: 2 },
        { question: 'Wer war der Anführer des Manhattan Projects?', answers: ['Albert Einstein', 'J. Robert Oppenheimer', 'Richard Feynman', 'Edward Teller'], correct: 1 },
        { question: 'In welchem Jahr wurde die erste Zeitung gedruckt?', answers: ['1434', '1440', '1450', '1460'], correct: 1 },
        { question: 'Wie viele Symphonien schrieb Beethoven?', answers: ['8', '9', '10', '11'], correct: 1 },
        { question: 'Wer war die erste Frau, die einen Nobelpreis erhielt?', answers: ['Marie Curie', 'Irène Joliot-Curie', 'Dorothy Hodgkin', 'Lise Meitner'], correct: 0 },
        { question: 'In welchem Land befindet sich der Eiffelturm?', answers: ['Deutschland', 'Belgien', 'Frankreich', 'Niederlande'], correct: 2 },
        { question: 'Wie viele Opern schrieb Mozart?', answers: ['20', '22', '27', '30'], correct: 2 },
        { question: 'Wer war der Anführer der Französischen Revolution?', answers: ['Robespierre', 'Danton', 'Mirabeau', 'Lafayette'], correct: 0 },
        { question: 'In welchem Jahr wurde die Unabhängigkeitserklärung der USA unterzeichnet?', answers: ['1774', '1775', '1776', '1777'], correct: 2 },
        { question: 'Wie viele Kantaten schrieb Bach?', answers: ['190', '200', '300', '400'], correct: 1 },
        { question: 'Wer war der erste Kaiser von Rom?', answers: ['Julius Caesar', 'Augustus', 'Nero', 'Marcus Aurelius'], correct: 1 },
        { question: 'In welchem Land befindet sich die Akropolis?', answers: ['Italien', 'Griechenland', 'Türkei', 'Ägypten'], correct: 1 },
        { question: 'Wie viele Bühnenwerke schrieb Wagner?', answers: ['13', '14', '15', '16'], correct: 0 },
        { question: 'Wer war der Gründer des Buddhismus?', answers: ['Konfuzius', 'Gautama Buddha', 'Lao Tzu', 'Mahavira'], correct: 1 },
        { question: 'In welchem Jahr wurde der Kompass erfunden?', answers: ['800 AD', '900 AD', '1000 AD', '1100 AD'], correct: 2 },
        { question: 'Wie viele Stücke schrieb Molière?', answers: ['27', '30', '35', '40'], correct: 1 },
        { question: 'Wer war der erste Papst?', answers: ['Petrus', 'Paulus', 'Linus', 'Clemens'], correct: 0 },
        { question: 'In welchem Land befindet sich die Freiheitsstatue?', answers: ['Kanada', 'USA', 'Frankreich', 'Mexiko'], correct: 1 },
        { question: 'Wie viele Opern schrieb Verdi?', answers: ['26', '28', '30', '32'], correct: 1 },
        { question: 'Wer erfand das Rad?', answers: ['Mesopotamier', 'Ägypter', 'Griechen', 'Römer'], correct: 0 },
        { question: 'In welchem Land befindet sich die Große Sphinx?', answers: ['Sudan', 'Libyen', 'Ägypten', 'Saudi-Arabien'], correct: 2 },
        { question: 'Wie viele Noten gibt es in der westlichen Musik?', answers: ['6', '7', '8', '12'], correct: 2 },
        { question: 'Wer war der erste britische Premierminister?', answers: ['Lord North', 'Robert Walpole', 'Lord Bute', 'Lord Grenville'], correct: 1 }
    ],
    3: [
        { question: 'Wer war der erste Präsident der USA?', answers: ['Thomas Jefferson', 'George Washington', 'Benjamin Franklin', 'John Adams'], correct: 1 },
        { question: 'Welche Wissenschaft befasst sich mit Sternen und Planeten?', answers: ['Geologie', 'Astronomie', 'Meteorologie', 'Physik'], correct: 1 },
        { question: 'In welchem Jahr wurde die Titanic versenkt?', answers: ['1910', '1911', '1912', '1913'], correct: 2 },
        { question: 'Wie viele Seiten hat eine Pyramide mit quadratischer Basis?', answers: ['4', '5', '6', '8'], correct: 1 },
        { question: 'Welcher Komponist komponierte die Neunfte Symphonie?', answers: ['Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Johann Sebastian Bach', 'Georg Friedrich Händel'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Australien?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correct: 2 },
        { question: 'Welcher Prozess wandelt Licht in chemische Energie um?', answers: ['Gärung', 'Fotosynthese', 'Atmung', 'Oxidation'], correct: 1 },
        { question: 'Wie viele Beine hat eine Spinne?', answers: ['6', '8', '10', '12'], correct: 1 },
        { question: 'Wer schrieb "Mein Kampf"?', answers: ['Benito Mussolini', 'Joseph Stalin', 'Adolf Hitler', 'Francisco Franco'], correct: 2 },
        { question: 'Welcher Planet hat die meisten Monde?', answers: ['Saturn', 'Jupiter', 'Uranus', 'Neptun'], correct: 1 },
        { question: 'Wie viele Ohren hat ein Elefant?', answers: ['1', '2', '3', '4'], correct: 1 },
        { question: 'Wer war Julius Caesar?', answers: ['Ein Pharao', 'Ein römischer Feldherr', 'Ein griechischer König', 'Ein ägyptischer Priester'], correct: 1 },
        { question: 'In welchem Jahr begann der Erste Weltkrieg?', answers: ['1912', '1913', '1914', '1915'], correct: 2 },
        { question: 'Wie viele Staaten hat die USA?', answers: ['48', '49', '50', '51'], correct: 2 },
        { question: 'Wer erfand das Telefon?', answers: ['Nikola Tesla', 'Alexander Graham Bell', 'Thomas Edison', 'Charles Babbage'], correct: 1 },
        { question: 'In welchem Jahr fiel die Berliner Mauer?', answers: ['1987', '1988', '1989', '1990'], correct: 2 },
        { question: 'Wie heißt die längste Knochenreihe?', answers: ['Brustbein', 'Rippe', 'Femur (Oberschenkelknochen)', 'Wirbelsäule'], correct: 2 },
        { question: 'Wer war Cleopatra?', answers: ['Eine römische Kaiserin', 'Eine ägyptische Königin', 'Eine griechische Herrscherin', 'Eine persische Prinzessin'], correct: 1 },
        { question: 'Wie viele Länder gibt es in Europa (ungefähr)?', answers: ['40', '44', '48', '52'], correct: 1 },
        { question: 'Wer war der Gründer des Islam?', answers: ['Ali', 'Muhammad', 'Abu Bakr', 'Uthman'], correct: 1 },
        { question: 'In welchem Land liegt Angkor Wat?', answers: ['Thailand', 'Vietnam', 'Kambodscha', 'Laos'], correct: 2 },
        { question: 'Wie viele Epochen der Renaissance gab es?', answers: ['2', '3', '4', '5'], correct: 1 },
        { question: 'Wer war Martin Luther King?', answers: ['Ein deutscher Reformer', 'Ein amerikanischer Bürgerrechtsführer', 'Ein südafrikanischer Aktivist', 'Ein indischer Nationalist'], correct: 1 },
        { question: 'In welchem Jahr wurde die Amerikanische Unabhängigkeit erklärt?', answers: ['1774', '1775', '1776', '1777'], correct: 2 },
        { question: 'Wie viele Pharaonen hatte das Alte Ägypten (ungefähr)?', answers: ['100', '150', '200', '300'], correct: 2 },
        { question: 'Wer war Sokrates?', answers: ['Ein griechischer Feldherr', 'Ein griechischer Philosoph', 'Ein ägyptischer Priester', 'Ein römischer Kaiser'], correct: 1 },
        { question: 'In welchem Jahr wurde die Russische Revolution durchgeführt?', answers: ['1915', '1916', '1917', '1918'], correct: 2 },
        { question: 'Wie viele Bücher hat das Alte Testament?', answers: ['37', '38', '39', '40'], correct: 2 },
        { question: 'Wer war Konfuzius?', answers: ['Ein chinesischer Feldherr', 'Ein chinesischer Philosoph', 'Ein japanischer Kaiser', 'Ein indischer Weise'], correct: 1 },
        { question: 'In welchem Jahr wurde das American Wild West eröffnet?', answers: ['1860', '1870', '1880', '1890'], correct: 1 },
        { question: 'Wie viele Kontinente hat die Erde?', answers: ['5', '6', '7', '8'], correct: 2 },
        { question: 'Wer war Napoleon Bonaparte?', answers: ['Ein spanischer König', 'Ein französischer Kaiser', 'Ein preußischer König', 'Ein italienischer Herzog'], correct: 1 },
        { question: 'In welchem Jahr wurde die Chinesische Mauer gebaut?', answers: ['600 BC', '700 BC', '800 BC', '900 BC'], correct: 1 },
        { question: 'Wie viele Meere hat die Erde (ungefähr)?', answers: ['3', '4', '5', '6'], correct: 2 },
        { question: 'Wer war Joan of Arc?', answers: ['Eine englische Königin', 'Eine französische Anführerin', 'Eine italienische Artistin', 'Eine spanische Nonne'], correct: 1 },
        { question: 'In welchem Jahr wurde die Magna Carta unterzeichnet?', answers: ['1200', '1215', '1225', '1235'], correct: 1 },
        { question: 'Wie viele Jahre dauerte der Hundertjährige Krieg?', answers: ['100', '116', '130', '150'], correct: 1 },
        { question: 'Wer war Marco Polo?', answers: ['Ein italienischer Künstler', 'Ein venezianischer Händler und Reisender', 'Ein spanischer Entdecker', 'Ein portugiesischer Seefahrer'], correct: 1 },
        { question: 'In welchem Jahr wurde Amerika entdeckt?', answers: ['1490', '1491', '1492', '1493'], correct: 2 },
        { question: 'Wie viele Kaiser hatte das Heilige Römische Reich (ungefähr)?', answers: ['150', '200', '300', '400'], correct: 1 },
        { question: 'Wer war Gutenberg?', answers: ['Ein Theologe', 'Ein Drucker und Erfinder', 'Ein Architekt', 'Ein Bildhauer'], correct: 1 },
        { question: 'In welchem Jahr wurde die Druckerpresse erfunden?', answers: ['1440', '1445', '1450', '1455'], correct: 0 },
        { question: 'Wie viele Jahre dauerte die Pest des Mittelalters?', answers: ['2', '3', '4', '5'], correct: 2 },
        { question: 'Wer war Michelangelo?', answers: ['Ein italienischer Bildhauer', 'Ein italienischer Künstler und Bildhauer', 'Ein Leonardo-Student', 'Ein Raphael-Schüler'], correct: 1 },
        { question: 'In welchem Jahr wurden die Mayas entdeckt?', answers: ['1502', '1524', '1540', '1560'], correct: 1 },
        { question: 'Wie viele Länder nahmen am Kalten Krieg teil (direkt)?', answers: ['2', '3', '4', '5'], correct: 0 },
        { question: 'Wer war William Shakespeare?', answers: ['Ein englischer Schauspieler', 'Ein englischer Dramatiker und Schauspieler', 'Ein schottischer Dichter', 'Ein irischer Schriftsteller'], correct: 1 },
        { question: 'In welchem Jahr wurde die Unabhängigkeit Amerikas erklärt?', answers: ['1775', '1776', '1777', '1778'], correct: 1 },
        { question: 'Wie viele Königreiche gehörten zur Britischen Monarchie?', answers: ['1', '2', '3', '4'], correct: 1 }
    ],
    4: [
        { question: 'Welches Teilchen wurde von James Chadwick 1932 entdeckt?', answers: ['Photon', 'Neutron', 'Positron', 'Meson'], correct: 1 },
        { question: 'In welchem Jahr fand die Französische Revolution statt?', answers: ['1787', '1788', '1789', '1790'], correct: 2 },
        { question: 'Was ist die Geschwindigkeit des Lichts?', answers: ['3 x 10^8 m/s', '3 x 10^7 m/s', '3 x 10^9 m/s', '3 x 10^6 m/s'], correct: 0 },
        { question: 'Welche Konstante wird "Avogadro-Konstante" genannt?', answers: ['6,02 x 10^22', '6,02 x 10^23', '6,02 x 10^24', '6,02 x 10^21'], correct: 1 },
        { question: 'Wer war der erste Astronaut im Weltall?', answers: ['Yuri Gagarin', 'John Glenn', 'Alan Shepard', 'Neil Armstrong'], correct: 0 },
        { question: 'Welche Kunstrichtung entwickelte Pablo Picasso?', answers: ['Surrealismus', 'Kubismus', 'Expressionismus', 'Impressionismus'], correct: 1 },
        { question: 'Was ist die Formel für die kinetische Energie?', answers: ['E = mv²', 'E = ½mv²', 'E = m²v', 'E = mv'], correct: 1 },
        { question: 'In welchem Jahr kam das Internet für die Öffentlichkeit verfügbar?', answers: ['1989', '1991', '1993', '1995'], correct: 2 },
        { question: 'Wie viele Bücher hat die Bibel?', answers: ['64', '66', '68', '70'], correct: 1 },
        { question: 'Welches Element hat die Ordnungszahl 79?', answers: ['Silber', 'Quecksilber', 'Gold', 'Platin'], correct: 2 },
        { question: 'Wer war der Erfinder des Dynamits?', answers: ['Carl Philipp Emanuel Bach', 'Alfred Nobel', 'Isambard Brunel', 'Charles Dickens'], correct: 1 },
        { question: 'Was ist das chemische Zeichen für Eisen?', answers: ['Ir', 'Fe', 'Er', 'En'], correct: 1 },
        { question: 'Wie viele Chromosomen hat ein Mensch?', answers: ['44', '46', '48', '50'], correct: 1 },
        { question: 'Wer war der Anführer der Oktoberrevolution?', answers: ['Trotzki', 'Lenin', 'Stalin', 'Kamenew'], correct: 1 },
        { question: 'Was ist die Hauptstadt von Brasilien?', answers: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], correct: 2 },
        { question: 'Wie viele Nobelpreise gibt es?', answers: ['4', '5', '6', '7'], correct: 2 },
        { question: 'Wer war der Erfinder des Penicillins?', answers: ['Howard Florey', 'Ernst Boris Chain', 'Alexander Fleming', 'Selman Waksman'], correct: 2 },
        { question: 'Was ist der größte See der Welt?', answers: ['Victoriasee', 'Tanganjikasee', 'Kaspisches Meer', 'Baikalsee'], correct: 2 },
        { question: 'Wie viele Atome sind in einem Wassermolekül?', answers: ['2', '3', '4', '5'], correct: 1 },
        { question: 'Wer war der Erfinder des Röntgengeräts?', answers: ['Pierre Curie', 'Wilhelm Röntgen', 'Max Planck', 'Niels Bohr'], correct: 1 },
        { question: 'Was ist das größte Organ des menschlichen Körpers?', answers: ['Lunge', 'Herz', 'Haut', 'Leber'], correct: 2 },
        { question: 'Wie viele Staaten hat Mexiko?', answers: ['29', '30', '31', '32'], correct: 2 },
        { question: 'Wer war der Erfinder des Mikroskops?', answers: ['Anton van Leeuwenhoek', 'Robert Hooke', 'Zacharias Janssen', 'Hans Lipperhey'], correct: 2 },
        { question: 'Was ist die Formel für potenzielle Energie?', answers: ['E = mgh', 'E = mh²', 'E = m²h', 'E = g²h'], correct: 0 },
        { question: 'Wie viele Staaten hat Indien?', answers: ['27', '28', '29', '30'], correct: 1 },
        { question: 'Wer war der Erfinder des Barometers?', answers: ['Galileo Galilei', 'Evangelista Torricelli', 'Blaise Pascal', 'Otto von Guericke'], correct: 1 },
        { question: 'Was ist der höchste Berg der Welt?', answers: ['K2', 'Mount Everest', 'Kangchenjunga', 'Makalu'], correct: 1 },
        { question: 'Wie viele Zahnarten hat ein Mensch?', answers: ['2', '3', '4', '5'], correct: 2 },
        { question: 'Wer war der Erfinder des Teleskops?', answers: ['Galileo Galilei', 'Hans Lipperhey', 'Jacob Metius', 'Sacharias Janssen'], correct: 1 },
        { question: 'Was ist der längste Knochen im menschlichen Körper?', answers: ['Tibia', 'Fibula', 'Femur', 'Humerus'], correct: 2 },
        { question: 'Wie viele Herzkammern hat ein Fisch?', answers: ['2', '3', '4', '5'], correct: 0 },
        { question: 'Wer war der Erfinder des Thermometers?', answers: ['Galileo Galilei', 'Daniel Fahrenheit', 'Anders Celsius', 'Ferdinand II de Medici'], correct: 3 },
        { question: 'Was ist das größte Riff der Welt?', answers: ['Ningaloo Reef', 'Belize Barrier Reef', 'Great Barrier Reef', 'Florida Keys'], correct: 2 },
        { question: 'Wie viele Magenkammern hat eine Kuh?', answers: ['2', '3', '4', '5'], correct: 2 },
        { question: 'Wer war der Erfinder des Elektroskops?', answers: ['Joseph Priestley', 'Charles Coulomb', 'Abraham Bennet', 'John Tyndall'], correct: 2 },
        { question: 'Was ist die Lichtgeschwindigkeit im Vakuum (ungefähr)?', answers: ['2.9 x 10^8 m/s', '3.0 x 10^8 m/s', '3.1 x 10^8 m/s', '3.2 x 10^8 m/s'], correct: 1 },
        { question: 'Wie viele Sinne hat ein Mensch?', answers: ['3', '4', '5', '6'], correct: 2 },
        { question: 'Wer war der Erfinder des Papiers?', answers: ['Die Ägypter', 'Die Römer', 'Die Chinesen', 'Die Griechen'], correct: 2 },
        { question: 'Was ist der tiefste Ozeangraben der Welt?', answers: ['Tonga-Graben', 'Kuril-Kamtschatka-Graben', 'Marianengraben', 'Philippinen-Graben'], correct: 2 },
        { question: 'Wie viele Rückenwirbel hat ein Mensch?', answers: ['30', '32', '33', '34'], correct: 2 },
        { question: 'Wer war der Erfinder des Kompasses?', answers: ['Die Araber', 'Die Chinesen', 'Die Griechen', 'Die Römer'], correct: 1 }
    ],
    5: [
        { question: 'Welcher Nobelpreisträger entwickelte die Relativitätstheorie?', answers: ['Max Planck', 'Albert Einstein', 'Niels Bohr', 'Werner Heisenberg'], correct: 1 },
        { question: 'In welchem Jahr wurde die Dezimalzahl von John Napier erfunden?', answers: ['1614', '1624', '1634', '1644'], correct: 0 },
        { question: 'Was ist die Mandelbrot-Menge?', answers: ['Eine mathematische Geometrie', 'Eine fraktale Menge in der Zahlenebene', 'Eine biologische Struktur', 'Ein astronomisches Phänomen'], correct: 1 },
        { question: 'Welcher Biochemiker entdeckte die Struktur der DNA?', answers: ['Linus Pauling', 'Francis Crick', 'Rosalind Franklin', 'Watson und Crick'], correct: 3 },
        { question: 'Was ist das Planck-Wirkungsquantum?', answers: ['h ≈ 6,63 × 10⁻³⁴', 'h ≈ 6,63 × 10⁻³³', 'h ≈ 6,63 × 10⁻³⁵', 'h ≈ 6,63 × 10⁻³²'], correct: 0 },
        { question: 'Welche Temperatur ist der absolute Nullpunkt?', answers: ['0°C', '-273,15°C', '-100°C', '0 Kelvin ist falsch'], correct: 1 },
        { question: 'Wer entwickelte die psychoanalytische Theorie?', answers: ['Carl Jung', 'Sigmund Freud', 'Alfred Adler', 'Wilhelm Wundt'], correct: 1 },
        { question: 'Was ist das größte Primzahl unter 100?', answers: ['93', '95', '97', '99'], correct: 2 },
        { question: 'Welcher Mathematiker bewies das Fermat-Letzte-Theorem?', answers: ['Pierre de Fermat', 'Andrew Wiles', 'Leonhard Euler', 'Carl Friedrich Gauß'], correct: 1 },
        { question: 'Wie viele Dimensionen gibt es laut Stringtheorie?', answers: ['10', '11', '12', '13'], correct: 1 },
        { question: 'Wer entwickelte die Quantenmechanik?', answers: ['Max Born', 'Werner Heisenberg', 'Erwin Schrödinger', 'Paul Dirac'], correct: 2 },
        { question: 'Was ist das Heisenberg-Unschärfeprinzip?', answers: ['Energie und Zeit können simultan bekannt sein', 'Ort und Impuls können nicht simultan mit beliebiger Genauigkeit bekannt sein', 'Energie und Impuls sind immer bekannt', 'Alle Teilchen sind lokalisierbar'], correct: 1 },
        { question: 'Wer war der Gründer der modernen Systemtheorie?', answers: ['Ludwig von Bertalanffy', 'Norbert Wiener', 'John von Neumann', 'Alan Turing'], correct: 0 },
        { question: 'Was ist die Höhe einer Oktave in Cent?', answers: ['100', '200', '1200', '2400'], correct: 2 },
        { question: 'Welcher Logarithmus wird üblicherweise in der Mathematik verwendet?', answers: ['Natürlicher Logarithmus', 'Zehnerlogarithmus', 'Binärer Logarithmus', 'Logarithmus zur Basis e'], correct: 0 },
        { question: 'Wer war der Erfinder des Computers Turing?', answers: ['Charles Babbage', 'Alan Turing', 'Ada Lovelace', 'John von Neumann'], correct: 1 },
        { question: 'Was ist die Turing-Maschine?', answers: ['Ein modernes Computermodell', 'Ein theoretisches Maschinenmodell', 'Ein spezieller Algorithmus', 'Ein mathematisches Konzept'], correct: 1 },
        { question: 'Wer formulierte die Bohr-Sommerfeld-Modell?', answers: ['Max Planck', 'Niels Bohr', 'Arnold Sommerfeld', 'Wolfgang Pauli'], correct: 2 },
        { question: 'Was ist die De-Broglie-Wellenlänge?', answers: ['λ = h/p', 'λ = hp', 'λ = p/h', 'λ = h²/p'], correct: 0 },
        { question: 'Wer war der Erfinder der Fuzzy Logic?', answers: ['Lotfi Zadeh', 'John McCarthy', 'Alan Newell', 'Herbert Simon'], correct: 0 },
        { question: 'Was ist der Gödel-Unvollständigkeitssatz?', answers: ['Alle Zahlen sind beweisbar', 'Jedes konsistente System hat unbeweisbare Wahrheiten', 'Alle Funktionen sind berechenbar', 'Alle Mengen sind abzählbar'], correct: 1 },
        { question: 'Wer war der Erfinder des Lambda-Kalküls?', answers: ['Alan Turing', 'Alonzo Church', 'Stephen Kleene', 'Emil Post'], correct: 1 },
        { question: 'Was ist die Chaitin-Konstante?', answers: ['Ein Wahrscheinlichkeitswert', 'Eine mathematische Konstante', 'Ein Maß für Zufall und Komplexität', 'Eine physikalische Konstante'], correct: 2 },
        { question: 'Wer entwickelte das Konzept der Rekursion?', answers: ['Kurt Gödel', 'Alonzo Church', 'Alan Turing', 'Stephen Kleene'], correct: 3 },
        { question: 'Was ist das Cantor-Diagonalargument?', answers: ['Ein Beweis für unendliche Mengen', 'Ein Beweis der Unabzählbarkeit', 'Ein Konzept in der Graphentheorie', 'Ein mathematisches Paradoxon'], correct: 1 },
        { question: 'Wer war der Erfinder der kategorientheorie?', answers: ['Samuel Eilenberg', 'Saunders Mac Lane', 'Samuel Eilenberg und Saunders Mac Lane', 'Alexander Grothendieck'], correct: 2 },
        { question: 'Was ist eine Basis in der linearen Algebra?', answers: ['Ein Vektor', 'Eine Menge linear unabhängiger Vektoren', 'Eine Matrix', 'Ein Skalar'], correct: 1 },
        { question: 'Wer bewies den Zentralen Grenzwertsatz?', answers: ['Carl Friedrich Gauß', 'Pierre-Simon Laplace', 'Abraham de Moivre', 'Aleksandr Lyapunov'], correct: 2 },
        { question: 'Was ist die Riemann-Vermutung?', answers: ['Eine bewiesene Vermutung', 'Eine ungelöste mathematische Vermutung', 'Ein physikalisches Konzept', 'Ein musikalisches Intervall'], correct: 1 },
        { question: 'Wer war der Erfinder der Boolesche Algebra?', answers: ['George Boole', 'Augustus De Morgan', 'Charles Babbage', 'John von Neumann'], correct: 0 },
        { question: 'Was ist die Zeta-Funktion?', answers: ['Eine trigonometrische Funktion', 'Eine komplexe analytische Funktion', 'Eine lineare Funktion', 'Eine Sprung-Funktion'], correct: 1 },
        { question: 'Wer war der erste Mathematiker, der Infinitesimalrechnung entwickelte?', answers: ['Isaac Newton', 'Gottfried Wilhelm Leibniz', 'Isaac Newton und Gottfried Wilhelm Leibniz', 'Johann Bernoulli'], correct: 2 },
        { question: 'Was ist ein Morphismus?', answers: ['Eine Transformation zwischen Objekten', 'Eine geometrische Form', 'Ein algebraisches Element', 'Ein physikalisches Konzept'], correct: 0 },
        { question: 'Wer bewies das Pumping Lemma?', answers: ['Alan Turing', 'John Myhill', 'Anil Nerode', 'John Myhill und Anil Nerode'], correct: 3 },
        { question: 'Was ist eine Topologie?', answers: ['Ein mathematisches Konzept', 'Eine Struktur auf einer Menge', 'Eine geometrische Form', 'Ein physikalisches Phänomen'], correct: 1 },
        { question: 'Wer war der Erfinder der Measure Theory?', answers: ['Émile Borel', 'Henri Lebesgue', 'Giuseppe Peano', 'Richard Dedekind'], correct: 1 },
        { question: 'Was ist ein Spektrum in der Funktionalanalysis?', answers: ['Ein visuelles Phänomen', 'Eine Menge von Eigenwerten', 'Ein mathematisches Konzept', 'Ein physikalisches Konzept'], correct: 2 },
        { question: 'Wer entwickelte die Theorie der distributionen?', answers: ['Laurent Schwartz', 'Vladimir Arnold', 'Andrey Nikolayevich Kolmogorov', 'Jean Dieudonné'], correct: 0 },
        { question: 'Was ist eine Homologie in der Topologie?', answers: ['Eine algebraische Invariante', 'Eine geometrische Form', 'Ein physikalisches Konzept', 'Eine mathematische Struktur'], correct: 0 },
        { question: 'Wer war der Erfinder der Algebraischen Topologie?', answers: ['Henri Poincaré', 'Georg Cantor', 'Emmy Noether', 'David Hilbert'], correct: 0 },
        { question: 'Was ist ein Simplex in der Mathematik?', answers: ['Eine einfache Form', 'Ein konvexes Polytop', 'Ein geometrisches Konzept', 'Ein mathematisches Konzept'], correct: 1 },
        { question: 'Wer entwickelte die Ramsey-Theorie?', answers: ['Frank P. Ramsey', 'Paul Erdős', 'Turán Pál', 'Szemerédi Endre'], correct: 0 },
        { question: 'Was ist ein Eigenwert in der linearen Algebra?', answers: ['Ein Vektor', 'Ein Skalar', 'Ein Wert, der aus Av = λv resuliert', 'Eine Matrix'], correct: 2 },
        { question: 'Wer bewies das Zornsche Lemma?', answers: ['Max Zorn', 'Ernst Zermelo', 'Abraham Fraenkel', 'Kurt Gödel'], correct: 0 },
        { question: 'Was ist ein Baire-Raum?', answers: ['Ein topologischer Raum', 'Ein mathematisches Konzept', 'Ein geometrisches Konzept', 'Ein algebraisches Konzept'], correct: 0 },
        { question: 'Wer entwickelte die Funktionalanalysis?', answers: ['David Hilbert', 'Stefan Banach', 'John von Neumann', 'David Hilbert und Stefan Banach'], correct: 3 }
    ]
}

// Preisstufen
const PRIZE_LEVELS = [
    100, 200, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000
];

// Spielzustand
let state = {
    currentQuestion: 0,
    currentLevel: 1,
    mode: 'endless',
    score: 0,
    prizeIndex: 0,
    isGameActive: false,
    callbacks: null,
    selectedAnswer: null,
    questionAnswered: false,
    totalQuestions: 0,
    correctAnswers: 0
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        currentQuestion: 0,
        currentLevel: config.level,
        mode: config.mode,
        score: 0,
        prizeIndex: 0,
        isGameActive: false,
        callbacks,
        selectedAnswer: null,
        questionAnswered: false,
        totalQuestions: 0,
        correctAnswers: 0
    };
    
    state.isGameActive = true;
    UI.showTimer(false);
    renderGameArea();
    loadQuestion();
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    UI.setGameContent(`
        <div class="millionaire-container">
            <div class="millionaire-header">
                <div class="prize-display">
                    <div class="prize-label">Gewinnstufe</div>
                    <div class="prize-amount" id="prize-amount">€ ${PRIZE_LEVELS[state.prizeIndex]}</div>
                </div>
                <div class="level-display">
                    <div class="level-label">Level</div>
                    <div class="level-value">${state.currentLevel}</div>
                </div>
            </div>
            
            <div class="question-container" id="question-container">
                <!-- Frage wird hier eingefügt -->
            </div>
            
            <div class="answers-container" id="answers-container">
                <!-- Antworten werden hier eingefügt -->
            </div>
        </div>
    `);
    
    injectStyles();
    UI.updateGameDisplay({ level: state.currentLevel, score: state.score });
    
    // Stelle sicher dass DOM aktualisiert ist bevor wir loadQuestion aufrufen
    setTimeout(() => {
        loadQuestion();
    }, 50);
}

/**
 * Lädt eine Frage
 */
function loadQuestion() {
    const questions = QUESTIONS_BY_LEVEL[state.currentLevel];
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    const questionEl = document.getElementById('question-container');
    questionEl.innerHTML = `
        <div class="question-number">Frage ${state.totalQuestions + 1}</div>
        <div class="question-text">${question.question}</div>
    `;
    
    const answersEl = document.getElementById('answers-container');
    answersEl.innerHTML = question.answers.map((answer, index) => `
        <button class="answer-btn" data-index="${index}" data-correct="${index === question.correct}">
            <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
            <span class="answer-text">${answer}</span>
        </button>
    `).join('');
    
    state.selectedAnswer = null;
    state.questionAnswered = false;
    
    setupAnswerListeners(question.correct);
}

/**
 * Setzt Answer-Listener
 */
function setupAnswerListeners(correctIndex) {
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (state.questionAnswered) return;
            
            state.selectedAnswer = parseInt(btn.dataset.index);
            state.questionAnswered = true;
            
            // Markiere alle Buttons
            buttons.forEach(b => {
                b.classList.add('disabled');
                if (parseInt(b.dataset.index) === correctIndex) {
                    b.classList.add('correct');
                }
            });
            
            // Markiere ausgewählte Antwort
            if (state.selectedAnswer === correctIndex) {
                btn.classList.add('selected-correct');
                await delay(1500);
                await handleCorrect();
            } else {
                btn.classList.add('selected-wrong');
                await delay(1500);
                await handleWrong();
            }
        });
    });
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    state.correctAnswers++;
    state.totalQuestions++;
    state.prizeIndex++;
    
    if (state.prizeIndex >= PRIZE_LEVELS.length) {
        await UI.showFeedback('success', 'Du hast eine Million gewonnen! 🎉', 2000);
        endGame();
    } else {
        state.score += PRIZE_LEVELS[state.prizeIndex - 1];
        
        // Nächstes Level nach 3 korrekten Antworten
        if (state.correctAnswers % 3 === 0 && state.currentLevel < 5) {
            state.currentLevel++;
            state.correctAnswers = 0;
            await UI.showFeedback('success', `Level aufgestiegen: ${state.currentLevel}! 🎯`, 1500);
        } else {
            await UI.showFeedback('success', 'Richtig! ✓', 1000);
        }
        
        renderGameArea();
        loadQuestion();
    }
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong() {
    state.isGameActive = false;
    
    const wrongPrize = state.prizeIndex > 0 ? PRIZE_LEVELS[state.prizeIndex - 1] : 0;
    
    if (state.mode === 'relaxed') {
        await UI.showFeedback('error', `Falsch! Gewinn: €${wrongPrize}`, 2000);
        state.correctAnswers = 0;
        state.prizeIndex = Math.max(0, state.prizeIndex - 1);
        state.isGameActive = true;
        renderGameArea();
        loadQuestion();
    } else {
        await UI.showFeedback('error', `Game Over! Gewinn: €${wrongPrize}`, 2000);
        state.score = wrongPrize;
        endGame();
    }
}

/**
 * Injiziert Styles
 */
function injectStyles() {
    const existingStyle = document.querySelector('style[data-millionaire-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-millionaire-style', 'true');
    style.textContent = `
        .millionaire-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .millionaire-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.4);
            border-bottom: 3px solid #ffd700;
        }

        .prize-display, .level-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }

        .prize-label, .level-label {
            font-size: 0.8rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            opacity: 0.9;
        }

        .prize-amount {
            font-size: 1.8rem;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        .level-value {
            font-size: 2rem;
            font-weight: 900;
            color: #00ffff;
        }

        .question-container {
            padding: 2rem 1.5rem;
            background: rgba(0, 0, 0, 0.2);
            text-align: center;
        }

        .question-number {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .question-text {
            font-size: 1.4rem;
            font-weight: 700;
            line-height: 1.6;
            color: #ffffff;
        }

        .answers-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 2rem 1.5rem;
            overflow-y: auto;
        }

        .answer-btn {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 0.75rem;
            color: white;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            text-align: left;
        }

        .answer-btn:hover:not(.disabled) {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
            border-color: #00ffff;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            transform: translateX(10px);
        }

        .answer-btn.disabled {
            cursor: not-allowed;
        }

        .answer-btn.correct {
            border-color: #00ff00;
            background: linear-gradient(135deg, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 100%);
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
        }

        .answer-btn.selected-correct {
            border-color: #00ff00;
            background: linear-gradient(135deg, rgba(0, 255, 0, 0.3) 0%, rgba(0, 255, 0, 0.2) 100%);
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.6);
        }

        .answer-btn.selected-wrong {
            border-color: #ff3333;
            background: linear-gradient(135deg, rgba(255, 51, 51, 0.3) 0%, rgba(255, 51, 51, 0.2) 100%);
            box-shadow: 0 0 30px rgba(255, 51, 51, 0.6);
        }

        .answer-letter {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 35px;
            height: 35px;
            background: rgba(255, 215, 0, 0.3);
            border-radius: 50%;
            font-weight: 900;
            font-size: 1.1rem;
            flex-shrink: 0;
        }

        .answer-text {
            flex: 1;
        }

        @media (max-width: 640px) {
            .millionaire-header {
                padding: 1rem;
            }

            .prize-amount {
                font-size: 1.5rem;
            }

            .level-value {
                font-size: 1.5rem;
            }

            .question-text {
                font-size: 1.2rem;
            }

            .answer-btn {
                padding: 1rem;
                gap: 0.75rem;
                font-size: 0.95rem;
            }

            .answer-letter {
                width: 30px;
                height: 30px;
                font-size: 0.95rem;
            }

            .answers-container {
                padding: 1.5rem 1rem;
                gap: 0.75rem;
            }
        }

        @media (orientation: portrait) and (max-height: 800px) {
            .question-container {
                padding: 1.5rem 1rem;
            }

            .answers-container {
                padding: 1rem;
                gap: 0.6rem;
            }

            .answer-btn {
                padding: 0.9rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Hilfsfunktion: Verzögerung
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Beendet das Spiel
 */
function endGame() {
    state.isGameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'millionaire',
            score: state.score,
            level: state.currentLevel,
            mode: state.mode,
            round: state.totalQuestions
        });
    }
}

/**
 * Stoppt das Spiel vorzeitig
 */
export function stop() {
    state.isGameActive = false;
}