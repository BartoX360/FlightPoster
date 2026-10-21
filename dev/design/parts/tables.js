  var TYPES = {
    A318: 'Airbus A318', A319: 'Airbus A319', A320: 'Airbus A320', A321: 'Airbus A321', A19N: 'Airbus A319neo',
    A20N: 'Airbus A320neo', A21N: 'Airbus A321neo', A332: 'Airbus A330-200', A333: 'Airbus A330-300',
    A338: 'Airbus A330-800neo', A339: 'Airbus A330-900neo', A343: 'Airbus A340-300', A346: 'Airbus A340-600',
    A359: 'Airbus A350-900', A35K: 'Airbus A350-1000', A388: 'Airbus A380-800', BCS1: 'Airbus A220-100',
    BCS3: 'Airbus A220-300', B737: 'Boeing 737-700', B738: 'Boeing 737-800', B739: 'Boeing 737-900',
    B37M: 'Boeing 737 MAX 7', B38M: 'Boeing 737 MAX 8', B39M: 'Boeing 737 MAX 9', B752: 'Boeing 757-200',
    B763: 'Boeing 767-300', B772: 'Boeing 777-200', B77W: 'Boeing 777-300ER', B77L: 'Boeing 777-200LR',
    B788: 'Boeing 787-8', B789: 'Boeing 787-9', B78X: 'Boeing 787-10', B744: 'Boeing 747-400', B748: 'Boeing 747-8',
    E170: 'Embraer 170', E175: 'Embraer 175', E190: 'Embraer 190', E195: 'Embraer 195', E290: 'Embraer E190-E2',
    E295: 'Embraer E195-E2', CRJ7: 'Bombardier CRJ700', CRJ9: 'Bombardier CRJ900', CRJX: 'Bombardier CRJ1000',
    AT72: 'ATR 72', AT76: 'ATR 72-600', AT75: 'ATR 72-500', AT45: 'ATR 42-500', AT46: 'ATR 42-600',
    DH8D: 'De Havilland Dash 8-400'
  };
  var CITY_FR = {
    'Mexico City': 'Mexico', 'London': 'Londres', 'Geneva': 'Genève', 'Brussels': 'Bruxelles', 'Venice': 'Venise',
    'Lisbon': 'Lisbonne', 'Seville': 'Séville', 'Athens': 'Athènes', 'Copenhagen': 'Copenhague', 'Vienna': 'Vienne',
    'Warsaw': 'Varsovie', 'Moscow': 'Moscou', 'Cairo': 'Le Caire', 'Algiers': 'Alger', 'Marrakesh': 'Marrakech',
    'Beijing': 'Pékin', 'Montreal': 'Montréal', 'Basel': 'Bâle', 'Edinburgh': 'Édimbourg',
    'Palma De Mallorca': 'Palma', 'Palma de Mallorca': 'Palma', 'Saint Petersburg': 'Saint-Pétersbourg',
    'Bucharest': 'Bucarest', 'Barcelona': 'Barcelone', 'Frankfurt': 'Francfort', 'Hamburg': 'Hambourg', 'Stockholm': 'Stockholm',
    'Valencia': 'Valence', 'Turin': 'Turin', 'Genoa': 'Gênes', 'Tangier': 'Tanger', 'Fez': 'Fès', 'Antwerp': 'Anvers',
    'Krakow': 'Cracovie', 'Dubrovnik': 'Dubrovnik', 'Reykjavik': 'Reykjavik', 'Mumbai': 'Bombay', 'Beirut': 'Beyrouth', 'Singapore': 'Singapour', 'The Hague': 'La Haye', 'Gothenburg': 'Göteborg', 'Malta': 'Malte'
  };
  // [dérive, bande 1, bande 2, liseré fuselage] — utilisé en mode couleur uniquement
  var LIVERIES = {
    AFR: ['#ffffff', '#1d3f8f', '#d62631', '#1d3f8f'], HOP: ['#ffffff', '#1d3f8f', '#d62631', '#1d3f8f'],
    TVF: ['#00a88e', '#ffffff', '#7fd4c6', '#00a88e'], EZY: ['#ff6600', '#ffffff', '#ff6600', '#ff6600'],
    EJU: ['#ff6600', '#ffffff', '#ff6600', '#ff6600'], EZS: ['#ff6600', '#ffffff', '#ff6600', '#ff6600'],
    RYR: ['#073590', '#f1c933', '#073590', '#073590'], RUK: ['#073590', '#f1c933', '#073590', '#073590'],
    DLH: ['#05164d', '#f9ba00', '#05164d', '#05164d'], SWR: ['#e30613', '#ffffff', '#e30613', '#e30613'],
    BAW: ['#ffffff', '#c8102e', '#075aaa', '#075aaa'], CFE: ['#ffffff', '#c8102e', '#075aaa', '#075aaa'],
    SHT: ['#ffffff', '#c8102e', '#075aaa', '#075aaa'], EFW: ['#ffffff', '#c8102e', '#075aaa', '#075aaa'], KLM: ['#00a1de', '#ffffff', '#00a1de', '#00a1de'],
    VLG: ['#ffcc00', '#4d4d4d', '#ffcc00', '#4d4d4d'], IBE: ['#d7192d', '#ffcc00', '#d7192d', '#d7192d'],
    ITY: ['#0047bb', '#00a650', '#0047bb', '#0047bb'], UAE: ['#ffffff', '#00843d', '#d71a21', '#d71a21'],
    QTR: ['#5c0632', '#ffffff', '#5c0632', '#5c0632'], THY: ['#c8102e', '#ffffff', '#c8102e', '#c8102e'],
    TAP: ['#d6001c', '#00a651', '#d6001c', '#00a651'], AUA: ['#d81e05', '#ffffff', '#d81e05', '#d81e05'],
    SAS: ['#000f9f', '#ffffff', '#000f9f', '#000f9f'], NSZ: ['#d81939', '#ffffff', '#d81939', '#d81939'],
    NOZ: ['#d81939', '#ffffff', '#d81939', '#d81939'], WZZ: ['#c6007e', '#25296c', '#c6007e', '#c6007e'],
    WMT: ['#c6007e', '#25296c', '#c6007e', '#c6007e'], WUK: ['#c6007e', '#25296c', '#c6007e', '#c6007e'],
    WAZ: ['#c6007e', '#25296c', '#c6007e', '#c6007e'], VOE: ['#ffffff', '#e3007b', '#2d2d2d', '#e3007b'],
    EWG: ['#a5027d', '#ffffff', '#a5027d', '#a5027d'], BCY: ['#00a0e2', '#ffffff', '#00a0e2', '#00a0e2'],
    TRA: ['#00d66c', '#ffffff', '#00d66c', '#00d66c'], TOM: ['#70cbf4', '#d40e14', '#70cbf4', '#d40e14'],
    DAL: ['#003366', '#c8102e', '#003366', '#c8102e'], UAL: ['#002244', '#ffffff', '#002244', '#002244'],
    AAL: ['#c30019', '#0078d2', '#c30019', '#0078d2'], ACA: ['#000000', '#d22630', '#000000', '#d22630'],
    ETD: ['#bd8b13', '#ffffff', '#bd8b13', '#bd8b13'], CFG: ['#fbb900', '#f5f5f5', '#fbb900', '#fbb900'],
    BEL: ['#003366', '#e30613', '#003366', '#e30613'], AEE: ['#003d7d', '#ffffff', '#003d7d', '#003d7d'],
    LOT: ['#11397e', '#ffffff', '#11397e', '#11397e'], FDX: ['#4d148c', '#ff6600', '#4d148c', '#ff6600'],
    UPS: ['#351c15', '#ffb500', '#351c15', '#ffb500'], DHK: ['#ffcc00', '#d40511', '#ffcc00', '#d40511']
  };
  // Noms et codes IATA des compagnies courantes (évite un appel réseau)
  var AIRLINES = {
    AFR: ['Air France', 'AF'], HOP: ['Air France Hop', 'A5'], TVF: ['Transavia France', 'TO'], TRA: ['Transavia', 'HV'],
    EZY: ['easyJet', 'U2'], EJU: ['easyJet Europe', 'EC'], EZS: ['easyJet Switzerland', 'DS'], RYR: ['Ryanair', 'FR'],
    RUK: ['Ryanair UK', 'RK'], DLH: ['Lufthansa', 'LH'], SWR: ['Swiss', 'LX'], BAW: ['British Airways', 'BA'],
    CFE: ['BA CityFlyer', 'BA'], KLM: ['KLM', 'KL'], VLG: ['Vueling', 'VY'], IBE: ['Iberia', 'IB'], ITY: ['ITA Airways', 'AZ'],
    UAE: ['Emirates', 'EK'], QTR: ['Qatar Airways', 'QR'], THY: ['Turkish Airlines', 'TK'], TAP: ['TAP Air Portugal', 'TP'],
    AUA: ['Austrian', 'OS'], SAS: ['SAS', 'SK'], NSZ: ['Norwegian', 'D8'], NOZ: ['Norwegian', 'DY'], WZZ: ['Wizz Air', 'W6'],
    WMT: ['Wizz Air Malta', 'W4'], WUK: ['Wizz Air UK', 'W9'], VOE: ['Volotea', 'V7'], EWG: ['Eurowings', 'EW'],
    BCY: ['CityJet', 'WX'], TOM: ['TUI Airways', 'BY'], DAL: ['Delta', 'DL'], UAL: ['United', 'UA'], AAL: ['American', 'AA'],
    ACA: ['Air Canada', 'AC'], ETD: ['Etihad', 'EY'], CFG: ['Condor', 'DE'], BEL: ['Brussels Airlines', 'SN'],
    AEE: ['Aegean', 'A3'], LOT: ['LOT', 'LO'], FIN: ['Finnair', 'AY'], AMX: ['Aeroméxico', 'AM'], AEA: ['Air Europa', 'UX'],
    FDX: ['FedEx', 'FX'], UPS: ['UPS', '5X'], DHK: ['DHL', 'D0'], NJE: ['NetJets Europe', '1I']
  };

