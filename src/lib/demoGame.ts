import type { SavedGame } from './stores/savedGames';

// ─── Toggle ───────────────────────────────────────────────────────────────────
// Auf `false` setzen um das Demo-Spiel aus der Spielauswahl zu entfernen.
export const DEMO_GAME_PLAYABLE = true;
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_GAME_ID = '__demo_game__';

function q(id: string, pts: number, deQ: string, deA: string, enQ: string, enA: string) {
	return { id, question: deQ, answer: deA, points: pts, translations: { en: { question: enQ, answer: enA } } };
}

export const DEMO_GAME: SavedGame = {
	id: DEMO_GAME_ID,
	name: '✨ Demo-Spiel',
	languages: ['de', 'en'],
	createdAt: '2025-01-01T00:00:00.000Z',
	updatedAt: '2025-01-01T00:00:00.000Z',
	isPublic: true,
	boardCount: 3,
	chaosEnabled: true,

	board1: [
		{
			id: 'd-b1-c1', name: 'Geografie',
			nameTranslations: { en: 'Geography' },
			questions: [
				q('d-b1-c1-1', 100, 'Die Hauptstadt von Frankreich.', 'Paris', 'The capital of France.', 'Paris'),
				q('d-b1-c1-2', 200, 'Welcher Kontinent ist der flächenmäßig größte der Erde?', 'Asien', 'Which continent is the largest by area?', 'Asia'),
				q('d-b1-c1-3', 300, 'Welches Land hat die längste Küstenlinie der Welt?', 'Kanada', 'Which country has the longest coastline in the world?', 'Canada'),
				q('d-b1-c1-4', 400, 'Wie heißt der tiefste See der Welt?', 'Baikalsee', 'What is the name of the world\'s deepest lake?', 'Lake Baikal'),
				q('d-b1-c1-5', 500, 'In welchem Land liegt das Gebirge Drakensberg?', 'Südafrika', 'In which country is the Drakensberg mountain range located?', 'South Africa'),
			],
		},
		{
			id: 'd-b1-c2', name: 'Geschichte',
			nameTranslations: { en: 'History' },
			questions: [
				q('d-b1-c2-1', 100, 'In welchem Jahr fiel die Berliner Mauer?', '1989', 'In which year did the Berlin Wall fall?', '1989'),
				q('d-b1-c2-2', 200, 'Wer war der erste Mensch auf dem Mond?', 'Neil Armstrong', 'Who was the first person on the Moon?', 'Neil Armstrong'),
				q('d-b1-c2-3', 300, 'Wie viele Jahre dauerte der Dreißigjährige Krieg?', '30 Jahre', 'How many years did the Thirty Years\' War last?', '30 years'),
				q('d-b1-c2-4', 400, 'Welche Zivilisation baute Machu Picchu?', 'Die Inka', 'Which civilization built Machu Picchu?', 'The Inca'),
				q('d-b1-c2-5', 500, 'In welchem Jahr begann der Erste Weltkrieg?', '1914', 'In which year did World War I begin?', '1914'),
			],
		},
		{
			id: 'd-b1-c3', name: 'Wissenschaft',
			nameTranslations: { en: 'Science' },
			questions: [
				q('d-b1-c3-1', 100, 'Was ist die chemische Formel für Wasser?', 'H₂O', 'What is the chemical formula for water?', 'H₂O'),
				q('d-b1-c3-2', 200, 'Wie viele Planeten hat unser Sonnensystem?', '8', 'How many planets does our solar system have?', '8'),
				q('d-b1-c3-3', 300, 'Welches Element hat das chemische Symbol Fe?', 'Eisen', 'Which element has the chemical symbol Fe?', 'Iron'),
				q('d-b1-c3-4', 400, 'Wie schnell ist Licht (ungefähr)?', '300.000 km/s', 'How fast is light (approximately)?', '300,000 km/s'),
				q('d-b1-c3-5', 500, 'Wer formulierte die Relativitätstheorie?', 'Albert Einstein', 'Who formulated the theory of relativity?', 'Albert Einstein'),
			],
		},
		{
			id: 'd-b1-c4', name: 'Sport',
			nameTranslations: { en: 'Sports' },
			questions: [
				q('d-b1-c4-1', 100, 'In welcher Sportart gibt es einen „Slam Dunk"?', 'Basketball', 'In which sport is there a "Slam Dunk"?', 'Basketball'),
				q('d-b1-c4-2', 200, 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?', '11', 'How many players does a football team have on the field?', '11'),
				q('d-b1-c4-3', 300, 'In welcher Stadt fanden die ersten modernen Olympischen Spiele statt?', 'Athen', 'In which city were the first modern Olympic Games held?', 'Athens'),
				q('d-b1-c4-4', 400, 'Wie viele Grand-Slam-Titel gewann Roger Federer?', '20', 'How many Grand Slam titles did Roger Federer win?', '20'),
				q('d-b1-c4-5', 500, 'Welches Land hat die meisten Fußball-Weltmeisterschaften gewonnen?', 'Brasilien (5×)', 'Which country has won the most FIFA World Cups?', 'Brazil (5×)'),
			],
		},
		{
			id: 'd-b1-c5', name: 'Musik',
			nameTranslations: { en: 'Music' },
			questions: [
				q('d-b1-c5-1', 100, 'Aus wie vielen Saiten besteht eine Standard-Gitarre?', '6', 'How many strings does a standard guitar have?', '6'),
				q('d-b1-c5-2', 200, 'Aus welchem Land kommt die Band ABBA?', 'Schweden', 'From which country does the band ABBA originate?', 'Sweden'),
				q('d-b1-c5-3', 300, 'Wie heißt Beethovens bekannteste Sinfonie?', '9. Sinfonie (Ode an die Freude)', 'What is Beethoven\'s most famous symphony?', '9th Symphony (Ode to Joy)'),
				q('d-b1-c5-4', 400, 'Welches Instrument spielt Elton John?', 'Klavier', 'Which instrument does Elton John play?', 'Piano'),
				q('d-b1-c5-5', 500, 'In welcher Stadt wurde Wolfgang Amadeus Mozart geboren?', 'Salzburg', 'In which city was Wolfgang Amadeus Mozart born?', 'Salzburg'),
			],
		},
		{
			id: 'd-b1-c6', name: 'Film & TV',
			nameTranslations: { en: 'Film & TV' },
			questions: [
				q('d-b1-c6-1', 100, 'Welche Filmreihe spielt in einer „weit, weit entfernten Galaxis"?', 'Star Wars', 'Which film series takes place in a "galaxy far, far away"?', 'Star Wars'),
				q('d-b1-c6-2', 200, 'Wie heißt der Löwenkönig in Disneys gleichnamigem Film?', 'Simba', 'What is the name of the lion king in Disney\'s eponymous film?', 'Simba'),
				q('d-b1-c6-3', 300, 'Wer spielte Iron Man im Marvel Cinematic Universe?', 'Robert Downey Jr.', 'Who played Iron Man in the Marvel Cinematic Universe?', 'Robert Downey Jr.'),
				q('d-b1-c6-4', 400, 'Welche Streaming-Plattform produzierte „Stranger Things"?', 'Netflix', 'Which streaming platform produced "Stranger Things"?', 'Netflix'),
				q('d-b1-c6-5', 500, 'Wie lautet der Geburtsname von Darth Vader?', 'Anakin Skywalker', 'What is Darth Vader\'s birth name?', 'Anakin Skywalker'),
			],
		},
	],

	board2: [
		{
			id: 'd-b2-c1', name: 'Hauptstädte der Welt',
			nameTranslations: { en: 'World Capitals' },
			questions: [
				q('d-b2-c1-1', 200, 'Die Hauptstadt von Japan.', 'Tokio', 'The capital of Japan.', 'Tokyo'),
				q('d-b2-c1-2', 400, 'Die Hauptstadt von Australien.', 'Canberra', 'The capital of Australia.', 'Canberra'),
				q('d-b2-c1-3', 600, 'Die Hauptstadt von Kanada.', 'Ottawa', 'The capital of Canada.', 'Ottawa'),
				q('d-b2-c1-4', 800, 'Die Hauptstadt von Brasilien.', 'Brasília', 'The capital of Brazil.', 'Brasília'),
				q('d-b2-c1-5', 1000, 'Die Hauptstadt von Kasachstan.', 'Astana', 'The capital of Kazakhstan.', 'Astana'),
			],
		},
		{
			id: 'd-b2-c2', name: 'Natur & Tiere',
			nameTranslations: { en: 'Nature & Animals' },
			questions: [
				q('d-b2-c2-1', 200, 'Welches Tier ist das schnellste an Land?', 'Gepard', 'Which animal is the fastest on land?', 'Cheetah'),
				q('d-b2-c2-2', 400, 'Wie viele Arme hat ein Oktopus?', '8', 'How many arms does an octopus have?', '8'),
				q('d-b2-c2-3', 600, 'Welcher Baum produziert Eicheln?', 'Eiche', 'Which tree produces acorns?', 'Oak'),
				q('d-b2-c2-4', 800, 'Wie nennt man die Angst vor Spinnen?', 'Arachnophobie', 'What is the fear of spiders called?', 'Arachnophobia'),
				q('d-b2-c2-5', 1000, 'Welches Säugetier legt Eier?', 'Schnabeltier (und Ameisenigel)', 'Which mammal lays eggs?', 'Platypus (and echidna)'),
			],
		},
		{
			id: 'd-b2-c3', name: 'Technik & Erfindungen',
			nameTranslations: { en: 'Tech & Inventions' },
			questions: [
				q('d-b2-c3-1', 200, 'In welchem Jahr wurde das erste iPhone vorgestellt?', '2007', 'In which year was the first iPhone unveiled?', '2007'),
				q('d-b2-c3-2', 400, 'Wer erfand die Glühbirne?', 'Thomas Edison', 'Who invented the light bulb?', 'Thomas Edison'),
				q('d-b2-c3-3', 600, 'Was steht hinter der Abkürzung „WWW"?', 'World Wide Web', 'What does the abbreviation "WWW" stand for?', 'World Wide Web'),
				q('d-b2-c3-4', 800, 'In welchem Jahr wurde das ARPANET (Vorläufer des Internets) entwickelt?', '1969', 'In which year was ARPANET (the precursor to the Internet) developed?', '1969'),
				q('d-b2-c3-5', 1000, 'Welche Programmiersprache wurde von Brendan Eich für Netscape entwickelt?', 'JavaScript', 'Which programming language was developed by Brendan Eich for Netscape?', 'JavaScript'),
			],
		},
		{
			id: 'd-b2-c4', name: 'Essen & Trinken',
			nameTranslations: { en: 'Food & Drinks' },
			questions: [
				q('d-b2-c4-1', 200, 'Aus welchem Land stammt die Pizza ursprünglich?', 'Italien', 'Which country does pizza originally come from?', 'Italy'),
				q('d-b2-c4-2', 400, 'Wie nennt man das japanische Gericht aus rohem Fisch und Reis?', 'Sushi', 'What is the Japanese dish made from raw fish and rice called?', 'Sushi'),
				q('d-b2-c4-3', 600, 'Welche Gewürzpflanze ist die teuerste der Welt?', 'Safran', 'Which spice is the most expensive in the world?', 'Saffron'),
				q('d-b2-c4-4', 800, 'In welchem Land wurde der Champagner erfunden?', 'Frankreich', 'In which country was champagne invented?', 'France'),
				q('d-b2-c4-5', 1000, 'Wie heißt die Technik des langsamen Garens von Fleisch bei niedrigen Temperaturen?', 'Sous-vide', 'What is the technique of slowly cooking meat at low temperatures called?', 'Sous-vide'),
			],
		},
		{
			id: 'd-b2-c5', name: 'Berühmte Personen',
			nameTranslations: { en: 'Famous People' },
			questions: [
				q('d-b2-c5-1', 200, 'Wer schrieb „Romeo und Julia"?', 'William Shakespeare', 'Who wrote "Romeo and Juliet"?', 'William Shakespeare'),
				q('d-b2-c5-2', 400, 'Welche Physikerin gewann zweimal den Nobelpreis?', 'Marie Curie', 'Which female physicist won the Nobel Prize twice?', 'Marie Curie'),
				q('d-b2-c5-3', 600, 'Wer war der erste Präsident der Vereinigten Staaten?', 'George Washington', 'Who was the first President of the United States?', 'George Washington'),
				q('d-b2-c5-4', 800, 'Welcher Künstler malte die Sixtinische Kapelle?', 'Michelangelo', 'Which artist painted the Sistine Chapel?', 'Michelangelo'),
				q('d-b2-c5-5', 1000, 'Von wem stammt das Zitat „Ich denke, also bin ich"?', 'René Descartes', 'Who said "I think, therefore I am"?', 'René Descartes'),
			],
		},
		{
			id: 'd-b2-c6', name: 'Kunst & Literatur',
			nameTranslations: { en: 'Art & Literature' },
			questions: [
				q('d-b2-c6-1', 200, 'Wer schrieb die „Harry Potter"-Reihe?', 'J.K. Rowling', 'Who wrote the "Harry Potter" series?', 'J.K. Rowling'),
				q('d-b2-c6-2', 400, 'In welchem Museum hängt die Mona Lisa?', 'Louvre (Paris)', 'In which museum does the Mona Lisa hang?', 'The Louvre (Paris)'),
				q('d-b2-c6-3', 600, 'Wer schrieb die Odyssee?', 'Homer', 'Who wrote the Odyssey?', 'Homer'),
				q('d-b2-c6-4', 800, 'Welcher Kunststil ist mit Pablo Picasso verbunden?', 'Kubismus', 'Which art style is associated with Pablo Picasso?', 'Cubism'),
				q('d-b2-c6-5', 1000, 'In welchem Roman lebt die Figur „Holden Caulfield"?', 'Der Fänger im Roggen', 'In which novel does "Holden Caulfield" appear?', 'The Catcher in the Rye'),
			],
		},
	],

	board3: [
		{
			id: 'd-b3-c1', name: 'Philosophie',
			nameTranslations: { en: 'Philosophy' },
			questions: [
				q('d-b3-c1-1', 400,  'Wer schrieb „Also sprach Zarathustra"?', 'Friedrich Nietzsche', 'Who wrote "Thus Spoke Zarathustra"?', 'Friedrich Nietzsche'),
				q('d-b3-c1-2', 800,  'Wie heißt Platons bekanntestes philosophisches Werk über den idealen Staat?', 'Der Staat (Politeia)', 'What is Plato\'s most famous philosophical work about the ideal state?', 'The Republic (Politeia)'),
				q('d-b3-c1-3', 1200, 'Welcher Philosoph begründete den Utilitarismus?', 'Jeremy Bentham', 'Which philosopher founded utilitarianism?', 'Jeremy Bentham'),
				q('d-b3-c1-4', 1600, 'Was beschreibt Ockhams Rasiermesser?', 'Die einfachste Erklärung ist meist die richtige', 'What does Occam\'s Razor describe?', 'The simplest explanation is usually correct'),
				q('d-b3-c1-5', 2000, 'Welcher deutsche Philosoph schrieb die „Kritik der reinen Vernunft"?', 'Immanuel Kant', 'Which German philosopher wrote the "Critique of Pure Reason"?', 'Immanuel Kant'),
			],
		},
		{
			id: 'd-b3-c2', name: 'Astronomie',
			nameTranslations: { en: 'Astronomy' },
			questions: [
				q('d-b3-c2-1', 400,  'Wie viele Monde hat der Jupiter (Stand 2024)?', 'Über 90', 'How many moons does Jupiter have (as of 2024)?', 'Over 90'),
				q('d-b3-c2-2', 800,  'Wie heißt der größte bekannte Stern der Milchstraße?', 'Stephenson 2-18', 'What is the name of the largest known star in the Milky Way?', 'Stephenson 2-18'),
				q('d-b3-c2-3', 1200, 'Was ist ein Lichtjahr?', 'Die Strecke, die Licht in einem Jahr zurücklegt (~9,46 Billionen km)', 'What is a light-year?', 'The distance light travels in one year (~9.46 trillion km)'),
				q('d-b3-c2-4', 1600, 'Wie heißt das Phänomen, wenn ein Schwarzes Loch Materie in Jets ausstößt?', 'Relativistischer Jet', 'What is the phenomenon called when a black hole ejects matter in jets?', 'Relativistic jet'),
				q('d-b3-c2-5', 2000, 'In welchem Jahr landete Voyager 1 außerhalb des Sonnensystems im interstellaren Raum?', '2012', 'In which year did Voyager 1 enter interstellar space beyond the solar system?', '2012'),
			],
		},
		{
			id: 'd-b3-c3', name: 'Mathematik',
			nameTranslations: { en: 'Mathematics' },
			questions: [
				q('d-b3-c3-1', 400,  'Was ist die Quadratwurzel aus 144?', '12', 'What is the square root of 144?', '12'),
				q('d-b3-c3-2', 800,  'Wie lautet der Satz des Pythagoras?', 'a² + b² = c²', 'What is the Pythagorean theorem?', 'a² + b² = c²'),
				q('d-b3-c3-3', 1200, 'Was ist eine Primzahl?', 'Eine natürliche Zahl größer 1, die nur durch 1 und sich selbst teilbar ist', 'What is a prime number?', 'A natural number greater than 1, divisible only by 1 and itself'),
				q('d-b3-c3-4', 1600, 'Wer bewies Fermats letzten Satz im Jahr 1994?', 'Andrew Wiles', 'Who proved Fermat\'s Last Theorem in 1994?', 'Andrew Wiles'),
				q('d-b3-c3-5', 2000, 'Was beschreibt die Eulersche Identität e^(iπ) + 1 = 0?', 'Die Beziehung zwischen e, i, π, 1 und 0 – die fünf wichtigsten Zahlen der Mathematik', 'What does Euler\'s identity e^(iπ) + 1 = 0 describe?', 'The relationship between e, i, π, 1, and 0 – the five most important numbers in mathematics'),
			],
		},
		{
			id: 'd-b3-c4', name: 'Weltrekorde',
			nameTranslations: { en: 'World Records' },
			questions: [
				q('d-b3-c4-1', 400,  'Welches ist das höchste Gebäude der Welt?', 'Burj Khalifa (Dubai, 828 m)', 'What is the tallest building in the world?', 'Burj Khalifa (Dubai, 828 m)'),
				q('d-b3-c4-2', 800,  'Welches Tier hat die längste Lebensdauer aller Wirbeltiere?', 'Grönlandhai (~400 Jahre)', 'Which animal has the longest lifespan of all vertebrates?', 'Greenland shark (~400 years)'),
				q('d-b3-c4-3', 1200, 'Welches ist das größte Land der Erde (nach Fläche)?', 'Russland', 'What is the largest country on Earth (by area)?', 'Russia'),
				q('d-b3-c4-4', 1600, 'Was ist das schnellste Tier im Wasser?', 'Segelfisch (~110 km/h)', 'What is the fastest animal in water?', 'Sailfish (~110 km/h)'),
				q('d-b3-c4-5', 2000, 'Welches ist das älteste noch existierende Unternehmen der Welt?', 'Kongō Gumi (Japan, gegründet 578 n. Chr.)', 'What is the oldest still-existing company in the world?', 'Kongō Gumi (Japan, founded 578 AD)'),
			],
		},
		{
			id: 'd-b3-c5', name: 'Sprachen der Welt',
			nameTranslations: { en: 'World Languages' },
			questions: [
				q('d-b3-c5-1', 400,  'Welche Sprache hat die meisten Muttersprachler weltweit?', 'Mandarin-Chinesisch', 'Which language has the most native speakers worldwide?', 'Mandarin Chinese'),
				q('d-b3-c5-2', 800,  'Wie viele Sprachen gibt es weltweit (ungefähr)?', 'Ca. 7.000', 'How many languages are there worldwide (approximately)?', 'Around 7,000'),
				q('d-b3-c5-3', 1200, 'Welche Sprache hat das größte Alphabet?', 'Khmer (74 Buchstaben)', 'Which language has the largest alphabet?', 'Khmer (74 letters)'),
				q('d-b3-c5-4', 1600, 'Was ist eine Lingua Franca?', 'Eine Verkehrssprache zwischen Menschen unterschiedlicher Muttersprachen', 'What is a Lingua Franca?', 'A common language used between people of different native languages'),
				q('d-b3-c5-5', 2000, 'In welchem Land wird Esperanto als Amtssprache genutzt?', 'In keinem – es ist eine Plansprache ohne offizielles Land', 'In which country is Esperanto used as an official language?', 'None – it is a constructed language with no official country'),
			],
		},
		{
			id: 'd-b3-c6', name: 'Mythen & Legenden',
			nameTranslations: { en: 'Myths & Legends' },
			questions: [
				q('d-b3-c6-1', 400,  'Wie heißt der Göttervater in der nordischen Mythologie?', 'Odin', 'What is the name of the father of the gods in Norse mythology?', 'Odin'),
				q('d-b3-c6-2', 800,  'Was ist der Heilige Gral der Artuslegende?', 'Der Kelch beim letzten Abendmahl Jesu', 'What is the Holy Grail of Arthurian legend?', 'The cup from the Last Supper of Jesus'),
				q('d-b3-c6-3', 1200, 'Welche Kreatur der griechischen Mythologie hat den Körper eines Löwen, den Kopf eines Menschen und den Schwanz eines Skorpions?', 'Manticore', 'Which creature of Greek mythology has the body of a lion, the head of a human, and the tail of a scorpion?', 'Manticore'),
				q('d-b3-c6-4', 1600, 'Wie heißt das versunkene Königreich aus Platons Erzählungen?', 'Atlantis', 'What is the name of the sunken kingdom from Plato\'s narratives?', 'Atlantis'),
				q('d-b3-c6-5', 2000, 'Was ist laut japanischer Mythologie der Ursprung der Welt?', 'Die Götter Izanagi und Izanami schufen die Inseln Japans', 'According to Japanese mythology, what is the origin of the world?', 'The gods Izanagi and Izanami created the islands of Japan'),
			],
		},
	],

	chaosCategory: {
		id: 'd-chaos', name: 'Chaos Category',
		questions: [
			{ ...q('d-chaos-1',  250,  'Was ist 15 % von 200?', '30', 'What is 15% of 200?', '30'), timerEnabled: true, timerSeconds: 15 },
			{ ...q('d-chaos-2',  500,  'Welche Farbe entsteht, wenn man Blau und Gelb mischt?', 'Grün', 'What color is created when you mix blue and yellow?', 'Green') },
			{ ...q('d-chaos-3',  750,  'In welcher Stadt steht die Freiheitsstatue?', 'New York City', 'In which city is the Statue of Liberty located?', 'New York City'), timerEnabled: true, timerSeconds: 20 },
			{ ...q('d-chaos-4',  1000, 'Was hat mehr Beine: ein Tausendfüßler oder ein Käfer?', 'Tausendfüßler', 'What has more legs: a centipede or a beetle?', 'Centipede') },
			{ ...q('d-chaos-5',  1250, 'Wie viele Sekunden hat eine Stunde?', '3.600', 'How many seconds are in one hour?', '3,600'), timerEnabled: true, timerSeconds: 10 },
			{ ...q('d-chaos-6',  1500, 'Welches Tier kann seinen Schwanz abwerfen und nachwachsen lassen?', 'Eidechse', 'Which animal can shed its tail and grow it back?', 'Lizard') },
			{ ...q('d-chaos-7',  1750, 'Wie heißt der größte Ozean der Erde?', 'Pazifischer Ozean', 'What is the name of the largest ocean on Earth?', 'Pacific Ocean'), timerEnabled: true, timerSeconds: 8 },
			{ ...q('d-chaos-8',  2000, 'In welchem Jahr begann der Zweite Weltkrieg?', '1939', 'In which year did World War II begin?', '1939') },
			{ ...q('d-chaos-9',  2250, 'Welches Element hat die Ordnungszahl 79?', 'Gold (Au)', 'Which element has the atomic number 79?', 'Gold (Au)'), timerEnabled: true, timerSeconds: 30 },
			{ ...q('d-chaos-10', 2500, 'Wie viele Knochen hat ein erwachsener menschlicher Körper?', '206', 'How many bones does an adult human body have?', '206') },
		],
	},
};
