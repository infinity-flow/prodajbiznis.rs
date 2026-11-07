/* ==========================================================
   PODEŠAVANJA SAJTA — ovde se menja sve što klijent menja
   ========================================================== */

window.SITE = {
  instagram: "https://www.instagram.com/prodajbiznis.rs/",
  instagramHandle: "@prodajbiznis.rs",
  // TODO: upisati prave kontakt podatke
  email: "info@prodajbiznis.rs",
  phone: "+381 60 000 0000",
  phoneHref: "+381600000000",
  city: "Beograd, Srbija",
  // Ako se doda Formspree (ili sl.) endpoint, forme šalju direktno.
  // Dok je prazno, forme otvaraju mejl sa popunjenim podacima.
  formEndpoint: ""
};

/* ----------------------------------------------------------
   INSTAGRAM RILSOVI
   video/poster: fajlovi u assets/video (540x960 mp4 + jpg kadar)
   url: link ka rilsu na Instagramu (dugme ↗ u uvećanom prikazu)
   Dok je lista prazna, prikazuju se placeholder kartice.
   ---------------------------------------------------------- */
window.REELS = [
  { video: "assets/video/reel-1.mp4", poster: "assets/video/reel-1.jpg", url: "https://www.instagram.com/reel/DfWfwj8NYM-/" },
  { video: "assets/video/reel-2.mp4", poster: "assets/video/reel-2.jpg", url: "https://www.instagram.com/reel/DfcaDcsN1Z3/" },
  { video: "assets/video/reel-3.mp4", poster: "assets/video/reel-3.jpg", url: "https://www.instagram.com/reel/DfSoqQ0tRWT/" },
  { video: "assets/video/reel-4.mp4", poster: "assets/video/reel-4.jpg", url: "https://www.instagram.com/reel/DfHbKSpNeoK/" },
  { video: "assets/video/reel-5.mp4", poster: "assets/video/reel-5.jpg", url: "https://www.instagram.com/reel/DfFIGD2tqRW/" }
];

/* ----------------------------------------------------------
   BIZNISI NA PRODAJU
   status: "aktivno" | "rezervisano"
   featured: true -> prikazuje se na početnoj
   Cene i iznosi su u evrima (godišnji promet / godišnja neto dobit).
   NAPOMENA: ovo su primeri oglasa za demo — zameniti pravim.
   ---------------------------------------------------------- */
