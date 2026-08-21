MPS MISSION CONTROL — LIVE v7.0

GŁÓWNE ZMIANY
==============
- Nowa sekcja AUTO: dane pojazdu, dokumenty, prawo jazdy, Car Health i archiwum misji.
- Przed odbiorem pierwszy przycisk menu nadal prowadzi do MISJI.
- Po kliknięciu „MAM MAZDĘ” pierwszy przycisk automatycznie zmienia się na AUTO.
- Mission Control pozostaje dostępny jako archiwum.
- Dokumenty i prawo jazdy zostały usunięte z GARAŻU i przeniesione do AUTO.
- Opony zostały przeniesione z GARAŻU do SERWISU.
- Tyre Manager: przód/tył, para A/B, bieżnik osi, przebieg kompletu, przebieg od przekładki, domyślnie 8000 km, prognozowana data przekładki, historia przekładek.
- Przekładka trafia również do UPCOMING / CAR HEALTH.
- W USTAWIENIACH można zmienić domyślny interwał przekładki.
- Dane pojazdu (VIN, tablica, rok, daty itd.) wpisujesz ręcznie.
- Build Sheet w polskim interfejsie pokazuje polskie nazwy pozycji; marki/specyfikacja pozostają oryginalne.

DANE / MIGRACJA
================
Nadal używana jest ta sama baza IndexedDB: MPSMissionControl_v6.
Aktualizacja zachowuje istniejące dane. Stare wpisy opon są automatycznie rozszerzane do nowego schematu v7.

Przed aktualizacją zalecany backup: USTAWIENIA -> EKSPORTUJ KOPIĘ JSON.

UPLOAD NA GITHUB
================
Wgraj do root repo wszystkie pliki:
index.html
style-v70.css
app-v70.js
i18n-v70.js
sw-v70.js
manifest.json
mps-badge-v63.png
icon-192.png
icon-512.png
apple-touch-icon.png

README jest opcjonalny.
Po commicie poczekaj na GitHub Pages, zamknij PWA całkowicie i uruchom ponownie.
