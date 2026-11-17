# Den Nationale Brokkommission – 4.0

En satirisk webapp fra madklubben med Kammerat Mårten som kommissionsformand. Østblok-inspireret myndighedsdesign, fiktiv forvaltningssatire og dokumenterede historiske brok-facts.

## Funktioner
- Central: sagsnummer JONAS-001, sagsalder, 31 daglige direktiver, kvittering og sagsbehandling.
- Sagsmappe: Operation Fit for Fight, gennemførelsesprotokol, historiske præcedenssager og det kildebelagte hovedarkiv med 31 facts.
- Efterretning: voksende lokal journal med fiktive dagsrapporter og særskilt registrering af faktiske kvitteringer og brugerens statusændringer.
- Sagsforløb: lægekonsultation, forundersøgelse, hospitalskontakt, operationsdato, operation og restitution. De allerede gennemførte trin registreres af brugeren.
- Brokfrihedsbevis: AFVENTER EKSEKVERING, EKSEKVERET og FIT FOR FIGHT – SAG HENLAGT. Kan udskrives eller gemmes som PDF. En aftalt afventning respekteres og giver et særskilt afventningsbevis.
- Forvaltning: sundhedskilder, alarmsignaler, telefonmanuskript og praktiske indstillinger.

## Webadresse
https://henrikeskelund-spec.github.io/maartens-brokvagt/

## Privatliv og begrænsninger
Fiktiv kommission, ikke en myndighed. Kun fornavnet Jonas er fast tiltale. Ingen konkret personlig sygehistorie eller uddannelsesbaggrund er indkodet. Status, sagsalder og kvitteringer gemmes lokalt med samme localStorage-nøgle som før. Deling kræver aktiv brugerhandling. Journalen beregnes ved åbning, ikke via baggrundsovervågning, og viser højst de seneste 366 kalenderdage.

Hospitalets og lægens vurdering har forrang. Certifikatet er satire og ikke en lægeerklæring. Appen sender ikke automatiske pushnotifikationer i baggrunden.

## Teknik
Statiske HTML/CSS/JavaScript-filer, GitHub Pages, webmanifest og service worker. Ingen backend eller eksterne biblioteker.
