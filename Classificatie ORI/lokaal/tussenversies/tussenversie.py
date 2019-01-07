import json
import requests
from pprint import pprint
import numpy as np
import pandas as pd
import re
import pickle
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.linear_model import SGDClassifier, LogisticRegression
from sklearn.metrics import f1_score
import sqlite3

from sqlalchemy import create_engine
engine = create_engine('postgresql://usr:pass@localhost:5432/sqlalchemy')

class ORIclassifier():
	"""Lets you classify a json file from ORI """
	def __init__(self):
		# Load lijsten
		beleidsWoorden = ['bestuur en beleid','facilitering','bevolkingsregister','straatnaamgeving','kadaster','kadastrale','stelposten','begrotingsruimte','integratieuitkeringen','decentralisatieuitkeringen','accountantscontrole','ombudsfunctie','rekenkamer','reiskosten','loonkosten', 'paspoorten', 'rijbewijzen', 'verkiezingen', 'documentaire informatievoorziening ', 'inkoop', 'ozb', 'onroerend zaakbelasting ', 'parkeerbelasting', 'hondenbelasting ', 'precariobeslasting ', 'reclamebelasting ', 'vennootschapsbelasting', 'algemene uitkering ', 'mutaties reserves', 'dividend nutsbedrijven']
		veiligheidWoorden = ['veiligheid', 'bibob', 'criminaliteit','criminelen','inbraken','explosieven','radicalisering','doodschouw','buitengewoon opsporingsambtenaar','crisisbeheersing', 'brandweer', 'brandbestrijding', 'rampenbestrijding', 'halt', 'apv', 'boa', 'georganiseerde criminaliteit', 'wet wapen en munitie', 'antidiscriminatiebeleid', 'dierenbescherming ', 'politie', 'leges drank en horeca', 'openbare orde']
		onderwijsWoorden = ['onderwijs', 'onderwijshuisvesting', 'school', 'scholen', 'basisschool', 'bewegingsonderwijs', 'leraren', 'vandalismebestrijding', 'schoolgebouwen', 'onderwijsbeleid', 'leerlingzaken', 'leerkrachten', 'volwasseneneducatie', 'peuterspeelzaal', 'peuterspeelzalen', 'leerlingbegeleiding', 'leerlingzorg', 'leerlingenvervoer', 'schooldeelname', 'leerplicht', 'schoolverlaten', 'basisonderwijs']
		economieWoorden = ['economische ontwikkeling','economie','economische','winkeliers','ondernemers', 'toerisme', 'landbouw','veeteelt','visserij','promotie', 'toeristen', 'beurzen', 'beurs', 'jaarmarkten', 'forensenbelasting', 'toeristenbelasting', 'vermakelijkhedenretributies', 'bedrijvenloket', 'ondernemersloket', 'startende ondernemers', 'straathandel', 'markten', 'biz-bijdrage', 'marktgelden', 'grondexploitatie bedrijventerreinen', 'winkelgebieden', 'bedrijfslocaties']
		verkeerWoorden = ['verkeer', 'verkeersbeleid', 'verkeersmaatregelen', 'verkeersveiligheid', 'wegen', 'pleinen', 'fietspad', 'voetpad', 'straten', 'civieltechnische kunstwerken', 'straatverlichting', 'gladheidbestrijding', 'sneeuwruimen', 'strooien', 'straatreiniging', 'zwerfafval', 'parkeerbeleid', 'parkeermeters', 'parkeervoorzieningen ', 'jachthaven ', 'bruggelden', 'passantenhaven', 'liggelden', 'havengelden', 'baggerwerkzaamheden ', 'zeehavens', 'binnenhavens ', 'doorgaande waterwegen', 'waterkering ', 'afwatering', 'openbaar vervoer', 'bus', 'tram', 'metro', 'veerdiensten', 'taxivervoer', 'busstation', 'metrostation', 'multimodaal knooppunt']
		cultuurWoorden = ['sport en cultuur', 'sportbeleid', 'topsport', 'sportbeoefening', 'recreatie', 'sport', 'cultuur', 'recreatieve', 'sportaccommodaties','sportverenigingen', 'sportvelden', 'zwembad', 'schaatshal', 'trapveldje', 'voetbalveld', 'voetbal', 'hockey', 'volleybal', 'handbal', 'muziek', 'dans', 'toneel', 'kunst', 'cultuurparticipatie', 'cultuurpresentatie', 'cultuurproductie', 'cultuuruitingen', 'kunstenaars', 'kunstwerken', 'cultuureducatie', 'herdenking', 'musea', 'museum', 'expositie', 'archeologie','archeologisch', 'heemkunde', 'historische archieven', 'bibliotheken', 'bibliotheek','stadsgezicht','monumenten','monumentenwet','lokale pers', 'lokale omroep', 'lokale informatievoorziening', 'natuurbescherming', 'onderhoud van bos', 'vijvers', 'vijver', 'openbaar groen', 'betuining', 'hobbyclub', 'volkstuinvereniging', 'speelvoorziening', 'recreatievoorziening']
		gezondheidsWoorden = ['volksgezondheid', 'milieu', 'gezondheidssituatie', 'gezondheid', 'gezondheidsbevordering', 'infectieziekten', 'vaccinaties', 'vaccinatie','prenatale', 'psychosociale hulp', 'centrum jeugd en gezin', 'ziekenvervoer', 'ambulance', 'riolering', 'oppervlaktewater', 'rioolwaterzuivering', 'rioolheffing', 'grondwater', 'afvalwater', 'hemelwater', 'afval', 'vuilophaal', 'reinigingsrechten', 'vuilstort', 'afvalstoffenheffing', 'milieubeheer', 'geluidhinder', 'bodemsanering', 'rud', 'regionale uitvoeringsdiensten', 'ongediertebestrijding', 'recycling', 'begraafplaatsen', 'begraafplaats','crematoria', 'grafrechten', 'luchtkwaliteit', 'milieubeleid', 'milieukwaliteit']
		sociaalWoorden = ['sociaal domein', 'burgerparticipatie', 'amw', 'algemeen maatschappelijk werk', 'burgerinitiatieven', 'eenzaamheidsbestrijding', 'collectief aanvullend vervoer', 'kinderopvang', 'noodopvang vluchtelingen', 'vreemdelingen', 'wijkteams', 'inkomensregelingen', 'ioaw', 'ioaz', 'wet inkomensvoorzieningen oudere en gedeeltelijk arbeidsongeschikte werkloze werknemers', 'wet inkomensvoorzieningen oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen', 'bijstandverlening', 'inkomensregeling', 'participatiewet', 'loonkostensubsidies', 'bijstandsverlening', 'bijstand', 'schuldhulpverlening', 'beschut werken', 'work first', 'proefplaatsen', 'participatieplaatsen', 'vrijwilligerswerk', 'detacheringsbanen', 'erkenning van verworven competenties', 'evc', 'loonkostensubsidie', 'jobcoach', 'werkplekaanpassingen', 'werkvoorzieningen', 'doventolk', 'inkomensvrijlating', 'stimuleringspremies', 'onkostenvergoedingen', 'no-riskpolis', 'inburgering', 'cursus nederlands', 'loonwaardebepaling', 'besluit bijstandsverlening zelfstandigen', 'bbz', 'maatwerkdienstverlening', 'maatwerkvoorzieningen', 'wmo', 'woningaanpassingen', 'gehandicaptenparkeerkaart ', 'eigen bijdrage', 'mantelzorg', 'pgb', 'jeugd-ggz', 'jeugdzorg', 'gescaleerde zorg', 'beschermdwonenvoorzieningen', 'opvangvoorzieningen', 'vrouwenopvang', 'veilig thuis', 'aanpak huiselijk geweld', 'beschermd wonen', 'kinderbeschermingsmaatregelen', 'jeugdreclassering ', 'ouderbijdragen']
		wonenWoorden = ['volkshuisvesting en ruimtelijke ordening', 'ruimtelijke ordening', 'bgt', 'basisregistratie grootschalige topografie', 'bestemmingsplan', 'bestemmingsplannen', 'grondbeleid', 'cai', 'breedband', 'glasvezel', 'grondexploitatie', 'grondverwerving', 'bouwrijpe gronden', 'bouwgrondcomplexen', 'gebiedsontwikkeling', 'woningvoorraad', 'huisvestingsvoorziening', 'basisregistratie adressen en gebouwen', 'bouwtoezicht', 'bag', 'woningbouw', 'woningverbetering', 'woonruimteverdeling', 'woningsplitsingsvergunning', 'woonvergunning', 'stedelijke vernieuwing', 'woningvoorraad', 'woonomgeving']
		lijsten = [beleidsWoorden,veiligheidWoorden,onderwijsWoorden,economieWoorden,verkeerWoorden,sociaalWoorden,wonenWoorden,gezondheidsWoorden,cultuurWoorden]
		self.lijsten = [beleidsWoorden,veiligheidWoorden,onderwijsWoorden,economieWoorden,verkeerWoorden,sociaalWoorden,wonenWoorden,gezondheidsWoorden,cultuurWoorden]
		
		# Load TFIDF model
		transformer = TfidfTransformer()
		print("here")
		tfidfModel = pickle.load(open("Models\\tfidf.pickle", "rb"))
		self.tfidf = tfidfModel

		# Load Classifiers
		classificationModels = []
		for lijst in self.lijsten:
		    classificationModels.append(pickle.load(open("Models\\"+lijst[0]+ ".pickle", "rb")))
		self.classificationModels = classificationModels

	def classify(self, item):
		item = item.json()
		listOfDocs = self.getUnderlyingDocs(item)
		listOfDocs = self.prepare(listOfDocs)
		listOfDocs = self.addLabels(listOfDocs)
		return listOfDocs

	def getUnderlyingDocs(self, jsonDoc):
		### INPUT: jsonDoc, JSON-file vanuit ORI-API zonder aangegeven thema's met daarin mogelijk onderliggende documenten;
		### OUTPUT: listOfDocs, per onderliggend document een dict met een ID en een string van de inhoud van het document;
		listOfDocs = []
		docID = jsonDoc["id"]
		text = jsonDoc["name"]
		if "description" in jsonDoc.keys():
			text += " " + jsonDoc["description"]
		listOfDocs.append({"id":docID, "text":text}) #Dit is niet een onderliggend document, maar de titel en de omschrijving van het agendapunt 

		if "sources" in jsonDoc.keys(): #loop over de onderliggende documenten
			keys = []
			for doc in jsonDoc["sources"]:
				if "description" in doc.keys() and  docID+"-"+doc["url"] not in keys:
					keys.append(docID+"-"+doc["url"])
					listOfDocs.append({"id":docID+"-"+doc["url"], "text":doc["note"]+" "+doc["description"]})
		return listOfDocs

	def preprocess(self, text):
		text = text.lower()
		text = re.sub("<\w*>", '', text)
		text = re.sub("<\w*\s\/>", '', text)
		text = re.sub("^https?:\/\/.*[\r\n]*", '', text)
		text = re.sub('\\\\x\S.', '', text)
		text = re.sub('[^a-z\s]', '', text)
		text = re.sub("\s+", " ", text)
		return text

	def prepare(self, listOfDocs):
		for doc in listOfDocs:
			doc["text"] = self.preprocess(doc["text"])
			doc["matrix"] = self.tfidf.transform([doc["text"]])
		return listOfDocs

	def addLabels(self, listOfDocs):
		for doc in listOfDocs:
			for clf, lijst in zip(self.classificationModels, self.lijsten):
				doc[lijst[0]] = clf.predict_proba(doc["matrix"])[0,0]
			del doc["text"]
			del doc["matrix"]
		return listOfDocs

