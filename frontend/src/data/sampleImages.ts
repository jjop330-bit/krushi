import { PestId } from '../types/pest';

export interface SamplePestImage {
  id: string;
  pestId: PestId;
  labelEn: string;
  labelOr: string;
  descriptionEn: string;
  descriptionOr: string;
  imageUri: string;
  isBlurryOrUncertain?: boolean;
}

// Crisp, high-detail SVG graphics encoded as Data URIs representing genuine field observations
const createSvgUri = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
};

export const SAMPLE_PEST_IMAGES: SamplePestImage[] = [
  {
    id: 'sample-bph-1',
    pestId: 'bph',
    labelEn: 'Brown Planthopper on Stem Base',
    labelOr: 'ଧାନ ଗଛ ମୂଳରେ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ',
    descriptionEn: 'Dense cluster of brown nymphs and adults crowding the lower stem base of rice tillers.',
    descriptionOr: 'ଧାନ ଗଛର ନିମ୍ନ ଭାଗରେ ମାଟିଆ ରଙ୍ଗର ଶିଶୁ ଓ ବୟସ୍କ ଗୁଣ୍ଡି ପୋକଙ୍କ ଭିଡ଼।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <linearGradient id="mudSoil" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4B382A" />
            <stop offset="100%" stop-color="#2B1D14" />
          </linearGradient>
          <linearGradient id="riceStem" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#657A3C" />
            <stop offset="50%" stop-color="#A2B95C" />
            <stop offset="100%" stop-color="#4E5E28" />
          </linearGradient>
          <radialGradient id="hopperGrad" cx="40%" cy="30%">
            <stop offset="0%" stop-color="#B87B44" />
            <stop offset="80%" stop-color="#5C3615" />
            <stop offset="100%" stop-color="#2D1705" />
          </radialGradient>
        </defs>
        <!-- Mud background & stagnant water reflection -->
        <rect width="400" height="300" fill="url(#mudSoil)" />
        <ellipse cx="200" cy="270" rx="190" ry="25" fill="#3A2C1F" opacity="0.8" />
        
        <!-- Rice Tillers Base -->
        <rect x="70" y="20" width="34" height="260" rx="8" fill="url(#riceStem)" />
        <rect x="135" y="10" width="38" height="270" rx="9" fill="url(#riceStem)" />
        <rect x="205" y="15" width="36" height="265" rx="8" fill="url(#riceStem)" />
        <rect x="270" y="25" width="32" height="255" rx="7" fill="url(#riceStem)" />
        
        <!-- Yellowing and chlorosis at stem sheath -->
        <path d="M135,140 Q155,180 135,220" stroke="#CBB44A" stroke-width="8" opacity="0.7" fill="none" />
        <path d="M205,130 Q225,170 205,210" stroke="#BFA83B" stroke-width="10" opacity="0.7" fill="none" />
        
        <!-- Brown Planthopper Cluster (Adults & Nymphs) -->
        <g id="hoppers">
          <!-- Hopper 1 (Center Adult) -->
          <g transform="translate(150, 150) rotate(-15)">
            <ellipse cx="0" cy="0" rx="9" ry="16" fill="url(#hopperGrad)" />
            <polygon points="-7,5 0,18 7,5" fill="#8C5326" opacity="0.9" />
            <!-- White dorsal midline characteristic of BPH -->
            <line x1="0" y1="-10" x2="0" y2="8" stroke="#E6D3B3" stroke-width="1.2" />
            <!-- Legs & Antennae -->
            <path d="M-7,-5 L-15,-10 M7,-5 L15,-10 M-8,3 L-16,8 M8,3 L16,8 M-7,10 L-14,18 M7,10 L14,18" stroke="#331A05" stroke-width="1.2" />
            <circle cx="-3" cy="-12" r="1.5" fill="#111" />
            <circle cx="3" cy="-12" r="1.5" fill="#111" />
          </g>

          <!-- Hopper 2 (Upper stem) -->
          <g transform="translate(220, 110) rotate(10)">
            <ellipse cx="0" cy="0" rx="8" ry="14" fill="url(#hopperGrad)" />
            <line x1="0" y1="-8" x2="0" y2="6" stroke="#E6D3B3" stroke-width="1" />
            <path d="M-6,-4 L-13,-8 M6,-4 L13,-8 M-7,2 L-14,7 M7,2 L14,7" stroke="#331A05" stroke-width="1" />
          </g>

          <!-- Hopper 3 (Middle crowded) -->
          <g transform="translate(142, 185) rotate(-25)">
            <ellipse cx="0" cy="0" rx="8" ry="14" fill="url(#hopperGrad)" />
            <line x1="0" y1="-7" x2="0" y2="5" stroke="#E6D3B3" stroke-width="1" />
          </g>

          <!-- Hopper 4 (Right stem) -->
          <g transform="translate(216, 175) rotate(20)">
            <ellipse cx="0" cy="0" rx="9" ry="15" fill="url(#hopperGrad)" />
            <line x1="0" y1="-9" x2="0" y2="7" stroke="#E6D3B3" stroke-width="1.2" />
          </g>

          <!-- Hopper 5 & 6 (Young Nymphs) -->
          <ellipse cx="160" cy="120" rx="5" ry="8" fill="#C49A5E" />
          <ellipse cx="228" cy="145" rx="5" ry="9" fill="#C49A5E" />
          <ellipse cx="145" cy="215" rx="6" ry="10" fill="#996332" />
          <ellipse cx="212" cy="205" rx="5" ry="8" fill="#B3844D" />
          <ellipse cx="152" cy="100" rx="4" ry="7" fill="#D4B07B" />
        </g>
        
        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="160" height="28" rx="6" fill="#000000" opacity="0.6" />
        <text x="25" y="34" fill="#BBF7D0" font-family="sans-serif" font-size="12" font-weight="bold">BPH Field Specimen (NRRI)</text>
      </svg>
    `)
  },
  {
    id: 'sample-stem-borer-1',
    pestId: 'stem_borer',
    labelEn: 'Stem Borer "Dead Heart" & Borehole',
    labelOr: 'ମଜା ପୋକ ଆକ୍ରମଣ ଓ ମଜା ମରିବା',
    descriptionEn: 'Central tiller drying into a dead heart with visible caterpillar borehole and frass.',
    descriptionOr: 'ଧାନ ଗଛର ମଝି ଡାଳ ଶୁଖି ମଜା ମରିବା ଓ କାଣ୍ଡରେ ବିନ୍ଧ ଦେଖାଯିବା।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <linearGradient id="bgField" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E2E8D5" />
            <stop offset="100%" stop-color="#BACCA4" />
          </linearGradient>
          <linearGradient id="healthyLeaf" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2D6A2E" />
            <stop offset="50%" stop-color="#4E9B3D" />
            <stop offset="100%" stop-color="#235824" />
          </linearGradient>
          <linearGradient id="deadHeartTiller" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C29B38" />
            <stop offset="50%" stop-color="#9C7724" />
            <stop offset="100%" stop-color="#634B16" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bgField)" />

        <!-- Green outer leaves -->
        <path d="M80,300 Q110,120 70,20 Q120,80 130,300" fill="url(#healthyLeaf)" />
        <path d="M270,300 Q260,110 320,10 Q280,100 240,300" fill="url(#healthyLeaf)" />

        <!-- Main Tiller Stem -->
        <rect x="175" y="80" width="50" height="220" rx="6" fill="#6A8E3F" />

        <!-- Center Dead Heart Shoot (Dried, Yellowish-Brown & Withered) -->
        <path d="M190,200 L196,40 Q200,20 204,40 L210,200 Z" fill="url(#deadHeartTiller)" />
        <line x1="200" y1="30" x2="200" y2="190" stroke="#7A5D19" stroke-width="1.5" stroke-dasharray="4,2" />

        <!-- Entrance Borehole with Frass (Excreta) -->
        <ellipse cx="200" cy="210" rx="7" ry="5" fill="#1C1309" />
        <circle cx="197" cy="208" r="1.5" fill="#000" />
        <!-- Caterpillar frass pellets around hole -->
        <circle cx="194" cy="216" r="2.5" fill="#5E4319" />
        <circle cx="206" cy="214" r="2.2" fill="#4A3412" />
        <circle cx="202" cy="220" r="2.8" fill="#3D290C" />
        <circle cx="210" cy="218" r="1.8" fill="#6B4C1E" />

        <!-- Yellow stem borer adult moth resting on leaf margin (Diagnostic Feature) -->
        <g transform="translate(100, 110) rotate(25)">
          <!-- Silky yellow forewings with single characteristic black spot -->
          <path d="M0,0 Q18,30 14,50 Q-2,35 -6,20 Z" fill="#F4D03F" stroke="#C9A517" stroke-width="1" />
          <path d="M0,0 Q-18,30 -14,50 Q2,35 6,20 Z" fill="#F4D03F" stroke="#C9A517" stroke-width="1" />
          <!-- Black central dot on forewing -->
          <circle cx="6" cy="26" r="2.2" fill="#1F2937" />
          <circle cx="-6" cy="26" r="2.2" fill="#1F2937" />
          <!-- Slender body & labial palpi -->
          <ellipse cx="0" cy="18" rx="3.5" ry="18" fill="#DEB025" />
          <line x1="-2" y1="0" x2="-8" y2="-12" stroke="#B8860B" stroke-width="1.2" />
          <line x1="2" y1="0" x2="8" y2="-12" stroke="#B8860B" stroke-width="1.2" />
        </g>

        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="175" height="28" rx="6" fill="#000000" opacity="0.6" />
        <text x="25" y="34" fill="#FEF08A" font-family="sans-serif" font-size="12" font-weight="bold">Stem Borer Dead Heart &amp; Moth</text>
      </svg>
    `)
  },
  {
    id: 'sample-leaf-folder-1',
    pestId: 'leaf_folder',
    labelEn: 'Rice Leaf Folder Longitudinal Fold',
    labelOr: 'ଧାନ ପତ୍ରମୋଡ଼ା ପୋକର ମୋଡ଼ା ପତ୍ର',
    descriptionEn: 'Folded leaf tube with white transparent scraped streaks and green larva inside.',
    descriptionOr: 'ପତ୍ର ଲମ୍ବା ଭାବେ ମୋଡ଼ି ହୋଇ ସେଥିରେ ଧଳା କାଗଜ ଭଳି କୋରା ଦାଗ।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1B4D20" />
            <stop offset="30%" stop-color="#347C3B" />
            <stop offset="70%" stop-color="#2D6B33" />
            <stop offset="100%" stop-color="#19451E" />
          </linearGradient>
        </defs>
        <!-- Background soft field blur -->
        <rect width="400" height="300" fill="#E8EFE0" />

        <!-- Paddy leaf blade extending diagonally -->
        <path d="M40,280 Q160,180 360,40 L380,50 Q180,200 60,300 Z" fill="url(#leafGrad)" />

        <!-- Longitudinal FOLD in leaf fastened by silk threads -->
        <path d="M120,220 Q200,150 290,95 Q285,115 190,175 Q115,235 120,220 Z" fill="#4B8C53" stroke="#22542A" stroke-width="2" />
        
        <!-- White/Silvery scraped translucent patches (chlorophyll eaten) -->
        <path d="M140,200 Q180,165 240,125" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.8" />
        <path d="M155,205 Q205,165 265,120" stroke="#F1F5E9" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
        <path d="M130,215 Q170,180 215,150" stroke="#E2E8D5" stroke-width="5" stroke-linecap="round" opacity="0.75" />

        <!-- White silk stitching threads across the fold -->
        <line x1="160" y1="180" x2="175" y2="190" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9" />
        <line x1="205" y1="145" x2="220" y2="155" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9" />
        <line x1="245" y1="115" x2="260" y2="125" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9" />

        <!-- Semi-exposed green caterpillar larva inside translucent fold -->
        <g transform="translate(190, 160) rotate(-40)">
          <path d="M-25,0 Q0,4 25,0 Q0,-4 -25,0 Z" fill="#8CE034" stroke="#5E9920" stroke-width="1" />
          <circle cx="24" cy="0" r="2.8" fill="#754E18" />
          <!-- Segments -->
          <line x1="-15" y1="-3" x2="-15" y2="3" stroke="#5E9920" stroke-width="0.8" />
          <line x1="-5" y1="-4" x2="-5" y2="4" stroke="#5E9920" stroke-width="0.8" />
          <line x1="5" y1="-4" x2="5" y2="4" stroke="#5E9920" stroke-width="0.8" />
          <line x1="15" y1="-3" x2="15" y2="3" stroke="#5E9920" stroke-width="0.8" />
        </g>

        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="180" height="28" rx="6" fill="#000000" opacity="0.6" />
        <text x="25" y="34" fill="#86EFAC" font-family="sans-serif" font-size="12" font-weight="bold">Leaf Folder Longitudinal Fold</text>
      </svg>
    `)
  },
  {
    id: 'sample-rice-hispa-1',
    pestId: 'rice_hispa',
    labelEn: 'Rice Hispa Spiny Beetle & Leaf Blister',
    labelOr: 'ହିସପା କଣ୍ଟା ପୋକ ଓ ପତ୍ରରେ ଧଳା ଗାର',
    descriptionEn: 'Small spiny black beetle scraping parallel white streaks along leaf blade.',
    descriptionOr: 'ନୀଳ-କଳା କଣ୍ଟା ପୋକ ଏବଂ ପତ୍ର ଉପରେ ସମାନ୍ତରାଳ ଧଳା ଗାର।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <!-- Background Leaf Blade -->
        <rect width="400" height="300" fill="#2E6B34" />
        <!-- Parallel Leaf Veins -->
        <g stroke="#3E8045" stroke-width="2">
          <line x1="0" y1="50" x2="400" y2="50" />
          <line x1="0" y1="90" x2="400" y2="90" />
          <line x1="0" y1="130" x2="400" y2="130" />
          <line x1="0" y1="170" x2="400" y2="170" />
          <line x1="0" y1="210" x2="400" y2="210" />
          <line x1="0" y1="250" x2="400" y2="250" />
        </g>

        <!-- Characteristic Hispa White Parallel Streaks (Epidermal scraping) -->
        <g stroke="#EAF2E1" stroke-width="5" stroke-linecap="round" opacity="0.85">
          <line x1="40" y1="75" x2="220" y2="75" />
          <line x1="60" y1="95" x2="310" y2="95" stroke-width="7" />
          <line x1="90" y1="115" x2="180" y2="115" />
          <line x1="260" y1="115" x2="380" y2="115" stroke-width="6" />
          <line x1="30" y1="195" x2="250" y2="195" stroke-width="8" />
          <line x1="120" y1="225" x2="340" y2="225" stroke-width="5" />
        </g>

        <!-- Blister Leaf Mine (Translucent grub chamber) -->
        <ellipse cx="140" cy="150" rx="35" ry="18" fill="#8CA87A" opacity="0.65" stroke="#CADBBF" stroke-dasharray="3,3" />

        <!-- Adult Hispa Beetle (Dicladispa armigera) - Distinctive Spines! -->
        <g transform="translate(230, 150) rotate(15)">
          <!-- Legs -->
          <g stroke="#111827" stroke-width="2.5" stroke-linecap="round">
            <line x1="-12" y1="-8" x2="-26" y2="-20" />
            <line x1="12" y1="-8" x2="26" y2="-20" />
            <line x1="-16" y1="4" x2="-30" y2="4" />
            <line x1="16" y1="4" x2="30" y2="4" />
            <line x1="-12" y1="18" x2="-28" y2="30" />
            <line x1="12" y1="18" x2="28" y2="30" />
          </g>

          <!-- Thorax and Body -->
          <ellipse cx="0" cy="12" rx="16" ry="22" fill="#111827" />
          <rect x="-10" y="-10" width="20" height="14" rx="4" fill="#0A0E17" />
          <circle cx="0" cy="-14" r="7" fill="#1F2937" />
          <!-- Antennae -->
          <line x1="-4" y1="-20" x2="-14" y2="-32" stroke="#111827" stroke-width="2" />
          <line x1="4" y1="-20" x2="14" y2="-32" stroke="#111827" stroke-width="2" />

          <!-- DORSAL & LATERAL SPINES (Signature Hispa Feature) -->
          <g stroke="#030712" stroke-width="2.2" stroke-linecap="round">
            <!-- Thoracic spines -->
            <line x1="-10" y1="-8" x2="-22" y2="-12" />
            <line x1="10" y1="-8" x2="22" y2="-12" />
            <line x1="-10" y1="-4" x2="-20" y2="-4" />
            <line x1="10" y1="-4" x2="20" y2="-4" />
            <!-- Elytral wing spines -->
            <line x1="-15" y1="4" x2="-24" y2="0" />
            <line x1="15" y1="4" x2="24" y2="0" />
            <line x1="-16" y1="12" x2="-26" y2="10" />
            <line x1="16" y1="12" x2="26" y2="10" />
            <line x1="-15" y1="20" x2="-23" y2="22" />
            <line x1="15" y1="20" x2="23" y2="22" />
            <line x1="-10" y1="28" x2="-16" y2="34" />
            <line x1="10" y1="28" x2="16" y2="34" />
            <line x1="0" y1="32" x2="0" y2="40" />
          </g>
          <!-- Metallic bluish sheen highlight -->
          <ellipse cx="-4" cy="10" rx="4" ry="12" fill="#2563EB" opacity="0.35" />
        </g>

        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="180" height="28" rx="6" fill="#000000" opacity="0.6" />
        <text x="25" y="34" fill="#93C5FD" font-family="sans-serif" font-size="12" font-weight="bold">Rice Hispa Spiny Beetle (OUAT)</text>
      </svg>
    `)
  },
  {
    id: 'sample-armyworm-1',
    pestId: 'armyworm',
    labelEn: 'Rice Armyworm Severing Panicle',
    labelOr: 'ଲେଡା ପୋକ ଶିଁଷା କାଟୁଥିବା ଅବସ୍ଥା',
    descriptionEn: 'Large striped nocturnal caterpillar climbing up the rice stem and feeding at the panicle base.',
    descriptionOr: 'ପଟା ପଟା ଚିହ୍ନ ଥିବା ଲେଡା ପୋକ ଧାନ ଶିଁଷା କାଟୁଥିବା ଅବସ୍ଥା।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <!-- Twilight/Night background for nocturnal armyworm -->
        <rect width="400" height="300" fill="#1C2833" />
        
        <!-- Golden Rice Panicle (Heading Stage) -->
        <g stroke="#D4AC0D" stroke-width="2.5" fill="none">
          <path d="M220,300 Q210,180 200,90 Q220,50 260,20" />
          <!-- Rice Grains on Panicle Branches -->
          <ellipse cx="230" cy="50" rx="4" ry="9" transform="rotate(30, 230, 50)" fill="#F4D03F" stroke="#B7950B" stroke-width="1" />
          <ellipse cx="245" cy="40" rx="4" ry="9" transform="rotate(40, 245, 40)" fill="#F4D03F" stroke="#B7950B" stroke-width="1" />
          <ellipse cx="260" cy="25" rx="4" ry="9" transform="rotate(45, 260, 25)" fill="#F4D03F" stroke="#B7950B" stroke-width="1" />
          <ellipse cx="215" cy="70" rx="4" ry="9" transform="rotate(20, 215, 70)" fill="#F4D03F" stroke="#B7950B" stroke-width="1" />
        </g>

        <!-- Severed drooping neck where caterpillar is chewing -->
        <circle cx="205" cy="95" r="4" fill="#935116" />
        
        <!-- Large Armyworm Caterpillar (Mythimna separata) -->
        <g transform="translate(165, 120) rotate(55)">
          <!-- Caterpillar Body with longitudinal stripes -->
          <path d="M-60,0 C-40,10 40,10 60,0 C40,-10 -40,-10 -60,0 Z" fill="#5D6D7E" stroke="#2C3E50" stroke-width="1.5" />
          <!-- Characteristic longitudinal dorsal and lateral stripes -->
          <path d="M-55,-2 C-35,6 35,6 55,-2" stroke="#FAD7A0" stroke-width="2" fill="none" />
          <path d="M-55,-6 C-35,2 35,2 55,-6" stroke="#273746" stroke-width="2" fill="none" />
          <path d="M-55,4 C-35,10 35,10 55,4" stroke="#D35400" stroke-width="1.5" fill="none" />
          
          <!-- Head Capsule (Reddish brown with inverted Y-mark) -->
          <circle cx="62" cy="0" r="8" fill="#78281F" stroke="#4A235A" stroke-width="1.2" />
          <line x1="62" y1="-5" x2="62" y2="1" stroke="#F5B7B1" stroke-width="1.2" />
          <line x1="62" y1="1" x2="58" y2="6" stroke="#F5B7B1" stroke-width="1.2" />
          <line x1="62" y1="1" x2="66" y2="6" stroke="#F5B7B1" stroke-width="1.2" />

          <!-- Prolegs grasping stem -->
          <ellipse cx="-20" cy="9" rx="3" ry="5" fill="#34495E" />
          <ellipse cx="-5" cy="9" rx="3" ry="5" fill="#34495E" />
          <ellipse cx="10" cy="9" rx="3" ry="5" fill="#34495E" />
          <ellipse cx="25" cy="9" rx="3" ry="5" fill="#34495E" />
        </g>

        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="195" height="28" rx="6" fill="#000000" opacity="0.6" />
        <text x="25" y="34" fill="#FCA5A5" font-family="sans-serif" font-size="12" font-weight="bold">Rice Armyworm (Ear-Cutting)</text>
      </svg>
    `)
  },
  {
    id: 'sample-beneficial-spider-1',
    pestId: 'beneficial_spider',
    labelEn: 'Beneficial Wolf Spider (Do Not Spray)',
    labelOr: 'ଚାଷୀଙ୍କ ବନ୍ଧୁ କଲମ ବୁଢ଼ିଆଣୀ (ଔଷଧ ସିଞ୍ଚନ୍ତୁ ନାହିଁ)',
    descriptionEn: 'Lycosa pseudoannulata predatory wolf spider actively hunting planthoppers on rice tiller.',
    descriptionOr: 'ଚାଷୀଙ୍କ ପରମ ବନ୍ଧୁ କଲମ ବୁଢ଼ିଆଣୀ ଧାନ କ୍ଷେତରେ ଗୁଣ୍ଡି ପୋକ ଶିକାର କରୁଛି।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <!-- Clean Green Rice Leaf Background -->
        <rect width="400" height="300" fill="#245A2E" />
        <path d="M50,0 Q200,150 350,300" stroke="#378446" stroke-width="18" fill="none" opacity="0.5" />
        
        <!-- Wolf Spider (Lycosa pseudoannulata) - Free Hunter, No Web -->
        <g transform="translate(200, 150)">
          <!-- 8 Long Radiating Legs with Mottled Bands -->
          <g stroke="#4A3B2C" stroke-width="3" stroke-linecap="round" fill="none">
            <!-- Front left -->
            <path d="M-8,-10 Q-35,-40 -60,-65" />
            <!-- Front right -->
            <path d="M8,-10 Q35,-40 60,-65" />
            <!-- Second left -->
            <path d="M-12,-4 Q-45,-15 -80,-25" />
            <!-- Second right -->
            <path d="M12,-4 Q45,-15 80,-25" />
            <!-- Third left -->
            <path d="M-12,8 Q-45,20 -75,45" />
            <!-- Third right -->
            <path d="M12,8 Q45,20 75,45" />
            <!-- Back left -->
            <path d="M-8,16 Q-30,55 -55,85" />
            <!-- Back right -->
            <path d="M8,16 Q30,55 55,85" />
          </g>

          <!-- Cephalothorax (Head/Chest) with distinct longitudinal light stripe -->
          <ellipse cx="0" cy="-6" rx="14" ry="18" fill="#6E5843" stroke="#2B2016" stroke-width="1.5" />
          <!-- Central radiant fork band on cephalothorax -->
          <path d="M0,-22 L-4,6 M0,-22 L4,6" stroke="#D1BA9D" stroke-width="2" stroke-linecap="round" />
          
          <!-- Eyes (Characteristic 3-row wolf spider eye arrangement) -->
          <circle cx="-4" cy="-18" r="1.8" fill="#111" />
          <circle cx="4" cy="-18" r="1.8" fill="#111" />
          <circle cx="-7" cy="-15" r="1.4" fill="#111" />
          <circle cx="7" cy="-15" r="1.4" fill="#111" />

          <!-- Abdomen (Egg-shaped with chevron markings) -->
          <ellipse cx="0" cy="22" rx="16" ry="24" fill="#826B54" stroke="#3D2F22" stroke-width="1.5" />
          <!-- Chevrons -->
          <path d="M-8,14 L0,20 L8,14 M-7,22 L0,28 L7,22 M-5,30 L0,35 L5,30" stroke="#D1BA9D" stroke-width="1.8" fill="none" />
        </g>

        <!-- Beneficial Protection Banner -->
        <rect x="15" y="15" width="220" height="28" rx="6" fill="#15803D" opacity="0.9" />
        <text x="25" y="34" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">BENEFICIAL PREDATOR (Eco-Agent)</text>
      </svg>
    `)
  },
  {
    id: 'sample-healthy-paddy-1',
    pestId: 'healthy_paddy',
    labelEn: 'Healthy Rice Crop (Tillering Stage)',
    labelOr: 'ସୁସ୍ଥ ନିରୋଗ ଧାନ ଗଛ (ବୃଦ୍ଧି ପର୍ଯ୍ୟାୟ)',
    descriptionEn: 'Vibrant green upright tillers with zero pest feeding lesions or leaf drying.',
    descriptionOr: 'ଚମତ୍କାର ସବୁଜ ତାଜା ଧାନ ଗଛ, କୌଣସି ପୋକ ବା ରୋଗର ଚିହ୍ନ ନାହିଁ।',
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#BAE6FD" />
            <stop offset="60%" stop-color="#E0F2FE" />
            <stop offset="100%" stop-color="#FEF9C3" />
          </linearGradient>
          <linearGradient id="paddyGreen1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#14532D" />
            <stop offset="50%" stop-color="#16A34A" />
            <stop offset="100%" stop-color="#4ADE80" />
          </linearGradient>
        </defs>
        <!-- Blue Sky & Morning Sun -->
        <rect width="400" height="300" fill="url(#skyGrad)" />
        <circle cx="340" cy="50" r="28" fill="#FDE047" opacity="0.85" />

        <!-- Lush Green Rice Canopy -->
        <path d="M50,300 Q100,100 160,30 Q120,120 100,300" fill="url(#paddyGreen1)" />
        <path d="M120,300 Q180,80 240,20 Q200,110 180,300" fill="url(#paddyGreen1)" />
        <path d="M220,300 Q260,110 320,40 Q280,130 250,300" fill="url(#paddyGreen1)" />
        <path d="M20,300 Q60,140 100,60 Q80,160 60,300" fill="url(#paddyGreen1)" />
        <path d="M280,300 Q330,120 380,50 Q340,150 310,300" fill="url(#paddyGreen1)" />

        <!-- Droplets of pure morning dew -->
        <circle cx="160" cy="40" r="3.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="240" cy="30" r="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="100" cy="80" r="2.5" fill="#FFFFFF" opacity="0.9" />

        <!-- Scientific Badge Overlay -->
        <rect x="15" y="15" width="180" height="28" rx="6" fill="#15803D" opacity="0.9" />
        <text x="25" y="34" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">HEALTHY CROP (No Spray)</text>
      </svg>
    `)
  },
  {
    id: 'sample-uncertain-blurry-1',
    pestId: 'uncertain',
    labelEn: 'Unclear / Out-of-Focus Test Photo',
    labelOr: 'ଅସ୍ପଷ୍ଟ / ଝାପ୍‌ସା ପରୀକ୍ଷାମୂଳକ ଫଟୋ',
    descriptionEn: 'Intentionally blurred photograph taken from far away to test AI quality validation & uncertainty warning.',
    descriptionOr: 'AI ର ଗୁଣବତ୍ତା ଯାଞ୍ଚ ପାଇଁ ଏକ ଦୂରରୁ ଉଠାଯାଇଥିବା ଅସ୍ପଷ୍ଟ ଫଟୋ।',
    isBlurryOrUncertain: true,
    imageUri: createSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
        <defs>
          <filter id="heavyBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <rect width="400" height="300" fill="#3F5938" />
        
        <!-- Blurred vague shapes -->
        <g filter="url(#heavyBlur)">
          <ellipse cx="180" cy="140" rx="90" ry="70" fill="#A89258" />
          <ellipse cx="230" cy="180" rx="60" ry="40" fill="#2E2319" />
          <line x1="50" y1="280" x2="350" y2="40" stroke="#8AAB6C" stroke-width="40" />
        </g>

        <!-- Warning Badge Overlay -->
        <rect x="15" y="15" width="230" height="28" rx="6" fill="#DC2626" opacity="0.9" />
        <text x="25" y="34" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">QUALITY TEST: Low Resolution / Blur</text>
      </svg>
    `)
  }
];
