MPS MISSION CONTROL — LIVE v6.1 PL / EN

CO TO JEST
==========
Jedna produkcyjna wersja aplikacji z dwoma językami:
- Polski — DOMYŚLNY
- English

Zmiana:
USTAWIENIA / SETTINGS -> JĘZYK / LANGUAGE -> Polski / English
Po zmianie aplikacja przeładowuje sam interfejs. Dane auta pozostają bez zmian.

DANE
====
- Wersja LIVE używa tej samej bazy IndexedDB co v6 PROD:
  MPSMissionControl_v6
- Jeżeli wcześniej używałeś v3, migracja z localStorage pozostaje włączona.
- Zmiana języka NIE tworzy osobnej bazy i NIE usuwa danych.

PODMIANA NA GITHUBIE
====================
Do głównego repo MPS-mission-control wrzuć WSZYSTKIE pliki z tej paczki:
- index.html
- style-v61.css
- app-v61.js
- i18n-v61.js
- sw-v61.js
- manifest.json
- icon-192.png
- icon-512.png
- apple-touch-icon.png

Stare pliki style-v6.css / app-v6.js / sw-v6.js mogą zostać.
Nowy index.html ich nie używa.

Po Commit changes:
1. Poczekaj aż GitHub Pages skończy deployment.
2. Zamknij MPS Control całkowicie z przełącznika aplikacji.
3. Otwórz ponownie.
4. Nagłówek powinien pokazać PWA v6.1 // LIVE.
5. Domyślny język: Polski.
6. English: USTAWIENIA -> JĘZYK -> English.

Jeżeli przez chwilę widzisz starą wersję:
- zamknij PWA,
- odczekaj około minutę,
- uruchom ponownie.
Nowe nazwy plików v61 oraz nowy service worker ograniczają problem starego cache.
