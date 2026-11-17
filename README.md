# Mårtens Brokvagt – designversion 2.2

En mobilvenlig webapp med Mårten som maskot, 31 kildebelagte historiske brok-facts, kvittering til madklubben og status på lægens behandlingsplan.

## Installation via GitHub Pages

1. Upload alle filer og hele `assets`-mappen til roden af det offentlige repository `henrikeskelund-spec/maartens-brokvagt`.
2. Gå til **Settings → Pages**, vælg **Deploy from a branch**, **main** og **/(root)**.
3. Åbn `https://henrikeskelund-spec.github.io/maartens-brokvagt/` efter publicering.

## Privatliv

Ingen portrætfoto, fuldt navn eller helbredsoplysninger om Jonas offentliggøres. Personlige indstillinger, lægestatus og kvitteringer lagres lokalt i brugerens browser (`localStorage`). Intet sendes automatisk til madklubben; brugeren vælger selv afsendelse i delingsmenuen.

## Begrænsninger

Der er 31 forskellige facts, der roterer med månedens dato. Appen skifter fact ved åbning, men **sender ikke daglige pushnotifikationer i baggrunden**. Dette kræver en native app eller en pushserver. Ved stærke smerter eller andre alarmsignaler skal brugeren søge lægehjælp. Ikke alle brok kræver operation; lægens vurdering er afgørende.

## Udvikling

Statiske HTML/CSS/JavaScript-filer, webmanifest og service worker. Ingen eksterne biblioteker eller backend. Version 2.2 tilpasset det godkendte visuelle design med fanerne Hjem, Historie, Status og Mere.
