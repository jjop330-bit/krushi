import { PestKnowledge, PestId } from '../types/pest';

export const PEST_KNOWLEDGE_BASE: Record<PestId, PestKnowledge> = {
  bph: {
    id: 'bph',
    commonNameEn: 'Brown Planthopper (BPH)',
    commonNameOr: 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ',
    scientificName: 'Nilaparvata lugens (Stål)',
    localOdishaName: 'ମାଟିଆ ଗୁଣ୍ଡି ପୋକ / ହଳଦିଆ ଗୁଣ୍ଡି',
    hostCrops: ['Paddy (Oryza sativa)'],
    affectedPlantParts: ['Stem base', 'Lower tillers', 'Leaf sheath'],
    keySymptomsEn: [
      'Both nymphs and adults gather at the base of the rice plant and suck sap from tillers.',
      'Leaves turn yellow, dry out, and turn brown, creating circular drying patches.',
      'Extensive severe infestation causes "Hopperburn" where circular patches look scorched/burnt.',
      'Honeydew excreted by planthoppers encourages black sooty mold growth at plant bases.'
    ],
    keySymptomsOr: [
      'ଶିଶୁ ଓ ବୟସ୍କ ପୋକ ଧାନ ଗଛର ମୂଳରେ ରହି ରସ ଶୋଷିନିଅନ୍ତି।',
      'ପତ୍ର ହଳଦିଆ ପଡ଼ି ଶୁଖିଯାଏ ଏବଂ କ୍ରମେ ମାଟିଆ ରଙ୍ଗ ହୋଇଯାଏ।',
      'ଅତ୍ୟଧିକ ଆକ୍ରମଣ ଯୋଗୁଁ କ୍ଷେତରେ ଗୋଲାକାର ଭାବେ ଗଛ ପୋଡ଼ିଗଲା ଭଳି ଦିଶେ (ହପରବର୍ନ)।',
      'ପୋକରୁ ନିର୍ଗତ ମିଠା ଅଠାଳିଆ ପଦାର୍ଥ ଯୋଗୁଁ ଗଛ ମୂଳରେ କଳା ଫିମ୍ପି ଜମେ।'
    ],
    potentialDamagePercent: '40% - 100% (Hopperburn can result in complete crop failure if unmanaged)',
    conditionsFavoringEn: [
      'High relative humidity (80% - 90%) and temperatures between 28°C - 32°C.',
      'Dense planting with narrow spacing and stagnant field water.',
      'Excessive and un-split application of nitrogenous fertilizers (Urea).',
      'Indiscriminate early spraying of synthetic pyrethroids killing natural predators.'
    ],
    conditionsFavoringOr: [
      'ଅତ୍ୟଧିକ ବାୟୁମଣ୍ଡଳୀୟ ଆର୍ଦ୍ରତା (୮୦% - ୯୦%) ଏବଂ ତାପମାତ୍ରା ୨୮°C ରୁ ୩୨°C।',
      'ଅତ୍ୟଧିକ ଘଞ୍ଚ ଧାନ ରୋପଣ ଏବଂ କ୍ଷେତରେ ଲଗାତାର ପାଣି ଜମି ରହିବା।',
      'ମାତ୍ରାଧିକ ୟୁରିଆ (ଯବକ୍ଷାରଜାନ) ସାରର ଅଣ-ନିୟନ୍ତ୍ରିତ ପ୍ରୟୋଗ।',
      'ପ୍ରାରମ୍ଭିକ ପର୍ଯ୍ୟାୟରେ ଅଯଥା ବିଷାକ୍ତ କୀଟନାଶକ ପ୍ରୟୋଗ ଯୋଗୁଁ ବନ୍ଧୁ କୀଟଙ୍କ ବିନାଶ।'
    ],
    economicThresholdLevelEn: '5 to 10 planthoppers per hill during vegetative stage; 15 to 20 per hill during reproductive stage.',
    economicThresholdLevelOr: 'ଗଛ ବୃଦ୍ଧି ସମୟରେ ଗୋଟିଏ ଗଛରେ ୫-୧୦ଟି ପୋକ; ଫୁଲ/ଶିଁଷା ସମୟରେ ଗଛ ପ୍ରତି ୧୫-୨୦ଟି ପୋକ।',
    immediateNextStepsEn: [
      'Drain standing water from the field for 3-4 days (Alternate Wetting and Drying).',
      'Create 30 cm alleyways (pathways) every 2 meters to allow sunlight and aeration.',
      'Stop applying synthetic nitrogen/urea fertilizer immediately.',
      'Count live hoppers per hill at 10 random spots before taking any chemical decision.'
    ],
    immediateNextStepsOr: [
      'କ୍ଷେତରୁ ଜମିଥିବା ପାଣି ୩-୪ ଦିନ ପାଇଁ ବାହାର କରି କ୍ଷେତକୁ ଶୁଖିବାକୁ ଦିଅନ୍ତୁ।',
      'ସୂର୍ଯ୍ୟକିରଣ ଓ ପବନ ଚଳାଚଳ ପାଇଁ ପ୍ରତି ୨ ମିଟରରେ ୩୦ ସେମି ବାଟ ଛାଡ଼ନ୍ତୁ (ଆଲି ସ୍ପେସିଂ)।',
      'ୟୁରିଆ ସାର ପ୍ରୟୋଗ ତୁରନ୍ତ ବନ୍ଦ କରନ୍ତୁ।',
      'କୌଣସି ଔଷଧ ସିଞ୍ଚନ ପୂର୍ବରୁ ଗଛ ମୂଳ ପରୀକ୍ଷା କରି ପୋକ ସଂଖ୍ୟା ଯାଞ୍ଚ କରନ୍ତୁ।'
    ],
    preventiveMeasuresEn: [
      'Adopt recommended spacing of 20 x 15 cm during transplanting.',
      'Plant resistant/tolerant varieties (e.g., Hasanta, Lalat, Pratikhya in Odisha).',
      'Practice Alternate Wetting and Drying (AWD) water management.',
      'Conserve natural enemies like wolf spiders and mirid bugs.'
    ],
    preventiveMeasuresOr: [
      'ରୋଇବା ସମୟରେ ସଠିକ ଦୂରତା (୨୦ x ୧୫ ସେ.ମି.) ରଖନ୍ତୁ।',
      'ରୋଗ-ପୋକ ସହଣୀୟ କିସମ (ହସନ୍ତା, ଲଲାଟ, ପ୍ରତୀକ୍ଷା) ଚୟନ କରନ୍ତୁ।',
      'କ୍ଷେତରେ ସର୍ବଦା ପାଣି ନ ବାନ୍ଧି ପର୍ଯ୍ୟାୟକ୍ରମେ ଓଦା-ଶୁଖିଲା (AWD) ପଦ୍ଧତି ଆପଣାନ୍ତୁ।',
      'ବନ୍ଧୁ ପୋକ ଯଥା ବୁଢ଼ିଆଣୀ ଓ ମିରିଡ୍ ବଗ୍‌ଙ୍କ ସଂରକ୍ଷଣ କରନ୍ତୁ।'
    ],
    biologicalControl: [
      {
        titleEn: 'Conservation of Wolf Spiders (Lycosa pseudoannulata)',
        titleOr: 'ବନ୍ଧୁ ବୁଢ଼ିଆଣୀଙ୍କ ସଂରକ୍ଷଣ',
        descriptionEn: 'A single wolf spider consumes 15 to 25 planthoppers per day. Avoid early synthetic insecticide sprays to preserve spider populations.',
        descriptionOr: 'ଗୋଟିଏ ବୁଢ଼ିଆଣୀ ଦିନକୁ ୧୫ ରୁ ୨୫ଟି ଗୁଣ୍ଡି ପୋକ ଖାଇଥାଏ। ତେଣୁ ଆରମ୍ଭରୁ ବିଷାକ୍ତ କୀଟନାଶକ ସିଞ୍ଚନ ନ କରି ଏମାନଙ୍କୁ ବଞ୍ଚାନ୍ତୁ।',
        category: 'predator',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Nymphs and Adults'
      },
      {
        titleEn: 'Mirid Bug (Cyrtorhinus lividipennis)',
        titleOr: 'ମିରିଡ୍ ବଗ୍ (ଅଣ୍ଡାଭକ୍ଷୀ କୀଟ)',
        descriptionEn: 'Predates heavily on BPH egg batches and young nymphs at the base of rice stems.',
        descriptionOr: 'ଧାନ ଗଛ ମୂଳରେ ଥିବା ଗୁଣ୍ଡି ପୋକର ଅଣ୍ଡା ଓ ଛୋଟ ପିଲାଙ୍କୁ ଖାଇ ନଷ୍ଟ କରେ।',
        category: 'predator',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Eggs & 1st-2nd Instar Nymphs'
      },
      {
        titleEn: 'Beauveria bassiana Biopesticide',
        titleOr: 'ବିଭେରିଆ ବାସିଆନା ଜୈବିକ କବକ',
        descriptionEn: 'Spray microbial suspension of Beauveria bassiana @ 5 g/litre or 1 kg/acre directed towards the base of plants during humid morning/evening hours.',
        descriptionOr: 'ପ୍ରତି ଲିଟର ପାଣିରେ ୫ ଗ୍ରାମ ବିଭେରିଆ ବାସିଆନା ମିଶାଇ ଗଛ ମୂଳକୁ ସିଞ୍ଚନ କରନ୍ତୁ।',
        category: 'biopesticide',
        safetyRating: 'Targeted Biological',
        targetStage: 'Nymphs and Adult hoppers'
      }
    ],
    culturalControl: [
      {
        titleEn: 'Alternate Wetting and Drying (AWD)',
        titleOr: 'ପର୍ଯ୍ୟାୟକ୍ରମେ କ୍ଷେତ ଶୁଖାଇବା ଓ ପାଣି ଦେବା',
        descriptionEn: 'Drain water for 3 to 4 days until the soil develops fine hairline cracks, then irrigate lightly. Reduces humidity at plant base by 25%.',
        descriptionOr: 'କ୍ଷେତରୁ ପାଣି କାଢ଼ି ୩-୪ ଦିନ ଶୁଖାନ୍ତୁ ଯେପରି ମାଟିରେ ସାମାନ୍ୟ ଫାଟ ଦେଖାଦେବ। ଏହାଦ୍ୱାରା ପୋକ ବଂଶବୃଦ୍ଧି ରୋକାଯାଇପାରିବ।',
        actionTiming: 'At first sign of pest buildup'
      },
      {
        titleEn: 'Formation of Alleyways (Pathways)',
        titleOr: 'କ୍ଷେତରେ ବାଟ ଛାଡ଼ିବା (ଆଲି ସ୍ପେସିଂ)',
        descriptionEn: 'Skip one row every 2 meters (create a 30 cm pathway). Promotes aeration, sunlight penetration, and simplifies targeted spraying.',
        descriptionOr: 'କ୍ଷେତରେ ପ୍ରତି ୨ ମିଟରରେ ଗୋଟିଏ ଧାଡ଼ି (୩୦ ସେଣ୍ଟିମିଟର) ଛାଡ଼ି ବାଟ କରନ୍ତୁ, ଯାହାଫଳରେ ଖରା-ପବନ ଲାଗିବ।',
        actionTiming: 'During transplanting or early tillering'
      }
    ],
    chemicalControl: [
      {
        activeIngredient: 'Triflumezopyrim 10% SC',
        tradeNames: ['Pexalon'],
        dosagePerAcre: '94 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 21,
        cibrcRegistered: true,
        toxicityClass: 'Blue (Moderately Toxic)',
        safetyPrecautionsEn: 'Wear protective goggles, nitrile gloves, and mask. Direct nozzle toward the base of the rice plants, not onto upper leaf canopy. Never spray against wind.',
        safetyPrecautionsOr: 'ମୁହଁରେ ମାସ୍କ ଏବଂ ହାତରେ ଗ୍ଲୋଭ୍ସ ପିନ୍ଧନ୍ତୁ। ସ୍ପ୍ରେ ନୋଜଲ୍ ଗଛ ମୂଳକୁ ରଖି ସିଞ୍ଚନ କରନ୍ତୁ। ପବନର ବିପରୀତ ଦିଗରେ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
        waterSprayInstructions: 'Calibrate hollow cone nozzle for high-volume coarse droplet delivery directly at stem bases.'
      },
      {
        activeIngredient: 'Pymetrozine 50% WG',
        tradeNames: ['Chess', 'Token'],
        dosagePerAcre: '120 grams in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 19,
        cibrcRegistered: true,
        toxicityClass: 'Green (Slightly Toxic)',
        safetyPrecautionsEn: 'Rapidly causes irreversible feeding cessation in sucking insects. Keep livestock away from treated fields for 48 hours.',
        safetyPrecautionsOr: 'ଔଷଧ ପଡ଼ିବାର କିଛି ଘଣ୍ଟା ମଧ୍ୟରେ ପୋକ ଖାଇବା ବନ୍ଦ କରିଦିଏ। ଗୃହପାଳିତ ପଶୁଙ୍କୁ ୪୮ ଘଣ୍ଟା କ୍ଷେତରୁ ଦୂରେଇ ରଖନ୍ତୁ।',
        waterSprayInstructions: 'Dissolve thoroughly in small volume first, then dilute into full 200 L tank.'
      }
    ],
    expertConsultationCriteriaEn: [
      'If hopper count exceeds 25 insects per hill despite AWD.',
      'If circular yellowing patches (incipient hopperburn) expand within 48 hours.',
      'If nearby fields report resistance to standard insecticide classes.'
    ],
    expertConsultationCriteriaOr: [
      'ଯଦି ଗଛ ମୂଳରେ ପୋକ ସଂଖ୍ୟା ୨୫ ରୁ ଅଧିକ ହୁଏ।',
      'ଯଦି କ୍ଷେତରେ ଗଛ ଶୁଖିବା ସ୍ଥାନ ୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ବଢ଼ିଚାଲେ।',
      'ଯଦି ପଡ଼ୋଶୀ କ୍ଷେତରେ ଔଷଧ କାମ କରୁନାହିଁ ବୋଲି ଜଣାପଡ଼େ।'
    ],
    scientificReferences: [
      'ICAR - National Rice Research Institute (NRRI), Cuttack: Integrated Pest Management in Rice (2024)',
      'Odisha University of Agriculture & Technology (OUAT): Package of Practices for Kharif Crops',
      'Central Insecticide Board & Registration Committee (CIBRC) Rice Insecticide Approvals'
    ]
  },

  stem_borer: {
    id: 'stem_borer',
    commonNameEn: 'Yellow Stem Borer (YSB)',
    commonNameOr: 'ହଳଦିଆ ମଜା ପୋକ',
    scientificName: 'Scirpophaga incertulas (Walker)',
    localOdishaName: 'ମଜା ପୋକ / କାଣ୍ଡ ବିନ୍ଧା ପୋକ',
    hostCrops: ['Paddy (Monophagous on rice)'],
    affectedPlantParts: ['Stem pith', 'Central growing shoot', 'Emerging panicle'],
    keySymptomsEn: [
      'Vegetative Stage: Central leaf whorl turns yellow, dries up and easily pulls out, known as "Dead Heart" (ମଜା ମରିବା).',
      'Reproductive Stage: Panicles emerge completely white, empty, and erect without grain, known as "White Earhead" (ଧଳା ଶିଁଷା).',
      'Small entrance boreholes surrounded by brownish frass (caterpillar excreta) visible on the lower stem.',
      'Egg masses covered with yellowish-brown hair felt found on upper surface of young leaves.'
    ],
    keySymptomsOr: [
      'ଗଛ ବଢ଼ିବା ସମୟରେ ମଝି ଡାଳ ଶୁଖିଯାଏ ଏବଂ ସହଜରେ ଟାଣିଲେ ବାହାରିଆସେ (ମଜା ମରିବା ବା ଡେଡ୍ ହାର୍ଟ)।',
      'ଶିଁଷା ବାହାରିବା ବେଳେ ଶିଁଷାଟି ସମ୍ପୂର୍ଣ୍ଣ ଧଳା, ଫମ୍ପା ହୋଇ ସିଧା ଛିଡ଼ା ରହେ (ଧଳା ଶିଁଷା ବା ହ୍ୱାଇଟ୍ ଇୟରହେଡ୍)।',
      'କାଣ୍ଡରେ ଛୋଟ ବିନ୍ଧ ଏବଂ ତାହା ଚାରିପାଖରେ ପୋକର ମଳ ଲାଗି ରହିବା ଦେଖାଯାଏ।',
      'ପତ୍ରର ଉପର ଭାଗରେ ହଳଦିଆ-ମାଟିଆ ରଙ୍ଗର ଲୋମଶ ଅଣ୍ଡା ପେନ୍ଥା ଦେଖିବାକୁ ମିଳେ।'
    ],
    potentialDamagePercent: '20% - 60% (Severe white earhead causes severe grain sterility and loss)',
    conditionsFavoringEn: [
      'Moderate temperatures (20°C - 30°C) with high relative humidity.',
      'Late transplanting of paddy crops after August.',
      'Staggered planting across neighbouring plots creating continuous breeding hosts.',
      'High application of nitrogenous fertilizers producing lush succulent stems.'
    ],
    conditionsFavoringOr: [
      'ମଧ୍ୟମ ତାପମାତ୍ରା (୨୦°C - ୩୦°C) ଓ ବାୟୁରେ ଆର୍ଦ୍ରତା।',
      'ଅଗଷ୍ଟ ମାସ ପରେ ଧାନ ବିଳମ୍ବରେ ରୋଇବା।',
      'ପାଖାପାଖି ଜମିରେ ଅଲଗା ଅଲଗା ସମୟରେ ଚାଷ କରିବା।',
      'ଅତ୍ୟଧିକ ୟୁରିଆ ପ୍ରୟୋଗ ଯୋଗୁଁ ଗଛ ନରମ ଓ ରସାଳ ହେବା।'
    ],
    economicThresholdLevelEn: '1 egg mass per m² OR 2 adult moths per m² OR 5% dead hearts at vegetative stage; 1 moth or egg mass per m² at panicle initiation.',
    economicThresholdLevelOr: 'ପ୍ରତି ବର୍ଗ ମିଟରରେ ୧ଟି ଅଣ୍ଡା ପେନ୍ଥା କିମ୍ବା ୨ଟି ପତଙ୍ଗ କିମ୍ବା ୫% ମଜା ମରିବା ଲକ୍ଷଣ।',
    immediateNextStepsEn: [
      'Clip the tip of seedlings before transplanting to remove deposited egg masses.',
      'Install sex pheromone traps with Scirpophaga incertulas lures @ 8 traps/acre for adult monitoring.',
      'Pull out and inspect affected tillers to verify presence of boring larvae inside stem.',
      'Collect and destroy egg masses visible on leaf tips.'
    ],
    immediateNextStepsOr: [
      'ରୋଇବା ପୂର୍ବରୁ ଧାନ ତଳିର ଅଗ କାଟି ଦିଅନ୍ତୁ, ଯାହାଫଳରେ ଅଣ୍ଡା ପେନ୍ଥା ନଷ୍ଟ ହୋଇଯିବ।',
      'କୀଟ ନିରୀକ୍ଷଣ ପାଇଁ ଏକର ପ୍ରତି ୮ଟି ଫେରୋମୋନ୍ ଟ୍ରାପ୍ ବା ଲିଙ୍ଗାକର୍ଷୀ ଫାନ୍ଦ ଲଗାନ୍ତୁ।',
      'ମରିଯାଇଥିବା ମଝି ଡାଳକୁ ଟାଣି ଭିତରେ ଶୁକ ଅଛି କି ନାହିଁ ପରୀକ୍ଷା କରନ୍ତୁ।',
      'ପତ୍ର ଅଗରେ ଦିଶୁଥିବା ଅଣ୍ଡା ପେନ୍ଥାଗୁଡ଼ିକୁ ହାତରେ ସଂଗ୍ରହ କରି ନଷ୍ଟ କରନ୍ତୁ।'
    ],
    preventiveMeasuresEn: [
      'Synchronous planting within a 15-day window across the farming village cluster.',
      'Deep summer ploughing to expose hibernating larvae in rice stubbles to sunlight and birds.',
      'Clip stubbles close to the ground level during harvest.',
      'Apply balanced NPK according to soil test recommendations.'
    ],
    preventiveMeasuresOr: [
      'ଗାଁର ସମସ୍ତ ଚାଷୀ ୧୫ ଦିନ ମଧ୍ୟରେ ଏକା ସାଙ୍ଗରେ ରୋଇବା ସାରନ୍ତୁ।',
      'ଖରାଦିନେ ଗଭୀର ଚାଷ କରନ୍ତୁ ଯାହାଦ୍ୱାରା ନଡ଼ା ଭିତରେ ଥିବା ପୋକ ସୂର୍ଯ୍ୟ ତାପରେ ମରିଯିବେ।',
      'ଧାନ କାଟିବା ସମୟରେ ମାଟିକୁ ଲାଗି ନଡ଼ା କାଟନ୍ତୁ।',
      'ମାଟି ପରୀକ୍ଷା ଅନୁସାରେ ସନ୍ତୁଳିତ ପରିମାଣରେ ସାର ଦିଅନ୍ତୁ।'
    ],
    biologicalControl: [
      {
        titleEn: 'Trichogramma japonicum Egg Parasitoid Cards',
        titleOr: 'ଟ୍ରାଇକୋଗ୍ରାମା ଜାପୋନିକମ୍ ପରଜୀବୀ କାର୍ଡ',
        descriptionEn: 'Release Trichogramma japonicum @ 40,000 to 50,000 parasitized eggs/acre (Trichocards) starting 30 days after transplanting, repeated 3 times at weekly intervals.',
        descriptionOr: 'ରୁଆର ୩୦ ଦିନ ପରେ ଏକର ପ୍ରତି ୪୦,୦୦୦ ରୁ ୫୦,୦୦୦ ଟ୍ରାଇକୋ କାର୍ଡ ସପ୍ତାହ ବ୍ୟବଧାନରେ ୩ ଥର କ୍ଷେତରେ ଲଗାନ୍ତୁ।',
        category: 'parasitoid',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Egg masses on leaves'
      },
      {
        titleEn: 'Installation of Bird Perches (T-Perches)',
        titleOr: 'ପକ୍ଷୀ ବସିବା ପାଇଁ ଟି (T) ଆକାରର ବାଉଁଶ ଖୁଣ୍ଟି',
        descriptionEn: 'Erect 15-20 T-shaped bamboo perches per acre to attract insectivorous birds (drongos, egrets) which prey on stem borer moths.',
        descriptionOr: 'ପକ୍ଷୀମାନେ ବସି ପତଙ୍ଗ ଖାଇବା ପାଇଁ ଏକର ପ୍ରତି ୧୫-୨୦ଟି ବାଉଁଶ ଖୁଣ୍ଟି ପୋତନ୍ତୁ।',
        category: 'predator',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Adult Moths'
      }
    ],
    culturalControl: [
      {
        titleEn: 'Pheromone Trap Monitoring and Mass Trapping',
        titleOr: 'ଫେରୋମୋନ୍ ଟ୍ରାପ୍ (ଲିଙ୍ଗାକର୍ଷୀ ଫାନ୍ଦ) ସ୍ଥାପନ',
        descriptionEn: 'Install 8 traps per acre with Scirpophaga incertulas lure suspended 30 cm above crop canopy. Change lure every 21 days.',
        descriptionOr: 'ଗଛ ଠାରୁ ୩୦ ସେମି ଉଚ୍ଚତାରେ ଏକର ପ୍ରତି ୮ଟି ଫାନ୍ଦ ଲଗାନ୍ତୁ। ପ୍ରତି ୨୧ ଦିନରେ ଲିଉର୍ ବଦଳାନ୍ତୁ।',
        actionTiming: 'From 20 days after transplanting until panicle emergence'
      },
      {
        titleEn: 'Seedling Tip Clipping',
        titleOr: 'ତଳିର ଅଗ କାଟି ରୋଇବା',
        descriptionEn: 'Cut the top 2-3 cm of seedling leaves before transplanting to discard 70-80% of laid egg masses.',
        descriptionOr: 'ରୋଇବା ପୂର୍ବରୁ ତଳିର ଉପର ଭାଗରୁ ୨-୩ ସେମି କାଟି ଫୋପାଡ଼ନ୍ତୁ।',
        actionTiming: 'Day of transplanting'
      }
    ],
    chemicalControl: [
      {
        activeIngredient: 'Chlorantraniliprole 18.5% SC',
        tradeNames: ['Coragen', 'Ferterra'],
        dosagePerAcre: '60 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 14,
        cibrcRegistered: true,
        toxicityClass: 'Green (Slightly Toxic)',
        safetyPrecautionsEn: 'Safe for beneficial predatory spiders and aquatic organisms when used at recommended dose. Wear full protective clothing and boots.',
        safetyPrecautionsOr: 'ସୁପାରିଶ କରାଯାଇଥିବା ମାତ୍ରାରେ ପ୍ରୟୋଗ କଲେ ଏହା ବନ୍ଧୁ ବୁଢ଼ିଆଣୀଙ୍କ ପାଇଁ ନିରାପଦ। ସିଞ୍ଚନ ବେଳେ ମୁହଁ ଓ ଦେହ ଘୋଡ଼ାଇ ରଖନ୍ତୁ।',
        waterSprayInstructions: 'Foliar spray during early larval hatching before borer enters deep into the stem.'
      },
      {
        activeIngredient: 'Cartap Hydrochloride 50% SP',
        tradeNames: ['Padan', 'Kritap'],
        dosagePerAcre: '400 grams in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 21,
        cibrcRegistered: true,
        toxicityClass: 'Blue (Moderately Toxic)',
        safetyPrecautionsEn: 'Do not spray near fish ponds or open water bodies. Highly toxic to bees; do not spray during morning flowering hours.',
        safetyPrecautionsOr: 'ମାଛ ପୋଖରୀ ନିକଟରେ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ। ମହୁମାଛିଙ୍କ ପାଇଁ ବିପଦ ଥିବାରୁ ସକାଳେ ଫୁଲ ଫୁଟିବା ସମୟରେ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
        waterSprayInstructions: 'Ensure uniform spray coverage over leaves and stems.'
      }
    ],
    expertConsultationCriteriaEn: [
      'If white earheads exceed 8% in the heading stage.',
      'If continuous moth catches in pheromone traps exceed 25 moths/trap/week.'
    ],
    expertConsultationCriteriaOr: [
      'ଯଦି ଧାନ ଶିଁଷା ବାହାରିବା ବେଳେ ୮% ରୁ ଅଧିକ ଧଳା ଶିଁଷା ଦେଖାଯାଏ।',
      'ଯଦି ଫାନ୍ଦରେ ସପ୍ତାହକୁ ୨୫ରୁ ଅଧିକ ପତଙ୍ଗ ପଡ଼ନ୍ତି।'
    ],
    scientificReferences: [
      'OUAT Agricultural Extension Bulletin on Stem Borer Management (2025)',
      'ICAR-NRRI Cuttack: Rice Pest Surveillance and Pheromone Trapping Protocols',
      'CIBRC Approved Pesticides for Rice Stem Borer'
    ]
  },

  leaf_folder: {
    id: 'leaf_folder',
    commonNameEn: 'Rice Leaf Folder',
    commonNameOr: 'ପତ୍ରମୋଡ଼ା ପୋକ',
    scientificName: 'Cnaphalocrocis medinalis (Guenée)',
    localOdishaName: 'ପତ୍ରମୋଡ଼ା ପୋକ / ଘୁଙ୍ଗୁଟିଆ ପୋକ',
    hostCrops: ['Paddy', 'Maize', 'Millets'],
    affectedPlantParts: ['Leaf blades', 'Flag leaf'],
    keySymptomsEn: [
      'Larva folds the leaf blade longitudinally and fastens the margins together with silk threads.',
      'Larva stays inside the folded tube and feeds by scraping the green mesophyll chlorophyll.',
      'Silvery-white, longitudinal translucent streaks appear along the folded leaf.',
      'In severe infestations, the whole field displays a whitish, scorched papery look.',
      'Flag leaf damage significantly reduces grain filling.'
    ],
    keySymptomsOr: [
      'ଶୁକଟି ପତ୍ରକୁ ଲମ୍ବାଳିଆ ଭାବେ ମୋଡ଼ି ରେଶମ ସୂତାରେ ବାନ୍ଧି ନଳୀ ପରି କରିଦିଏ।',
      'ମୋଡ଼ା ପତ୍ର ଭିତରେ ରହି ଭିତର ପଟର ସବୁଜ ଅଂଶ (କ୍ଲୋରୋଫିଲ୍) କୋରି ଖାଇଯାଏ।',
      'ପତ୍ରରେ ଧଳା ରଙ୍ଗର ଲମ୍ବା ଦାଗ ହୋଇ ପତ୍ର ପତଳା କାଗଜ ପରି ଦିଶେ।',
      'ବେଶୀ ଆକ୍ରମଣ ହେଲେ ପୂରା କ୍ଷେତ ଧଳା ଦେଖାଯାଏ ଏବଂ ଧାନ ଅଗାଡ଼ି ହୋଇଯାଏ।'
    ],
    potentialDamagePercent: '15% - 40% (Especially devastating when flag leaves are damaged)',
    conditionsFavoringEn: [
      'High humidity (>85%) combined with cloudy, overcast, and rainy weather.',
      'Shady field borders or fields near tree canopies.',
      'Excessive doses of nitrogenous fertilizers.',
      'High crop density preventing air movement.'
    ],
    conditionsFavoringOr: [
      'ଅଧିକ ଆର୍ଦ୍ରତା ଏବଂ ମେଘୁଆ କିମ୍ବା ଝିପିଝିପି ବର୍ଷା ପାଗ।',
      'ଛାଇ ପଡ଼ୁଥିବା ଜମି କିମ୍ବା ଗଛ ତଳେ ଥିବା ଜମି।',
      'ମାତ୍ରାଧିକ ୟୁରିଆ ସାରର ବ୍ୟବହାର।',
      'ଗଛ ଘଞ୍ଚ ହୋଇ ପବନ ଚଳାଚଳ ନ ହେବା।'
    ],
    economicThresholdLevelEn: '1 to 2 damaged leaves with active larvae per hill at tillering stage; 1 damaged flag leaf per hill at booting/panicle stage.',
    economicThresholdLevelOr: 'ଗଛ ବୃଦ୍ଧି ସମୟରେ ଗୋଟିଏ ଗଛରେ ୧-୨ଟି ମୋଡ଼ା ପତ୍ର; ଶିଁଷା ବାହାରିବା ସମୟରେ ଗଛ ପ୍ରତି ୧ଟି ମୋଡ଼ା ଧ୍ୱଜା ପତ୍ର (ଫ୍ଲାଗ୍ ଲିଫ୍)।',
    immediateNextStepsEn: [
      'Drag a coir or jute rope across the standing crop canopy early in the morning when dew is present to unroll leaves and dislodge caterpillars.',
      'Examine whether inside folded leaves there are live caterpillars or empty pupal cases before spraying.',
      'Withhold urea application until fresh vegetative growth recovers.',
      'Cut overgrown weeds and grass along field bunds where moths shelter during daytime.'
    ],
    immediateNextStepsOr: [
      'ସକାଳେ କାକର ଥିବା ସମୟରେ ଦୁଇ ଜଣ ଲୋକ ଏକ ଶକ୍ତ ଦଉଡ଼ିକୁ କ୍ଷେତ ଉପରେ ଟାଣି ନିଅନ୍ତୁ, ଯାହାଦ୍ୱାରା ପତ୍ର ଫିଟିଯିବ ଓ ପୋକ ତଳେ ପଡ଼ି ମରିବେ।',
      'ମୋଡ଼ା ପତ୍ର ଖୋଲି ଜୀବନ୍ତ ପୋକ ଅଛି କି ନାହିଁ ଦେଖନ୍ତୁ।',
      'ୟୁରିଆ ସାର ପକାଇବା ବନ୍ଦ ରଖନ୍ତୁ।',
      'ହିଡ଼ରେ ଥିବା ଘାସ ସଫା କରନ୍ତୁ ଯେଉଁଠି ପତଙ୍ଗ ଲୁଚି ରହନ୍ତି।'
    ],
    preventiveMeasuresEn: [
      'Maintain balanced fertilizer application using Leaf Color Chart (LCC).',
      'Avoid planting under dense tree shades.',
      'Conserve Trichogramma chilonis and predatory damselflies in the ecosystem.'
    ],
    preventiveMeasuresOr: [
      'ଲିଫ୍ କଲର୍ ଚାର୍ଟ (LCC) ଦେଖି ଆବଶ୍ୟକ ମୁତାବକ ସାର ଦିଅନ୍ତୁ।',
      'ଗଛ ଛାଇରେ ଚାଷ କରିବା ବେଳେ ସତର୍କ ରୁହନ୍ତୁ।',
      'କ୍ଷେତରେ ଥିବା ବନ୍ଧୁ ପତଙ୍ଗ ଓ ଝିଣ୍ଟିକାଙ୍କୁ ସୁରକ୍ଷା ଦିଅନ୍ତୁ।'
    ],
    biologicalControl: [
      {
        titleEn: 'Trichogramma chilonis Egg Parasitoid Cards',
        titleOr: 'ଟ୍ରାଇକୋଗ୍ରାମା ଚିଲୋନିସ୍ ପରଜୀବୀ କାର୍ଡ',
        descriptionEn: 'Release Trichogramma chilonis @ 20,000 to 40,000 eggs/acre starting at first moth appearance. Cards are stapled underneath leaves in early mornings.',
        descriptionOr: 'ଏକର ପ୍ରତି ୨୦,୦୦୦ ରୁ ୪୦,୦୦୦ ଟ୍ରାଇକୋ କାର୍ଡ କ୍ଷେତରେ ପତ୍ର ତଳେ ଷ୍ଟାପଲ୍ କରି ଲଗାନ୍ତୁ।',
        category: 'parasitoid',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Eggs'
      },
      {
        titleEn: 'Azadirachtin (Neem Oil 1500 ppm / 0.03% EC)',
        titleOr: 'ନିମ୍ବ ତେଲ (ଆଜାଡିରାକ୍ଟିନ୍ ୧୫୦୦ ପିପିଏମ୍)',
        descriptionEn: 'Spray botanical Neem formulation @ 3-5 ml/Litre water. Acts as an effective repellent, antifeedant, and oviposition deterrent.',
        descriptionOr: 'ପ୍ରତି ଲିଟର ପାଣିରେ ୩ ରୁ ୫ ମିଲି ନିମ୍ବ ତେଲ ମିଶାଇ ସିଞ୍ଚନ କରନ୍ତୁ। ଏହା ପୋକଙ୍କୁ ପତ୍ର ଖାଇବାରୁ ଦୂରେଇ ରଖେ।',
        category: 'biopesticide',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Early instar larvae'
      }
    ],
    culturalControl: [
      {
        titleEn: 'Coir Rope Dragging in Morning Dew',
        titleOr: 'ସକାଳୁ କାକରରେ ଦଉଡ଼ି ଟାଣିବା',
        descriptionEn: 'Two operators stretch a 25-meter rope dipped in kerosene-mixed emulsion across the rice crop and walk through the field. Dislodges larvae into standing water.',
        descriptionOr: 'ସକାଳେ କାକର ଥିବା ବେଳେ ୨ ଜଣ ଚାଷୀ କ୍ଷେତର ଦୁଇ ପାଖରୁ ଦଉଡ଼ି ଟାଣି ଚାଲନ୍ତୁ।',
        actionTiming: 'Early vegetative tillering stage on sunny mornings'
      }
    ],
    chemicalControl: [
      {
        activeIngredient: 'Chlorantraniliprole 18.5% SC',
        tradeNames: ['Coragen'],
        dosagePerAcre: '60 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 14,
        cibrcRegistered: true,
        toxicityClass: 'Green (Slightly Toxic)',
        safetyPrecautionsEn: 'Target foliar canopy during early morning or late afternoon. Wear eye shield and hand gloves.',
        safetyPrecautionsOr: 'ସକାଳ କିମ୍ବା ଅପରାହ୍ନରେ ସିଞ୍ଚନ କରନ୍ତୁ। ଚଷମା ଓ ଗ୍ଲୋଭ୍ସ ପିନ୍ଧନ୍ତୁ।',
        waterSprayInstructions: 'Use flat fan nozzle to ensure thorough coverage of folded upper canopy leaves.'
      },
      {
        activeIngredient: 'Flubendiamide 20% WG',
        tradeNames: ['Fame', 'Belt'],
        dosagePerAcre: '50 grams in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 15,
        cibrcRegistered: true,
        toxicityClass: 'Green (Slightly Toxic)',
        safetyPrecautionsEn: 'Very low toxicity to fish and beneficial honeybees. Safe waiting period 15 days before harvest.',
        safetyPrecautionsOr: 'ମହୁମାଛି ଓ ମାଛଙ୍କ ପାଇଁ ସୁରକ୍ଷିତ। ଅମଳର ୧୫ ଦିନ ପୂର୍ବରୁ ସିଞ୍ଚନ ବନ୍ଦ କରନ୍ତୁ।',
        waterSprayInstructions: 'Dissolve completely in bucket before filling spray tank.'
      }
    ],
    expertConsultationCriteriaEn: [
      'If more than 20% flag leaves are folded during panicle emergence.',
      'If heavy caterpillar folding persists after two chemical sprays.'
    ],
    expertConsultationCriteriaOr: [
      'ଯଦି ଶିଁଷା ବାହାରିବା ବେଳେ ୨୦% ରୁ ଅଧିକ ଧ୍ୱଜା ପତ୍ର ନଷ୍ଟ ହୁଏ।',
      'ଯଦି ଥରେ ଔଷଧ ସିଞ୍ଚନ ପରେ ମଧ୍ୟ ପୋକ ସଂଖ୍ୟା କମେ ନାହିଁ।'
    ],
    scientificReferences: [
      'OUAT Crop Protection Advisory on Rice Leaf Folder (2024)',
      'ICAR-NRRI Cuttack: Integrated Pest Management Manual',
      'Directorate of Plant Protection, Quarantine & Storage (DPPQS) Rice Guidelines'
    ]
  },

  rice_hispa: {
    id: 'rice_hispa',
    commonNameEn: 'Rice Hispa',
    commonNameOr: 'ହିସପା ପୋକ (କଣ୍ଟା ପୋକ)',
    scientificName: 'Dicladispa armigera (Olivier)',
    localOdishaName: 'ହିସପା ପୋକ / ଧାନ କଣ୍ଟା ପୋକ',
    hostCrops: ['Paddy', 'Grasses'],
    affectedPlantParts: ['Leaf blade epidermis', 'Upper leaf tissue'],
    keySymptomsEn: [
      'Adult is a small (4-5 mm), bluish-black beetle covered with numerous sharp spines on its thorax and wing covers.',
      'Adults scrape the upper surface of leaves, leaving characteristic parallel white streaks along the leaf veins.',
      'Grubs (larvae) mine between epidermal layers, forming translucent, irregular blister-like blotches (leaf mines).',
      'Infested leaves wither, turn whitish, and dry from the tip downward.',
      'Heavily attacked fields present a scorched, whitish appearance from a distance.'
    ],
    keySymptomsOr: [
      'ପତଙ୍ଗଟି ୪-୫ ମିଲିମିଟର ଲମ୍ବ, ନୀଳ-କଳା ରଙ୍ଗର ଏବଂ ଏହାର ପିଠିରେ ବହୁତ କଣ୍ଟା ଥାଏ।',
      'ବୟସ୍କ ପୋକ ପତ୍ରର ସବୁଜ ଅଂଶ କୋରି ଖାଇଯାଏ, ଯାହାଦ୍ୱାରା ଧାଡ଼ି ଧାଡ଼ି ଧଳା ଗାର ପଡ଼ିଯାଏ।',
      'ଛୋଟ କୀଟ ପତ୍ର ଭିତରେ ପଶି ଫୋଟକା ଭଳି ଧଳା ଦାଗ ସୃଷ୍ଟି କରେ।',
      'ପତ୍ରଗୁଡ଼ିକ ଉପରୁ ଶୁଖି ଶୁଖି ଆସେ ଏବଂ ଦୂରରୁ କ୍ଷେତଟି ପୋଡ଼ିଯାଇଥିବା ପରି ଧଳା ଦିଶେ।'
    ],
    potentialDamagePercent: '20% - 50% (High risk in rainfed lowlands of coastal Odisha)',
    conditionsFavoringEn: [
      'Warm and humid weather followed by frequent rainfall spells in coastal Odisha districts (Balasore, Bhadrak, Puri, Cuttack).',
      'Presence of lush wild grassy weeds on field bunds.',
      'High seedling density and delayed transplanting.',
      'Over-application of nitrogenous fertilizers.'
    ],
    conditionsFavoringOr: [
      'ଉପକୂଳ ଓଡ଼ିଶାର ଜିଲ୍ଲାମାନଙ୍କରେ (ବାଲେଶ୍ୱର, ଭଦ୍ରକ, ପୁରୀ, କଟକ) ଗରମ ଓ ଆର୍ଦ୍ର ପାଗ ସହିତ ବର୍ଷା।',
      'କ୍ଷେତ ହିଡ଼ରେ ବେଶୀ ଘାସ ରହିବା।',
      'ଅତ୍ୟଧିକ ଘଞ୍ଚ ତଳି ରୋପଣ ଏବଂ ବିଳମ୍ବିତ ଚାଷ।',
      'ଅଧିକ ମାତ୍ରାରେ ୟୁରିଆ ସାର ବ୍ୟବହାର।'
    ],
    economicThresholdLevelEn: '1 to 2 adults per hill OR 1 leaf with active grub per hill during vegetative stage.',
    economicThresholdLevelOr: 'ଗଛ ବୃଦ୍ଧି ସମୟରେ ଗୋଟିଏ ଗଛରେ ୧-୨ଟି ବୟସ୍କ ପୋକ କିମ୍ବା ୧ଟି ପୋକ ଲାଗିଥିବା ପତ୍ର।',
    immediateNextStepsEn: [
      'Clip the top 5 cm of seedling leaves before transplanting to discard hispa eggs and grubs.',
      'Sweep the crop canopy with hand nets in the early morning to capture and destroy spiny beetles.',
      'Clear grassy weeds on bunds that serve as alternate hosts.',
      'Inspect underside of leaves for blister mines.'
    ],
    immediateNextStepsOr: [
      'ତଳି ରୋଇବା ପୂର୍ବରୁ ଅଗରୁ ୫ ସେମି କାଟି ଫୋପାଡ଼ନ୍ତୁ ଯେପରି ଅଣ୍ଡା ନଷ୍ଟ ହେବ।',
      'ସକାଳୁ ଧାନ କ୍ଷେତରେ ଜାଲ ବୁଲାଇ କଣ୍ଟା ପୋକ ସଂଗ୍ରହ କରି ମାରିଦିଅନ୍ତୁ।',
      'ହିଡ଼ରେ ଥିବା ସମସ୍ତ ଘାସ ତୁରନ୍ତ ଛାଣ୍ଟି ସଫା କରନ୍ତୁ।',
      'ପତ୍ର ତଳ ପରୀକ୍ଷା କରି ପୋକ ଖୋଳିଥିବା ଫୋଟକା ଯାଞ୍ଚ କରନ୍ତୁ।'
    ],
    preventiveMeasuresEn: [
      'Deep summer ploughing to eradicate resting pupae.',
      'Avoid staggered planting; complete transplanting within the recommended seasonal window.',
      'Plant hispa-resistant or tolerant varieties recommended by OUAT.'
    ],
    preventiveMeasuresOr: [
      'ଖରାଦିନେ ଜମିକୁ ଗଭୀର ଚାଷ କରନ୍ତୁ।',
      'ସମସ୍ତେ ମିଶି ନିର୍ଦ୍ଦିଷ୍ଟ ସମୟ ମଧ୍ୟରେ ଧାନ ରୋଇବା ଶେଷ କରନ୍ତୁ।',
      'ଓୟୁଏଟି ଦ୍ୱାରା ଅନୁମୋଦିତ ରୋଗ ସହଣୀୟ କିସମ ଲଗାନ୍ତୁ।'
    ],
    biologicalControl: [
      {
        titleEn: 'Conserve Eulophid & Braconid Wasp Parasitoids',
        titleOr: 'ବନ୍ଧୁ ଭ୍ରମରୀ ଓ ବିରୁଡ଼ି ପରଜୀବୀ ସଂରକ୍ଷଣ',
        descriptionEn: 'Naturally occurring eulophid and braconid micro-wasps parasitize up to 40% of hispa grubs inside leaf mines. Avoid blanket sprays.',
        descriptionOr: 'ପ୍ରାକୃତିକ ଭାବେ ଥିବା କ୍ଷୁଦ୍ର ବିରୁଡ଼ିମାନେ ହିସପା ପୋକର ୪୦% ଶୁକଙ୍କୁ ନଷ୍ଟ କରନ୍ତି। ଏମାନଙ୍କ ସୁରକ୍ଷା ପାଇଁ ଅଯଥା ବିଷ ସିଞ୍ଚନ୍ତୁ ନାହିଁ।',
        category: 'parasitoid',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Grubs inside leaf mines'
      }
    ],
    culturalControl: [
      {
        titleEn: 'Sweeping with Insect Hand Nets in Early Mornings',
        titleOr: 'ହାତ ଜାଲ ସାହାଯ୍ୟରେ ପୋକ ସଂଗ୍ରହ',
        descriptionEn: 'Pass a standard cotton insect net across crop foliage 3-4 times. Catch beetles when they are sluggish at dawn and destroy them in soapy water.',
        descriptionOr: 'ସକାଳୁ ଯେତେବେଳେ ପୋକ ଥଣ୍ଡାରେ ଅଳସୁଆ ଥାଆନ୍ତି, ଜାଲ ବୁଲାଇ ସେମାନଙ୍କୁ ସାବୁନ ପାଣିରେ ପକାଇ ମାରନ୍ତୁ।',
        actionTiming: 'Early mornings (6:00 AM - 8:00 AM)'
      }
    ],
    chemicalControl: [
      {
        activeIngredient: 'Chlorpyriphos 20% EC',
        tradeNames: ['Dursban', 'Tricel'],
        dosagePerAcre: '500 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 21,
        cibrcRegistered: true,
        toxicityClass: 'Yellow (Highly Toxic)',
        safetyPrecautionsEn: 'Strong organophosphate insecticide. MUST wear respirator mask, rubber gloves, and protective apron. Wash thoroughly with soap after application. Keep children and cattle away.',
        safetyPrecautionsOr: 'ଏହା ଏକ ତୀବ୍ର ବିଷାକ୍ତ କୀଟନାଶକ। ମୁହଁରେ ମାସ୍କ, ରବର ଗ୍ଲୋଭ୍ସ ଓ ପୋଷାକ ପିନ୍ଧି ସିଞ୍ଚନ କରନ୍ତୁ। ସିଞ୍ଚନ ପରେ ସାବୁନରେ ଭଲ ଭାବେ ଧୁଅନ୍ତୁ। ପିଲା ଓ ଗୋରୁଗାଈଙ୍କୁ ଦୂରରେ ରଖନ୍ତୁ।',
        waterSprayInstructions: 'Direct spray evenly over leaf surfaces where adult beetles are scraping.'
      },
      {
        activeIngredient: 'Quinalphos 25% EC',
        tradeNames: ['Ekalux'],
        dosagePerAcre: '400 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 20,
        cibrcRegistered: true,
        toxicityClass: 'Yellow (Highly Toxic)',
        safetyPrecautionsEn: 'Penetrates into leaf tissue to reach mining grubs. Strict protective measures required during handling.',
        safetyPrecautionsOr: 'ଏହା ପତ୍ର ଭିତରକୁ ଯାଇ ପୋକକୁ ମାରେ। ସିଞ୍ଚନ ବେଳେ ସମ୍ପୂର୍ଣ୍ଣ ସତର୍କତା ଅବଲମ୍ବନ କରନ୍ତୁ।',
        waterSprayInstructions: 'Spray when ETL is reached and clear weather is forecasted.'
      }
    ],
    expertConsultationCriteriaEn: [
      'If hispa outbreak spreads across consecutive panchayats in coastal districts.',
      'If leaf damage exceeds 30% of canopy area within one week.'
    ],
    expertConsultationCriteriaOr: [
      'ଯଦି ହିସପା ଆକ୍ରମଣ ପାଖ ପଞ୍ଚାୟତକୁ ବ୍ୟାପିଯାଏ।',
      'ଯଦି ସପ୍ତାହେ ମଧ୍ୟରେ ୩୦% ରୁ ଅଧିକ ପତ୍ର ନଷ୍ଟ ହୋଇଯାଏ।'
    ],
    scientificReferences: [
      'ICAR-NRRI Cuttack: Rice Hispa Management in Coastal Agro-Ecosystems',
      'OUAT Plant Pathology & Entomology Research Digest',
      'CIBRC Insecticide Schedule for Rice Hispa'
    ]
  },

  armyworm: {
    id: 'armyworm',
    commonNameEn: 'Rice Armyworm / Swarming Caterpillar',
    commonNameOr: 'ଲେଡା ପୋକ / ସୈନ୍ୟ କୀଟ (ଧାନ କାଟୁଆ ପୋକ)',
    scientificName: 'Mythimna separata (Walker) / Spodoptera mauritia',
    localOdishaName: 'ଲେଡା ପୋକ / ଲକ୍ଷ୍ମଣ ଝୁଲା / ଶିଁଷା କାଟୁଆ ପୋକ',
    hostCrops: ['Paddy', 'Maize', 'Sorghum', 'Grasses'],
    affectedPlantParts: ['Foliage', 'Panicle base', 'Peduncle neck'],
    keySymptomsEn: [
      'Caterpillars march in large "armies" from field to field, causing sudden widespread devastation overnight.',
      'Voracious leaf feeding: Caterpillars consume leaf blades down to midribs, leaving only bare ragged stems.',
      'Ear-Cutting Phase: At panicle emergence/maturity stage, caterpillars climb up at night and sever the panicles at the neck, dropping mature grain to the muddy ground.',
      'Caterpillars hide inside soil crevices or under rice clods during bright sunlight and become active at twilight.'
    ],
    keySymptomsOr: [
      'ଶୁକଗୁଡ଼ିକ ଏକା ସାଙ୍ଗରେ ସୈନ୍ୟ ଦଳ ପରି କ୍ଷେତରୁ କ୍ଷେତ ମାଡ଼ିଚାଲନ୍ତି ଏବଂ ରାତାରାତି ଫସଲ ନଷ୍ଟ କରନ୍ତି।',
      'ପତ୍ରର ସବୁଜ ଅଂଶକୁ ସମ୍ପୂର୍ଣ୍ଣ ଖାଇ କେବଳ ଡାଳଟିକୁ ଛାଡ଼ିଦିଅନ୍ତି।',
      'ଧାନ ପାଚିବା ବେଳେ ରାତିରେ ଗଛ ଉପରକୁ ଚଢ଼ି ଶିଁଷାର ଡେମ୍ଫ କାଟିଦିଅନ୍ତି, ଯାହାଫଳରେ ପାଚିଲା ଧାନ କାଦୁଅରେ ଖସିପଡ଼େ (ଶିଁଷା କାଟୁଆ ପୋକ)।',
      'ଦିନବେଳେ ପ୍ରଖର ଖରାରେ ପୋକଗୁଡ଼ିକ ମାଟି ଫାଟ ବା ଗଛ ମୂଳରେ ଲୁଚି ରହନ୍ତି ଓ ସନ୍ଧ୍ୟା ହେଲେ ବାହାରନ୍ତି।'
    ],
    potentialDamagePercent: '50% - 90% (Can destroy entire mature standing crop within 48 to 72 hours)',
    conditionsFavoringEn: [
      'Sudden heavy rainfall or floods followed by extended dry sunny spells.',
      'Fields with high organic litter or overgrown grassy field bunds.',
      'Warm night temperatures (24°C - 28°C) encouraging nocturnal foraging.',
      'Nearby fallow lands hosting untreated initial generations.'
    ],
    conditionsFavoringOr: [
      'ହଠାତ୍ ବର୍ଷା ବା ବନ୍ୟା ପରେ ଖରା ପାଗ ହେବା।',
      'କ୍ଷେତ ଚାରିପାଖରେ ଥିବା ହିଡ଼ରେ ଅନାବନା ଘାସ ବଣ ହୋଇ ରହିବା।',
      'ଉଷ୍ମ ରାତି ଯାହା ପୋକଙ୍କୁ ରାତିରେ ବୁଲି ଖାଇବାକୁ ଉତ୍ସାହିତ କରେ।',
      'ପାଖରେ ଥିବା ପଡ଼ିଆ ଜମିରେ ପୋକ ବଂଶ ବୃଦ୍ଧି ହେବା।'
    ],
    economicThresholdLevelEn: '1 larva per hill during tillering stage; 1 larva per 2 hills during panicle/heading stage.',
    economicThresholdLevelOr: 'ଗଛ ବୃଦ୍ଧି ସମୟରେ ଗଛ ପ୍ରତି ୧ଟି ପୋକ; ଶିଁଷା ବାହାରିବା ସମୟରେ ୨ଟି ଗଛରେ ୧ଟି ପୋକ।',
    immediateNextStepsEn: [
      'Dig 30 cm deep trenches around the perimeter of the field and dust with lime or neem cake to trap marching caterpillars.',
      'Flood the field briefly to force caterpillars out of soil crevices so birds can consume them.',
      'Conduct all pesticide spraying strictly in late afternoon or early dusk (after 4:30 PM) when larvae climb onto plants.',
      'Install light traps on field bunds to capture nocturnal egg-laying moths.'
    ],
    immediateNextStepsOr: [
      'କ୍ଷେତ ଚାରିପାଖେ ୩୦ ସେମି ଗଭୀର ନାଳ ଖୋଳି ଚୂନ ବା ନିମ୍ବ ପିଡ଼ିଆ ପକାନ୍ତୁ ଯେପରି ପୋକ କ୍ଷେତ ଭିତରକୁ ପଶିପାରିବେ ନାହିଁ।',
      'କ୍ଷେତରେ ପାଣି ମଡ଼ାଇ ପୋକଙ୍କୁ ମାଟି ଭିତରୁ ବାହାର କରନ୍ତୁ ଯାହାଫଳରେ ପକ୍ଷୀମାନେ ସେମାନଙ୍କୁ ଖାଇଯିବେ।',
      'କୀଟନାଶକ କେବଳ ଅପରାହ୍ନ ୪:୩୦ ପରେ କିମ୍ବା ସନ୍ଧ୍ୟା ବେଳେ ସିଞ୍ଚନ କରନ୍ତୁ, କାରଣ ପୋକ ରାତିରେ ବାହାରନ୍ତି।',
      'କ୍ଷେତ ହିଡ଼ରେ ଲାଇଟ୍ ଟ୍ରାପ୍ (ଆଲୋକ ଫାନ୍ଦ) ଲଗାଇ ପତଙ୍ଗ ନଷ୍ଟ କରନ୍ତୁ।'
    ],
    preventiveMeasuresEn: [
      'Keep field bunds meticulously weed-free throughout the season.',
      'Erect T-shaped bird perches @ 20 per acre across the field.',
      'Avoid delayed harvesting of matured paddy panicles.'
    ],
    preventiveMeasuresOr: [
      'କୌଣସି ପରିସ୍ଥିତିରେ ହିଡ଼ରେ ଅନାବନା ଘାସ ବଢ଼ିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।',
      'ପକ୍ଷୀ ବସିବା ପାଇଁ ଏକର ପ୍ରତି ୨୦ଟି ବାଉଁଶ ଖୁଣ୍ଟି ଲଗାନ୍ତୁ।',
      'ଧାନ ପାଚିଲେ ବିଳମ୍ବ ନ କରି ଶୀଘ୍ର ଅମଳ କରନ୍ତୁ।'
    ],
    biologicalControl: [
      {
        titleEn: 'Bacillus thuringiensis (Bt) Microbial Biopesticide',
        titleOr: 'ବ୍ୟାସିଲସ୍ ଥୁରିନଜିଏନ୍‌ସିସ୍ (Bt) ଜୈବିକ ଜୀବାଣୁ',
        descriptionEn: 'Spray Bt formulation @ 2 g/Litre or 400 g/acre during late afternoon. Highly effective on young caterpillar stages without harming fish or cattle.',
        descriptionOr: 'ପ୍ରତି ଲିଟର ପାଣିରେ ୨ ଗ୍ରାମ ବିଟି ପାଉଡର ମିଶାଇ ଅପରାହ୍ନରେ ସିଞ୍ଚନ କରନ୍ତୁ। ଏହା ଛୋଟ ପୋକଙ୍କୁ ଶୀଘ୍ର ମାରିଦିଏ।',
        category: 'biopesticide',
        safetyRating: 'Eco-Friendly',
        targetStage: 'Early caterpillar instars'
      },
      {
        titleEn: 'Entomopathogenic Nematodes (EPN / Heterorhabditis spp.)',
        titleOr: 'କୀଟନାଶକ ସୂତ୍ରକୃମି (EPN)',
        descriptionEn: 'Apply EPN formulations along with irrigation water to infect and kill caterpillars resting in soil crevices.',
        descriptionOr: 'ଜଳସେଚନ ପାଣି ସହିତ ମାଟିରେ ଥିବା ଲୁକ୍କାୟିତ ପୋକଙ୍କୁ ମାରିବା ପାଇଁ EPN ପ୍ରୟୋଗ କରନ୍ତୁ।',
        category: 'parasitoid',
        safetyRating: 'Targeted Biological',
        targetStage: 'Larvae and Pupae in soil'
      }
    ],
    culturalControl: [
      {
        titleEn: 'Barrier Trenching Around Infested Field Borders',
        titleOr: 'କ୍ଷେତ ଚାରିପାଖରେ ସୁରକ୍ଷା ନାଳ ଖୋଳିବା',
        descriptionEn: 'Dig a trench 30 cm wide and 25 cm deep around the field border. Caterpillars fall into the trench during migration and can be destroyed.',
        descriptionOr: 'କ୍ଷେତ ଚାରିପାଖରେ ୩୦ ସେମି ଓସାର ଓ ୨୫ ସେମି ଗଭୀର ନାଳ ଖୋଳନ୍ତୁ, ଯାହାଫଳରେ ପୋକ ଗାତରେ ପଡ଼ିଯିବେ।',
        actionTiming: 'Immediately upon sighting marching hordes'
      }
    ],
    chemicalControl: [
      {
        activeIngredient: 'Chlorantraniliprole 18.5% SC',
        tradeNames: ['Coragen'],
        dosagePerAcre: '60 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 14,
        cibrcRegistered: true,
        toxicityClass: 'Green (Slightly Toxic)',
        safetyPrecautionsEn: 'Apply in the evening when armyworms begin climbing up the stems. Wear boots, mask, and full protective coveralls.',
        safetyPrecautionsOr: 'ସନ୍ଧ୍ୟା ସମୟରେ ସିଞ୍ଚନ କରନ୍ତୁ ଯେତେବେଳେ ପୋକ ଗଛ ଉପରକୁ ଚଢ଼ନ୍ତି। ସୁରକ୍ଷିତ ପୋଷାକ ଓ ମାସ୍କ ପିନ୍ଧନ୍ତୁ।',
        waterSprayInstructions: 'Spray plant canopy and soil base uniformly with high pressure coarse spray.'
      },
      {
        activeIngredient: 'Indoxacarb 14.5% SC',
        tradeNames: ['Avaunt', 'Dakar'],
        dosagePerAcre: '200 ml in 200 Litres water per acre',
        waterVolumePerAcre: '200 Litres',
        phiDays: 14,
        cibrcRegistered: true,
        toxicityClass: 'Blue (Moderately Toxic)',
        safetyPrecautionsEn: 'Very fast knockdown of voracious caterpillar pests. Toxic to aquatic organisms; prevent wash-off into irrigation channels.',
        safetyPrecautionsOr: 'ଖୁବ୍ ଶୀଘ୍ର ପୋକକୁ ମାରିଦିଏ। ନାଳ କିମ୍ବା ପୋଖରୀ ପାଣିରେ ଯେପରି ଔଷଧ ନ ମିଶେ ଧ୍ୟାନ ଦିଅନ୍ତୁ।',
        waterSprayInstructions: 'Spray between 4:30 PM and 6:30 PM for maximum contact efficacy.'
      }
    ],
    expertConsultationCriteriaEn: [
      'If migrating armyworms cross trenches and threaten panicle cutting across adjacent blocks.',
      'If mature standing crops within 10 days of harvest suffer neck clipping.'
    ],
    expertConsultationCriteriaOr: [
      'ଯଦି ପୋକ ନାଳ ଡେଇଁ ପଡ଼ୋଶୀ କ୍ଷେତର ଶିଁଷା କାଟିବା ଆରମ୍ଭ କରନ୍ତି।',
      'ଯଦି ଅମଳର ୧୦ ଦିନ ପୂର୍ବରୁ ପାଚିଲା ଧାନ ଶିଁଷା କଟି କାଦୁଅରେ ପଡ଼େ।'
    ],
    scientificReferences: [
      'OUAT Contingency Plan for Swarming Caterpillar / Armyworm Outbreaks',
      'ICAR-NRRI Cuttack: Management of Ear-Cutting Caterpillars in Rice',
      'Central Insecticide Board Approved Insecticides for Spodoptera & Mythimna'
    ]
  },

  beneficial_spider: {
    id: 'beneficial_spider',
    commonNameEn: 'Wolf Spider (Beneficial Natural Predator)',
    commonNameOr: 'କଲମ ବୁଢ଼ିଆଣୀ (ଚାଷୀଙ୍କ ବନ୍ଧୁ କୀଟ)',
    scientificName: 'Lycosa pseudoannulata (Boesenberg & Strand)',
    localOdishaName: 'କଲମ ବୁଢ଼ିଆଣୀ / ଶିକାରୀ ବୁଢ଼ିଆଣୀ',
    hostCrops: ['Found in all rice agro-ecosystems'],
    affectedPlantParts: ['None (Does NOT harm the rice crop)'],
    keySymptomsEn: [
      'Active free-roaming spider running quickly on water surface and rice hills without spinning webs.',
      'Fork-shaped or longitudinal dark markings visible on the grayish-brown cephalothorax.',
      'DO NOT HARM THIS SPIDER: It is one of the most vital beneficial predators in Odisha rice fields!',
      'Consumes 15-25 brown planthoppers, green leafhoppers, and young stem borer larvae daily.'
    ],
    keySymptomsOr: [
      'ଏହା ଜାଲ ବୁଣେ ନାହିଁ; ପାଣି ଉପରେ ଏବଂ ଧାନ ଗଛରେ ଦ୍ରୁତ ଗତିରେ ଦୌଡ଼ି ଶିକାର କରେ।',
      'ମାଟିଆ-ଧୂସର ଶରୀର ଉପରେ ତ୍ରିଶୂଳ ଆକାରର କଳା ଚିହ୍ନ ଥାଏ।',
      'ଏହାକୁ କଦାପି ମାରନ୍ତୁ ନାହିଁ: ଏହା ଚାଷୀଙ୍କର ପରମ ବନ୍ଧୁ!',
      'ଦିନକୁ ୧୫ ରୁ ୨୫ଟି ଗୁଣ୍ଡି ପୋକ, ଶୋଷକ କୀଟ ଓ ମଜା ପୋକର ଛୋଟ ପିଲାଙ୍କୁ ଖାଇ ଫସଲ ରକ୍ଷା କରେ।'
    ],
    potentialDamagePercent: '0% (Beneficial biological agent - increases crop yield by controlling pests)',
    conditionsFavoringEn: [
      'Paddy fields managed with zero or minimal synthetic insecticide sprays.',
      'Moist soil with organic mulch and healthy field biodiversity.'
    ],
    conditionsFavoringOr: [
      'ବିଷାକ୍ତ କୀଟନାଶକ ସିଞ୍ଚନ ନ ହୋଇଥିବା କ୍ଷେତ।',
      'ମାଟିରେ ଆର୍ଦ୍ରତା ଓ ଜୈବିକ ଅଂଶ ଥିବା ସୁସ୍ଥ ପରିବେଶ।'
    ],
    economicThresholdLevelEn: 'Presence of 1-2 spiders per hill indicates excellent biological control equilibrium; NO chemical spray needed.',
    economicThresholdLevelOr: 'ଗଛ ପ୍ରତି ୧-୨ଟି ବୁଢ଼ିଆଣୀ ଥିଲେ କୌଣସି ଔଷଧ ସିଞ୍ଚନ ଆବଶ୍ୟକ ନାହିଁ।',
    immediateNextStepsEn: [
      'DO NOT SPRAY ANY CHEMICAL PESTICIDE.',
      'Maintain field moisture to allow spiders to forage across tillers.',
      'Monitor pest populations; spiders will naturally suppress planthoppers.'
    ],
    immediateNextStepsOr: [
      'କୌଣସି ରାସାୟନିକ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
      'କ୍ଷେତରେ ଓଦା ଭାବ ରଖନ୍ତୁ ଯାହାଦ୍ୱାରା ବୁଢ଼ିଆଣୀମାନେ ପୋକ ଖାଇପାରିବେ।',
      'ନିରୀକ୍ଷଣ ଜାରି ରଖନ୍ତୁ; ବୁଢ଼ିଆଣୀମାନେ ନିଜେ ପୋକଙ୍କୁ ନିୟନ୍ତ୍ରଣ କରିବେ।'
    ],
    preventiveMeasuresEn: [
      'Avoid early-season broad spectrum insecticide applications.',
      'Leave straw mulch on bunds to provide winter shelter for spiders.'
    ],
    preventiveMeasuresOr: [
      'ଚାଷ ଆରମ୍ଭରୁ ଅଯଥା କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
      'ହିଡ଼ରେ ସାମାନ୍ୟ ନଡ଼ା ରଖନ୍ତୁ ଯେଉଁଥିରେ ବୁଢ଼ିଆଣୀ ଆଶ୍ରୟ ନେଇପାରିବେ।'
    ],
    biologicalControl: [],
    culturalControl: [
      {
        titleEn: 'Bio-Conservation and Habitat Protection',
        titleOr: 'ଜୈବିକ ସଂରକ୍ଷଣ ଓ ବନ୍ଧୁ କୀଟ ସୁରକ୍ଷା',
        descriptionEn: 'Protect existing spider cocoons and egg sacs carried on female abdomen.',
        descriptionOr: 'ମାଆ ବୁଢ଼ିଆଣୀ ପିଠିରେ ଥିବା ଅଣ୍ଡା ଥଳିକୁ ସୁରକ୍ଷା ଦିଅନ୍ତୁ।',
        actionTiming: 'Throughout the cropping season'
      }
    ],
    chemicalControl: [],
    expertConsultationCriteriaEn: [
      'Consult KVK scientist if you are unsure whether an insect is a pest or a beneficial predator.'
    ],
    expertConsultationCriteriaOr: [
      'କୌଣସି ପୋକ ବନ୍ଧୁ କି ଶତ୍ରୁ ଜାଣି ନ ପାରିଲେ ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK) ସହିତ ପରାମର୍ଶ କରନ୍ତୁ।'
    ],
    scientificReferences: [
      'ICAR-NRRI Cuttack: Natural Enemies of Rice Pests in Eastern India',
      'OUAT Agro-Ecology Guide: Predatory Arthropods in Odisha Rice Systems'
    ]
  },

  healthy_paddy: {
    id: 'healthy_paddy',
    commonNameEn: 'Healthy Paddy Crop',
    commonNameOr: 'ନିରୋଗ ସୁସ୍ଥ ଧାନ ଫସଲ',
    scientificName: 'Oryza sativa L.',
    localOdishaName: 'ସୁସ୍ଥ ଧାନ ଗଛ',
    hostCrops: ['Paddy'],
    affectedPlantParts: ['None (Crop is robust and healthy)'],
    keySymptomsEn: [
      'Vigorous, dark-green upright leaves without feeding streaks or lesions.',
      'Tillers are firm, well-spaced, with clean white-creamy roots.',
      'No signs of dead heart, hopperburn, leaf rolling, or white earhead.',
      'Natural ecosystem with beneficial insects maintaining balance.'
    ],
    keySymptomsOr: [
      'ଗଛର ପତ୍ରଗୁଡ଼ିକ ସତେଜ, ସବୁଜ ଏବଂ ସିଧା ଛିଡ଼ା ହୋଇଛି।',
      'କୌଣସି ମଜା ମରିବା, ପତ୍ରମୋଡ଼ା ବା ପତ୍ର ଶୁଖିବା ଦାଗ ନାହିଁ।',
      'ଚେରଗୁଡ଼ିକ ଧଳା, ମଜବୁତ ଓ ସୁସ୍ଥ ଅଛି।',
      'ଫସଲ ସମ୍ପୂର୍ଣ୍ଣ ରୋଗ-ପୋକ ମୁକ୍ତ ଏବଂ ଉତ୍ତମ ବୃଦ୍ଧି ହେଉଛି।'
    ],
    potentialDamagePercent: '0% (Excellent crop health)',
    conditionsFavoringEn: [
      'Optimal soil nutrient balance, proper spacing, and balanced water management.'
    ],
    conditionsFavoringOr: [
      'ସନ୍ତୁଳିତ ସାର, ଉତ୍ତମ ଜଳ ପରିଚାଳନା ଓ ସଠିକ ଦୂରତାରେ ରୋପଣ।'
    ],
    economicThresholdLevelEn: 'No intervention required.',
    economicThresholdLevelOr: 'କୌଣସି ଔଷଧ ସିଞ୍ଚନ ଆବଶ୍ୟକ ନାହିଁ।',
    immediateNextStepsEn: [
      'Continue regular crop scouting twice a week.',
      'Maintain Alternate Wetting and Drying (AWD) water management.',
      'Avoid prophylactic chemical sprays that waste money and kill beneficial insects.'
    ],
    immediateNextStepsOr: [
      'ସପ୍ତାହରେ ଦୁଇ ଥର ନିୟମିତ ଭାବେ କ୍ଷେତ ବୁଲି ଯାଞ୍ଚ କରନ୍ତୁ।',
      'ପର୍ଯ୍ୟାୟକ୍ରମେ ପାଣି ଦେବା ଓ ଶୁଖାଇବା (AWD) ପଦ୍ଧତି ଜାରି ରଖନ୍ତୁ।',
      'ବିନା କାରଣରେ ଅଯଥା ଖର୍ଚ୍ଚ କରି ଔଷଧ ସିଞ୍ଚନ୍ତୁ ନାହିଁ।'
    ],
    preventiveMeasuresEn: [
      'Follow recommended nutrient management based on soil health card.',
      'Maintain clean field bunds.'
    ],
    preventiveMeasuresOr: [
      'ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଅନୁସାରେ ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।',
      'କ୍ଷେତ ହିଡ଼ ପରିଷ୍କାର ରଖନ୍ତୁ।'
    ],
    biologicalControl: [],
    culturalControl: [
      {
        titleEn: 'Routine Agro-Ecosystem Field Surveillance',
        titleOr: 'ନିୟମିତ କ୍ଷେତ ନିରୀକ୍ଷଣ',
        descriptionEn: 'Inspect 20 random hills diagonally across the field every Tuesday and Friday morning.',
        descriptionOr: 'ପ୍ରତି ସପ୍ତାହରେ କ୍ଷେତରେ ୨୦ଟି ଗଛ ବୁଲି ନିରୀକ୍ଷଣ କରନ୍ତୁ।',
        actionTiming: 'Twice a week'
      }
    ],
    chemicalControl: [],
    expertConsultationCriteriaEn: [
      'No consultation needed for healthy crops.'
    ],
    expertConsultationCriteriaOr: [
      'ଫସଲ ସୁସ୍ଥ ଥିବାରୁ କୌଣସି ପରାମର୍ଶର ଆବଶ୍ୟକତା ନାହିଁ।'
    ],
    scientificReferences: [
      'OUAT Good Agricultural Practices (GAP) for Rice Farming',
      'ICAR-NRRI Good Agronomic Practices Compendium'
    ]
  },

  uncertain: {
    id: 'uncertain',
    commonNameEn: 'Uncertain / Low-Confidence Observation',
    commonNameOr: 'ଅନିଶ୍ଚିତ ଚିହ୍ନଟ / ଅସ୍ପଷ୍ଟ ଫଟୋ',
    scientificName: 'Identification Inconclusive',
    localOdishaName: 'ଅନିଶ୍ଚିତ କୀଟ ଚିହ୍ନଟ',
    hostCrops: ['Paddy'],
    affectedPlantParts: ['Inconclusive from current image'],
    keySymptomsEn: [
      'The uploaded photograph lacks sufficient sharpness, optimal lighting, or close-up detail for a scientifically verified identification.',
      'Distinguishing entomological features (antennae, wing venation, dorsal spines, feeding frass) cannot be confirmed with high statistical confidence.',
      'An uncertain or incorrect pesticide application may waste money, eliminate beneficial natural predators, or induce pest resurgence.'
    ],
    keySymptomsOr: [
      'ଅପଲୋଡ୍ କରାଯାଇଥିବା ଫଟୋଟି ଅସ୍ପଷ୍ଟ, କମ୍ ଆଲୋକ ଯୁକ୍ତ କିମ୍ବା ପୋକଟି ବହୁତ ଦୂରରୁ ଉଠାଯାଇଛି।',
      'ପୋକର କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ ଚିହ୍ନ (ଡେଣା, କଣ୍ଟା, ଆଣ୍ଟେନା ବା ମଳ) ସ୍ପଷ୍ଟ ଭାବେ ଦେଖାଯାଉ ନାହିଁ।',
      'ଅନିଶ୍ଚିତ ଭାବେ ଭୁଲ୍ ଔଷଧ ସିଞ୍ଚନ କଲେ ଚାଷୀଙ୍କ ଟଙ୍କା ନଷ୍ଟ ହେବା ସହ ବନ୍ଧୁ ପୋକ ମରିଯିବାର ଆଶଙ୍କା ଥାଏ।'
    ],
    potentialDamagePercent: 'Assessment suspended pending clearer photograph or expert review',
    conditionsFavoringEn: [
      'Photo captured under severe backlight, heavy blur, or excessive camera shaking.'
    ],
    conditionsFavoringOr: [
      'ଅତ୍ୟଧିକ ଖରା, କମ୍ ଆଲୋକ ବା ହାତ ହଲିବା ଯୋଗୁଁ ଫଟୋ ଝାପ୍‌ସା ହେବା।'
    ],
    economicThresholdLevelEn: 'Do NOT apply any chemical insecticide on an uncertain diagnosis.',
    economicThresholdLevelOr: 'ଅସ୍ପଷ୍ଟ ଫଟୋ ଆଧାରରେ କଦାପି କୌଣସି ରାସାୟନିକ ଔଷଧ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।',
    immediateNextStepsEn: [
      'Retake the photograph in daylight, focusing closely on the insect or damaged plant part from 15-20 cm distance.',
      'Avoid camera shaking: keep your hand steady or use tap-to-focus on your phone screen.',
      'If symptoms persist and cannot be photographed clearly, tap the "Escalate to KVK Agricultural Scientist" button below.'
    ],
    immediateNextStepsOr: [
      'ସକାଳେ ବା ଦିନ ଆଲୋକରେ ଗଛ ବା ପୋକ ଠାରୁ ୧୫-୨୦ ସେମି ଦୂରତାରେ ରଖି ପୁଣି ଏକ ସ୍ପଷ୍ଟ ଫଟୋ ଉଠାନ୍ତୁ।',
      'ମୋବାଇଲ୍ ସ୍କ୍ରିନ୍‌ରେ ଟାପ୍ କରି ଫୋକସ୍ କରନ୍ତୁ ଏବଂ ହାତ ସ୍ଥିର ରଖନ୍ତୁ।',
      'ଯଦି ସମସ୍ୟା ଜାରି ରହେ, ତଳେ ଥିବା "କୃଷି ବିଜ୍ଞାନୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ" ବଟନ୍ ଦବାନ୍ତୁ।'
    ],
    preventiveMeasuresEn: [
      'Follow standardized photographic guidelines provided in the app tips.'
    ],
    preventiveMeasuresOr: [
      'ଫଟୋ ଉଠାଇବା ପାଇଁ ଆପ୍‌ରେ ଦିଆଯାଇଥିବା ନିର୍ଦ୍ଦେଶାବଳୀ ପାଳନ କରନ୍ତୁ।'
    ],
    biologicalControl: [],
    culturalControl: [
      {
        titleEn: 'Physical Specimen Collection for KVK Inspection',
        titleOr: 'ପୋକ ସଂଗ୍ରହ କରି କୃଷି କାର୍ଯ୍ୟାଳୟରେ ଦେଖାଇବା',
        descriptionEn: 'Carefully collect 2-3 live specimens or affected leaves in a ventilated transparent plastic container and present them to your block Assistant Agriculture Officer (AAO) or nearest KVK.',
        descriptionOr: 'ଗୋଟିଏ ଛୋଟ ପ୍ଲାଷ୍ଟିକ୍ ଡବାରେ ୨-୩ଟି ପୋକ ବା ଆକ୍ରାନ୍ତ ପତ୍ର ରଖି ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀ (AAO) କିମ୍ବା ନିକଟସ୍ଥ କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ରକୁ ନିଅନ୍ତୁ।',
        actionTiming: 'Within 24-48 hours'
      }
    ],
    chemicalControl: [],
    expertConsultationCriteriaEn: [
      'Mandatory expert review triggered automatically for uncertain identifications.'
    ],
    expertConsultationCriteriaOr: [
      'ଅନିଶ୍ଚିତ ଚିହ୍ନଟ କ୍ଷେତ୍ରରେ କୃଷି ବିଜ୍ଞାନୀଙ୍କ ପରାମର୍ଶ ନେବା ବାଧ୍ୟତାମୂଳକ।'
    ],
    scientificReferences: [
      'ICAR Guidelines on Responsible Agricultural AI & Diagnostic Safety',
      'OUAT Diagnostic Quality Protocol'
    ]
  }
};
