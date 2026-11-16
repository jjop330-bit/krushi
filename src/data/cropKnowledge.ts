import { CropId } from '../types/pest';

export interface CropCategoryInfo {
  id: string;
  nameEn: string;
  nameOr: string;
  icon: string;
  descriptionEn: string;
  descriptionOr: string;
}

export const CROP_CATEGORIES: CropCategoryInfo[] = [
  {
    id: 'cereals_millets',
    nameEn: 'Cereals & Millets',
    nameOr: 'ଧାନ୍ୟ ଓ ମିଲେଟ୍ ଜାତୀୟ ଫସଲ',
    icon: '🌾',
    descriptionEn: 'Major staple grains and climate-resilient millets of Odisha',
    descriptionOr: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ଖାଦ୍ୟଶସ୍ୟ ଓ ପୁଷ୍ଟିକର ମିଲେଟ୍ ଫସଲ'
  },
  {
    id: 'pulses',
    nameEn: 'Pulses',
    nameOr: 'ଡାଲି ଜାତୀୟ ଫସଲ',
    icon: '🌱',
    descriptionEn: 'High-protein leguminous crops cultivated across Odisha river basins and uplands',
    descriptionOr: 'ଓଡ଼ିଶାରେ ଚାଷ ହେଉଥିବା ପ୍ରମୁଖ ଡାଲି ଜାତୀୟ ଫସଲ'
  },
  {
    id: 'oilseeds',
    nameEn: 'Oilseeds',
    nameOr: 'ତୈଳବୀଜ ଫସଲ',
    icon: '🌻',
    descriptionEn: 'Edible and industrial oil crops supporting agrarian livelihood',
    descriptionOr: 'ତେଲ ଉତ୍ପାଦନକାରୀ ଫସଲ'
  },
  {
    id: 'vegetables',
    nameEn: 'Vegetables',
    nameOr: 'ପନିପରିବା ଫସଲ',
    icon: '🥦',
    descriptionEn: 'High-value horticultural vegetable crops widely grown across western and coastal Odisha',
    descriptionOr: 'ଓଡ଼ିଶାର ପ୍ରମୁଖ ପନିପରିବା ଚାଷ'
  },
  {
    id: 'fruits_horticulture',
    nameEn: 'Fruits & Horticultural Crops',
    nameOr: 'ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ',
    icon: '🥭',
    descriptionEn: 'Perennial orchards and cash plantations across coastal and plateau agro-climatic zones',
    descriptionOr: 'ଓଡ଼ିଶାର ଫଳ ବଗିଚା ଓ ଅର୍ଥକାରୀ ଉଦ୍ୟାନ ଫସଲ'
  }
];

export interface CropInfo {
  id: CropId;
  category: 'cereals_millets' | 'pulses' | 'oilseeds' | 'vegetables' | 'fruits_horticulture';
  commonNameEn: string;
  commonNameOr: string;
  scientificName: string;
  growthStages: string[];
  majorInsectPests: string[];
  commonDiseases: string[];
  beneficialInsects: string[];
  status: 'FULL_VALIDATED' | 'SUPERVISED_FIELD_PILOT' | 'STAGED_RESEARCH';
  sourceInstitution: string;
  scoutingMethod: string;
  icon: string;
}

