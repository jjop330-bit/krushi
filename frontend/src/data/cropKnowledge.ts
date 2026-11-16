import { CropId } from '../types/pest';

export interface CropInfo {
  id: CropId;
  nameEn: string;
  nameOr: string;
  scientificName: string;
  status: 'active' | 'in_validation';
  validationNoticeEn?: string;
  validationNoticeOr?: string;
  keyTargetPests: string[];
  icon: string;
}

export const SUPPORTED_CROPS: CropInfo[] = [
  {
    id: 'paddy',
    nameEn: 'Paddy / Rice',
    nameOr: 'ଧାନ (Paddy)',
    scientificName: 'Oryza sativa L.',
    status: 'active',
    keyTargetPests: ['Brown Planthopper', 'Yellow Stem Borer', 'Rice Leaf Folder', 'Rice Hispa', 'Armyworm'],
    icon: '🌾'
  },
  {
    id: 'maize',
    nameEn: 'Maize (Corn)',
    nameOr: 'ମକା (Maize)',
    scientificName: 'Zea mays L.',
    status: 'in_validation',
    validationNoticeEn: 'Field validation trial underway at OUAT & KVK Mayurbhanj for Fall Armyworm (Spodoptera frugiperda). Pest model release planned Q2 2026.',
    validationNoticeOr: 'ମକାରେ ଫଲ୍ ଆର୍ମିୱାର୍ମ ପୋକ ଚିହ୍ନଟ ପାଇଁ ଓୟୁଏଟି ଗବେଷଣାଗାରରେ ପରୀକ୍ଷଣ ଚାଲିଛି। ଖୁବ୍ ଶୀଘ୍ର ଉପଲବ୍ଧ ହେବ।',
    keyTargetPests: ['Fall Armyworm', 'Stem Borer', 'Shoot Fly'],
    icon: '🌽'
  },
  {
    id: 'tomato',
    nameEn: 'Tomato',
    nameOr: 'ବିଲାତି ବାଇଗଣ / ଟମାଟୋ',
    scientificName: 'Solanum lycopersicum L.',
    status: 'in_validation',
    validationNoticeEn: 'Model training dataset being curated with ICAR-IIHR for Tuta absoluta & Fruit Borer. Not claimed until model accuracy exceeds 92%.',
    validationNoticeOr: 'ଟମାଟୋ ଫଳ ବିନ୍ଧା ପୋକ ନିର୍ଣ୍ଣୟ ପାଇଁ ତଥ୍ୟ ଯାଞ୍ଚ ଚାଲିଛି। ସଠିକତା ୯୨% ନ ହେବା ଯାଏଁ ଏହା ସକ୍ରିୟ ହେବ ନାହିଁ।',
    keyTargetPests: ['Tuta absoluta', 'Fruit Borer', 'Whitefly'],
    icon: '🍅'
  },
  {
    id: 'brinjal',
    nameEn: 'Brinjal (Eggplant)',
    nameOr: 'ବାଇଗଣ (Brinjal)',
    scientificName: 'Solanum melongena L.',
    status: 'in_validation',
    validationNoticeEn: 'Shoot and Fruit Borer (Leucinodes orbonalis) dataset collection in progress across Ganjam & Cuttack vegetable clusters.',
    validationNoticeOr: 'ବାଇଗଣ ଡାଙ୍ଗ ଓ ଫଳ ବିନ୍ଧା ପୋକର ଫଟୋ ସଂଗ୍ରହ ଓ ଯାଞ୍ଚ ଚାଲିଛି।',
    keyTargetPests: ['Shoot and Fruit Borer', 'Hadda Beetle'],
    icon: '🍆'
  },
  {
    id: 'chilli',
    nameEn: 'Chilli',
    nameOr: 'ଲଙ୍କା (Chilli)',
    scientificName: 'Capsicum annuum L.',
    status: 'in_validation',
    validationNoticeEn: 'Targeting Black Thrips (Thrips parvispinus) and Yellow Mite leaf curling models for Sambalpur & Kuchinda clusters.',
    validationNoticeOr: 'କୁଚିଣ୍ଡା ଅଞ୍ଚଳ ପାଇଁ ଲଙ୍କା କୁକୁଡ଼ା ରୋଗ ଓ କଳା ଥ୍ରିପ୍ସ ପୋକର ମଡେଲ ପ୍ରସ୍ତୁତ ଚାଲିଛି।',
    keyTargetPests: ['Black Thrips', 'Yellow Mite', 'Aphids'],
    icon: '🌶️'
  },
  {
    id: 'groundnut',
    nameEn: 'Groundnut (Peanut)',
    nameOr: 'ଚିନାବାଦାମ (Groundnut)',
    scientificName: 'Arachis hypogaea L.',
    status: 'in_validation',
    validationNoticeEn: 'Groundnut leaf miner and collar rot vision benchmarks scheduled for Jajpur & Puri sandy coastal soils.',
    validationNoticeOr: 'ଚିନାବାଦାମ ପତ୍ର ଖୋଳା ପୋକ ମଡେଲ ଯାଞ୍ଚ କରାଯାଉଛି।',
    keyTargetPests: ['Leaf Miner', 'Spodoptera litura', 'White Grub'],
    icon: '🥜'
  },
  {
    id: 'pulses',
    nameEn: 'Pulses (Green Gram / Black Gram)',
    nameOr: 'ଡାଲି ଜାତୀୟ ଫସଲ (ମୁଗ / ବିରି)',
    scientificName: 'Vigna radiata / Vigna mungo',
    status: 'in_validation',
    validationNoticeEn: 'Pod borer (Helicoverpa / Maruca) annotation phase for Nayagarh and Cuttack riverine pulse belts.',
    validationNoticeOr: 'ମୁଗ ଓ ବିରି ଫଳି ବିନ୍ଧା ପୋକ ପାଇଁ କୃଷି ମଡେଲ ବିକାଶ ଚାଲିଛି।',
    keyTargetPests: ['Pod Borer', 'Whitefly / YMV Vector', 'Spotted Pod Borer'],
    icon: '🌱'
  }
];
