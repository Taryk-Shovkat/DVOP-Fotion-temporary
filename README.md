# Fotion

## Obsah
  Úvod
  Technologie
  Instalační Pokyny
  Použití
  Ukazka
  Přispívání

## Fotion je webová aplikace určená pro tvorbu a správu zápisků, velmi podobná aplikaci Notion. Umožňuje uživatelům vytvářet, organizovat a sdílet poznámky a dokumenty přímo v prohlížeči.

## Poznámka: Tento projekt je uzavřený pro externí příspěvky. Jakékoliv pull requesty nebo issues otevřené externími uživateli nebudou přezkoumávány ani přijímány.


## Technologie

  Jazyk: Javascript
  Framework: express, vue
  Databáze: PostgreSQL
  Další Technologie: prisma, Socket.io, JOI js, Oauth


## Instalační Pokyny


###Pro nastavení vývojového prostředí tohoto projektu postupujte následovně:


### Klonování repozitáře:
 
 git clone https://github.com/Taryk-Shovkat/DVOP-Fotion-temporary


### Instalace závislostí:

  npm install

### Vytvoření vlastní postgres databáze

  Vytvořte si libovolnou prázdnou postgresql databázi (například přes pgAdmin)


### Konfigurace environmentálních proměnných:

  Vytvořte soubor .env v kořenovém adresáři a přidejte potřebné environmentální proměnné:

  DATABASE_URL=vaše_databázová_url


### Nastavte url databáze v prisma.scheme

  v složce "prisma" najděte soubor "prisma.scheme" kde v "datasource db" vyplňte "shadowDatabaseUrl" na url vaší shadowdatabáze 
  (postgresql://janedoe:mypassword@localhost:5432/mydb?schema=public&connection_limit=5)

### Spuštění databázových migrací:

  npx prisma migrate dev --name [název]

  Poznámka: V připadě, že toto nefunguje, si vytvořte shadow databázi - https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database


### Spuštění vývojového serveru:

  npm run dev


### Spuštění frontendu

### Naklonujte repozitář

  git clone https://github.com/Majncz/notion-frontend


### Instalace závislostí:

  npm install


### Spuštění vývojového frontendu:

  npm run dev


## Použití

Po instalaci všech závislostí a nastavení environmentálních proměnných můžete spustit server následujícím příkazem (pro vývoj):

  npm run dev

    Aplikace se skládá z frontendu a backendu.
    Práce s databází je zajištěna prismou a api je spravováno pomocí express js. 
    Jednotlivé endpointy můžete shlédnout přes swagger: 

      Po spuštění frontendu a backendu se musíte nejprve příhlásit, po přihlášení dostanete přístup k funkcím apliakce.


## Ukázka

  https://www.loom.com/share/f5906f2a69724ca3a988072d29aef641?sid=a51615a6-b5de-4bac-9999-686c620cefe8

## Přispívání

  Poznámka: Tento projekt nepřijímá příspěvky od externích uživatelů.
