export interface TranslationDictionary {
  appName: string;
  tagline: string;
  taglineOr: string;
  languageSelect: string;
  navHome: string;
  navScanner: string;
  navReport: string;
  navTreatment: string;
  navAssistant: string;
  navMap: string;
  navFollowUp: string;
  navCropLibrary: string;
  navExpertPortal: string;
  navSettings: string;
  ctaScanNow: string;
  ctaVoiceAsk: string;
  ctaDemoMode: string;
  ctaRetake: string;
  ctaSaveReport: string;
  ctaEscalateExpert: string;
  confidenceLabel: string;
  biologicalTab: string;
  culturalTab: string;
  chemicalTab: string;
  disclaimerText: string;
  emergencyHelpline: string;
  kvkTitle: string;
  // New Marketplace & Expert Modules
  navStore: string;
  navTalkExpert: string;
  navSellerPortal: string;
  navAdminDashboard: string;
  navMyOrders: string;
  navMyRequests: string;
  ctaFindProducts: string;
  ctaDiscussExpert: string;
  cartTitle: string;
  checkoutTitle: string;
  sellerRegisterTitle: string;
}

export const ODIA_TRANSLATIONS: Record<'en' | 'or', TranslationDictionary> = {
  en: {
    appName: 'Krushi Mitra AI',
    tagline: 'Detect Early. Understand the Damage. Save the Harvest.',
    taglineOr: 'ଶୀଘ୍ର ଚିହ୍ନଟ କରନ୍ତୁ। କ୍ଷତିର ମାତ୍ରା ବୁଝନ୍ତୁ। ଫସଲ ରକ୍ଷା କରନ୍ତୁ।',
    languageSelect: 'Language / ଭାଷା',
    navHome: 'Dashboard',
    navScanner: 'AI Pest Scanner',
    navReport: 'Diagnostic Report',
    navTreatment: 'Smart Treatments',
    navAssistant: 'Odia Voice Assistant',
    navMap: 'Odisha Outbreak Map',
    navFollowUp: 'Follow-Up',
    navCropLibrary: 'Crops',
    navExpertPortal: 'Expert Review Queue',
    navSettings: 'API & Configuration',
    ctaScanNow: 'Scan Crop Leaf Now',
    ctaVoiceAsk: 'Ask Voice Assistant in Odia',
    ctaDemoMode: 'Load Verified Odisha Sample Data',
    ctaRetake: 'Replace / Retake Photo',
    ctaSaveReport: 'Save to Farmer Record',
    ctaEscalateExpert: 'Escalate to KVK Scientist',
    confidenceLabel: 'AI Diagnostic Confidence',
    biologicalTab: '1. Biological & Predators',
    culturalTab: '2. Cultural & Mechanical',
    chemicalTab: '3. Regulated Chemical (CIBRC)',
    disclaimerText: 'Krushi Mitra AI is an independent AI research project developed for Odisha AI Hackathon 2026. It is NOT officially affiliated with ICAR, OUAT, or the Government of Odisha. Always verify serious outbreaks with your local KVK or Agriculture Officer.',
    emergencyHelpline: 'Kisan Call Centre Toll-Free: 1800-180-1551 (6 AM - 10 PM)',
    kvkTitle: 'Krishi Vigyan Kendra (KVK) Escalation Network',
    navStore: 'Krushi Store',
    navTalkExpert: 'Talk to an Expert',
    navSellerPortal: 'Seller Portal',
    navAdminDashboard: 'Admin Control',
    navMyOrders: 'My Orders',
    navMyRequests: 'My Support Requests',
    ctaFindProducts: 'Find Relevant Products',
    ctaDiscussExpert: 'Discuss With an Expert',
    cartTitle: 'Shopping Cart',
    checkoutTitle: 'Checkout & Delivery',
    sellerRegisterTitle: 'Register as Agri Seller'
  },
  or: {
    appName: 'କୃଷି ମିତ୍ର AI',
    tagline: 'ଶୀଘ୍ର ଚିହ୍ନଟ କରନ୍ତୁ। କ୍ଷତିର ମାତ୍ରା ବୁଝନ୍ତୁ। ଫସଲ ରକ୍ଷା କରନ୍ତୁ।',
    taglineOr: 'ଶୀଘ୍ର ଚିହ୍ନଟ କରନ୍ତୁ। କ୍ଷତିର ମାତ୍ରା ବୁଝନ୍ତୁ। ଫସଲ ରକ୍ଷା କରନ୍ତୁ।',
    languageSelect: 'ଭାଷା / Language',
    navHome: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    navScanner: 'କୀଟ ଚିହ୍ନଟ ସ୍କାନର',
    navReport: 'ନିରୀକ୍ଷଣ ରିପୋର୍ଟ',
    navTreatment: 'ଉପଚାର ପରାମର୍ଶ',
    navAssistant: 'ଓଡ଼ିଆ ଭଏସ୍ ସାଥୀ',
    navMap: 'ଓଡ଼ିଶା କୀଟ ମାନଚିତ୍ର',
    navFollowUp: 'ପରବର୍ତ୍ତୀ ଯାଞ୍ଚ (Follow-up)',
    navCropLibrary: 'ଫସଲ ତାଲିକା',
    navExpertPortal: 'କୃଷି ବିଶେଷଜ୍ଞ ଡେସ୍କ',
    navSettings: 'ସେଟିଂସ ଓ AI କି',
    ctaScanNow: 'ଧାନ ପତ୍ର ଫଟୋ ସ୍କାନ୍ କରନ୍ତୁ',
    ctaVoiceAsk: 'ଓଡ଼ିଆରେ କଥା ହୋଇ ପଚାରନ୍ତୁ',
    ctaDemoMode: 'ପରୀକ୍ଷିତ ଓଡ଼ିଶା ତଥ୍ୟ ଦେଖନ୍ତୁ',
    ctaRetake: 'ଅନ୍ୟ ଫଟୋ ଉଠାନ୍ତୁ',
    ctaSaveReport: 'ରିପୋର୍ଟ ସଂରକ୍ଷଣ କରନ୍ତୁ',
    ctaEscalateExpert: 'କୃଷି ବିଜ୍ଞାନୀଙ୍କ ପରାମର୍ଶ ମାଗନ୍ତୁ',
    confidenceLabel: 'AI ନିର୍ଣ୍ଣୟ ସଠିକତା',
    biologicalTab: '୧. ଜୈବିକ ଓ ବନ୍ଧୁ କୀଟ',
    culturalTab: '୨. ଚାଷ ପଦ୍ଧତି ଓ ଯାନ୍ତ୍ରିକ',
    chemicalTab: '୩. ଅନୁମୋଦିତ ରାସାୟନିକ (CIBRC)',
    disclaimerText: 'କୃଷି ମିତ୍ର AI ଓଡ଼ିଶା AI ହ୍ୟାକାଥନ୍ ୨୦୨୬ ପାଇଁ ପ୍ରସ୍ତୁତ ଏକ ସ୍ୱତନ୍ତ୍ର AI ଅନୁସନ୍ଧାନ ମଞ୍ଚ। ଏହା ICAR, OUAT କିମ୍ବା ଓଡ଼ିଶା ସରକାରଙ୍କ ସହିତ ସରକାରୀ ଭାବେ ଅନୁବନ୍ଧିତ ନୁହେଁ। ବଡ଼ ଧରଣର ଆକ୍ରମଣ ବେଳେ ସ୍ଥାନୀୟ କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
    emergencyHelpline: 'କିଷାନ କଲ୍ ସେଣ୍ଟର୍ ନିଃଶୁଳ୍କ ନମ୍ବର: ୧୮୦୦-୧୮୦-୧୫୫୧ (ସକାଳ ୬ ରୁ ରାତି ୧୦)',
    kvkTitle: 'କୃଷି ବିଜ୍ଞାନ କେନ୍ଦ୍ର (KVK) ସହାୟତା ନେଟୱାର୍କ',
    navStore: 'କୃଷି ଷ୍ଟୋର',
    navTalkExpert: 'ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ',
    navSellerPortal: 'ବିକ୍ରେତା ପୋର୍ଟାଲ',
    navAdminDashboard: 'ପ୍ରଶାସନିକ ନିୟନ୍ତ୍ରଣ',
    navMyOrders: 'ମୋର ଅର୍ଡର',
    navMyRequests: 'ମୋର ପରାମର୍ଶ ଅନୁରୋଧ',
    ctaFindProducts: 'ଅନୁକୂଳ ଉତ୍ପାଦ ଖୋଜନ୍ତୁ',
    ctaDiscussExpert: 'ବିଶେଷଜ୍ଞଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ',
    cartTitle: 'କ୍ରୟ ଥଳି (Cart)',
    checkoutTitle: 'ଚେକ୍‌ଆଉଟ୍ ଓ ଠିକଣା',
    sellerRegisterTitle: 'ବିକ୍ରେତା ଭାବେ ଯୋଗଦିଅନ୍ତୁ'
  }
};