window.LISTINGS = [
  {
    id: "PB-101", title: "Kafić sa baštom na Vračaru", category: "Ugostiteljstvo", city: "Beograd",
    price: 85000, revenue: 210000, profit: 48000, employees: 6, founded: 2016, status: "aktivno", featured: true,
    desc: "Stabilan kafić u mirnoj ulici sa letnjom baštom za 40 gostiju. Stalni gosti iz kraja, uredan zakup na 5 godina.",
    includes: ["Oprema", "Inventar", "Ugovor o zakupu", "Instagram profil"]
  },
  {
    id: "PB-102", title: "Online prodavnica kućnih aparata", category: "IT & Online", city: "Novi Sad",
    price: 140000, revenue: 520000, profit: 72000, employees: 4, founded: 2019, status: "aktivno", featured: true,
    desc: "Web shop sa razrađenim kanalima oglašavanja i ugovorima sa uvoznicima. Rad bez lokala, magacin po potrebi.",
    includes: ["Domen i sajt", "Baza kupaca", "Ugovori sa dobavljačima", "Zalihe"]
  },
  {
    id: "PB-103", title: "Frizerski salon u centru grada", category: "Lepota & Zdravlje", city: "Niš",
    price: 32000, revenue: 78000, profit: 21000, employees: 4, founded: 2014, status: "aktivno", featured: true,
    desc: "Opremljen salon sa četiri radna mesta i ustaljenom klijentelom. Vlasnik ostaje mesec dana zbog primopredaje.",
    includes: ["Oprema", "Brend", "Baza klijenata"]
  },
  {
    id: "PB-104", title: "Pekara sa sopstvenom proizvodnjom", category: "Proizvodnja", city: "Kragujevac",
    price: 190000, revenue: 460000, profit: 86000, employees: 11, founded: 2009, status: "aktivno", featured: true,
    desc: "Pekara sa dva maloprodajna objekta i isporukom za lokalne prodavnice. Pogon u vlasništvu ulazi u cenu.",
    includes: ["Pogon", "Oprema", "Vozilo", "Dva objekta"]
  },
  {
    id: "PB-105", title: "Apartmani na Zlatiboru", category: "Turizam", city: "Zlatibor",
    price: 420000, revenue: 96000, profit: 61000, employees: 2, founded: 2018, status: "aktivno", featured: true,
    desc: "Šest opremljenih apartmana sa visokom popunjenošću tokom cele godine i odličnim ocenama na platformama.",
    includes: ["Nekretnina", "Nameštaj", "Profili na platformama"]
  },
  {
    id: "PB-106", title: "Auto servis i vulkanizer", category: "Auto", city: "Pančevo",
    price: 115000, revenue: 240000, profit: 52000, employees: 5, founded: 2011, status: "rezervisano", featured: true,
    desc: "Servis sa tri kanala, dizalicama i ugovorima sa dva lokalna voznog parka. Lokal u dugoročnom zakupu.",
    includes: ["Oprema", "Ugovori sa firmama", "Zalihe"]
  },
  {
    id: "PB-107", title: "Restoran domaće kuhinje", category: "Ugostiteljstvo", city: "Novi Sad",
    price: 160000, revenue: 380000, profit: 64000, employees: 14, founded: 2013, status: "aktivno", featured: false,
    desc: "Restoran sa 90 mesta, terasom i jakom bazom keteringa za firme. Prepoznatljiv brend u gradu.",
    includes: ["Oprema", "Brend", "Ketering ugovori"]
  },
  {
    id: "PB-108", title: "Digitalna marketing agencija", category: "IT & Online", city: "Beograd",
    price: 95000, revenue: 180000, profit: 55000, employees: 5, founded: 2020, status: "aktivno", featured: false,
    desc: "Agencija sa 18 klijenata na mesečnom paušalu. Tim ostaje, rad je potpuno remote.",
    includes: ["Ugovori sa klijentima", "Tim", "Brend i sajt"]
  },
  {
    id: "PB-109", title: "Prodavnica mešovite robe", category: "Trgovina", city: "Čačak",
    price: 48000, revenue: 290000, profit: 26000, employees: 4, founded: 2007, status: "aktivno", featured: false,
    desc: "Prodavnica u gusto naseljenom delu grada sa stalnim prometom i proverenim dobavljačima.",
    includes: ["Zalihe", "Oprema", "Ugovor o zakupu"]
  },
  {
    id: "PB-110", title: "Teretana i fitnes centar", category: "Lepota & Zdravlje", city: "Beograd",
    price: 130000, revenue: 165000, profit: 38000, employees: 7, founded: 2017, status: "aktivno", featured: false,
    desc: "Teretana od 600 m² sa preko 400 aktivnih članarina, grupnim treninzima i novom opremom.",
    includes: ["Oprema", "Članarine", "Brend"]
  },
  {
    id: "PB-111", title: "Proizvodnja nameštaja po meri", category: "Proizvodnja", city: "Kraljevo",
    price: 240000, revenue: 410000, profit: 79000, employees: 9, founded: 2006, status: "aktivno", featured: false,
    desc: "Radionica sa CNC mašinom i stalnim nalozima iz Beograda i inostranstva. Hala u vlasništvu.",
    includes: ["Hala", "Mašine", "Vozila", "Otvoreni nalozi"]
  },
  {
    id: "PB-112", title: "Cvećara sa dostavom", category: "Trgovina", city: "Beograd",
    price: 28000, revenue: 72000, profit: 19000, employees: 3, founded: 2015, status: "aktivno", featured: false,
    desc: "Cvećara sa jakim Instagram profilom i online porudžbinama. Saradnja sa event agencijama.",
    includes: ["Instagram profil", "Oprema", "Vozilo"]
  },
  {
    id: "PB-113", title: "Stomatološka ordinacija", category: "Lepota & Zdravlje", city: "Subotica",
    price: 175000, revenue: 220000, profit: 68000, employees: 5, founded: 2010, status: "aktivno", featured: false,
    desc: "Ordinacija sa dve stolice, rendgenom i bazom od preko 3.000 pacijenata. Mogućnost zadržavanja tima.",
    includes: ["Oprema", "Baza pacijenata", "Tim"]
  },
  {
    id: "PB-114", title: "Brza hrana na prometnoj lokaciji", category: "Ugostiteljstvo", city: "Niš",
    price: 55000, revenue: 150000, profit: 34000, employees: 6, founded: 2018, status: "rezervisano", featured: false,
    desc: "Objekat brze hrane pored fakulteta, rad do kasno u noć, jaka dostava preko aplikacija.",
    includes: ["Oprema", "Recepture", "Nalozi na aplikacijama"]
  },
  {
    id: "PB-115", title: "SaaS za zakazivanje termina", category: "IT & Online", city: "Beograd",
    price: 220000, revenue: 110000, profit: 64000, employees: 2, founded: 2021, status: "aktivno", featured: false,
    desc: "Softver na pretplatu sa 300+ aktivnih salona. Mesečni prihod raste, mali troškovi održavanja.",
    includes: ["Izvorni kod", "Pretplatnici", "Domen i brend"]
  },
  {
    id: "PB-116", title: "Rent-a-car agencija", category: "Auto", city: "Beograd",
    price: 310000, revenue: 260000, profit: 72000, employees: 4, founded: 2012, status: "aktivno", featured: false,
    desc: "Flota od 22 vozila, kancelarija blizu aerodroma i ugovori sa turističkim agencijama.",
    includes: ["22 vozila", "Ugovori", "Sajt i brend"]
  },
  {
    id: "PB-117", title: "Butik ženske garderobe", category: "Trgovina", city: "Novi Sad",
    price: 42000, revenue: 130000, profit: 24000, employees: 3, founded: 2016, status: "aktivno", featured: false,
    desc: "Butik u šoping zoni sa online prodajom preko Instagrama. Zalihe ulaze u cenu po nabavnoj vrednosti.",
    includes: ["Zalihe", "Instagram profil", "Enterijer"]
  },
  {
    id: "PB-118", title: "Agencija za čišćenje", category: "Usluge", city: "Beograd",
    price: 65000, revenue: 190000, profit: 42000, employees: 16, founded: 2015, status: "aktivno", featured: false,
    desc: "Ugovori sa poslovnim zgradama i stambenim zajednicama, stabilan tim i oprema.",
    includes: ["Ugovori", "Oprema", "Vozila"]
  },
  {
    id: "PB-119", title: "Seoski turizam sa smeštajem", category: "Turizam", city: "Čačak",
    price: 260000, revenue: 70000, profit: 38000, employees: 3, founded: 2014, status: "aktivno", featured: false,
    desc: "Imanje sa domaćinstvom, smeštajem za 20 gostiju i proizvodnjom domaćih proizvoda.",
    includes: ["Imanje", "Objekti", "Brend"]
  },
  {
    id: "PB-120", title: "Računovodstvena agencija", category: "Usluge", city: "Kragujevac",
    price: 90000, revenue: 120000, profit: 46000, employees: 4, founded: 2008, status: "aktivno", featured: false,
    desc: "Agencija sa 70 stalnih klijenata na mesečnom ugovoru. Vlasnik pomaže u prelaznom periodu.",
    includes: ["Klijenti", "Softver i licence", "Tim"]
  }
];
