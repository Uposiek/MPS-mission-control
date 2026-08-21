MPS MISSION CONTROL — LIVE v6.3

NOWOŚCI:
- poprawiona litera M w chromowanym znaczku MPS,
- automatycznie dodane dokumenty:
  OC Euroins — ważne do 18.08.2027 — 614,10 PLN,
  AC Hestia — ważne do 18.08.2027 — 781,00 PLN,
- osobna sekcja PRAWO JAZDY,
  ważne do 14.07.2029,
- prawo jazdy można później edytować.

WAŻNE:
v6.3 nadal używa tej samej bazy IndexedDB:
MPSMissionControl_v6

Aktualizacja NIE kasuje dotychczasowych:
- tankowań,
- serwisów,
- listy remontu,
- problemów,
- opon,
- dokumentów,
- ustawień.

OC / AC / prawo jazdy zostaną zasiane tylko raz.
Usunięcie ich później nie spowoduje ponownego automatycznego dodania przy każdym starcie.

PODMIANA:
Wrzuć do root repo wszystkie pliki aplikacji:
index.html
style-v63.css
app-v63.js
i18n-v63.js
sw-v63.js
manifest.json
mps-badge-v63.png
icon-192.png
icon-512.png
apple-touch-icon.png

README można wrzucić opcjonalnie.

Po commicie:
1. poczekaj na GitHub Pages,
2. zamknij całkowicie PWA,
3. uruchom ponownie,
4. sprawdź napis PWA v6.3 // LIVE,
5. GARAŻ -> DOKUMENTY powinien pokazać OC i AC,
6. niżej pojawi się PRAWO JAZDY.

Przed większymi przyszłymi aktualizacjami:
USTAWIENIA -> EKSPORTUJ KOPIĘ JSON.
To backup awaryjny; normalna aktualizacja na tym samym URL zachowuje IndexedDB.