class feedback():
	"""allows to give feedback on documents"""
	def __init__(self):
		super(feedback, self).__init__()
		self.columnnames = ["bestuurEnBeleid","veiligheid","onderwijs","economie","verkeer","sociaal","volkshuisvesting","gezondheid","cultuur"]

	def giveFeedback(self, feedbackDict):
		conn = sqlite3.connect('feedback.db')
		cursor = conn.cursor()
		cursor.execute("SELECT " +feedbackDict["category"]+" FROM feedback WHERE id LIKE '" + feedbackDict["id"]+"'")
		if cursor.fetchall():
			cursor.execute("UPDATE feedback SET " +feedbackDict["category"]+"=" +feedbackDict["category"]+"+"
				+str(feedbackDict["feedback"])+" WHERE id ='" +feedbackDict["id"]+"'")
		else:
			feedbackList = self.createFeedbackList([feedbackDict["id"],0],feedbackDict["category"],feedbackDict["feedback"])
			cursor.executemany('INSERT INTO feedback VALUES (?,?,?,?,?,?,?,?,?,?,?)', [feedbackList])
		conn.commit()
		return

	def createFeedbackList(self, feedbackList,category,feedback):
		for name in self.columnnames:
			if name is category:
				feedbackList.append(feedback)
			else:
				feedbackList.append(0)
		return feedbackList

    
		