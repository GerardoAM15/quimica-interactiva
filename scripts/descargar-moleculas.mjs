// Catálogo curado de moléculas para uso sin conexión.
// Para cada molécula descarga de PubChem (dominio público): propiedades, estructura 3D (SDF; si no
// existe, la 2D) y el punto de ebullición experimental con su referencia (PUG View).
// Salidas: src/data/moleculas.json (índice) y public/moleculas/<cid>.sdf
// Uso: node scripts/descargar-moleculas.mjs [--sin-cache]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { descargar, guardarJSON, hoy, RAIZ } from './lib/util.mjs';

// nombre en español | nombre para buscar en PubChem | fórmula esperada (Hill, con carga) | categoría
const CATALOGO = `
agua|water|H2O|inorganica
peróxido de hidrógeno|hydrogen peroxide|H2O2|inorganica
amoníaco|ammonia|H3N|inorganica
dióxido de carbono|carbon dioxide|CO2|inorganica
monóxido de carbono|carbon monoxide|CO|inorganica
oxígeno (O2)|oxygen|O2|inorganica
ozono|ozone|O3|inorganica
nitrógeno (N2)|nitrogen|N2|inorganica
hidrógeno (H2)|hydrogen|H2|inorganica
flúor (F2)|fluorine|F2|inorganica
cloro (Cl2)|chlorine|Cl2|inorganica
bromo (Br2)|bromine|Br2|inorganica
yodo (I2)|iodine|I2|inorganica
fluoruro de hidrógeno|hydrogen fluoride|FH|inorganica
cloruro de hidrógeno|hydrogen chloride|ClH|inorganica
bromuro de hidrógeno|hydrogen bromide|BrH|inorganica
yoduro de hidrógeno|hydrogen iodide|HI|inorganica
sulfuro de hidrógeno|hydrogen sulfide|H2S|inorganica
seleniuro de hidrógeno|hydrogen selenide|H2Se|inorganica
telururo de hidrógeno|hydrogen telluride|H2Te|inorganica
dióxido de azufre|sulfur dioxide|O2S|inorganica
trióxido de azufre|sulfur trioxide|O3S|inorganica
monóxido de nitrógeno|nitric oxide|NO|inorganica
dióxido de nitrógeno|nitrogen dioxide|NO2|inorganica
óxido nitroso|nitrous oxide|N2O|inorganica
tetróxido de dinitrógeno|dinitrogen tetroxide|N2O4|inorganica
cianuro de hidrógeno|hydrogen cyanide|CHN|inorganica
fosfina|phosphine|H3P|inorganica
arsina|arsine|AsH3|inorganica
estibina|stibine|H3Sb|inorganica
silano|silane|H4Si|inorganica
germano|germane|GeH4|inorganica
estannano|stannane|H4Sn|inorganica
tricloruro de fósforo|phosphorus trichloride|Cl3P|inorganica
pentacloruro de fósforo|phosphorus pentachloride|Cl5P|inorganica
hexafluoruro de azufre|sulfur hexafluoride|F6S|inorganica
tetrafluoruro de azufre|sulfur tetrafluoride|F4S|inorganica
trifluoruro de boro|boron trifluoride|BF3|inorganica
tricloruro de boro|boron trichloride|BCl3|inorganica
cloruro de berilio|beryllium chloride|BeCl2|inorganica
difluoruro de xenón|xenon difluoride|F2Xe|inorganica
tetrafluoruro de xenón|xenon tetrafluoride|F4Xe|inorganica
trifluoruro de cloro|chlorine trifluoride|ClF3|inorganica
pentafluoruro de bromo|bromine pentafluoride|BrF5|inorganica
pentafluoruro de yodo|iodine pentafluoride|F5I|inorganica
tetracloruro de silicio|silicon tetrachloride|Cl4Si|inorganica
trifluoruro de nitrógeno|nitrogen trifluoride|F3N|inorganica
ácido sulfúrico|sulfuric acid|H2O4S|inorganica
ácido nítrico|nitric acid|HNO3|inorganica
ácido nitroso|nitrous acid|HNO2|inorganica
ácido fosfórico|phosphoric acid|H3O4P|inorganica
ácido perclórico|perchloric acid|ClHO4|inorganica
ácido hipocloroso|hypochlorous acid|ClHO|inorganica
ácido carbónico|carbonic acid|CH2O3|inorganica
hidrazina|hydrazine|H4N2|inorganica
oxicloruro de fósforo|phosphoryl chloride|Cl3OP|inorganica
fosgeno|phosgene|CCl2O|inorganica
ion amonio|ammonium|H4N+|ion
ion hidronio|hydronium|H3O+|ion
ion nitrato|nitrate|NO3-|ion
ion nitrito|nitrite|NO2-|ion
ion carbonato|carbonate|CO3-2|ion
ion bicarbonato|bicarbonate|CHO3-|ion
ion sulfato|sulfate|O4S-2|ion
ion sulfito|sulfite|O3S-2|ion
ion fosfato|phosphate|O4P-3|ion
ion perclorato|perchlorate|ClO4-|ion
ion clorato|chlorate|ClO3-|ion
ion permanganato|permanganate|MnO4-|ion
ion cianuro|cyanide|CN-|ion
ion acetato|acetate|C2H3O2-|ion
metano|methane|CH4|hidrocarburo
etano|ethane|C2H6|hidrocarburo
propano|propane|C3H8|hidrocarburo
butano|butane|C4H10|hidrocarburo
pentano|pentane|C5H12|hidrocarburo
hexano|hexane|C6H14|hidrocarburo
heptano|heptane|C7H16|hidrocarburo
octano|octane|C8H18|hidrocarburo
nonano|nonane|C9H20|hidrocarburo
decano|decane|C10H22|hidrocarburo
isobutano (2-metilpropano)|isobutane|C4H10|hidrocarburo
isopentano (2-metilbutano)|isopentane|C5H12|hidrocarburo
neopentano (2,2-dimetilpropano)|neopentane|C5H12|hidrocarburo
2-metilpentano|2-methylpentane|C6H14|hidrocarburo
3-metilpentano|3-methylpentane|C6H14|hidrocarburo
2,2-dimetilbutano|2,2-dimethylbutane|C6H14|hidrocarburo
2,3-dimetilbutano|2,3-dimethylbutane|C6H14|hidrocarburo
isooctano (2,2,4-trimetilpentano)|2,2,4-trimethylpentane|C8H18|hidrocarburo
eteno (etileno)|ethylene|C2H4|hidrocarburo
propeno|propene|C3H6|hidrocarburo
but-1-eno|1-butene|C4H8|hidrocarburo
cis-but-2-eno|cis-2-butene|C4H8|hidrocarburo
trans-but-2-eno|trans-2-butene|C4H8|hidrocarburo
2-metilpropeno|isobutylene|C4H8|hidrocarburo
buta-1,3-dieno|1,3-butadiene|C4H6|hidrocarburo
isopreno (2-metilbuta-1,3-dieno)|isoprene|C5H8|hidrocarburo
etino (acetileno)|acetylene|C2H2|hidrocarburo
propino|propyne|C3H4|hidrocarburo
but-1-ino|1-butyne|C4H6|hidrocarburo
but-2-ino|2-butyne|C4H6|hidrocarburo
ciclopropano|cyclopropane|C3H6|hidrocarburo
ciclobutano|cyclobutane|C4H8|hidrocarburo
ciclopentano|cyclopentane|C5H10|hidrocarburo
ciclohexano|cyclohexane|C6H12|hidrocarburo
ciclohexeno|cyclohexene|C6H10|hidrocarburo
metilciclohexano|methylcyclohexane|C7H14|hidrocarburo
benceno|benzene|C6H6|hidrocarburo
tolueno (metilbenceno)|toluene|C7H8|hidrocarburo
o-xileno|o-xylene|C8H10|hidrocarburo
m-xileno|m-xylene|C8H10|hidrocarburo
p-xileno|p-xylene|C8H10|hidrocarburo
etilbenceno|ethylbenzene|C8H10|hidrocarburo
estireno (vinilbenceno)|styrene|C8H8|hidrocarburo
cumeno (isopropilbenceno)|cumene|C9H12|hidrocarburo
naftaleno|naphthalene|C10H8|hidrocarburo
antraceno|anthracene|C14H10|hidrocarburo
fenantreno|phenanthrene|C14H10|hidrocarburo
metanol|methanol|CH4O|oxigenado
etanol|ethanol|C2H6O|oxigenado
propan-1-ol|1-propanol|C3H8O|oxigenado
propan-2-ol (isopropanol)|isopropanol|C3H8O|oxigenado
butan-1-ol|1-butanol|C4H10O|oxigenado
butan-2-ol|2-butanol|C4H10O|oxigenado
2-metilpropan-2-ol (terc-butanol)|tert-butanol|C4H10O|oxigenado
2-metilpropan-1-ol (isobutanol)|isobutanol|C4H10O|oxigenado
pentan-1-ol|1-pentanol|C5H12O|oxigenado
etano-1,2-diol (etilenglicol)|ethylene glycol|C2H6O2|oxigenado
propano-1,2,3-triol (glicerol)|glycerol|C3H8O3|oxigenado
fenol|phenol|C6H6O|oxigenado
ciclohexanol|cyclohexanol|C6H12O|oxigenado
alcohol bencílico|benzyl alcohol|C7H8O|oxigenado
metoximetano (éter dimetílico)|dimethyl ether|C2H6O|oxigenado
etoxietano (éter dietílico)|diethyl ether|C4H10O|oxigenado
metoxietano|methoxyethane|C3H8O|oxigenado
metil terc-butil éter|methyl tert-butyl ether|C5H12O|oxigenado
tetrahidrofurano|tetrahydrofuran|C4H8O|oxigenado
anisol (metoxibenceno)|anisole|C7H8O|oxigenado
óxido de etileno (oxirano)|ethylene oxide|C2H4O|oxigenado
metanal (formaldehído)|formaldehyde|CH2O|oxigenado
etanal (acetaldehído)|acetaldehyde|C2H4O|oxigenado
propanal|propanal|C3H6O|oxigenado
butanal|butanal|C4H8O|oxigenado
benzaldehído|benzaldehyde|C7H6O|oxigenado
propanona (acetona)|acetone|C3H6O|oxigenado
butanona|butanone|C4H8O|oxigenado
pentan-2-ona|2-pentanone|C5H10O|oxigenado
pentan-3-ona|3-pentanone|C5H10O|oxigenado
ciclohexanona|cyclohexanone|C6H10O|oxigenado
acetofenona|acetophenone|C8H8O|oxigenado
ácido metanoico (fórmico)|formic acid|CH2O2|oxigenado
ácido etanoico (acético)|acetic acid|C2H4O2|oxigenado
ácido propanoico|propanoic acid|C3H6O2|oxigenado
ácido butanoico|butanoic acid|C4H8O2|oxigenado
ácido benzoico|benzoic acid|C7H6O2|oxigenado
ácido oxálico|oxalic acid|C2H2O4|oxigenado
ácido láctico|lactic acid|C3H6O3|oxigenado
ácido cítrico|citric acid|C6H8O7|oxigenado
ácido salicílico|salicylic acid|C7H6O3|oxigenado
ácido acrílico|acrylic acid|C3H4O2|oxigenado
anhídrido acético|acetic anhydride|C4H6O3|oxigenado
metanoato de metilo|methyl formate|C2H4O2|oxigenado
etanoato de metilo|methyl acetate|C3H6O2|oxigenado
etanoato de etilo (acetato de etilo)|ethyl acetate|C4H8O2|oxigenado
metanoato de etilo|ethyl formate|C3H6O2|oxigenado
etanoato de butilo|butyl acetate|C6H12O2|oxigenado
acetato de isoamilo (aroma de plátano)|isoamyl acetate|C7H14O2|oxigenado
butanoato de etilo (aroma de piña)|ethyl butyrate|C6H12O2|oxigenado
salicilato de metilo|methyl salicylate|C8H8O3|oxigenado
furano|furan|C4H4O|oxigenado
metilamina|methylamine|CH5N|nitrogenado
etilamina|ethylamine|C2H7N|nitrogenado
dimetilamina|dimethylamine|C2H7N|nitrogenado
trimetilamina|trimethylamine|C3H9N|nitrogenado
propan-1-amina|propylamine|C3H9N|nitrogenado
anilina (fenilamina)|aniline|C6H7N|nitrogenado
piridina|pyridine|C5H5N|nitrogenado
pirrol|pyrrole|C4H5N|nitrogenado
piperidina|piperidine|C5H11N|nitrogenado
imidazol|imidazole|C3H4N2|nitrogenado
pirimidina|pyrimidine|C4H4N2|nitrogenado
purina|purine|C5H4N4|nitrogenado
metanamida (formamida)|formamide|CH3NO|nitrogenado
etanamida (acetamida)|acetamide|C2H5NO|nitrogenado
N,N-dimetilformamida|N,N-dimethylformamide|C3H7NO|nitrogenado
benzamida|benzamide|C7H7NO|nitrogenado
urea|urea|CH4N2O|nitrogenado
etanonitrilo (acetonitrilo)|acetonitrile|C2H3N|nitrogenado
propanonitrilo|propionitrile|C3H5N|nitrogenado
benzonitrilo|benzonitrile|C7H5N|nitrogenado
acrilonitrilo|acrylonitrile|C3H3N|nitrogenado
nitrometano|nitromethane|CH3NO2|nitrogenado
nitrobenceno|nitrobenzene|C6H5NO2|nitrogenado
2,4,6-trinitrotolueno (TNT)|2,4,6-trinitrotoluene|C7H5N3O6|nitrogenado
nitroglicerina|nitroglycerin|C3H5N3O9|nitrogenado
etanolamina|ethanolamine|C2H7NO|nitrogenado
clorometano|chloromethane|CH3Cl|halogenado
diclorometano|dichloromethane|CH2Cl2|halogenado
triclorometano (cloroformo)|chloroform|CHCl3|halogenado
tetraclorometano|carbon tetrachloride|CCl4|halogenado
fluorometano|fluoromethane|CH3F|halogenado
bromometano|bromomethane|CH3Br|halogenado
yodometano|iodomethane|CH3I|halogenado
cloroetano|chloroethane|C2H5Cl|halogenado
bromoetano|bromoethane|C2H5Br|halogenado
1,2-dicloroetano|1,2-dichloroethane|C2H4Cl2|halogenado
2-cloropropano|2-chloropropane|C3H7Cl|halogenado
1-bromobutano|1-bromobutane|C4H9Br|halogenado
2-bromo-2-metilpropano|2-bromo-2-methylpropane|C4H9Br|halogenado
cloroeteno (cloruro de vinilo)|vinyl chloride|C2H3Cl|halogenado
tricloroeteno|trichloroethylene|C2HCl3|halogenado
tetrafluoroeteno|tetrafluoroethylene|C2F4|halogenado
diclorodifluorometano (freón-12)|dichlorodifluoromethane|CCl2F2|halogenado
clorobenceno|chlorobenzene|C6H5Cl|halogenado
bromobenceno|bromobenzene|C6H5Br|halogenado
cloruro de acetilo|acetyl chloride|C2H3ClO|halogenado
cloruro de benzoílo|benzoyl chloride|C7H5ClO|halogenado
glucosa|glucose|C6H12O6|biomolecula
fructosa|fructose|C6H12O6|biomolecula
galactosa|galactose|C6H12O6|biomolecula
ribosa|ribose|C5H10O5|biomolecula
desoxirribosa|deoxyribose|C5H10O4|biomolecula
sacarosa|sucrose|C12H22O11|biomolecula
lactosa|lactose|C12H22O11|biomolecula
maltosa|maltose|C12H22O11|biomolecula
glicina|glycine|C2H5NO2|biomolecula
alanina|alanine|C3H7NO2|biomolecula
valina|valine|C5H11NO2|biomolecula
leucina|leucine|C6H13NO2|biomolecula
isoleucina|isoleucine|C6H13NO2|biomolecula
serina|serine|C3H7NO3|biomolecula
treonina|threonine|C4H9NO3|biomolecula
cisteína|cysteine|C3H7NO2S|biomolecula
metionina|methionine|C5H11NO2S|biomolecula
ácido aspártico|aspartic acid|C4H7NO4|biomolecula
ácido glutámico|glutamic acid|C5H9NO4|biomolecula
asparagina|asparagine|C4H8N2O3|biomolecula
glutamina|glutamine|C5H10N2O3|biomolecula
lisina|lysine|C6H14N2O2|biomolecula
arginina|arginine|C6H14N4O2|biomolecula
histidina|histidine|C6H9N3O2|biomolecula
fenilalanina|phenylalanine|C9H11NO2|biomolecula
tirosina|tyrosine|C9H11NO3|biomolecula
triptófano|tryptophan|C11H12N2O2|biomolecula
prolina|proline|C5H9NO2|biomolecula
adenina|adenine|C5H5N5|biomolecula
guanina|guanine|C5H5N5O|biomolecula
citosina|cytosine|C4H5N3O|biomolecula
timina|thymine|C5H6N2O2|biomolecula
uracilo|uracil|C4H4N2O2|biomolecula
adenosina|adenosine|C10H13N5O4|biomolecula
colesterol|cholesterol|C27H46O|biomolecula
ácido palmítico|palmitic acid|C16H32O2|biomolecula
ácido esteárico|stearic acid|C18H36O2|biomolecula
ácido oleico|oleic acid|C18H34O2|biomolecula
ácido linoleico|linoleic acid|C18H32O2|biomolecula
ácido ascórbico (vitamina C)|ascorbic acid|C6H8O6|biomolecula
dopamina|dopamine|C8H11NO2|biomolecula
adrenalina|epinephrine|C9H13NO3|biomolecula
serotonina|serotonin|C10H12N2O|biomolecula
histamina|histamine|C5H9N3|biomolecula
colina|choline|C5H14NO+|biomolecula
nicotinamida|nicotinamide|C6H6N2O|biomolecula
ácido pirúvico|pyruvic acid|C3H4O3|biomolecula
testosterona|testosterone|C19H28O2|biomolecula
estradiol|estradiol|C18H24O2|biomolecula
retinol (vitamina A)|retinol|C20H30O|biomolecula
ácido acetilsalicílico (aspirina)|aspirin|C9H8O4|cotidiana
paracetamol|acetaminophen|C8H9NO2|cotidiana
ibuprofeno|ibuprofen|C13H18O2|cotidiana
cafeína|caffeine|C8H10N4O2|cotidiana
nicotina|nicotine|C10H14N2|cotidiana
teobromina (cacao)|theobromine|C7H8N4O2|cotidiana
capsaicina (ají)|capsaicin|C18H27NO3|cotidiana
mentol|menthol|C10H20O|cotidiana
vainillina|vanillin|C8H8O3|cotidiana
limoneno|limonene|C10H16|cotidiana
alcanfor|camphor|C10H16O|cotidiana
cinamaldehído (canela)|cinnamaldehyde|C9H8O|cotidiana
eugenol (clavo de olor)|eugenol|C10H12O2|cotidiana
geraniol|geraniol|C10H18O|cotidiana
sacarina|saccharin|C7H5NO3S|cotidiana
aspartamo|aspartame|C14H18N2O5|cotidiana
benzocaína|benzocaine|C9H11NO2|cotidiana
lidocaína|lidocaine|C14H22N2O|cotidiana
glutamato monosódico (monohidrato)|monosodium glutamate|C5H10NNaO5|cotidiana
ácido fórmico (hormigas)|formic acid|CH2O2|duplicado
etilenglicol|ethylene glycol|C2H6O2|duplicado
propilenglicol|propylene glycol|C3H8O2|cotidiana
DEET (repelente)|DEET|C12H17NO|cotidiana
ácido sórbico|sorbic acid|C6H8O2|cotidiana
benzoato de sodio|sodium benzoate|C7H5NaO2|cotidiana
cloruro de sodio|sodium chloride|ClNa|ionico
hidróxido de sodio|sodium hydroxide|HNaO|ionico
carbonato de calcio|calcium carbonate|CCaO3|ionico
bicarbonato de sodio|sodium bicarbonate|CHNaO3|ionico
cloruro de cesio|cesium chloride|ClCs|ionico
fluoruro de calcio|calcium fluoride|CaF2|ionico
sulfuro de zinc|zinc sulfide|SZn|ionico
`
  .trim()
  .split('\n')
  .map((l) => l.split('|'))
  .filter((c) => c[3] !== 'duplicado');

