# Template pro zkousku

Obsahuje:
- remix
- prisma
- typescript
- tailwind + daisyUI

## jak spustit


### potrebuju mit nejakou DB
Pokud nemate vlastni db, staci spustit docker, to vam spustit lokalni postgres na jeden prikaz:

`docker-compose -f docker-compose.local.yml up`

a to je vse. Pro nahlizeni do db lze pouzit cokoli, ja pouzivam nejakej package ve vs code.

Pokud uz mam vlastni bezici DB, tak v `.env` staci upravit connection string s udaji k vlastni DB

### nainstalovat packages

`npm install`

## spustit

`npm run dev`


## jak se v tom zorientovat

soubory:
- `.env` promenne prostredi - nastaveni pristupu do db
- `prisma/schema.prisma` - nastaveni schematu tabulek
  - po zmene je potreba zavolat `npx prisma migrate dev` cimz zpropaguje schema do vasi db
  - pokud chcete prejmenovat tabulku, tak to udelate prave tady - v modelu je @@map(NazevTabulky). I po te je potreba zavolat migrate.
- hlavni magie se deje v `app/routes`:
  - `_index.tsx` - se zobrazi pokud otevrete web
  - `file.tsx` - je to same jako index rozsirene o upload souboru
  - v dane route lze nalezt:
    - `loader` - ten taha data z db a vraci dolu do komponenty
    - `action` - ten zpracovava formular
    - `export default NazevKomponety` - tohle renderuje prohlizec
    - validacni schema - napsane v zodu, pouziva se pro bezpecny parsing dat z formulare. ve schema lze pouzivat regexpy a hromadu dalsich veci.
- v `app/models` jsou volani do DB podle tabulek - tohle je ta prisma, a neni potreba psat SQL
- v `utils/server` jsou helpery pro zpracovani formularovych dat, ale to vas nemusi zajimat.










# Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

## Development

Run the Vite dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
