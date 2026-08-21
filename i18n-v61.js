// ==========================================================
// MPS OPERATING SYSTEM // UI LANGUAGE LAYER v6.1
// Default: Polish. Switch in Settings -> Language.
// Vehicle data remains in the same IndexedDB database.
// ==========================================================

(() => {
  const LANG_KEY = "mps_v61_ui_language";
  const lang = localStorage.getItem(LANG_KEY) || "pl";
  document.documentElement.lang = lang === "pl" ? "pl" : "en";
  document.body.dataset.lang = lang;

  const exact = new Map(Object.entries({
    // App / navigation
    "Odbiór Mazdy": "Odbiór Mazdy",
    "MISSION": "MISJA",
    "DRIVE": "JAZDA",
    "SERVICE": "SERWIS",
    "GARAGE": "GARAŻ",
    "LOG": "HISTORIA",
    "SET": "UST.",
    "SETTINGS": "USTAWIENIA",

    // Mission
    "MPS REBUILD // LIVE TELEMETRY": "MPS REBUILD // TELEMETRIA NA ŻYWO",
    "ELAPSED": "MINĘŁO",
    "REMAINING": "POZOSTAŁO",
    "MISSION DAY": "DZIEŃ MISJI",
    "TODAY": "DZISIAJ",
    "LEGACY COUNTER": "LICZNIK CAŁKOWITY",
    "TOTAL TIME WITHOUT MPS": "ŁĄCZNY CZAS BEZ MPS-A",
    "CURRENT OBJECTIVE": "AKTUALNY CEL",
    "PHASE PROGRESS": "POSTĘP ETAPU",
    "PHASE MAP": "MAPA ETAPÓW",
    "SCHEDULE BUFFER": "ZAPAS CZASU",
    "EARLIEST READY": "NAJWCZEŚNIEJ GOTOWY",
    "TARGET PICKUP": "PLANOWANY ODBIÓR",
    "NEXT PHASE": "NASTĘPNY ETAP",
    "NEXT MILESTONE": "NASTĘPNY PRÓG",
    "MISSION LOG": "DZIENNIK MISJI",
    "ALL SYSTEMS NOMINAL": "WSZYSTKIE SYSTEMY W NORMIE",
    "WAIT FOR CREW RETURN": "CZEKAJ NA POWRÓT EKIPY",
    "ENGINE INSTALL": "MONTAŻ SILNIKA",
    "FIRST START": "PIERWSZE URUCHOMIENIE",
    "1000 KM BREAK-IN": "DOCIERANIE 1000 KM",
    "DYNO // DISI TUNE": "HAMOWNIA // DISI TUNE",
    "FINAL CHECKS": "KONTROLE KOŃCOWE",
    "READY TO DRIVE": "GOTOWY DO JAZDY",
    "TRACK": "TOR",
    "INSTALL": "MONTAŻ",
    "START": "START",
    "BREAK-IN": "DOCIERANIE",
    "DYNO": "HAMOWNIA",
    "FINAL": "FINAŁ",
    "😎 MAM MAZDĘ // START OPERATIONS": "😎 MAM MAZDĘ // URUCHOM TRYB EKSPLOATACJI",
    "MPS DELIVERED // REBUILD MISSION START": "MPS ODDANY // START MISJI REMONT",
    "FINAL STAGE COUNTDOWN ONLINE": "ODLICZANIE OSTATNIEGO ETAPU URUCHOMIONE",
    "CREW RETURN // ENGINE INSTALL WINDOW": "POWRÓT EKIPY // OKNO MONTAŻU SILNIKA",
    "1000 KM BREAK-IN WINDOW": "OKNO DOCIERANIA 1000 KM",
    "DYNO // DISI TUNE WINDOW": "OKNO HAMOWNI // DISI TUNE",
    "EARLIEST POSSIBLE READY DATE": "NAJWCZEŚNIEJSZY MOŻLIWY TERMIN GOTOWOŚCI",
    "TARGET PICKUP // MISSION END": "PLANOWANY ODBIÓR // KONIEC MISJI",
    "ACTUAL": "FAKT",
    "PLAN": "PLAN",

    // Mission statuses / system
    "🇸🇰 CREW AWAY // SLOVAKIA TRACK MODE": "🇸🇰 EKIPA WYJECHAŁA // TRYB TOR SŁOWACJA",
    "🔧 ENGINE INSTALL // EXHAUST PHASE": "🔧 MONTAŻ SILNIKA // ETAP WYDECHU",
    "⚙️ START-UP PREPARATION": "⚙️ PRZYGOTOWANIE DO PIERWSZEGO STARTU",
    "🛣️ BREAK-IN RUNNING": "🛣️ DOCIERANIE W TOKU",
    "📈 DYNO // DISI TUNE": "📈 HAMOWNIA // DISI TUNE",
    "✅ FINAL CHECKS // PICKUP WINDOW": "✅ KONTROLE KOŃCOWE // OKNO ODBIORU",
    "😎 MISSION COMPLETE": "😎 MISJA ZAKOŃCZONA",
    "ENGINE → CAR // LONG DP": "SILNIK → AUTO // DŁUGI DP",
    "FIRST START // SYSTEM CHECK": "PIERWSZY START // KONTROLA SYSTEMÓW",
    "1000 KM ROAD BREAK-IN": "DOCIERANIE DROGOWE 1000 KM",
    "FINAL OIL // DYNO // CALIBRATION": "OLEJ DOCELOWY // HAMOWNIA // STROJENIE",
    "WAITING FOR THE CALL 📞": "CZEKANIE NA TELEFON 📞",
    "MISSION COMPLETE // READY TO DRIVE 😎": "MISJA ZAKOŃCZONA // GOTOWY DO JAZDY 😎",
    "DO NOT TURN OFF YOUR MAZDA": "NIE WYŁĄCZAJ SWOJEJ MAZDY",
    "ALMOST HOME": "JUŻ PRAWIE",
    "FINAL APPROACH": "OSTATNIA PROSTA",
    "NICE.": "NICE.",
    "HALFWAY THERE": "POŁOWA ZA NAMI",
    "QUARTER MISSION COMPLETE": "ĆWIERĆ MISJI ZA NAMI",
    "DOUBLE DIGITS": "DWUCYFROWY POSTĘP",

    // Drive
    "DRIVE CONTROL": "JAZDA",
    "FUEL // ODOMETER // COST // REPORTS": "PALIWO // PRZEBIEG // KOSZTY // RAPORTY",
    "VEHICLE SNAPSHOT": "PODSUMOWANIE AUTA",
    "WAITING FOR PICKUP": "OCZEKIWANIE NA ODBIÓR",
    "POST-REBUILD ACTIVE": "TRYB PO REMONCIE AKTYWNY",
    "ODO": "PRZEBIEG",
    "SINCE REBUILD": "OD REMONTU",
    "OIL LEFT": "OLEJ — POZOSTAŁO",
    "LAST FUEL": "OSTATNIE SPALANIE",
    "OPEN ISSUES": "OTWARTE PROBLEMY",
    "NEXT SERVICE": "NAJBLIŻSZY SERWIS",
    "CURRENT ODO": "AKTUALNY PRZEBIEG",
    "KM SINCE PICKUP": "KM OD ODBIORU",
    "FUEL // FULL-TO-FULL": "PALIWO // FULL-TO-FULL",
    "LAST": "OSTATNIE",
    "AVERAGE": "ŚREDNIA",
    "LAST 3": "OSTATNIE 3",
    "LAST 5": "OSTATNIE 5",
    "BEST": "NAJLEPSZE",
    "WORST": "NAJGORSZE",
    "FUEL ECONOMICS": "KOSZTY PALIWA",
    "AVG PRICE": "ŚR. CENA",
    "PRICE MIN/MAX": "CENA MIN/MAX",
    "COST / 100 KM": "KOSZT / 100 KM",
    "FUEL COST / KM": "PALIWO / KM",
    "SEASON COMPARISON": "PORÓWNANIE SEZONÓW",
    "☀️ SUMMER": "☀️ LATO",
    "❄️ WINTER": "❄️ ZIMA",
    "THIS MONTH": "TEN MIESIĄC",
    "DISTANCE": "DYSTANS",
    "FUEL SPEND": "PALIWO",
    "SERVICE + OTHER": "SERWIS + INNE",
    "TOTAL": "RAZEM",
    "COST CENTER": "CENTRUM KOSZTÓW",
    "Include rebuild cost in total": "Uwzględniaj koszt remontu w sumie",
    "REBUILD COST / KM": "REMONT / KM",
    "SERVICE + OTHER / KM": "SERWIS + INNE / KM",
    "TOTAL LOGGED COST / KM": "ŁĄCZNY ZAPISANY KOSZT / KM",
    "＋ ADD FUEL": "＋ DODAJ TANKOWANIE",
    "＋ ODOMETER READING": "＋ DODAJ PRZEBIEG",
    "＋ OTHER EXPENSE": "＋ DODAJ INNY KOSZT",
    "RECENT FUEL": "OSTATNIE TANKOWANIA",
    "EDIT / DELETE": "EDYCJA / USUWANIE",
    "FULL": "PEŁNY",
    "PARTIAL": "CZĘŚCIOWY",
    "EDIT": "EDYTUJ",
    "DEL": "USUŃ",

    // Service
    "SERVICE CONTROL": "SERWIS",
    "OIL // MAINTENANCE // UPCOMING // OIL TOP-UPS": "OLEJ // OBSŁUGA // NADCHODZĄCE // DOLEWKI",
    "ENGINE OIL": "OLEJ SILNIKOWY",
    "INTERVAL USED": "ZUŻYCIE INTERWAŁU",
    "KM LEFT": "KM DO WYMIANY",
    "SINCE OIL": "OD WYMIANY",
    "TARGET": "CEL",
    "TIME SINCE": "CZAS OD WYMIANY",
    "TIME MAX": "MAKS. CZAS",
    "EST. OIL SERVICE": "SZAC. WYMIANA OLEJU",
    "ADD PICKUP / OIL BASELINE": "USTAW ODBIÓR / BAZĘ OLEJU",
    "DISTANCE LIMIT FIRST": "PIERWSZY LIMIT: PRZEBIEG",
    "TIME LIMIT FIRST": "PIERWSZY LIMIT: CZAS",
    "OIL TOP-UP TRACKER": "MONITOR DOLEWEK OLEJU",
    "TOPPED UP": "DOLANO",
    "RATE": "ZUŻYCIE",
    "L SINCE BASE": "L OD BAZY",
    "L / 1000 KM": "L / 1000 KM",
    "＋ ADD OIL TOP-UP / CHECK": "＋ DODAJ DOLEWKĘ / KONTROLĘ OLEJU",
    "UPCOMING": "NADCHODZĄCE",
    "＋ ADD MAINTENANCE ITEM": "＋ DODAJ POZYCJĘ OBSŁUGI",
    "＋ ADD SERVICE EVENT": "＋ DODAJ SERWIS",
    "SET / RESET OIL BASELINE": "USTAW / ZRESETUJ BAZĘ OLEJU",
    "MAINTENANCE SCHEDULE": "HARMONOGRAM OBSŁUGI",
    "CUSTOM INTERVALS": "WŁASNE INTERWAŁY",
    "SERVICE HISTORY": "HISTORIA SERWISOWA",

    // Garage
    "ISSUES // TYRES // PARTS // DOCUMENTS": "PROBLEMY // OPONY // CZĘŚCI // DOKUMENTY",
    "ISSUES / SYMPTOMS": "USTERKI / OBJAWY",
    "＋ ADD ISSUE": "＋ DODAJ PROBLEM",
    "TYRES": "OPONY",
    "NO ACTIVE SET": "BRAK AKTYWNEGO KOMPLETU",
    "＋ ADD TYRE SET": "＋ DODAJ KOMPLET OPON",
    "ACTIVE": "AKTYWNE",
    "SWITCH": "ZAŁÓŻ",
    "PARTS / SPECS / MODS": "CZĘŚCI / SPECYFIKACJA / MODY",
    "＋ ADD ITEM": "＋ DODAJ POZYCJĘ",
    "DOCUMENTS": "DOKUMENTY",
    "＋ ADD DOCUMENT": "＋ DODAJ DOKUMENT",
    "INFO": "INFO",
    "WATCH": "OBSERWUJ",
    "URGENT": "PILNE",
    "OPEN": "OTWARTE",
    "OBSERVING": "OBSERWACJA",
    "RESOLVED": "ROZWIĄZANE",

    // History / settings
    "VEHICLE LOG": "HISTORIA AUTA",
    "SEARCH // FILTER // FULL HISTORY": "SZUKAJ // FILTRUJ // PEŁNA HISTORIA",
    "ALL EVENTS": "WSZYSTKIE ZDARZENIA",
    "EXPORT VEHICLE LOG CSV": "EKSPORTUJ HISTORIĘ DO CSV",
    "INDEXEDDB // BACKUP // CONFIG": "INDEXEDDB // KOPIA // KONFIGURACJA",
    "DATA ENGINE": "SILNIK DANYCH",
    "POST-REBUILD BASELINE": "BAZA PO REMONCIE",
    "PICKUP DATE": "DATA ODBIORU",
    "PICKUP ODOMETER [KM]": "PRZEBIEG PRZY ODBIORZE [KM]",
    "CURRENT ODOMETER [KM]": "AKTUALNY PRZEBIEG [KM]",
    "REBUILD COST [PLN]": "KOSZT REMONTU [PLN]",
    "FUEL TANK CAPACITY [L]": "POJEMNOŚĆ BAKU [L]",
    "SAVE BASELINE": "ZAPISZ BAZĘ",
    "OIL INTERVAL": "INTERWAŁ OLEJU",
    "TARGET [KM]": "CEL [KM]",
    "SOFT MAX [KM]": "MIĘKKI LIMIT [KM]",
    "TIME MAX [MONTHS]": "MAKS. CZAS [MIES.]",
    "SAVE OIL SETTINGS": "ZAPISZ USTAWIENIA OLEJU",
    "BACKUP / EXPORT": "KOPIA / EKSPORT",
    "EXPORT BACKUP JSON": "EKSPORTUJ KOPIĘ JSON",
    "IMPORT BACKUP JSON": "IMPORTUJ KOPIĘ JSON",
    "DANGER ZONE": "STREFA NIEBEZPIECZNA",
    "RESET ALL APP DATA": "USUŃ WSZYSTKIE DANE APLIKACJI",
    "LANGUAGE": "JĘZYK",
    "INTERFACE LANGUAGE": "JĘZYK INTERFEJSU",
    "Language changes only the interface. Vehicle data and units stay unchanged.": "Zmiana języka dotyczy tylko interfejsu. Dane auta i jednostki pozostają bez zmian.",

    // Generic forms / modals
    "SAVE": "ZAPISZ",
    "CANCEL": "ANULUJ",
    "MISSION COMPLETE 😎": "MISJA ZAKOŃCZONA 😎",
    "Wpisz faktyczną datę odbioru i przebieg.": "Wpisz faktyczną datę odbioru i przebieg.",
    "ODOMETER [KM]": "PRZEBIEG [KM]",
    "Ustaw jako bazę finalnego oleju": "Ustaw jako bazę finalnego oleju",
    "START OPERATIONS": "URUCHOM TRYB EKSPLOATACJI",
    "ADD FUEL": "DODAJ TANKOWANIE",
    "Full-to-full supports partial fills between FULL entries.": "Metoda full-to-full obsługuje częściowe tankowania pomiędzy pełnymi bakami.",
    "DATE": "DATA",
    "LITERS": "LITRY",
    "TOTAL [PLN]": "KWOTA [PLN]",
    "FULL TANK": "PEŁNY BAK",
    "STATION / NOTE": "STACJA / NOTATKA",
    "ODOMETER READING": "ODCZYT PRZEBIEGU",
    "Updates current mileage and forecasts.": "Aktualizuje bieżący przebieg i prognozy.",
    "OTHER EXPENSE": "INNY KOSZT",
    "Insurance, tyres, detailing, inspection, parts...": "Ubezpieczenie, opony, detailing, przegląd, części...",
    "CATEGORY": "KATEGORIA",
    "COST [PLN]": "KOSZT [PLN]",
    "NOTE": "NOTATKA",
    "ADD SERVICE": "DODAJ SERWIS",
    "A service event can reset an oil baseline.": "Wpis serwisowy może ustawić nową bazę oleju.",
    "SERVICE": "SERWIS",
    "SET NEW OIL BASELINE": "USTAW NOWĄ BAZĘ OLEJU",
    "MAINTENANCE ITEM": "POZYCJA OBSŁUGI",
    "Set km and/or time interval. Leave unused interval at 0.": "Ustaw interwał km i/lub czasu. Nieużywany interwał zostaw jako 0.",
    "ITEM NAME": "NAZWA POZYCJI",
    "INTERVAL [KM] — 0 = OFF": "INTERWAŁ [KM] — 0 = WYŁ.",
    "INTERVAL [MONTHS] — 0 = OFF": "INTERWAŁ [MIES.] — 0 = WYŁ.",
    "LAST DONE DATE": "DATA OSTATNIEGO SERWISU",
    "LAST DONE ODO [KM]": "PRZEBIEG OSTATNIEGO SERWISU [KM]",
    "EST. COST [PLN]": "SZAC. KOSZT [PLN]",
    "OIL BASELINE": "BAZA OLEJU",
    "Reference point for oil-life calculations.": "Punkt odniesienia dla obliczeń interwału oleju.",
    "OIL TOP-UP / CHECK": "DOLEWKA / KONTROLA OLEJU",
    "Track top-ups and calculate L/1000 km since oil baseline.": "Rejestruje dolewki i liczy L/1000 km od bazy oleju.",
    "TOP-UP [L] — 0 FOR CHECK ONLY": "DOLEWKA [L] — 0 DLA SAMEJ KONTROLI",
    "LEVEL / RESULT": "POZIOM / WYNIK",
    "OK / FULL": "OK / MAX",
    "LOW": "NISKI",
    "TOPPED UP": "DOLANO",
    "ISSUE / SYMPTOM": "USTERKA / OBJAW",
    "Keep a diagnostic timeline.": "Prowadź oś czasu diagnostyki.",
    "FIRST NOTICED": "PIERWSZE WYSTĄPIENIE",
    "ISSUE / SYMPTOM": "USTERKA / OBJAW",
    "SEVERITY": "WAŻNOŚĆ",
    "STATUS": "STATUS",
    "DETAILS / CONDITIONS": "SZCZEGÓŁY / WARUNKI",
    "TYRE SET": "KOMPLET OPON",
    "Mileage is tracked while a set is active.": "Przebieg jest naliczany, gdy komplet jest aktywny.",
    "SET NAME": "NAZWA KOMPLETU",
    "SEASON": "SEZON",
    "SUMMER": "LATO",
    "WINTER": "ZIMA",
    "ALL SEASON": "CAŁOROCZNE",
    "TREAD [MM]": "BIEŻNIK [MM]",
    "PART / SPEC / MOD": "CZĘŚĆ / SPEC / MOD",
    "Build a searchable database for this exact car.": "Buduj przeszukiwalną bazę dokładnie tego egzemplarza.",
    "NAME": "NAZWA",
    "PART / SPEC / VALUE": "CZĘŚĆ / SPEC / WARTOŚĆ",
    "PART NUMBER": "NUMER CZĘŚCI",
    "INSTALLED DATE": "DATA MONTAŻU",
    "INSTALLED ODO [KM]": "PRZEBIEG PRZY MONTAŻU [KM]",
    "DOCUMENT": "DOKUMENT",
    "Track OC/AC/inspection/assistance expiration.": "Pilnuj terminów OC/AC/przeglądu/assistance.",
    "TYPE": "TYP",
    "NAME / PROVIDER": "NAZWA / DOSTAWCA",
    "EXPIRY DATE": "DATA WAŻNOŚCI",

    // Categories
    "ENGINE": "SILNIK",
    "FLUIDS": "PŁYNY",
    "BRAKES": "HAMULCE",
    "FILTERS": "FILTRY",
    "INSPECTION": "KONTROLA",
    "OTHER": "INNE",
    "INSURANCE": "UBEZPIECZENIE",
    "DETAILING": "DETAILING",
    "PARTS": "CZĘŚCI",
    "TURBO": "TURBO",
    "FUEL": "PALIWO",
    "INTAKE": "DOLOT",
    "EXHAUST": "WYDECH",
    "CHASSIS": "PODWOZIE",
    "SPEC / CONSUMABLE": "SPEC / EKSPLOATACJA",

    // Data / validation / feedback
    "BRAK DANYCH": "BRAK DANYCH",
    "BRAK WYNIKÓW": "BRAK WYNIKÓW",
    "Missing fuel data.": "Brakuje danych tankowania.",
    "Fuel saved ⛽": "Tankowanie zapisane ⛽",
    "Fuel updated.": "Tankowanie zaktualizowane.",
    "Missing odometer data.": "Brakuje danych przebiegu.",
    "Odometer saved.": "Przebieg zapisany.",
    "Missing expense data.": "Brakuje danych kosztu.",
    "Expense saved.": "Koszt zapisany.",
    "Missing service data.": "Brakuje danych serwisu.",
    "Service saved 🔧": "Serwis zapisany 🔧",
    "Name required.": "Nazwa jest wymagana.",
    "Maintenance item saved.": "Pozycja obsługi zapisana.",
    "Missing baseline.": "Brakuje danych bazy.",
    "Oil baseline saved.": "Baza oleju zapisana.",
    "Missing oil check data.": "Brakuje danych kontroli oleju.",
    "Oil entry saved.": "Wpis olejowy zapisany.",
    "Issue title required.": "Nazwa problemu jest wymagana.",
    "Issue saved.": "Problem zapisany.",
    "Tyre set name required.": "Nazwa kompletu opon jest wymagana.",
    "Tyre set saved.": "Komplet opon zapisany.",
    "Part/spec saved.": "Część/specyfikacja zapisana.",
    "Type and expiry required.": "Typ i data ważności są wymagane.",
    "Document saved.": "Dokument zapisany.",
    "Deleted.": "Usunięto.",
    "Restored.": "Przywrócono.",
    "UNDO": "COFNIJ",
    "Settings saved.": "Ustawienia zapisane.",
    "Oil settings saved.": "Ustawienia oleju zapisane.",
    "Backup imported.": "Kopia zaimportowana.",
    "Invalid backup.": "Nieprawidłowy plik kopii.",
    "Database reset.": "Baza danych wyzerowana.",
    "Date and odo required.": "Data i przebieg są wymagane.",
    "POST-REBUILD OPERATIONS ONLINE 😎": "TRYB PO REMONCIE URUCHOMIONY 😎",
    "Set current odometer first.": "Najpierw ustaw aktualny przebieg.",
    "Active tyre set changed.": "Aktywny komplet opon zmieniony.",

    // Storage
    "Loading database...": "Ładowanie bazy danych...",
    "Language changes only the interface. Vehicle data and units stay unchanged.": "Zmiana języka dotyczy tylko interfejsu. Dane auta i jednostki pozostają bez zmian."
  }));

  // Text patterns produced dynamically.
  const patterns = [
    [/^(\d+) VALID$/i, "$1 POPRAWNYCH"],
    [/^(\d+) ITEMS$/i, "$1 POZYCJI"],
    [/^(\d+) ITEM$/i, "$1 POZYCJA"],
    [/^(\d+) OPEN$/i, "$1 OTWARTYCH"],
    [/^(\d+) ACTIVE$/i, "$1 AKTYWNYCH"],
    [/^(\d+) EVENTS$/i, "$1 ZDARZEŃ"],
    [/^(\d+) EVENT$/i, "$1 ZDARZENIE"],
    [/^(\d+) ENTRIES$/i, "$1 WPISÓW"],
    [/^(\d+) ENTRY$/i, "$1 WPIS"],
    [/^(\d+) MONTHS$/i, "$1 MIES."],
    [/^(\d+) MONTH$/i, "$1 MIES."],
    [/^(\d+)d OVER$/i, "$1d PO TERMINIE"],
    [/^(\d+)d$/i, "$1d"],
    [/^(\d[\d\s,.]*) KM LEFT$/i, "$1 KM POZOSTAŁO"],
    [/^EST\. (.+)$/i, "SZAC. $1"],
    [/^EXP\. (.+)$/i, "WAŻNE DO $1"],
    [/^FULL \/\/ /i, "PEŁNY // "],
    [/^PARTIAL \/\/ /i, "CZĘŚCIOWY // "],
    [/^OIL (.+)$/i, "OLEJ $1"],
    [/^Database: /i, "Baza: "],
    [/v3 localStorage migration enabled\./i, "migracja danych z localStorage v3 jest włączona."],
    [/state stored in IndexedDB\./i, "stan zapisany w IndexedDB."],
    [/^RESERVE BETWEEN EARLIEST READY AND TARGET$/i, "ZAPAS MIĘDZY NAJWCZEŚNIEJSZYM TERMINEM A CELEM"],
    [/^LIVE RESERVE LEFT UNTIL TARGET PICKUP$/i, "AKTUALNY ZAPAS DO PLANOWANEGO ODBIORU"],
    [/^TARGET WINDOW EXCEEDED$/i, "PRZEKROCZONO PLANOWANE OKNO"],
    [/^DISTANCE LIMIT FIRST \/\/ (.+)$/i, "PIERWSZY LIMIT: PRZEBIEG // $1"],
    [/^TIME LIMIT FIRST$/i, "PIERWSZY LIMIT: CZAS"],
    [/^NO DATE FORECAST$/i, "BRAK PROGNOZY DATY"],
    [/^EST\. (.+) \/\/ (DISTANCE|TIME)$/i, (_, a, b) => `SZAC. ${a} // ${b === "DISTANCE" ? "PRZEBIEG" : "CZAS"}`],
    [/^(\d[\d\s,.]*) KM LOGGED$/i, "$1 KM NALICZONE"],
  ];

  const attrMap = new Map(Object.entries({
    "Szukaj: BNR, HPFP, świeca, filtr...": "Szukaj: BNR, HPFP, świeca, filtr...",
    "Szukaj wpisów...": "Szukaj wpisów...",
    "Search entries...": "Szukaj wpisów..."
  }));

  function translateString(input) {
    if (lang !== "pl") return input;
    const raw = String(input);
    const trimmed = raw.trim();
    if (!trimmed) return raw;

    if (exact.has(trimmed)) {
      const translated = exact.get(trimmed);
      return raw.replace(trimmed, translated);
    }

    let out = trimmed;
    for (const [regex, replacement] of patterns) {
      if (regex.test(out)) {
        out = out.replace(regex, replacement);
      }
    }

    // Common token replacements for mixed dynamic lines.
    const tokens = [
      [" KM LEFT", " KM POZOSTAŁO"],
      [" MONTHS", " MIES."],
      [" // DISTANCE", " // PRZEBIEG"],
      [" // TIME", " // CZAS"],
      [" // ENGINE", " // SILNIK"],
      [" // INSPECTION", " // KONTROLA"],
      [" // OTHER", " // INNE"]
    ];
    for (const [a,b] of tokens) out = out.replaceAll(a,b);

    return raw.replace(trimmed, out);
  }

  let busy = false;

  function translateTextNode(node) {
    if (lang !== "pl" || busy || !node || node.nodeType !== Node.TEXT_NODE) return;
    const old = node.nodeValue;
    const neu = translateString(old);
    if (old !== neu) {
      busy = true;
      node.nodeValue = neu;
      busy = false;
    }
  }

  function translateElement(el) {
    if (lang !== "pl" || !el || el.nodeType !== Node.ELEMENT_NODE) return;

    if (el.hasAttribute("placeholder")) {
      const p = el.getAttribute("placeholder");
      if (attrMap.has(p)) el.setAttribute("placeholder", attrMap.get(p));
    }

    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) translateTextNode(child);
      else if (child.nodeType === Node.ELEMENT_NODE) translateElement(child);
    }
  }

  function applyLanguage() {
    const select = document.getElementById("languageSelect");
    if (select) select.value = lang;
    if (lang === "pl") {
      translateElement(document.body);
      document.title = "MPS Mission Control";
    }
  }

  // Translate native confirm() messages from the main app as well.
  const nativeConfirm = window.confirm.bind(window);
  window.confirm = (message) => nativeConfirm(lang === "pl" ? translateString(message) : message);

  const observer = new MutationObserver(mutations => {
    if (lang !== "pl" || busy) return;
    for (const mutation of mutations) {
      if (mutation.type === "characterData") translateTextNode(mutation.target);
      for (const node of mutation.addedNodes || []) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
      }
    }
  });

  observer.observe(document.body, {subtree:true, childList:true, characterData:true});

  document.addEventListener("change", event => {
    if (event.target && event.target.id === "languageSelect") {
      localStorage.setItem(LANG_KEY, event.target.value);
      location.reload();
    }
  });

  applyLanguage();
})();