/** Fórmula de Hill con carga en la notación de PubChem («NO3-», «CO3-2»). */
const conCarga = (formula, carga) => (carga === 0 ? formula : `${formula}${carga > 0 ? '+' : '-'}${Math.abs(carga) > 1 ? Math.abs(carga) : ''}`);

/**
 * Punto de ebullición desde PUG View: se prefiere el valor del CRC Handbook; si no, el primero en °C
 * (o °F/K convertido) que no indique otra presión. Devuelve { valor (°C), texto, fuente } o null.
 */
function puntoEbullicion(json) {
  const items = [];
  const recorrer = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o.Information)) for (const i of o.Information) items.push(i);
    for (const k of Object.keys(o)) recorrer(o[k]);
  };
  recorrer(json);
  const candidatos = [];
  for (const i of items) {
    const texto = (i.Value?.StringWithMarkup?.[0]?.String ?? (i.Value?.Number ? `${i.Value.Number[0]} ${i.Value.Unit ?? ''}` : '')).replace(/−/g, '-');
    const fuente = (i.Reference ?? []).join('; ') || 'PubChem';
    if (!texto) continue;
    // Se descartan: disoluciones, desigualdades, descomposición, explosión y presiones distintas de 1 atm
    if (/solution|%|greater|less than|[<>]|decompos|explod|begins/i.test(texto)) continue;
    const sinNormal = texto.replace(/760 ?mm ?hg|101\.3 ?kpa|1 ?atm/gi, '');
    if (/mm ?hg|kpa|torr|\batm\b|\bbar\b|pa\b/i.test(sinNormal)) continue;
    // Número (sin confundir el guion de un rango «145-148» con un signo menos) y unidad
    const m = /(?<![\d.])(-?\d+(?:\.\d+)?)(?:\s*(?:-|to)\s*\d+(?:\.\d+)?)?\s*(?:°|deg\s*)?\s*([CFK])\b/.exec(texto);
    if (!m) continue;
    let v = Number(m[1]);
    if (m[2] === 'F') v = ((v - 32) * 5) / 9;
    if (m[2] === 'K') v -= 273.15;
    candidatos.push({ valor: Math.round(v * 100) / 100, texto, fuente, crc: /CRC/i.test(fuente), sublima: /sublim/i.test(texto) });
  }
  return candidatos.find((c) => c.crc) ?? candidatos.find((c) => /°C/.test(c.texto)) ?? candidatos[0] ?? null;
}

