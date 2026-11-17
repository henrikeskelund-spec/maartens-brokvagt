const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone:'Europe/Copenhagen',year:'numeric',month:'2-digit',day:'2-digit',
  hour:'2-digit',minute:'2-digit',hourCycle:'h23'
});
export function slotFor(when){
  const p=Object.fromEntries(formatter.formatToParts(new Date(when)).map(x=>[x.type,x.value]));
  if(p.minute!=='00'||!['09','13','18'].includes(p.hour))return null;
  const date=p.year+'-'+p.month+'-'+p.day;
  return {id:date+'T'+p.hour, hour:Number(p.hour), day:Number(p.day)};
}
const dispatches={
9:[
'Centraludvalget har erklæret dagens planperiode for åbnet.',
'Produktionsapparatet er genstartet. Præsidiet forventer administrativ fremdrift.',
'Formanden har godkendt sin egen tilstedeværelse. Hermed er dagens møde beslutningsdygtigt.',
'Dagens direktiv er fremlagt i tre eksemplarer. Ét er til kommissionens hale.',
'Under henvisning til femårsplanen indledes dagens sagsbehandling.',
'Præsidiet har afskaffet morgenmødet og indført et møde før morgenmødet.',
'Kommissionen er operativ. Kontorplanten har endnu ikke udtalt sig.'
],
13:[
'Implementeringskontoret anmoder om en kort administrativ status.',
'En arbejdsgruppe har konstateret, at et møde om fremdrift ikke nødvendigvis er fremdrift.',
'Den interne midtvejsevaluering er afsluttet. Formanden har godkendt evalueringen af evalueringen.',
'Den vejledende målsætning for eftermiddagen er at begrænse antallet af vejledende målsætninger.',
'Kontoret for administrativ inerti har anmodet om udsættelse af sit eget effektiviseringsprogram.',
'Præsidiet har godkendt et forslag om at reducere antallet af forslag.',
'Et ekstra stempel er bestilt. Formanden anser sagen for administrativt veludstyret.'
],
18:[
'Præsidiet har indkaldt til ekstraordinær aftenrapport.',
'Kammerat Mårten har søgt aktindsigt i sin egen tålmodighed.',
'Kommissionens aftenrevision var enstemmig. Revisor og formand er samme mår.',
'Den daglige produktionsrapport er afsluttet. Ringmapperne er meldt operative.',
'Femårsplanen har fået en ekstra side. Ingen ekstra dage er bevilget.',
'Formandens hale har indgivet en mindretalsudtalelse. Den journalføres i morgen.',
'Centraludvalget har stemplet dagens journal. Stemplets funktion er efterfølgende stemplet.'
]};
export function messageFor(slot){
  const label={9:'Morgendirektiv',13:'Implementeringskontrol',18:'Aftenrapport'}[slot.hour];
  if(!label)throw new Error('Invalid slot');
  const n=(slot.day-1)%7;
  return {title:'Kammerat Mårten · '+label,body:dispatches[slot.hour][n],tag:'direktiv-'+slot.id};
}
