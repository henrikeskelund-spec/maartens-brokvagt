# Den Nationale Brokkommission – 3.0

En satirisk webapp fra madklubben, målrettet Jonas. Kommissionsformand Mårten leverer 31 daglige bureaukratiske henvendelser og 31 kildebelagte historiske brok-facts.

## Funktioner
- Kommandocentral med sagsnummer JONAS-001 og lokal sagsalder. Efter 7 og 14 dage eskalerer den bureaukratiske satire – ikke den medicinske risikovurdering.
- Historiske efterretninger med links til kilder.
- Daglig modtagelseskvittering, frivillig deling til madklubben og bevarelse af tidligere kvitteringer.
- Sagsbehandling: Kontaktet lægen, operationsdato registreret eller afventning aftalt med lægen.
- Satirisk afslutningsbevis, der kan udskrives eller gemmes som PDF. Det er ikke en lægeerklæring.
- Installerbar og offlinevenlig webapp.

## Webadresse
https://henrikeskelund-spec.github.io/maartens-brokvagt/

## Privatliv
Kun fornavnet Jonas er fast tiltale. Ingen portrætfoto, efternavn eller konkrete helbredsoplysninger offentliggøres. Sagsstatus, sagsalder og kvitteringer gemmes kun på den lokale enhed. Deling er frivillig og kræver brugerens handling.

## Begrænsninger
Kommissionen er fiktiv og ikke en offentlig myndighed. Appen kan ikke vurdere personlig risiko. Ikke alle brok skal opereres; lægens vurdering er afgørende. Søg akut lægehjælp ved alarmsignaler. En ny fact vises ved åbning hver dag; baggrundsnotifikationer kræver særskilt pushløsning eller native app.

## Teknik
Statiske HTML/CSS/JavaScript-filer uden backend eller eksterne biblioteker. GitHub Pages, webmanifest og service worker. Version 3.0 bevarer den tidligere localStorage-nøgle.