// Moléculas diatómicas de elementos: se contrasta con el punto de ebullición del elemento (PubChem)
const elementos = JSON.parse(readFileSync(join(RAIZ, 'src/data/elementos.json'), 'utf8')).elementos;
const DIATOMICAS = { H2: 'H', N2: 'N', O2: 'O', F2: 'F', Cl2: 'Cl', Br2: 'Br', I2: 'I' };

mkdirSync(join(RAIZ, 'public', 'moleculas'), { recursive: true });
const salida = [];
const problemas = [];
for (const [nombre, consulta, esperada, categoria] of CATALOGO) {
  const props = 'MolecularFormula,MolecularWeight,IUPACName,SMILES,Charge,Title,HeavyAtomCount';
  let p;
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(consulta)}/property/${props}/JSON`;
    p = JSON.parse(await descargar(url)).PropertyTable.Properties[0];
  } catch (e) {
    problemas.push(`${nombre}: no se encontró en PubChem (${e.message})`);
    continue;
  }
  const formula = conCarga(p.MolecularFormula.replace(/[+-]\d*$/, ''), p.Charge);
  if (formula !== esperada && p.MolecularFormula !== esperada) {
    problemas.push(`${nombre}: PubChem devolvió ${p.MolecularFormula} (carga ${p.Charge}), se esperaba ${esperada}`);
    continue;
  }
  // Estructura 3D (conformero de PubChem) o, si no existe, la 2D
  let sdf = null;
  let tiene3D = true;
  try {
    sdf = await descargar(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${p.CID}/SDF?record_type=3d`, { reintentos: 1 });
  } catch {
    tiene3D = false;
    sdf = await descargar(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${p.CID}/SDF?record_type=2d`);
  }
  // Solo se guarda el bloque de la molécula (hasta M  END), sin las propiedades de PubChem
  const molblock = sdf.split(/\r?\nM {2}END/)[0] + '\nM  END\n';
  writeFileSync(join(RAIZ, 'public', 'moleculas', `${p.CID}.sdf`), molblock);

  let pe = null;
  try {
    pe = puntoEbullicion(JSON.parse(await descargar(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${p.CID}/JSON?heading=Boiling+Point`, { reintentos: 1 })));
  } catch {
    /* sin dato de punto de ebullición */
  }
  const simboloDiatomico = DIATOMICAS[p.MolecularFormula];
  if (simboloDiatomico) {
    const el = elementos.find((e) => e.simbolo === simboloDiatomico);
    const teElemento = Math.round((el.puntoEbullicion - 273.15) * 100) / 100;
    if (!pe || Math.abs(pe.valor - teElemento) > 1) {
      if (pe) console.log(`  ⚠ ${nombre}: PUG View da ${pe.valor} °C; se usa el del elemento en PubChem (${teElemento} °C)`);
      pe = { valor: teElemento, texto: `${el.puntoEbullicion} K`, fuente: 'PubChem Periodic Table (punto de ebullición del elemento)', sublima: false };
    }
  }

  salida.push({
    cid: p.CID,
    nombre,
    nombreIngles: p.Title,
    formula: p.MolecularFormula,
    carga: p.Charge,
    masaMolar: Number(p.MolecularWeight),
    iupac: p.IUPACName ?? null,
    smiles: p.SMILES,
    categoria,
    tiene3D,
    puntoEbullicion: pe ? { valor: pe.valor, texto: pe.texto, fuente: pe.fuente, sublima: pe.sublima } : null,
  });
  console.log(`  ${String(p.CID).padEnd(9)} ${nombre.padEnd(42)} ${p.MolecularFormula.padEnd(12)} ${tiene3D ? '3D' : '2D'}  Te=${pe ? pe.valor : '—'}`);
}

guardarJSON('src/data/moleculas.json', {
  fuente: {
    nombre: 'PubChem (NCBI/NIH): propiedades, conformeros 3D y puntos de ebullición (PUG View)',
    url: 'https://pubchem.ncbi.nlm.nih.gov/',
    licencia: 'Dominio público; cada punto de ebullición conserva su referencia original',
    descargado: hoy(),
    notas: 'tiene3D = false: PubChem no publica conformero 3D (iones, sales o moléculas muy flexibles); la app genera una geometría aproximada.',
  },
  moleculas: salida,
});
if (problemas.length) {
  console.log('\nProblemas:');
  for (const x of problemas) console.log('  ✗ ' + x);
}