export const SUPPORTED_CROPS: CropInfo[] = [
  // CEREALS & MILLETS
  {
    id: 'paddy',
    category: 'cereals_millets',
    commonNameEn: 'Paddy / Rice',
    commonNameOr: 'ଧାନ',
    scientificName: 'Oryza sativa L.',
    growthStages: ['Nursery', 'Tillering', 'Panicle Initiation', 'Flowering / Booting', 'Milking / Grain Filling', 'Maturity / Harvest'],
    majorInsectPests: ['Brown Planthopper (BPH)', 'Yellow Stem Borer', 'Rice Leaf Folder', 'Rice Hispa', 'Swarming Caterpillar / Armyworm', 'Gall Midge', 'Gundhi Bug'],
    commonDiseases: ['Bacterial Leaf Blight (BLB)', 'Rice Blast (Magnaporthe oryzae)', 'Sheath Blight', 'Brown Spot'],
    beneficialInsects: ['Lycosa pseudoannulata (Wolf Spider)', 'Cyrtorhinus lividipennis (Mirid Bug)', 'Paederus fuscipes (Rove Beetle)', 'Odonata (Damselflies)'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-NRRI Cuttack, OUAT Bhubaneswar',
    scoutingMethod: 'Scout 20 random hills in a zigzag pattern across the field weekly during Kharif/Rabi.',
    icon: '🌾'
  },
  {
    id: 'maize',
    category: 'cereals_millets',
    commonNameEn: 'Maize (Corn)',
    commonNameOr: 'ମକା',
    scientificName: 'Zea mays L.',
    growthStages: ['Seedling (VE-V4)', 'Knee-high (V6-V8)', 'Tasseling (VT)', 'Silking (R1)', 'Dough (R4)', 'Maturity (R6)'],
    majorInsectPests: ['Fall Armyworm (Spodoptera frugiperda)', 'Stem Borer (Chilo partellus)', 'Shoot Fly (Atherigona soccata)'],
    commonDiseases: ['Turcicum Leaf Blight', 'Maydis Leaf Blight', 'Banded Leaf and Sheath Blight'],
    beneficialInsects: ['Trichogramma chilonis', 'Telenomus remus', 'Chrysoperla zastrowi', 'Earwig (Chelisoches morio)'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIMR, OUAT Mayurbhanj / Nabarangpur KVK',
    scoutingMethod: 'Examine 20 consecutive plants in 5 field spots; inspect whorls for pinholes and sawdust-like frass.',
    icon: '🌽'
  },
  {
    id: 'ragi',
    category: 'cereals_millets',
    commonNameEn: 'Finger Millet (Ragi / Mandia)',
    commonNameOr: 'ମାଣ୍ଡିଆ',
    scientificName: 'Eleusine coracana (L.) Gaertn.',
    growthStages: ['Seedling', 'Tillering', 'Stem Elongation', 'Earhead Emergence', 'Grain Dough', 'Harvest'],
    majorInsectPests: ['Ragi Stem Borer (Sesamia inferens)', 'Finger Millet Aphid', 'Grasshopper', 'Earhead Bug'],
    commonDiseases: ['Finger Millet Blast (Pyricularia grisea)', 'Foot Rot', 'Brown Spot'],
    beneficialInsects: ['Coccinellid beetles', 'Syrphid fly larvae', 'Spiders'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'Odisha Millets Mission, OUAT Semiliguda RRTTS Koraput',
    scoutingMethod: 'Sample 50 hills along diagonals; inspect leaf sheaths for bore holes and deadhearts.',
    icon: '🥣'
  },
  {
    id: 'sorghum',
    category: 'cereals_millets',
    commonNameEn: 'Sorghum (Jowar / Juara)',
    commonNameOr: 'ଜୁଆର',
    scientificName: 'Sorghum bicolor (L.) Moench',
    growthStages: ['Emergence', 'Vegetative', 'Panicle Development', 'Flowering', 'Grain Fill', 'Maturity'],
    majorInsectPests: ['Sorghum Shoot Fly', 'Stem Borer', 'Earhead Bug', 'Fall Armyworm'],
    commonDiseases: ['Grain Mold', 'Anthracnose', 'Downy Mildew'],
    beneficialInsects: ['Trichogramma spp.', 'Carabid beetles'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIMR, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect 20 plants across 4 quadrants; record deadheart percentage within 4 weeks of emergence.',
    icon: '🌾'
  },
  {
    id: 'pearl_millet',
    category: 'cereals_millets',
    commonNameEn: 'Pearl Millet (Bajra)',
    commonNameOr: 'ବାଜରା',
    scientificName: 'Pennisetum glaucum (L.) R. Br.',
    growthStages: ['Seedling', 'Vegetative', 'Booting', 'Flowering', 'Grain Filling', 'Maturity'],
    majorInsectPests: ['Shoot Fly', 'Stem Borer', 'Earhead Caterpillar'],
    commonDiseases: ['Downy Mildew (Green Ear Disease)', 'Ergot', 'Rust'],
    beneficialInsects: ['Hoverflies', 'Ladybird beetles', 'Mirid bugs'],
    status: 'STAGED_RESEARCH',
    sourceInstitution: 'Odisha Millets Mission, ICAR-AICRP on Pearl Millet',
    scoutingMethod: 'Scout 50 plants randomly; check central leaves for shot-hole damage.',
    icon: '🌾'
  },
  {
    id: 'foxtail_millet',
    category: 'cereals_millets',
    commonNameEn: 'Foxtail Millet (Kanghu)',
    commonNameOr: 'କାଙ୍ଗୁ',
    scientificName: 'Setaria italica (L.) P. Beauv.',
    growthStages: ['Seedling', 'Tillering', 'Boot Stage', 'Earhead Emergence', 'Maturity'],
    majorInsectPests: ['Shoot Fly', 'Grasshopper', 'Earhead Midge'],
    commonDiseases: ['Blast', 'Brown Leaf Spot', 'Rust'],
    beneficialInsects: ['Braconid parasitoids', 'Spiders'],
    status: 'STAGED_RESEARCH',
    sourceInstitution: 'Odisha Millets Mission, OUAT Tribal Agro-Ecosystems',
    scoutingMethod: 'Visual canopy assessment across 10-meter row transects.',
    icon: '🥣'
  },

  // PULSES
  {
    id: 'green_gram',
    category: 'pulses',
    commonNameEn: 'Green Gram (Moong)',
    commonNameOr: 'ମୁଗ',
    scientificName: 'Vigna radiata (L.) R. Wilczek',
    growthStages: ['Germination', 'Vegetative', 'Branching', 'Flowering', 'Pod Development', 'Maturity'],
    majorInsectPests: ['Pod Borer (Maruca vitrata)', 'Whitefly (Bemisia tabaci - YMV Vector)', 'Aphids', 'Thrips', 'Pod Bug'],
    commonDiseases: ['Yellow Mosaic Virus (YMV)', 'Cercospora Leaf Spot', 'Powdery Mildew'],
    beneficialInsects: ['Ladybird beetles', 'Chrysoperla', 'Spider fauna'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIPR Kanpur, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect 20 plants diagonally; check buds and flowers for webbed frass and thrips count.',
    icon: '🌱'
  },
  {
    id: 'black_gram',
    category: 'pulses',
    commonNameEn: 'Black Gram (Biri)',
    commonNameOr: 'ବିରି',
    scientificName: 'Vigna mungo (L.) Hepper',
    growthStages: ['Germination', 'Vegetative', 'Flowering', 'Podding', 'Ripening'],
    majorInsectPests: ['Spotted Pod Borer (Maruca vitrata)', 'Whitefly', 'Stem Fly (Ophiomyia phaseoli)', 'Bihar Hairy Caterpillar'],
    commonDiseases: ['Yellow Mosaic Virus', 'Root Rot', 'Powdery Mildew'],
    beneficialInsects: ['Trichogrammatoidea', 'Coccinellid predators'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIPR, OUAT Nayagarh / Cuttack KVKs',
    scoutingMethod: 'Examine 30 flowers and young pods for exit holes and live caterpillars.',
    icon: '🌱'
  },
  {
    id: 'pigeon_pea',
    category: 'pulses',
    commonNameEn: 'Pigeon Pea (Arhar / Harada)',
    commonNameOr: 'ହରଡ଼',
    scientificName: 'Cajanus cajan (L.) Millsp.',
    growthStages: ['Vegetative', 'Branching', 'Budding', 'Flowering', 'Pod Formation', 'Pod Maturity'],
    majorInsectPests: ['Gram Pod Borer (Helicoverpa armigera)', 'Pod Fly (Melanagromyza obtusa)', 'Blister Beetle', 'Plume Moth'],
    commonDiseases: ['Fusarium Wilt', 'Sterility Mosaic Disease', 'Phytophthora Blight'],
    beneficialInsects: ['Campoletis chlorideae', 'Bracon hebetor', 'Praying mantis'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIPR, OUAT RRTTS Bhawanipatna (Kalahandi)',
    scoutingMethod: 'Shake 10 random plants over a white sheet; count dislodged larvae at early podding.',
    icon: '🌿'
  },
  {
    id: 'chickpea',
    category: 'pulses',
    commonNameEn: 'Chickpea (Gram / Chana)',
    commonNameOr: 'ଚଣା',
    scientificName: 'Cicer arietinum L.',
    growthStages: ['Seedling', 'Vegetative', 'Flowering', 'Pod Development', 'Maturity'],
    majorInsectPests: ['Helicoverpa armigera (Pod Borer)', 'Cutworm', 'Aphids'],
    commonDiseases: ['Fusarium Wilt', 'Ascochyta Blight', 'Dry Root Rot'],
    beneficialInsects: ['Trichogramma chilonis', 'Campoletis chlorideae', 'Wasps'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIPR, OUAT Western Undulating Zone',
    scoutingMethod: 'Scout 10-meter row samples; count larvae per meter row; ETL is 1 larva/meter row.',
    icon: '🌱'
  },
  {
    id: 'lentil',
    category: 'pulses',
    commonNameEn: 'Lentil (Masoor)',
    commonNameOr: 'ମସୁର ଡାଲି',
    scientificName: 'Lens culinaris Medik.',
    growthStages: ['Vegetative', 'Flowering', 'Pod Filling', 'Maturity'],
    majorInsectPests: ['Aphids (Aphis craccivora)', 'Pod Borer'],
    commonDiseases: ['Rust (Uromyces viciae-fabae)', 'Wilt', 'Collar Rot'],
    beneficialInsects: ['Ladybird beetles', 'Syrphid fly larvae'],
    status: 'STAGED_RESEARCH',
    sourceInstitution: 'ICAR-IIPR, Dept of Agriculture Odisha',
    scoutingMethod: 'Inspect top 10 cm of terminal twigs on 20 plants for aphid colonies.',
    icon: '🌱'
  },
  {
    id: 'cowpea',
    category: 'pulses',
    commonNameEn: 'Cowpea (Jhudunga)',
    commonNameOr: 'ଝୁଡ଼ୁଙ୍ଗ',
    scientificName: 'Vigna unguiculata (L.) Walp.',
    growthStages: ['Vegetative', 'Flowering', 'Pod Extension', 'Maturity'],
    majorInsectPests: ['Pod Borer', 'Aphids', 'Cowpea Weevil', 'Flea Beetle'],
    commonDiseases: ['Anthracnose', 'Cercospora Leaf Spot', 'Cowpea Mosaic'],
    beneficialInsects: ['Predatory pentatomid bugs', 'Coccinellids'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'OUAT Bhubaneswar & KVK Pipili',
    scoutingMethod: 'Inspect 25 leaves and 25 pods across 5 canopy sections.',
    icon: '🌱'
  },
  {
    id: 'pulses',
    category: 'pulses',
    commonNameEn: 'General Pulses (Generic)',
    commonNameOr: 'ସାଧାରଣ ଡାଲି ଜାତୀୟ ଫସଲ',
    scientificName: 'Leguminosae family',
    growthStages: ['Vegetative', 'Flowering', 'Pod Stage', 'Maturity'],
    majorInsectPests: ['Pod Borer (Maruca / Helicoverpa)', 'Whitefly', 'Thrips'],
    commonDiseases: ['Yellow Mosaic', 'Powdery Mildew'],
    beneficialInsects: ['Spiders', 'Ladybird beetles'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'OUAT, ICAR-IIPR',
    scoutingMethod: 'Standard pulse field scouting procedure.',
    icon: '🌱'
  },

  // OILSEEDS
  {
    id: 'groundnut',
    category: 'oilseeds',
    commonNameEn: 'Groundnut (Peanut / Chinabadama)',
    commonNameOr: 'ଚିନାବାଦାମ',
    scientificName: 'Arachis hypogaea L.',
    growthStages: ['Emergence', 'Vegetative', 'Flowering', 'Pegging', 'Pod Addition', 'Maturity'],
    majorInsectPests: ['Groundnut Leaf Miner (Aproaerema modicella)', 'Tobacco Caterpillar (Spodoptera litura)', 'Thrips', 'White Grub'],
    commonDiseases: ['Tikka Disease (Early & Late Leaf Spot)', 'Rust', 'Collar Rot'],
    beneficialInsects: ['Chelonus formosanus', 'Bracon hebetor', 'Ground beetles (Carabids)'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-DGR Junagadh, OUAT RRTTS Chiplima (Sambalpur)',
    scoutingMethod: 'Inspect 20 plants; observe leaf folding/mines; ETL is 5 active larvae per plant.',
    icon: '🥜'
  },
  {
    id: 'mustard',
    category: 'oilseeds',
    commonNameEn: 'Mustard / Rapeseed (Sorisa)',
    commonNameOr: 'ସୋରିଷ',
    scientificName: 'Brassica juncea (L.) Czern.',
    growthStages: ['Seedling', 'Rosette', 'Bolting', 'Flowering', 'Podding / Siliqua', 'Maturity'],
    majorInsectPests: ['Mustard Aphid (Lipaphis erysimi)', 'Mustard Sawfly (Athalia lugens)', 'Painted Bug'],
    commonDiseases: ['Alternaria Blight', 'White Rust (Albugo candida)', 'Downy Mildew'],
    beneficialInsects: ['Diaeretiella rapae (Aphid parasitoid)', 'Coccinella septempunctata'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-DRMR Bharatpur, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect 10 cm central twig of 20 plants; ETL is 20-25 aphids per twig or 30% infested plants.',
    icon: '🌾'
  },
  {
    id: 'sesame',
    category: 'oilseeds',
    commonNameEn: 'Sesame (Gingelly / Rasi)',
    commonNameOr: 'ରାଶି',
    scientificName: 'Sesamum indicum L.',
    growthStages: ['Seedling', 'Vegetative', 'Flowering', 'Capsule Formation', 'Harvest'],
    majorInsectPests: ['Sesame Shoot and Leaf Webbed Caterpillar (Antigastra catalaunalis)', 'Gall Fly', 'Sphinx Moth'],
    commonDiseases: ['Phyllody (Phytoplasma transmitted by leafhopper)', 'Bacterial Leaf Spot'],
    beneficialInsects: ['Trichogramma spp.', 'Green lacewing larvae'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIOR, OUAT Regional Station Bhawanipatna',
    scoutingMethod: 'Inspect 20 terminals for webbed leaves and bored capsules.',
    icon: '🌱'
  },
  {
    id: 'sunflower',
    category: 'oilseeds',
    commonNameEn: 'Sunflower (Surjamukhi)',
    commonNameOr: 'ସୂର୍ଯ୍ୟମୁଖୀ',
    scientificName: 'Helianthus annuus L.',
    growthStages: ['Seedling', 'Vegetative', 'Star Bud', 'Flowering', 'Seed Development', 'Physiological Maturity'],
    majorInsectPests: ['Head Borer (Helicoverpa armigera)', 'Leaf Eating Caterpillar', 'Capitulum Thrips'],
    commonDiseases: ['Alternaria Leaf Spot', 'Sunflower Necrosis Virus', 'Rust'],
    beneficialInsects: ['Honeybees (critical pollinators)', 'Syrphid flies'],
    status: 'STAGED_RESEARCH',
    sourceInstitution: 'ICAR-IIOR, OUAT Bhubaneswar',
    scoutingMethod: 'Check 20 flower heads during ray floret opening for head borer larvae.',
    icon: '🌻'
  },
  {
    id: 'niger',
    category: 'oilseeds',
    commonNameEn: 'Niger (Alasi)',
    commonNameOr: 'ଅଳସୀ',
    scientificName: 'Guizotia abyssinica (L.f.) Cass.',
    growthStages: ['Seedling', 'Vegetative', 'Flowering', 'Seed Formation', 'Maturity'],
    majorInsectPests: ['Niger Caterpillar (Perigea capensis)', 'Semilooper', 'Capsule Borer'],
    commonDiseases: ['Alternaria Blight', 'Cercospora Leaf Spot'],
    beneficialInsects: ['Apis cerana indica', 'Carabid beetles'],
    status: 'STAGED_RESEARCH',
    sourceInstitution: 'OUAT Tribal Agro-Ecosystems (Koraput & Rayagada KVKs)',
    scoutingMethod: 'Random sampling across 5 spots in tribal slope terraces.',
    icon: '🌼'
  },

  // VEGETABLES
  {
    id: 'tomato',
    category: 'vegetables',
    commonNameEn: 'Tomato (Bilati Baigana)',
    commonNameOr: 'ବିଲାତି ବାଇଗଣ / ଟମାଟୋ',
    scientificName: 'Solanum lycopersicum L.',
    growthStages: ['Nursery', 'Vegetative', 'Flowering', 'Fruit Set', 'Fruiting / Ripening', 'Harvest'],
    majorInsectPests: ['Fruit Borer (Helicoverpa armigera)', 'Tomato Pinworm (Tuta absoluta)', 'Whitefly (Bemisia tabaci - TYLCV Vector)', 'Serpentine Leafminer (Liriomyza trifolii)'],
    commonDiseases: ['Early Blight (Alternaria solani)', 'Late Blight (Phytophthora infestans)', 'Tomato Leaf Curl Virus (ToLCV)', 'Bacterial Wilt'],
    beneficialInsects: ['Nesidiocoris tenuis (Mirid bug)', 'Trichogramma pretiosum', 'Chrysoperla carnea'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIHR Bengaluru, OUAT Dept of Vegetable Science',
    scoutingMethod: 'Scout 20 plants weekly; check underside of young leaves for whiteflies and fruits for pinhead borer holes.',
    icon: '🍅'
  },
  {
    id: 'brinjal',
    category: 'vegetables',
    commonNameEn: 'Brinjal (Eggplant / Baigana)',
    commonNameOr: 'ବାଇଗଣ',
    scientificName: 'Solanum melongena L.',
    growthStages: ['Nursery', 'Transplanting / Early Vegetative', 'Flowering', 'Fruit Extension', 'Harvest'],
    majorInsectPests: ['Shoot and Fruit Borer (Leucinodes orbonalis)', 'Hadda Beetle (Epilachna vigintioctopunctata)', 'Epilachna Beetle', 'Jassids / Leafhopper'],
    commonDiseases: ['Phomopsis Blight', 'Little Leaf of Brinjal (Phytoplasma)', 'Bacterial Wilt'],
    beneficialInsects: ['Trathala flavo-orbitalis (Ichneumonid parasite)', 'Spiders', 'Predatory bugs'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIHR, OUAT Bhubaneswar',
    scoutingMethod: 'Examine 20 plants; record percentage of wilted terminal shoots and bored fruits; ETL is 5% damaged shoots/fruits.',
    icon: '🍆'
  },
  {
    id: 'chilli',
    category: 'vegetables',
    commonNameEn: 'Chilli (Lanka)',
    commonNameOr: 'ଲଙ୍କା',
    scientificName: 'Capsicum annuum L.',
    growthStages: ['Nursery', 'Vegetative', 'Flowering', 'Fruit Formation', 'Green / Red Pods'],
    majorInsectPests: ['Black Thrips (Thrips parvispinus)', 'Chilli Thrips (Scirtothrips dorsalis)', 'Yellow Mite (Polyphagotarsonemus latus)', 'Fruit Borer (Spodoptera litura)'],
    commonDiseases: ['Anthracnose / Dieback (Colletotrichum capsici)', 'Chilli Leaf Curl Virus', 'Powdery Mildew'],
    beneficialInsects: ['Amblyseius swirskii (Predatory mite)', 'Anthocoris bugs', 'Ladybirds'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIHR, OUAT Kuchinda / Sambalpur KVK',
    scoutingMethod: 'Tap 5 terminal flower shoots over white paper; count thrips; observe upward leaf curling (thrips) vs downward curling (mites).',
    icon: '🌶️'
  },
  {
    id: 'okra',
    category: 'vegetables',
    commonNameEn: 'Okra / Ladyfinger (Bhendi)',
    commonNameOr: 'ଭେଣ୍ଡି',
    scientificName: 'Abelmoschus esculentus (L.) Moench',
    growthStages: ['Germination', 'Vegetative', 'Flowering', 'Fruit Podding', 'Picking'],
    majorInsectPests: ['Shoot and Fruit Borer (Earias vittella)', 'Whitefly (YVMV Vector)', 'Leafhopper (Amrasca biguttula biguttula)', 'Aphids'],
    commonDiseases: ['Yellow Vein Mosaic Virus (YVMV)', 'Enation Leaf Curl Virus', 'Powdery Mildew'],
    beneficialInsects: ['Campoletis chlorideae', 'Cheilomenes sexmaculata'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIVR Varanasi, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect 20 plants; record dead top shoots and borer entrance holes plugged with excreta in fruits.',
    icon: '🥬'
  },
  {
    id: 'cabbage',
    category: 'vegetables',
    commonNameEn: 'Cabbage (Bandha Kobi)',
    commonNameOr: 'ବନ୍ଧା କୋବି',
    scientificName: 'Brassica oleracea var. capitata L.',
    growthStages: ['Nursery', 'Vegetative', 'Cupping / Head Formation', 'Head Firming', 'Harvest'],
    majorInsectPests: ['Diamondback Moth (Plutella xylostella)', 'Tobacco Caterpillar (Spodoptera litura)', 'Cabbage Aphid (Brevicoryne brassicae)', 'Cabbage Butterfly (Pieris brassicae)'],
    commonDiseases: ['Black Rot (Xanthomonas campestris)', 'Clubroot', 'Alternaria Leaf Spot'],
    beneficialInsects: ['Diadegma semiclausum (DBM parasitoid)', 'Cotesia plutellae', 'Syrphid fly'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIVR, OUAT Vegetable Clusters Ganjam & Dhenkanal',
    scoutingMethod: 'Examine 20 cabbage plants; inspect inner folds for DBM larvae; ETL is 2 larvae per plant.',
    icon: '🥬'
  },
  {
    id: 'cauliflower',
    category: 'vegetables',
    commonNameEn: 'Cauliflower (Phula Kobi)',
    commonNameOr: 'ଫୁଲ କୋବି',
    scientificName: 'Brassica oleracea var. botrytis L.',
    growthStages: ['Nursery', 'Vegetative', 'Curd Initiation', 'Curd Development', 'Harvest'],
    majorInsectPests: ['Diamondback Moth', 'Spodoptera litura', 'Mustard Sawfly', 'Aphids'],
    commonDiseases: ['Downy Mildew', 'Damping Off', 'Black Rot', 'Whiptail (Molybdenum deficiency)'],
    beneficialInsects: ['Braconids', 'Chrysopids'],
    status: 'FULL_VALIDATED',
    sourceInstitution: 'ICAR-IIVR, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect 20 curds and underleaf surfaces for larval feeding holes.',
    icon: '🥦'
  },
  {
    id: 'bitter_gourd',
    category: 'vegetables',
    commonNameEn: 'Bitter Gourd (Kalara)',
    commonNameOr: 'କଲରା',
    scientificName: 'Momordica charantia L.',
    growthStages: ['Germination', 'Trailing / Trellis Growth', 'Flowering', 'Fruit Setting', 'Harvest'],
    majorInsectPests: ['Melon Fruit Fly (Bactrocera cucurbitae)', 'Red Pumpkin Beetle (Aulacophora foveicollis)', 'Epilachna Beetle'],
    commonDiseases: ['Downy Mildew (Pseudoperonospora cubensis)', 'Powdery Mildew', 'Mosaic Virus'],
    beneficialInsects: ['Opius fletcheri (Fruit fly parasitoid)', 'Spiders'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'OUAT Dept of Horticulture, ICAR-CHS Bhubaneswar',
    scoutingMethod: 'Set up cue-lure pheromone traps (16 traps/acre); count punctures and resinous oozing on young gourds.',
    icon: '🥒'
  },
  {
    id: 'bottle_gourd',
    category: 'vegetables',
    commonNameEn: 'Bottle Gourd (Lau)',
    commonNameOr: 'ଲାଉ',
    scientificName: 'Lagenaria siceraria (Molina) Standl.',
    growthStages: ['Seedling', 'Vine Elongation', 'Flowering', 'Fruiting', 'Harvest'],
    majorInsectPests: ['Melon Fruit Fly', 'Pumpkin Beetle', 'Aphids'],
    commonDiseases: ['Anthracnose', 'Downy Mildew', 'Collar Rot'],
    beneficialInsects: ['Predatory mites', 'Ladybird beetles'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'OUAT Bhubaneswar & Puri Coastal KVK',
    scoutingMethod: 'Visual inspection of vines and fruit skins for oviposition marks.',
    icon: '🥒'
  },
  {
    id: 'pointed_gourd',
    category: 'vegetables',
    commonNameEn: 'Pointed Gourd (Potala)',
    commonNameOr: 'ପୋଟଳ',
    scientificName: 'Trichosanthes dioica Roxb.',
    growthStages: ['Vegetative Vine Extension', 'Flowering', 'Fruit Swelling', 'Multi-Picking Phase'],
    majorInsectPests: ['Fruit Fly (Bactrocera cucurbitae)', 'Vine Borer (Melittia eurytion)', 'Root-Knot Nematode'],
    commonDiseases: ['Downy Mildew', 'Fruit Rot (Phytophthora)', 'Collar Rot'],
    beneficialInsects: ['Spiders', 'Carabids'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'OUAT RRTTS Ranital (Bhadrak), Coastal Alluvial Plains',
    scoutingMethod: 'Inspect 25 vines; check base of vines for swelling or gum exudation from vine borers.',
    icon: '🥒'
  },
  {
    id: 'onion',
    category: 'vegetables',
    commonNameEn: 'Onion (Piaja)',
    commonNameOr: 'ପିଆଜ',
    scientificName: 'Allium cepa L.',
    growthStages: ['Seedling', 'Vegetative Bulb Initiation', 'Bulb Swelling', 'Maturity / Neck Fall'],
    majorInsectPests: ['Onion Thrips (Thrips tabaci)', 'Spodoptera exigua (Beet Armyworm)', 'Maggot'],
    commonDiseases: ['Purple Blotch (Alternaria porri)', 'Stemphylium Blight', 'Basal Rot'],
    beneficialInsects: ['Orius bugs (Minute pirate bug)', 'Aeolothrips'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-DOGR Rajgurunagar, OUAT Bolangir / Kalahandi Onion Hubs',
    scoutingMethod: 'Part the neck leaves of 20 plants; count thrips in the sheath axis; ETL is 30 thrips/plant.',
    icon: '🧅'
  },
  {
    id: 'potato',
    category: 'vegetables',
    commonNameEn: 'Potato (Alu)',
    commonNameOr: 'ଆଳୁ',
    scientificName: 'Solanum tuberosum L.',
    growthStages: ['Sprouting', 'Vegetative', 'Tuber Initiation', 'Tuber Bulking', 'Senescence'],
    majorInsectPests: ['Potato Tuber Moth (Phthorimaea operculella)', 'Aphids (Myzus persicae - Virus Vector)', 'Cutworm'],
    commonDiseases: ['Late Blight (Phytophthora infestans)', 'Early Blight', 'Bacterial Wilt'],
    beneficialInsects: ['Coccinellids', 'Parasitic wasps'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-CPRI Shimla, OUAT Koraput Plateau & Cuttack',
    scoutingMethod: 'Inspect 20 plants across field; count aphids on 100 compound leaves (upper, middle, lower).',
    icon: '🥔'
  },

  // FRUITS & HORTICULTURE
  {
    id: 'mango',
    category: 'fruits_horticulture',
    commonNameEn: 'Mango (Amba)',
    commonNameOr: 'ଆମ୍ବ',
    scientificName: 'Mangifera indica L.',
    growthStages: ['Vegetative Flush', 'Panicle Emergence', 'Flowering', 'Fruit Set (Pea/Marble Size)', 'Fruit Maturity'],
    majorInsectPests: ['Mango Hopper (Idioscopus clypealis & I. niveosparsus)', 'Fruit Fly (Bactrocera dorsalis)', 'Stem Borer (Batocera rufomaculata)', 'Bark Eating Caterpillar'],
    commonDiseases: ['Powdery Mildew (Oidium mangiferae)', 'Anthracnose (Colletotrichum gloeosporioides)', 'Sooty Mold'],
    beneficialInsects: ['Mallada boninensis (Green lacewing)', 'Spiders', 'Predatory wasps'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-CISH Lucknow, OUAT Dept of Fruit Science & Rayagada KVK',
    scoutingMethod: 'Examine 20 panicles across orchard; tap panicle over hand; ETL is 5 hoppers per panicle at flowering.',
    icon: '🥭'
  },
  {
    id: 'banana',
    category: 'fruits_horticulture',
    commonNameEn: 'Banana (Kadali)',
    commonNameOr: 'କଦଳୀ',
    scientificName: 'Musa acuminata Colla / Musa paradisiaca',
    growthStages: ['Shooting / Sucker Stage', 'Vegetative', 'Inflorescence Emergence', 'Bunch Development', 'Harvest'],
    majorInsectPests: ['Pseudostem Weevil (Odoiporus longicollis)', 'Banana Rhizome Weevil (Cosmopolites sordidus)', 'Banana Aphid (Pentalonia nigronervosa - Bunchy Top Vector)'],
    commonDiseases: ['Panama Wilt (Fusarium oxysporum f. sp. cubense)', 'Sigatoka Leaf Spot', 'Banana Bunchy Top Virus (BBTV)'],
    beneficialInsects: ['Beauveria bassiana (entomopathogenic fungus)', 'Earwigs'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-NRCB Tiruchirappalli, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect pseudostem for pinhead exudation of jelly-like transparent sap indicating weevil entry.',
    icon: '🍌'
  },
  {
    id: 'papaya',
    category: 'fruits_horticulture',
    commonNameEn: 'Papaya (Amrutabhanda)',
    commonNameOr: 'ଅମୃତଭଣ୍ଡା',
    scientificName: 'Carica papaya L.',
    growthStages: ['Seedling', 'Vegetative Extension', 'Flowering / Sex Expression', 'Fruit Set', 'Fruit Ripening'],
    majorInsectPests: ['Papaya Mealybug (Paracoccus marginatus)', 'Red Spider Mite', 'Aphids (PRSV Vectors)'],
    commonDiseases: ['Papaya Ring Spot Virus (PRSV)', 'Foot Rot / Stem Rot (Pythium aphanidermatum)', 'Anthracnose'],
    beneficialInsects: ['Acerophagus papayae (Encyrtid parasitoid - classical biocontrol)', 'Ladybirds'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-IIHR, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect terminal shoots, leaf undersides, and fruit crevices for white waxy mealybug colonies.',
    icon: '🍈'
  },
  {
    id: 'guava',
    category: 'fruits_horticulture',
    commonNameEn: 'Guava (Pijuli)',
    commonNameOr: 'ପିଜୁଳି',
    scientificName: 'Psidium guajava L.',
    growthStages: ['Vegetative Flush', 'Flower Bud', 'Flowering', 'Fruit Development', 'Ripening'],
    majorInsectPests: ['Fruit Fly (Bactrocera correcta)', 'Tea Mosquito Bug (Helopeltis antonii)', 'Mealybug', 'Bark Borer'],
    commonDiseases: ['Guava Wilt (Fusarium oxysporum f. sp. psidii)', 'Anthracnose', 'Fruit Canker'],
    beneficialInsects: ['Green lacewings', 'Spiders'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-CISH, OUAT Horticultural Research Station',
    scoutingMethod: 'Check 20 developing fruits for rusty scab-like punctures caused by tea mosquito bug.',
    icon: '🍏'
  },
  {
    id: 'citrus',
    category: 'fruits_horticulture',
    commonNameEn: 'Citrus / Lemon (Lembu)',
    commonNameOr: 'ଲେମ୍ବୁ',
    scientificName: 'Citrus aurantiifolia (Christm.) Swingle',
    growthStages: ['New Flush', 'Flowering', 'Fruitlet Set', 'Fruit Enlargement', 'Harvest'],
    majorInsectPests: ['Citrus Asian Psyllid (Diaphorina citri - Huanglongbing Vector)', 'Citrus Leaf Miner (Phyllocnistis citrella)', 'Citrus Butterfly (Papilio demoleus)', 'Scale Insects'],
    commonDiseases: ['Citrus Canker (Xanthomonas citri)', 'Citrus Greening / Huanglongbing (HLB)', 'Gummosis (Phytophthora)'],
    beneficialInsects: ['Tamarixia radiata (Psyllid parasitoid)', 'Syrphid fly larvae'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-CCRI Nagpur, OUAT Bhubaneswar',
    scoutingMethod: 'Inspect fresh new leaf flushes for silvery serpentine mines and psyllids sitting at 45-degree angle.',
    icon: '🍋'
  },
  {
    id: 'coconut',
    category: 'fruits_horticulture',
    commonNameEn: 'Coconut (Nadia)',
    commonNameOr: 'ନଡ଼ିଆ',
    scientificName: 'Cocos nucifera L.',
    growthStages: ['Seedling', 'Crown Formation', 'Inflorescence Emergence', 'Button Shedding / Nut Development', 'Maturity'],
    majorInsectPests: ['Rhinoceros Beetle (Oryctes rhinoceros)', 'Red Palm Weevil (Rhynchophorus ferrugineus)', 'Black Headed Caterpillar (Opisina arenosella)', 'Coconut Eriophyid Mite (Aceria guerreronis)'],
    commonDiseases: ['Bud Rot (Phytophthora palmivora)', 'Stem Bleeding', 'Tanjore Wilt / Basal Stem Rot'],
    beneficialInsects: ['Goniozus nephantidis', 'Bracon brevicornis', 'Baculovirus oryctes (Biocontrol agent)'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-CPCRI Kasaragod, OUAT Coconut Research Station Sakhigopal (Puri)',
    scoutingMethod: 'Inspect central crown fronds for geometric V-shaped cuts from Rhinoceros beetle; check button nuts for triangular yellow patches (eriophyid mite).',
    icon: '🥥'
  },
  {
    id: 'cashew',
    category: 'fruits_horticulture',
    commonNameEn: 'Cashew (Kaju)',
    commonNameOr: 'କାଜୁ',
    scientificName: 'Anacardium occidentale L.',
    growthStages: ['Vegetative Flush', 'Panicle Emergence', 'Flowering', 'Nut and Apple Formation', 'Harvest'],
    majorInsectPests: ['Tea Mosquito Bug (Helopeltis antonii)', 'Cashew Stem and Root Borer (Plocaederus ferrugineus)', 'Apple and Nut Borer (Thylocoptila panrosema)'],
    commonDiseases: ['Dieback / Pink Disease', 'Anthracnose', 'Inflorescence Blight'],
    beneficialInsects: ['Oecophylla smaragdina (Weaver Ant)', 'Chrysocharis spp.'],
    status: 'SUPERVISED_FIELD_PILOT',
    sourceInstitution: 'ICAR-DCR Puttur, OUAT Directorate of Cashew Research Bhubaneswar',
    scoutingMethod: 'Scout 52 leader shoots on 20 trees; look for resinous exudation on fresh flushes and cashew apples.',
    icon: '🥜'
  }
];

export function getCropById(cropId: CropId | string): CropInfo | undefined {
  return SUPPORTED_CROPS.find(c => c.id === cropId);
}

export function getCropsByCategory(category: string): CropInfo[] {
  if (category === 'all') return SUPPORTED_CROPS;
  return SUPPORTED_CROPS.filter(c => c.category === category);
}
