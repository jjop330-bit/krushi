"""
Comprehensive Odisha Crop Knowledge Registry for Krushi Mitra AI.
Authoritative source-backed agronomic repository covering 30+ major Odisha crops
across Cereals, Pulses, Oilseeds, Vegetables, and Fruits & Horticulture.
Compiled from OUAT Bhubaneswar, ICAR-NRRI Cuttack, ICAR-CIWA, KVKs, and
Odisha Department of Agriculture & Farmers' Empowerment.
"""
from typing import Dict, Any, List, Optional
from app.models.crop import CropDetail, CropCategory, CropValidationStatus, CropPestSummary

ODISHA_CROPS_REGISTRY: Dict[str, Dict[str, Any]] = {
    # ----------------------------------------------------
    # 1. CEREALS & MILLETS
    # ----------------------------------------------------
    "paddy": {
        "id": "paddy",
        "common_name_en": "Rice / Paddy",
        "common_name_or": "ଧାନ (Dhana)",
        "scientific_name": "Oryza sativa L.",
        "category": CropCategory.CEREALS_MILLETS,
        "category_name_en": "Cereals & Millets",
        "category_name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ",
        "validation_status": CropValidationStatus.ACTIVE_VALIDATED,
        "growth_stages": ["Nursery / Seedling", "Tillering", "Stem Elongation / Booting", "Panicle Initiation", "Flowering / Heading", "Milking / Dough", "Maturity / Ripening"],
        "plant_parts": ["leaf", "stem", "root", "panicle", "grain", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "bph",
                "common_name_en": "Brown Planthopper (BPH)",
                "common_name_or": "ମାଟିଆ ଗୁଣ୍ଡି ପୋକ",
                "scientific_name": "Nilaparvata lugens (Stål)",
                "local_name_or": "ମାଟିଆ ଗୁଣ୍ଡି ପୋକ",
                "affected_parts": ["stem", "leaf"],
                "etl_en": "5-10 insects/hill in vegetative, 15-20 insects/hill in reproductive",
                "etl_or": "ଗଛ ବୃଦ୍ଧି ସମୟରେ ୫-୧୦ ପୋକ/ଗଛ, ଶିଁଷା ସମୟରେ ୧୫-୨୦ ପୋକ/ଗଛ",
                "validation_status": "validated"
            },
            {
                "pest_id": "stem_borer",
                "common_name_en": "Yellow Stem Borer",
                "common_name_or": "ହଳଦିଆ ମଝିପୋକ",
                "scientific_name": "Scirpophaga incertulas (Walker)",
                "local_name_or": "କାଣ୍ଡ ବିନ୍ଧା ପୋକ / ମଝିପୋକ",
                "affected_parts": ["stem", "panicle"],
                "etl_en": "5% dead hearts in vegetative stage; 1 egg mass/sq.m; 2% white heads in flowering",
                "etl_or": "ବୃଦ୍ଧି ସମୟରେ ୫% ଶୁଖିଲା ମଝିଡାଙ୍ଗ; ଫୁଲ ସମୟରେ ୨% ଧଳା ଶିଁଷା",
                "validation_status": "validated"
            },
            {
                "pest_id": "leaf_folder",
                "common_name_en": "Rice Leaf Folder",
                "common_name_or": "ପତ୍ରମୋଡ଼ା ପୋକ",
                "scientific_name": "Cnaphalocrocis medinalis (Guenée)",
                "local_name_or": "ପତ୍ରଗୁଡ଼ା ପୋକ",
                "affected_parts": ["leaf"],
                "etl_en": "1-2 damaged folded leaves with live larvae per hill",
                "etl_or": "ଗଛ ପ୍ରତି ୧-୨ଟି ଜୀବନ୍ତ ପୋକ ଥିବା ମୁଡୁଳା ପତ୍ର",
                "validation_status": "validated"
            },
            {
                "pest_id": "rice_hispa",
                "common_name_en": "Rice Hispa",
                "common_name_or": "ଧାନ ହିସ୍ପା (କଣ୍ଟା ପୋକ)",
                "scientific_name": "Dicladispa armigera (Olivier)",
                "local_name_or": "ଚିପୁଡ଼ି ପୋକ / କଣ୍ଟା ପୋକ",
                "affected_parts": ["leaf"],
                "etl_en": "1-2 adults or 2 damaged leaves with grubs per hill",
                "etl_or": "ଗଛ ପ୍ରତି ୧-୨ ବୟସ୍କ କିମ୍ବା ଶୁକ ଥିବା ପତ୍ର",
                "validation_status": "validated"
            },
            {
                "pest_id": "armyworm",
                "common_name_en": "Rice Swarming Caterpillar / Armyworm",
                "common_name_or": "ଲେଡା ପୋକ / ଧାନ କାଟୁଆ ପୋକ",
                "scientific_name": "Mythimna separata (Walker)",
                "local_name_or": "କାଟୁଆ ପୋକ / ଲେଡା ପୋକ",
                "affected_parts": ["leaf", "panicle"],
                "etl_en": "1-2 larvae per hill or visible panicle cutting",
                "etl_or": "ଗଛ ପ୍ରତି ୧-୨ଟି ଲାର୍ଭା କିମ୍ବା ଶିଁଷା କଟା ଦେଖାଗଲେ",
                "validation_status": "validated"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Wolf Spider (Lycosa pseudoannulata)", "name_or": "ବନ୍ଧୁ ବୁଢ଼ିଆଣୀ", "role": "Active hunter of BPH and leaf folder larvae"},
            {"name_en": "Mirid Bug (Cyrtorhinus lividipennis)", "name_or": "ମିରିଡ୍ ବଗ୍", "role": "Egg predator of planthoppers"},
            {"name_en": "Trichogramma japonicum", "name_or": "ଟ୍ରାଇକୋଗ୍ରାମା ମିତ୍ର ପୋକ", "role": "Egg parasitoid of stem borer"}
        ],
        "common_diseases": ["Bacterial Leaf Blight (BLB)", "Rice Blast (Magnaporthe oryzae)", "Sheath Blight (Rhizoctonia solani)", "Brown Spot (Bipolaris oryzae)"],
        "nutrient_deficiencies": ["Nitrogen (uniform leaf yellowing)", "Phosphorus (narrow erect dark leaves, delayed tillering)", "Zinc / Khaira disease (rusty brown spots on lower leaves)"],
        "characteristic_symptoms": ["Hopperburn circular patches", "Dead hearts in tillering", "Whiteheads at grain filling", "Longitudinally folded leaves with white scrape marks"],
        "scouting_methods": ["Random sampling of 20 hills per acre diagonally", "Inspect stem bases by gently parting tillers", "Sweep net scouting for active flying moths"],
        "cultural_mechanical_control": ["Provide 30 cm alleyways (pathways) every 2 meters for aeration", "Alternate Wetting and Drying (AWD)", "Balanced fertilization without excess urea"],
        "biological_control": ["Release Trichogramma japonicum @ 50,000/ha", "Conserve wolf spiders by avoiding broad-spectrum synthetic pyrethroids"],
        "chemical_control_safeguards": ["Chemical control fail-closed: strictly gated behind ETL breach verified by authorized supervisor", "CIBRC registered pesticides only: Triflumezopyrim, Chlorantraniliprole, Cartap Hydrochloride", "Strict observation of 14-21 days Pre-Harvest Intervals (PHI)"],
        "source_institutions": ["ICAR-National Rice Research Institute (NRRI) Cuttack", "Orissa University of Agriculture & Technology (OUAT) Bhubaneswar"],
        "evidence_status": "Fully Validated Multi-Season Evidence (Phase 6.2 / 6.3)",
        "icon": "🌾"
    },
    "maize": {
        "id": "maize",
        "common_name_en": "Maize / Corn",
        "common_name_or": "ମକା (Maka)",
        "scientific_name": "Zea mays L.",
        "category": CropCategory.CEREALS_MILLETS,
        "category_name_en": "Cereals & Millets",
        "category_name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Emergence / V1-V3", "Vegetative / Whorl (V4-V8)", "Tasseling / VT", "Silking / R1", "Milking / Dough", "Physiological Maturity"],
        "plant_parts": ["leaf", "whorl", "stem", "tassel", "cob", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "fall_armyworm",
                "common_name_en": "Fall Armyworm (FAW)",
                "common_name_or": "ଫଲ୍ ଆର୍ମିୱାର୍ମ / ମକା କାଟୁଆ ପୋକ",
                "scientific_name": "Spodoptera frugiperda (J.E. Smith)",
                "local_name_or": "ବିଦେଶୀ ଲେଡା ପୋକ / ମକା କାଟୁଆ",
                "affected_parts": ["whorl", "leaf", "cob"],
                "etl_en": "5% infested whorls in seedling (V1-V4); 10% in mid-whorl (V5-V8); 20% in late whorl",
                "etl_or": "ଚାରା ଅବସ୍ଥାରେ ୫% ଆକ୍ରାନ୍ତ ଗଛ; ବୃଦ୍ଧି ସମୟରେ ୧୦% ଏବଂ ବଡ଼ ଅବସ୍ଥାରେ ୨୦%",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "stem_borer_maize",
                "common_name_en": "Maize Stem Borer",
                "common_name_or": "ମକା କାଣ୍ଡ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Chilo partellus (Swinhoe)",
                "local_name_or": "ମକା ମଝିପୋକ",
                "affected_parts": ["stem", "whorl"],
                "etl_en": "10% plants with pin holes or shot holes on leaf blades",
                "etl_or": "୧୦% ଗଛର ପତ୍ରରେ ଛୋଟ ଛୋଟ ବିନ୍ଧ କଣା ଦେଖାଗଲେ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Trichogramma pretiosum", "name_or": "ଟ୍ରାଇକୋଗ୍ରାମା ମିତ୍ର ପୋକ", "role": "Egg parasitoid attacking FAW egg masses"},
            {"name_en": "Earwig (Doru luteipes)", "name_or": "ଇୟରୱିଗ୍ ବନ୍ଧୁ କୀଟ", "role": "Nymph and larval predator residing in leaf whorls"}
        ],
        "common_diseases": ["Maydis Leaf Blight (Bipolaris maydis)", "Turcicum Leaf Blight (Exserohilum turcicum)", "Bacterial Stalk Rot (Dickeya zeae)"],
        "nutrient_deficiencies": ["Nitrogen (V-shaped chlorosis extending from leaf tip down midrib)", "Zinc (broad whitish bands on either side of leaf midrib)"],
        "characteristic_symptoms": ["Window-pane feeding marks on young whorl leaves", "Coarse sawdust-like frass inside the central funnel", "Four dark pinacula in square arrangement on 8th abdominal segment of caterpillar"],
        "scouting_methods": ["W-pattern field walk checking 20 consecutive plants across 5 spots (100 total plants)", "Inspect whorl depths for fresh moist frass and young instar caterpillars"],
        "cultural_mechanical_control": ["Deep summer plowing to expose pupae to predatory birds", "Intercropping with pulses (cowpea / pigeonpea) to enhance natural enemies", "Hand picking and crushing egg masses in smallholder plots"],
        "biological_control": ["Erect pheromone traps @ 5 traps/acre for FAW male moth surveillance", "Spray Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 1500 ppm @ 5 ml/L at first sign of pinholes", "Apply Bacillus thuringiensis (Bt kurstaki) @ 2 g/L into central whorls"],
        "chemical_control_safeguards": ["Chemical control fail-closed: locked until verified ETL breach", "CIBRC registered formulations: Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Spinetoram 11.7% SC @ 0.5 ml/L targeted specifically into whorls", "Observe mandatory 25-day Pre-Harvest Interval (PHI)"],
        "source_institutions": ["OUAT Department of Entomology", "ICAR-Indian Institute of Maize Research (IIMR)", "KVK Mayurbhanj / Nabarangpur"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌽"
    },
    "ragi": {
        "id": "ragi",
        "common_name_en": "Finger Millet / Ragi / Mandia",
        "common_name_or": "ମାଣ୍ଡିଆ (Mandia)",
        "scientific_name": "Eleusine coracana (L.) Gaertn.",
        "category": CropCategory.CEREALS_MILLETS,
        "category_name_en": "Cereals & Millets",
        "category_name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling / Nursery", "Tillering", "Stem Elongation", "Flag Leaf / Booting", "Flowering", "Dough Stage", "Ripening"],
        "plant_parts": ["leaf", "stem", "earhead", "grain", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "ragi_stem_borer",
                "common_name_en": "Pink Stem Borer",
                "common_name_or": "ମାଣ୍ଡିଆ କାଣ୍ଡ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Sesamia inferens (Walker)",
                "local_name_or": "ଗୋଲାପୀ କାଣ୍ଡ ପୋକ",
                "affected_parts": ["stem"],
                "etl_en": "5% dead hearts in vegetative stage",
                "etl_or": "୫% ଗଛରେ ମଲା ମଝିଡାଙ୍ଗ ଦେଖାଗଲେ",
                "validation_status": "staged_research"
            },
            {
                "pest_id": "ragi_earhead_caterpillar",
                "common_name_en": "Earhead Caterpillar",
                "common_name_or": "ମାଣ୍ଡିଆ ଶିଁଷା କାଟୁଆ ପୋକ",
                "scientific_name": "Helicoverpa armigera / Cryptoblabes gnidiella",
                "local_name_or": "ଶିଁଷା ପୋକ",
                "affected_parts": ["earhead", "grain"],
                "etl_en": "2-3 caterpillars per 10 earheads during milky/dough stage",
                "etl_or": "୧୦ଟି ଶିଁଷାରେ ୨-୩ଟି ପୋକ ଥିଲେ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Braconid wasps (Cotesia sesamiae)", "name_or": "ପରଜୀବୀ କୁମ୍ଭାରୀ ପୋକ", "role": "Larval parasitoid of pink stem borer"}
        ],
        "common_diseases": ["Ragi Blast (Pyricularia grisea)", "Foot Rot (Sclerotium rolfsii)", "Cercospora Leaf Spot"],
        "nutrient_deficiencies": ["Nitrogen (stunted growth, pale green to yellow leaves)", "Zinc (leaf bronzing and interveinal chlorosis)"],
        "characteristic_symptoms": ["Blast lesions: diamond-shaped spindle lesions on leaves, neck blast snapping finger earheads", "Central shoot drying into dead heart"],
        "scouting_methods": ["Inspect 20 random hills per field for central whorl drying and neck blast symptoms"],
        "cultural_mechanical_control": ["Grow blast-tolerant certified varieties promoted under Odisha Millets Mission (Arjuna, Bhairabi, GPU-28)", "Proper seed treatment with Trichoderma viride @ 5g/kg"],
        "biological_control": ["Release Trichogramma chilonis @ 50,000/ha", "Conserve predatory spiders and coccinellids"],
        "chemical_control_safeguards": ["Millets are predominantly organic in tribal districts: prioritize bio-pesticides and NSKE 5%", "Synthetic chemical intervention fail-closed; requires KVK confirmation"],
        "source_institutions": ["Odisha Millets Mission", "OUAT All India Coordinated Research Project on Small Millets", "KVK Koraput / Rayagada"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌾"
    },
    "sorghum": {
        "id": "sorghum",
        "common_name_en": "Sorghum / Jowar",
        "common_name_or": "ଜୁଆର (Juara)",
        "scientific_name": "Sorghum bicolor (L.) Moench",
        "category": CropCategory.CEREALS_MILLETS,
        "category_name_en": "Cereals & Millets",
        "category_name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Booting", "Panicle Emergence", "Flowering", "Dough", "Maturity"],
        "plant_parts": ["leaf", "stem", "panicle", "grain"],
        "major_insect_pests": [
            {
                "pest_id": "sorghum_shoot_fly",
                "common_name_en": "Sorghum Shoot Fly",
                "common_name_or": "ଜୁଆର ଶୁଟ୍ ଫ୍ଲାଏ (ମଝିପୋକ)",
                "scientific_name": "Atherigona soccata (Rondani)",
                "local_name_or": "ଚାରା ମଝିପୋକ",
                "affected_parts": ["stem", "leaf"],
                "etl_en": "10% dead hearts or 1 egg per seedling on underside of leaves up to 30 days after emergence",
                "etl_or": "୧୦% ଗଛରେ ମଲା ମଝିଡାଙ୍ଗ କିମ୍ବା ପତ୍ର ତଳେ ଅଣ୍ଡା",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Chrysoperla carnea (Green Lacewing)", "name_or": "ସବୁଜ ଲେସ୍‌ୱିଙ୍ଗ୍", "role": "Predator of shoot fly eggs and aphids"}
        ],
        "common_diseases": ["Grain Mold (Fusarium / Curvularia)", "Anthracnose (Colletotrichum graminicola)", "Loose Smut"],
        "nutrient_deficiencies": ["Nitrogen", "Iron (interveinal chlorosis on young expanding leaves)"],
        "characteristic_symptoms": ["Dead hearts on seedlings within 4 weeks of germination with foul rot smell", "Shot holes on leaves"],
        "scouting_methods": ["Inspect lower surface of leaves for white cigar-shaped shoot fly eggs in seedling stage"],
        "cultural_mechanical_control": ["Early sowing with the onset of monsoon before fly population builds up", "Use higher seed rate and rogue out infested seedlings at 2 weeks"],
        "biological_control": ["Neem seed kernel extract (NSKE 5%) spray at 7 and 14 days after emergence"],
        "chemical_control_safeguards": ["Seed treatment with Imidacloprid 70 WS; foliar chemicals fail-closed without expert verification"],
        "source_institutions": ["ICAR-Indian Institute of Millets Research (IIMR)", "OUAT Bhubaneswar"],
        "evidence_status": "Staged Research",
        "icon": "🌾"
    },
    "bajra": {
        "id": "bajra",
        "common_name_en": "Pearl Millet / Bajra",
        "common_name_or": "ବାଜରା (Bajara)",
        "scientific_name": "Pennisetum glaucum (L.) R. Br.",
        "category": CropCategory.CEREALS_MILLETS,
        "category_name_en": "Cereals & Millets",
        "category_name_or": "ଦାନାଦାର ଓ କ୍ଷୁଦ୍ର ଶସ୍ୟ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Tillering", "Stem Elongation", "Heading", "Flowering", "Maturity"],
        "plant_parts": ["leaf", "stem", "earhead", "grain"],
        "major_insect_pests": [
            {
                "pest_id": "bajra_shoot_fly",
                "common_name_en": "Bajra Shoot Fly",
                "common_name_or": "ବାଜରା ଚାରା ମଝିପୋକ",
                "scientific_name": "Atherigona approximata",
                "local_name_or": "ମଝି କାଟୁଆ",
                "affected_parts": ["stem"],
                "etl_en": "8-10% dead hearts in seedling stage",
                "etl_or": "୮-୧୦% ଗଛରେ ମଝିଡାଙ୍ଗ ଶୁଖିଗଲେ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Ladybird beetles", "name_or": "ମିତ୍ର ସାଧବ ବୋହୂ ପୋକ", "role": "Predator of aphids and small grubs"}
        ],
        "common_diseases": ["Downy Mildew / Green Ear Disease (Sclerospora graminicola)", "Ergot (Claviceps fusiformis)", "Rust"],
        "nutrient_deficiencies": ["Zinc", "Nitrogen"],
        "characteristic_symptoms": ["Green ear transformation: floral parts transformed into leafy leafy structures", "Honeydew droplet exudation from spikelets in ergot"],
        "scouting_methods": ["Examine earheads at flowering for pink honey-like droplets indicative of ergot infection"],
        "cultural_mechanical_control": ["Deep summer plowing", "Roguing green-ear infected plants early and burying deeply"],
        "biological_control": ["Seed treatment with biocontrol formulations (Trichoderma)"],
        "chemical_control_safeguards": ["Fail-closed: all synthetic chemical recommendations locked pending verified diagnosis"],
        "source_institutions": ["Odisha Millets Mission", "OUAT"],
        "evidence_status": "Staged Research",
        "icon": "🌾"
    },

    # ----------------------------------------------------
    # 2. PULSES
    # ----------------------------------------------------
    "moong": {
        "id": "moong",
        "common_name_en": "Green Gram / Moong",
        "common_name_or": "ମୁଗ (Muga)",
        "scientific_name": "Vigna radiata (L.) R. Wilczek",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Vegetative / Trifoliate", "Flower Bud Initiation", "Flowering", "Pod Development", "Pod Maturity / Harvest"],
        "plant_parts": ["leaf", "stem", "flower", "pod", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "whitefly_moong",
                "common_name_en": "Whitefly (Yellow Mosaic Virus Vector)",
                "common_name_or": "ଧଳା ମାଛି (ହଳଦିଆ ପତ୍ର ରୋଗ ବାହକ)",
                "scientific_name": "Bemisia tabaci (Gennadius)",
                "local_name_or": "ଧଳା ମାଛି",
                "affected_parts": ["leaf"],
                "etl_en": "4-5 whiteflies per plant on upper tender foliage",
                "etl_or": "ଗଛ ପ୍ରତି ୪-୫ଟି ଧଳା ମାଛି ଦେଖାଗଲେ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "pod_borer_moong",
                "common_name_en": "Spotted Pod Borer / Gram Pod Borer",
                "common_name_or": "ମୁଗ ଫଳି ବିନ୍ଧା ପୋକ",
                "scientific_name": "Maruca vitrata / Helicoverpa armigera",
                "local_name_or": "ଫଳି କଣା ପୋକ",
                "affected_parts": ["flower", "pod"],
                "etl_en": "1 larva or webbing per meter row; 5% damaged pods",
                "etl_or": "ଧାଡ଼ି ପ୍ରତି ୧ଟି ପୋକ ବା ଜାଲି; ୫% କଣା ଫଳି",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Ladybird beetle (Menochilus sexmaculatus)", "name_or": "ସାଧବ ବୋହୂ ପୋକ", "role": "Voracious predator of whitefly nymphs and aphids"},
            {"name_en": "Campoletis sonorensis", "name_or": "ପରଜୀବୀ କୁମ୍ଭାରୀ ପୋକ", "role": "Larval endoparasitoid of pod borers"}
        ],
        "common_diseases": ["Yellow Mosaic Disease (MYMV)", "Powdery Mildew (Erysiphe polygoni)", "Cercospora Leaf Spot"],
        "nutrient_deficiencies": ["Phosphorus (poor nodulation and purple leaf margins)", "Sulphur (yellowing of younger leaves)"],
        "characteristic_symptoms": ["Irregular bright yellow patches alternating with green on leaf lamina (MYMV)", "Webbed flower clusters and circular bored holes on pods with frass"],
        "scouting_methods": ["Count whiteflies on 3 leaves (top, middle, bottom) on 20 random plants early in the morning", "Inspect webbed flowers at 50% flowering"],
        "cultural_mechanical_control": ["Install yellow sticky traps @ 10 traps/acre at canopy height for whiteflies", "Grow YMV-tolerant certified varieties (IPM 02-03, IPM 02-14, Dhauli)", "Rogue out early mosaic-infected plants at 2 weeks"],
        "biological_control": ["Spray Neem oil 1500 ppm @ 3 ml/L or NSKE 5% at vegetative stage", "Release Trichogramma chilonis @ 50,000/ha at flower bud stage"],
        "chemical_control_safeguards": ["Chemical control fail-closed: locked until verified ETL breach", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L for pod borers; Acetamiprid 20% SP @ 0.2 g/L for whitefly vector", "Observe 14-day Pre-Harvest Interval"],
        "source_institutions": ["OUAT Department of Plant Pathology & Entomology", "ICAR-Indian Institute of Pulses Research (IIPR) Kanpur", "KVK Nayagarh / Puri"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌱"
    },
    "biri": {
        "id": "biri",
        "common_name_en": "Black Gram / Urad / Biri",
        "common_name_or": "ବିରି (Biri)",
        "scientific_name": "Vigna mungo (L.) Hepper",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Vegetative", "Branching / Flowering", "Pod Formation", "Maturity"],
        "plant_parts": ["leaf", "stem", "flower", "pod", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "whitefly_biri",
                "common_name_en": "Whitefly (YMV Vector)",
                "common_name_or": "ଧଳା ମାଛି",
                "scientific_name": "Bemisia tabaci",
                "local_name_or": "ଧଳା ମାଛି",
                "affected_parts": ["leaf"],
                "etl_en": "4-5 adults per plant",
                "etl_or": "ଗଛ ପ୍ରତି ୪-୫ଟି ଧଳା ମାଛି",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "pod_borer_biri",
                "common_name_en": "Pod Borer Complex (Maruca / Spodoptera)",
                "common_name_or": "ବିରି ଫଳି ବିନ୍ଧା ପୋକ",
                "scientific_name": "Maruca vitrata / Spodoptera litura",
                "local_name_or": "ଫଳି କଣା ପୋକ",
                "affected_parts": ["flower", "pod"],
                "etl_en": "5% pod damage or 1 larva per meter row",
                "etl_or": "୫% ଫଳି କଣା କିମ୍ବା ମିଟର ପ୍ରତି ୧ଟି ପୋକ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Green Lacewing", "name_or": "ସବୁଜ ଲେସ୍‌ୱିଙ୍ଗ୍", "role": "Whitefly predator"}
        ],
        "common_diseases": ["Yellow Mosaic Disease", "Cercospora Leaf Spot", "Root Rot / Dry Root Rot (Macrophomina)"],
        "nutrient_deficiencies": ["Phosphorus", "Iron"],
        "characteristic_symptoms": ["Golden yellow blotches on leaves turning necrotic", "Larvae webbing leaves and inflorescence with frass"],
        "scouting_methods": ["Scout early morning before whiteflies take flight; inspect flower buds for silk webbing"],
        "cultural_mechanical_control": ["Use certified YMV resistant varieties (Pant U-31, PU-30, Sarala, Prasad)", "Yellow sticky traps @ 8-10 traps/acre"],
        "biological_control": ["Spray NSKE 5% at flower initiation; apply Beauveria bassiana @ 5 g/L"],
        "chemical_control_safeguards": ["Fail-closed: requires verified observation; CIBRC formulations only"],
        "source_institutions": ["OUAT Bhubaneswar", "ICAR-IIPR", "KVK Cuttack / Jagatsinghpur"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌱"
    },
    "arhar": {
        "id": "arhar",
        "common_name_en": "Pigeonpea / Red Gram / Arhar / Kandula",
        "common_name_or": "କନ୍ଦୁଳ / ହରଡ଼ (Kandula / Harada)",
        "scientific_name": "Cajanus cajan (L.) Millsp.",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Vegetative Branching", "Flower Bud Initiation", "Flowering", "Pod Development", "Pod Senescence"],
        "plant_parts": ["leaf", "stem", "flower", "pod", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "pod_borer_arhar",
                "common_name_en": "Gram Pod Borer / American Bollworm",
                "common_name_or": "ହରଡ଼ ଫଳି ବିନ୍ଧା ପୋକ",
                "scientific_name": "Helicoverpa armigera (Hübner)",
                "local_name_or": "କନ୍ଦୁଳ କଣା ପୋକ",
                "affected_parts": ["flower", "pod"],
                "etl_en": "1 larva per plant or 5% damaged pods",
                "etl_or": "ଗଛ ପ୍ରତି ୧ଟି ଲାର୍ଭା ବା ୫% କଣା ଫଳି",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "pod_fly_arhar",
                "common_name_en": "Pod Fly",
                "common_name_or": "ପୋଡ୍ ଫ୍ଲାଏ (ମଞ୍ଜି ପୋକ)",
                "scientific_name": "Melanagromyza obtusa (Malloch)",
                "local_name_or": "ମଞ୍ଜି କଣା ମାଛି",
                "affected_parts": ["pod", "grain"],
                "etl_en": "5% pod oviposition punctures or 1 egg/pod",
                "etl_or": "୫% ଫଳିରେ ବିନ୍ଧା ଦାଗ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Trichogramma chilonis", "name_or": "ଟ୍ରାଇକୋଗ୍ରାମା", "role": "Egg parasitoid of Helicoverpa"},
            {"name_en": "Campoletis sonorensis", "name_or": "କାମ୍ପୋଲେଟିସ୍ ପରଜୀବୀ", "role": "Larval parasitoid"}
        ],
        "common_diseases": ["Fusarium Wilt (Fusarium udum)", "Sterility Mosaic Disease (SMD)", "Phytophthora Blight"],
        "nutrient_deficiencies": ["Zinc", "Boron"],
        "characteristic_symptoms": ["Caterpillar feeding on flowers with head inside pod and body outside", "Pores in pod wall with internal damaged chewed seeds", "Sterility mosaic: bushy growth with pale leaves and zero flower development"],
        "scouting_methods": ["Shake flowering branches over a white cloth to count Helicoverpa caterpillars"],
        "cultural_mechanical_control": ["Intercrop with sorghum or pearl millet to encourage predatory birds", "Install bird perches @ 20 per acre", "Use SMD and wilt resistant varieties (Maruti, Asha)"],
        "biological_control": ["Erect pheromone traps (Helilure) @ 5/acre", "Spray HaNPV @ 250 LE/ha or Bt formulations", "Neem Seed Kernel Extract 5% at early flowering"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Flubendiamide 39.35% SC @ 0.2 ml/L", "Observe 21-day Pre-Harvest Interval"],
        "source_institutions": ["OUAT Bhubaneswar", "ICAR-IIPR", "KVK Kalahandi / Bolangir"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌱"
    },
    "chickpea": {
        "id": "chickpea",
        "common_name_en": "Chickpea / Bengal Gram / Chana",
        "common_name_or": "ଚଣା / ବୁଟ (Chana / Buta)",
        "scientific_name": "Cicer arietinum L.",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative Branching", "Pod Initiation", "Grain Filling", "Maturity"],
        "plant_parts": ["leaf", "flower", "pod", "root"],
        "major_insect_pests": [
            {
                "pest_id": "pod_borer_chana",
                "common_name_en": "Gram Pod Borer",
                "common_name_or": "ବୁଟ ଫଳି କଣା ପୋକ",
                "scientific_name": "Helicoverpa armigera",
                "local_name_or": "ଚଣା କାଟୁଆ",
                "affected_parts": ["flower", "pod"],
                "etl_en": "1 larva per meter row or 1 larva/plant",
                "etl_or": "ମିଟର ଧାଡ଼ି ପ୍ରତି ୧ଟି ଲାର୍ଭା",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Predatory wasps and spiders", "name_or": "ମିତ୍ର ବୁଢ଼ିଆଣୀ", "role": "Pod borer natural enemies"}
        ],
        "common_diseases": ["Fusarium Wilt", "Dry Root Rot", "Ascochyta Blight"],
        "nutrient_deficiencies": ["Iron (bleached young leaves)", "Zinc"],
        "characteristic_symptoms": ["Characteristic circular bore holes on developing pods with empty seed cavities", "Drooping and yellowing of foliage in wilt"],
        "scouting_methods": ["Count larvae per meter row at 5 field spots; inspect pod surfaces for entry holes"],
        "cultural_mechanical_control": ["Deep plowing", "Early planting", "Intercropping with coriander or mustard"],
        "biological_control": ["Install Helilure pheromone traps @ 5/acre", "HaNPV @ 250 LE/ha in evening hours"],
        "chemical_control_safeguards": ["Fail-closed: requires verified scouting proof; CIBRC approved chemicals only"],
        "source_institutions": ["ICAR-IIPR", "OUAT"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },
    "lentil": {
        "id": "lentil",
        "common_name_en": "Lentil / Masur",
        "common_name_or": "ମସୁର (Masura)",
        "scientific_name": "Lens culinaris Medik.",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Flowering", "Pod Development", "Maturity"],
        "plant_parts": ["leaf", "flower", "pod"],
        "major_insect_pests": [
            {
                "pest_id": "aphid_lentil",
                "common_name_en": "Cowpea / Lentil Aphid",
                "common_name_or": "ମସୁର ଜାଉ ପୋକ",
                "scientific_name": "Aphis craccivora (Koch)",
                "local_name_or": "ରସ ଶୋଷା ଜାଉ",
                "affected_parts": ["leaf", "flower"],
                "etl_en": "20 aphids per top 10 cm shoot or visible honeydew",
                "etl_or": "ଡାଳ ଅଗରେ ୨୦ଟି ଜାଉ ପୋକ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Syrphid fly larvae (Hoverflies)", "name_or": "ହୋଭରଫ୍ଲାଏ ଶୁକ", "role": "Aphid predator"}
        ],
        "common_diseases": ["Rust (Uromyces viciae-fabae)", "Fusarium Wilt", "Collar Rot"],
        "nutrient_deficiencies": ["Phosphorus", "Molybdenum"],
        "characteristic_symptoms": ["Curled distorted young leaves covered with black sooty mold and sticky honeydew"],
        "scouting_methods": ["Inspect tender shoot tips and terminal buds across 20 random plants"],
        "cultural_mechanical_control": ["Optimum sowing window (late October - November)", "Avoid excess moisture"],
        "biological_control": ["Spray NSKE 5% or Verticillium lecanii @ 5 g/L"],
        "chemical_control_safeguards": ["Fail-closed: zero pesticide guidance without verified ETL"],
        "source_institutions": ["OUAT", "ICAR-IIPR"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },
    "cowpea": {
        "id": "cowpea",
        "common_name_en": "Cowpea / Lobia / Jhudunga",
        "common_name_or": "ଝୁଡ଼ଙ୍ଗ (Jhudunga)",
        "scientific_name": "Vigna unguiculata (L.) Walp.",
        "category": CropCategory.PULSES,
        "category_name_en": "Pulses",
        "category_name_or": "ଡାଲି ଜାତୀୟ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Flowering", "Pod Filling", "Harvest"],
        "plant_parts": ["leaf", "flower", "pod"],
        "major_insect_pests": [
            {
                "pest_id": "cowpea_aphid",
                "common_name_en": "Cowpea Aphid",
                "common_name_or": "ଝୁଡ଼ଙ୍ଗ ଜାଉ ପୋକ",
                "scientific_name": "Aphis craccivora",
                "local_name_or": "କଳା ଜାଉ ପୋକ",
                "affected_parts": ["leaf", "stem", "pod"],
                "etl_en": "20% shoots infested with aphid colonies",
                "etl_or": "୨୦% ଡାଙ୍ଗରେ ଜାଉ ପୋକ ଦେଖାଗଲେ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Coccinellid predatory beetles", "name_or": "ସାଧବ ବୋହୂ ପୋକ", "role": "Aphid predator"}
        ],
        "common_diseases": ["Cowpea Mosaic", "Anthracnose", "Cercospora Leaf Spot"],
        "nutrient_deficiencies": ["Phosphorus", "Iron"],
        "characteristic_symptoms": ["Colonies of black shiny aphids clustering on tender pods and buds causing wilting"],
        "scouting_methods": ["Inspect 20 random vines for black aphid clusters and attending ants"],
        "cultural_mechanical_control": ["Yellow sticky traps", "Intercropping with maize"],
        "biological_control": ["Spray neem oil 1500 ppm @ 3 ml/L"],
        "chemical_control_safeguards": ["Fail-closed: requires verified observation"],
        "source_institutions": ["OUAT", "ICAR-IIPR"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },

    # ----------------------------------------------------
    # 3. OILSEEDS
    # ----------------------------------------------------
    "groundnut": {
        "id": "groundnut",
        "common_name_en": "Groundnut / Peanut",
        "common_name_or": "ଚିନାବାଦାମ (Chinabadam)",
        "scientific_name": "Arachis hypogaea L.",
        "category": CropCategory.OILSEEDS,
        "category_name_en": "Oilseeds",
        "category_name_or": "ତୈଳବୀଜ ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Emergence / Seedling", "Vegetative Branching", "Flowering", "Pegging / Gyndophore elongation", "Pod Development / Pod Filling", "Harvest Maturity"],
        "plant_parts": ["leaf", "stem", "peg", "pod", "root", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "groundnut_leaf_miner",
                "common_name_en": "Groundnut Leaf Miner",
                "common_name_or": "ଚିନାବାଦାମ ପତ୍ର ଖୋଳା ପୋକ",
                "scientific_name": "Aproaerema modicella (Deventer)",
                "local_name_or": "ପତ୍ର ସୁଡ଼ଙ୍ଗ ପୋକ",
                "affected_parts": ["leaf"],
                "etl_en": "5 active mines per plant in seedling; 10 mines per plant in vegetative/pegging",
                "etl_or": "ଚାରା ଅବସ୍ଥାରେ ଗଛ ପ୍ରତି ୫ଟି କିମ୍ବା ବଡ଼ ଅବସ୍ଥାରେ ୧୦ଟି ସୁଡ଼ଙ୍ଗ ଦେଖାଗଲେ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "spodoptera_groundnut",
                "common_name_en": "Tobacco Caterpillar / Cutworm",
                "common_name_or": "ପତ୍ର ଖିଆ ଲେଡା ପୋକ",
                "scientific_name": "Spodoptera litura (Fabricius)",
                "local_name_or": "ବାଦାମ କାଟୁଆ",
                "affected_parts": ["leaf"],
                "etl_en": "1-2 egg masses or 3 larvae per meter row; 10% defoliation",
                "etl_or": "ମିଟର ଧାଡ଼ି ପ୍ରତି ୩ଟି ଲାର୍ଭା କିମ୍ବା ୧୦% ପତ୍ର କଟା",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Braconid wasps", "name_or": "କୁମ୍ଭାରୀ ପୋକ", "role": "Parasitoid of leaf miner larvae"},
            {"name_en": "Spiders", "name_or": "ବୁଢ଼ିଆଣୀ", "role": "Foliage hunters"}
        ],
        "common_diseases": ["Tikka Disease / Early & Late Leaf Spot (Cercospora arachidicola & Phaeoisariopsis personata)", "Collar Rot (Aspergillus niger)", "Rust (Puccinia arachidis)"],
        "nutrient_deficiencies": ["Calcium (empty pods or 'pops' without kernels)", "Iron (interveinal bleaching of young leaves on calcareous coastal soils)", "Sulphur (light green leaves with reduced oil content)"],
        "characteristic_symptoms": ["Blister-like small brown blotches on leaf turning into webbed rolled leaves looking burnt", "Skeltonized defoliated leaves from gregarious caterpillar feeding", "Tikka: circular brown to black spots with distinct yellow halo"],
        "scouting_methods": ["Count blister mines across 20 plants across field diagonals; inspect undersides of leaves for Spodoptera egg masses covered with brown hair"],
        "cultural_mechanical_control": ["Deep summer plowing", "Apply Gypsum @ 200 kg/acre at 40-45 days (pegging stage) to ensure calcium for pod filling", "Intercrop with pearl millet or castor as trap crop for Spodoptera"],
        "biological_control": ["Erect Spodolure pheromone traps @ 5/acre", "Spray NSKE 5% or SlNPV @ 250 LE/ha in evening hours"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Novaluron 10% EC @ 1 ml/L", "Observe 20-day Pre-Harvest Interval"],
        "source_institutions": ["OUAT Regional Research and Technology Transfer Station (RRTTS) Chiplima", "ICAR-Directorate of Groundnut Research (DGR) Junagadh", "KVK Jajpur / Puri"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥜"
    },
    "mustard": {
        "id": "mustard",
        "common_name_en": "Mustard / Rapeseed",
        "common_name_or": "ସୋରିଷ (Sorisa)",
        "scientific_name": "Brassica juncea (L.) Czern.",
        "category": CropCategory.OILSEEDS,
        "category_name_en": "Oilseeds",
        "category_name_or": "ତୈଳବୀଜ ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Rosette", "Inflorescence Emergence", "Flowering", "Siliqua / Pod Formation", "Maturity"],
        "plant_parts": ["leaf", "stem", "inflorescence", "siliqua"],
        "major_insect_pests": [
            {
                "pest_id": "mustard_aphid",
                "common_name_en": "Mustard Aphid",
                "common_name_or": "ସୋରିଷ ଜାଉ ପୋକ",
                "scientific_name": "Lipaphis erysimi (Kaltenbach)",
                "local_name_or": "ଜାଉ ପୋକ / ମହୁଆ ପୋକ",
                "affected_parts": ["inflorescence", "siliqua", "leaf"],
                "etl_en": "20-25 aphids per 10 cm terminal shoot or 0.5-1.0 cm aphid colony on 10% plants",
                "etl_or": "ଡାଙ୍ଗ ଅଗରେ ୨୦-୨୫ ଜାଉ ପୋକ କିମ୍ବା ୧୦% ଗଛରେ ଜାଉ କଲୋନୀ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Ladybird beetle (Coccinella septempunctata)", "name_or": "୭-ଫୋପା ସାଧବ ବୋହୂ ପୋକ", "role": "Adults and grubs consume 50-100 aphids per day"},
            {"name_en": "Syrphid fly larvae", "name_or": "ସିର୍ଫିଡ୍ ମାଛି ଶୁକ", "role": "Voracious aphid predator"}
        ],
        "common_diseases": ["Alternaria Blight (Alternaria brassicae)", "White Rust (Albugo candida)", "Downy Mildew"],
        "nutrient_deficiencies": ["Sulphur (cupping of leaves and reddish-purple discoloration)", "Boron (internal cracking of stem and hollow pod)"],
        "characteristic_symptoms": ["Colonies of yellow-green aphids sucking sap from floral parts causing curled, withered flowers and stunted empty pods", "Alternaria: concentric rings of brown-black zonate spots"],
        "scouting_methods": ["Sample 20 plants diagonally across field measuring length of aphid colony on central shoot"],
        "cultural_mechanical_control": ["Early sowing by third week of October to escape peak aphid flight in January", "Balanced fertilization with elemental Sulphur @ 20 kg/acre", "Yellow sticky traps @ 10/acre"],
        "biological_control": ["Conserve Coccinellid beetles; do not spray synthetic pyrethroids which decimate ladybird larvae", "Spray Verticillium lecanii @ 5 g/L or NSKE 5% at early colony initiation"],
        "chemical_control_safeguards": ["Chemical control strictly fail-closed: locked until verified ETL breach", "CIBRC registered: Dimethoate 30% EC @ 1.5 ml/L or Thiamethoxam 25% WG @ 0.2 g/L", "Apply only in late afternoon to protect foraging honeybee pollinators; observe 21-day PHI"],
        "source_institutions": ["OUAT Bhubaneswar", "ICAR-Directorate of Rapeseed-Mustard Research (DRMR) Bharatpur", "KVK Dhenkanal / Sambalpur"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌱"
    },
    "sesame": {
        "id": "sesame",
        "common_name_en": "Sesame / Til / Rasi",
        "common_name_or": "ରାଶି (Rasi)",
        "scientific_name": "Sesamum indicum L.",
        "category": CropCategory.OILSEEDS,
        "category_name_en": "Oilseeds",
        "category_name_or": "ତୈଳବୀଜ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Flowering", "Capsule Development", "Maturity"],
        "plant_parts": ["leaf", "flower", "capsule", "stem"],
        "major_insect_pests": [
            {
                "pest_id": "sesame_leaf_and_pod_caterpillar",
                "common_name_en": "Sesame Leaf and Pod Caterpillar",
                "common_name_or": "ରାଶି ପତ୍ରଗୁଡ଼ା ଓ ଫଳି ପୋକ",
                "scientific_name": "Antigastra catalaunalis (Duponchel)",
                "local_name_or": "ରାଶି ଜାଲି ପୋକ",
                "affected_parts": ["leaf", "flower", "capsule"],
                "etl_en": "1 larva per plant or 10% webbed plants",
                "etl_or": "ଗଛ ପ୍ରତି ୧ଟି ପୋକ ବା ୧୦% ଜାଲି ଗଛ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Parasitoid wasps", "name_or": "ମିତ୍ର ପରଜୀବୀ ପୋକ", "role": "Antigastra larval parasitoids"}
        ],
        "common_diseases": ["Phyllody (Phytoplasma transmitted by leafhoppers)", "Phoma Stem Rot", "Bacterial Leaf Spot"],
        "nutrient_deficiencies": ["Zinc", "Nitrogen"],
        "characteristic_symptoms": ["Phyllody: all floral parts transformed into green leafy structures with sterile bunchy appearance", "Antigastra: top leaves webbed together into tight clusters with caterpillar feeding inside"],
        "scouting_methods": ["Inspect top terminals for webbed leaves and green caterpillars"],
        "cultural_mechanical_control": ["Rogue out and burn phyllody infected plants immediately", "Intercropping with pulses"],
        "biological_control": ["Spray neem formulations @ 3 ml/L at first web appearance"],
        "chemical_control_safeguards": ["Fail-closed: requires verified observation"],
        "source_institutions": ["OUAT", "ICAR-Indian Institute of Oilseeds Research (IIOR)"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },
    "sunflower": {
        "id": "sunflower",
        "common_name_en": "Sunflower",
        "common_name_or": "ସୂର୍ଯ୍ୟମୁଖୀ (Surjamukhi)",
        "scientific_name": "Helianthus annuus L.",
        "category": CropCategory.OILSEEDS,
        "category_name_en": "Oilseeds",
        "category_name_or": "ତୈଳବୀଜ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Star Bud / Button", "Ray Floret Emergence", "Flowering / Anthesis", "Seed Development", "Harvest"],
        "plant_parts": ["leaf", "stem", "capitulum / head", "seed"],
        "major_insect_pests": [
            {
                "pest_id": "sunflower_head_borer",
                "common_name_en": "Head Borer / Gram Pod Borer",
                "common_name_or": "ସୂର୍ଯ୍ୟମୁଖୀ ମୁଣ୍ଡ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Helicoverpa armigera",
                "local_name_or": "ଫୁଲ ବିନ୍ଧା ପୋକ",
                "affected_parts": ["capitulum / head", "seed"],
                "etl_en": "1 larva per head at ray floret stage",
                "etl_or": "ଫୁଲ ପ୍ରତି ୧ଟି ଲାର୍ଭା ଥିଲେ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Honeybees (Apis cerana / Apis dorsata)", "name_or": "ମହୁମାଛି", "role": "Essential pollinators ensuring seed set; NEVER spray insecticides during morning blooming!"}
        ],
        "common_diseases": ["Alternaria Leaf Blight", "Head Rot (Rhizopus oryzae)", "Powdery Mildew"],
        "nutrient_deficiencies": ["Boron (poor seed filling, hollow chaffy center, neck drooping)", "Nitrogen"],
        "characteristic_symptoms": ["Borer caterpillars feeding on developing seeds and florets creating dark frass clumps on flower face", "Boron deficiency: deformed flower heads with brittle stems"],
        "scouting_methods": ["Inspect 20 developing flower heads at star bud and ray floret stages"],
        "cultural_mechanical_control": ["Hand pollination by rubbing palms across capitulum on alternate mornings", "Apply Borax @ 2 g/L at star bud stage"],
        "biological_control": ["Release Trichogramma @ 50,000/ha; spray HaNPV @ 250 LE/ha"],
        "chemical_control_safeguards": ["Fail-closed: avoid morning sprays to prevent mass honeybee mortality"],
        "source_institutions": ["OUAT", "ICAR-IIOR Hyderabad"],
        "evidence_status": "Staged Research",
        "icon": "🌻"
    },
    "niger": {
        "id": "niger",
        "common_name_en": "Niger / Alsi",
        "common_name_or": "ଅଳସୀ (Alsi)",
        "scientific_name": "Guizotia abyssinica (L.f.) Cass.",
        "category": CropCategory.OILSEEDS,
        "category_name_en": "Oilseeds",
        "category_name_or": "ତୈଳବୀଜ ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative", "Flowering", "Seed Setting", "Maturity"],
        "plant_parts": ["leaf", "flower", "seed"],
        "major_insect_pests": [
            {
                "pest_id": "niger_caterpillar",
                "common_name_en": "Niger Caterpillar / Semi-looper",
                "common_name_or": "ଅଳସୀ ପତ୍ର କାଟୁଆ ପୋକ",
                "scientific_name": "Condica illecta",
                "local_name_or": "ଲେଡା ପୋକ",
                "affected_parts": ["leaf", "flower"],
                "etl_en": "2-3 caterpillars per plant or 10% defoliation",
                "etl_or": "ଗଛ ପ୍ରତି ୨-୩ଟି ପୋକ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Predatory beetles and spiders", "name_or": "ବନ୍ଧୁ ପୋକ", "role": "Generalist predators"}
        ],
        "common_diseases": ["Alternaria Blight", "Cercospora Leaf Spot", "Root Rot"],
        "nutrient_deficiencies": ["Phosphorus", "Zinc"],
        "characteristic_symptoms": ["Severe defoliation of leaves and damage to yellow capitulum in tribal upland plots"],
        "scouting_methods": ["Inspect foliage at 30-45 days after sowing"],
        "cultural_mechanical_control": ["Grow in tribal rainfed upland rotation; hand picking caterpillars in small plots"],
        "biological_control": ["Spray neem seed extract (NSKE 5%)"],
        "chemical_control_safeguards": ["Fail-closed: tribal agriculture is largely chemical-free"],
        "source_institutions": ["OUAT AICRP on Niger Semiliguda (Koraput)", "ICAR-IIOR"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },

    # ----------------------------------------------------
    # 4. VEGETABLES
    # ----------------------------------------------------
    "tomato": {
        "id": "tomato",
        "common_name_en": "Tomato",
        "common_name_or": "ବିଲାତି ବାଇଗଣ / ଟମାଟୋ (Bilati Baigana)",
        "scientific_name": "Solanum lycopersicum L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative / Branching", "First Flowering", "Fruit Setting", "Fruit Enlargement", "Breaker / Ripening"],
        "plant_parts": ["leaf", "stem", "flower", "fruit", "root", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "fruit_borer_tomato",
                "common_name_en": "Tomato Fruit Borer",
                "common_name_or": "ଟମାଟୋ ଫଳ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Helicoverpa armigera (Hübner)",
                "local_name_or": "ଫଳ କଣା ପୋକ",
                "affected_parts": ["flower", "fruit"],
                "etl_en": "1 larva per 5 plants or 1 egg per plant on leaves/calyx; 2% fruit damage",
                "etl_or": "୫ଟି ଗଛରେ ୧ଟି ଲାର୍ଭା କିମ୍ବା ୨% କଣା ଫଳ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "tuta_absoluta",
                "common_name_en": "Tomato Pinworm / Leafminer",
                "common_name_or": "ଟୁଟା ଆବସୋଲୁଟା (ପତ୍ର ଓ ଫଳ ସୁଡ଼ଙ୍ଗ ପୋକ)",
                "scientific_name": "Tuta absoluta (Meyrick)",
                "local_name_or": "ପିନ୍ ପୋକ",
                "affected_parts": ["leaf", "fruit", "stem"],
                "etl_en": "3 moths per pheromone trap per week or 1 active mine per plant",
                "etl_or": "ଟ୍ରାପ୍ ପ୍ରତି ସପ୍ତାହରେ ୩ଟି ପତଙ୍ଗ କିମ୍ବା ଗଛ ପ୍ରତି ୧ଟି ସୁଡ଼ଙ୍ଗ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "whitefly_tomato",
                "common_name_en": "Whitefly (Tomato Leaf Curl Virus Vector)",
                "common_name_or": "ଧଳା ମାଛି (କୁକୁଡ଼ା ରୋଗ ବାହକ)",
                "scientific_name": "Bemisia tabaci",
                "local_name_or": "ଧଳା ମାଛି",
                "affected_parts": ["leaf"],
                "etl_en": "3-5 whiteflies per plant on young foliage",
                "etl_or": "ଗଛ ପ୍ରତି ୩-୫ଟି ଧଳା ମାଛି",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Trichogramma chilonis", "name_or": "ଟ୍ରାଇକୋଗ୍ରାମା ମିତ୍ର ପୋକ", "role": "Helicoverpa egg parasitoid"},
            {"name_en": "Mirid bug (Nesidiocoris tenuis)", "name_or": "ମିରିଡ୍ ବଗ୍", "role": "Egg and nymph predator of Tuta absoluta and whiteflies"}
        ],
        "common_diseases": ["Tomato Leaf Curl Virus (ToLCV)", "Early Blight (Alternaria solani)", "Late Blight (Phytophthora infestans)", "Bacterial Wilt (Ralstonia solanacearum)"],
        "nutrient_deficiencies": ["Calcium / Blossom End Rot (black sunken leathery rot on blossom end of fruit)", "Magnesium (interveinal yellowing with green veins on older leaves)", "Potassium (uneven yellow-shouldered ripening)"],
        "characteristic_symptoms": ["Helicoverpa: circular bored holes in green and ripe fruit with head inserted and decaying interior", "Tuta absoluta: broad blotch-type transparent mines on leaves with visible black frass grains", "Leaf curl: stunted bunchy plants with upward cupping and curling of thick brittle leaves"],
        "scouting_methods": ["Check undersides of leaves and calyx of 20 plants for whitefly and moth eggs", "Examine fruit clusters for pinhead entry holes under calyx"],
        "cultural_mechanical_control": ["Intercrop with African Marigold (Tagetes erecta) @ 1 row per 16 tomato rows as trap crop for Helicoverpa", "Install yellow sticky traps @ 15/acre for whiteflies and Tutasan pheromone traps @ 10/acre for Tuta", "Spray Calcium Nitrate @ 5 g/L to prevent Blossom End Rot"],
        "biological_control": ["Release Trichogramma pretiosum / chilonis @ 50,000/ha at flowering", "Apply Bacillus thuringiensis (Bt) @ 2 g/L or HaNPV @ 250 LE/ha", "Neem oil 1500 ppm @ 3 ml/L"],
        "chemical_control_safeguards": ["Chemical control fail-closed: locked until verified ETL breach", "CIBRC registered formulations: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Flubendiamide 39.35% SC @ 0.2 ml/L for fruit borer; Cyantraniliprole 10.26% OD @ 1.8 ml/L for Tuta & whitefly", "Observe strict 3-day Pre-Harvest Interval (PHI) for fresh market tomatoes"],
        "source_institutions": ["OUAT Department of Vegetable Science & Entomology", "ICAR-Indian Institute of Vegetable Research (IIVR) Varanasi", "KVK Keonjhar / Sambalpur"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🍅"
    },
    "brinjal": {
        "id": "brinjal",
        "common_name_en": "Brinjal / Eggplant",
        "common_name_or": "ବାଇଗଣ (Baigana)",
        "scientific_name": "Solanum melongena L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative Branching", "Flowering", "Fruit Initiation", "Multiple Harvests"],
        "plant_parts": ["leaf", "shoot / stem", "flower", "fruit", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "shoot_and_fruit_borer",
                "common_name_en": "Brinjal Shoot and Fruit Borer (BSFB)",
                "common_name_or": "ବାଇଗଣ ଡାଙ୍ଗ ଓ ଫଳ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Leucinodes orbonalis (Guenée)",
                "local_name_or": "ଡାଙ୍ଗ ଓ ଫଳ କଣା ପୋକ",
                "affected_parts": ["shoot / stem", "fruit"],
                "etl_en": "5% drooping wilted shoots in vegetative stage; 2% bored fruit in fruiting stage",
                "etl_or": "୫% ଶୁଖିଲା ଡାଳ କିମ୍ବା ୨% କଣା ବାଇଗଣ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "hadda_beetle",
                "common_name_en": "Hadda Beetle / Epilachna Beetle",
                "common_name_or": "ହାଡ଼ା ପୋକ (କଙ୍କାଳିଆ ପୋକ)",
                "scientific_name": "Henosepilachna vigintioctopunctata (Fabricius)",
                "local_name_or": "ପତ୍ର କଙ୍କାଳିଆ ପୋକ",
                "affected_parts": ["leaf"],
                "etl_en": "10% infested leaves with skeletonized ladder-like scraping",
                "etl_or": "୧୦% ପତ୍ର କଙ୍କାଳିଆ ହୋଇଗଲେ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Trathala flavo-orbitalis", "name_or": "ଟ୍ରାଥାଲା ପରଜୀବୀ ପୋକ", "role": "Larval parasitoid of Leucinodes orbonalis"},
            {"name_en": "Bracon hebetor", "name_or": "ବ୍ରାକନ୍ କୁମ୍ଭାରୀ ପୋକ", "role": "Ectoparasitoid attacking caterpillar larvae"}
        ],
        "common_diseases": ["Bacterial Wilt (Ralstonia solanacearum)", "Little Leaf Disease (Phytoplasma transmitted by Hishimonus phycitis)", "Phomopsis Blight / Fruit Rot"],
        "nutrient_deficiencies": ["Nitrogen", "Potassium (marginal chlorosis and scorch)", "Iron"],
        "characteristic_symptoms": ["Drooping withered terminal shoots in young plants before fruiting", "Fruit entry bore holes plugged with dark larval excrement", "Hadda: ladder-like parallel scraped windows leaving only veins"],
        "scouting_methods": ["Count number of wilted drooping shoots per 20 plants twice a week", "Examine developing fruits for sealed holes with frass"],
        "cultural_mechanical_control": ["Clip off and deeply bury or destroy all drooping infested shoot tips twice weekly", "Install Lucinlure pheromone traps @ 15 traps/acre for mass trapping male BSFB moths", "Collect and destroy yellow spiny grubs and adults of Hadda beetles in morning hours"],
        "biological_control": ["Release Trichogramma chilonis @ 50,000/ha weekly", "Spray Bacillus thuringiensis (Bt) @ 2 g/L or Beauveria bassiana @ 5 g/L"],
        "chemical_control_safeguards": ["Chemical control fail-closed: locked until verified ETL breach", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L; never spray during picking days", "Strictly enforce 5-day Pre-Harvest Interval (PHI)"],
        "source_institutions": ["OUAT Department of Entomology", "ICAR-IIVR Varanasi", "KVK Ganjam / Cuttack"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🍆"
    },
    "chilli": {
        "id": "chilli",
        "common_name_en": "Chilli / Hot Pepper",
        "common_name_or": "ଲଙ୍କା (Lanka)",
        "scientific_name": "Capsicum annuum L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative", "Flowering", "Fruit Setting", "Green Harvest", "Red Ripe Harvest"],
        "plant_parts": ["leaf", "flower", "fruit", "stem", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "black_thrips_chilli",
                "common_name_en": "Invasive Black Thrips / Chilli Thrips",
                "common_name_or": "କଳା ଥ୍ରିପ୍ସ / ଚିପୁଡ଼ା ପୋକ",
                "scientific_name": "Thrips parvispinus (Karny) / Scirtothrips dorsalis",
                "local_name_or": "କୁକୁଡ଼ା ପୋକ / କଳା ଥ୍ରିପ୍ସ",
                "affected_parts": ["leaf", "flower", "fruit"],
                "etl_en": "2-3 thrips per leaf or tender flower bud; upward leaf curling",
                "etl_or": "ପତ୍ର ବା ଫୁଲ ପ୍ରତି ୨-୩ଟି ପୋକ; ଉପରମୁହାଁ କୁକୁଡ଼ା ପତ୍ର",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "yellow_mite_chilli",
                "common_name_en": "Yellow Mite / Broad Mite",
                "common_name_or": "ହଳଦିଆ ଉକୁଣିଆ ପୋକ (ମାଇଟ୍)",
                "scientific_name": "Polyphagotarsonemus latus (Banks)",
                "local_name_or": "ତଳମୁହାଁ କୁକୁଡ଼ା ପୋକ",
                "affected_parts": ["leaf"],
                "etl_en": "2 mites per leaf or downward inverted boat-shaped leaf curling",
                "etl_or": "ପତ୍ର ପ୍ରତି ୨ଟି ମାଇଟ୍; ତଳମୁହାଁ କୁକୁଡ଼ା ପତ୍ର",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Predatory Phytoseiid Mites (Amblyseius swirskii)", "name_or": "ମିତ୍ର ମାଇଟ୍", "role": "Voracious feeder on thrips larvae and broad mites"},
            {"name_en": "Orius insidiosus (Minute Pirate Bug)", "name_or": "ପାଇରେଟ୍ ବଗ୍", "role": "Generalist thrips hunter"}
        ],
        "common_diseases": ["Chilli Leaf Curl Virus (ChiLCV)", "Anthracnose / Dieback / Fruit Rot (Colletotrichum capsici)", "Damping-off (Pythium aphanidermatum)", "Bacterial Leaf Spot"],
        "nutrient_deficiencies": ["Zinc (narrow clustered leaves at branch tips / mottle leaf)", "Calcium (fruit tip necrosis)"],
        "characteristic_symptoms": ["Thrips damage: upward curling of leaves looking like miniature cups with brown roughened lower surface", "Mite damage: downward curling of leaves with elongated petiole looking like an inverted boat", "Black thrips: dark discoloration and drop of flowers and small fruit"],
        "scouting_methods": ["Tap 10 flowering branches over white plastic sheet to dislodge and count tiny slender thrips", "Inspect undersides of young crinkled leaves with 10x hand lens for oval translucent mites"],
        "cultural_mechanical_control": ["Install blue sticky traps @ 20/acre for thrips and yellow sticky traps for whiteflies", "Sprinkler irrigation on foliage reduces thrips and mite populations significantly", "Intercropping with maize or sorghum as border windbreaks to block vector insects"],
        "biological_control": ["Spray Neem oil 1500 ppm @ 3-5 ml/L", "Apply entomopathogenic fungus Lecanicillium lecanii @ 5 g/L"],
        "chemical_control_safeguards": ["Chemical control fail-closed: locked until verified ETL breach", "CIBRC registered: Spinetoram 11.7% SC @ 1 ml/L or Fipronil 5% SC @ 1.5 ml/L for thrips; Diafenthiuron 50% WP @ 1 g/L or Spiromesifen 22.9% SC @ 1 ml/L for mites", "Observe mandatory 7-day Pre-Harvest Interval"],
        "source_institutions": ["OUAT Regional Research Station Kuchinda / Sambalpur", "ICAR-Indian Institute of Horticultural Research (IIHR) Bengaluru", "KVK Sambalpur / Balasore"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌶️"
    },
    "okra": {
        "id": "okra",
        "common_name_en": "Okra / Lady's Finger / Bhendi",
        "common_name_or": "ଭେଣ୍ଡି (Bhendi)",
        "scientific_name": "Abelmoschus esculentus (L.) Moench",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Vegetative", "First Flower", "Continuous Fruiting", "Harvest Maturity"],
        "plant_parts": ["leaf", "shoot", "flower", "fruit", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "shoot_and_fruit_borer_okra",
                "common_name_en": "Spotted Bollworm / Shoot and Fruit Borer",
                "common_name_or": "ଭେଣ୍ଡି ଡାଙ୍ଗ ଓ ଫଳ ବିନ୍ଧା ପୋକ",
                "scientific_name": "Earias vittella (Fabricius)",
                "local_name_or": "ଭେଣ୍ଡି କଣା ପୋକ",
                "affected_parts": ["shoot", "fruit"],
                "etl_en": "5% infested drooping shoots or 2% damaged fruit",
                "etl_or": "୫% ନଇଁପଡ଼ିଥିବା ଡାଙ୍ଗ ବା ୨% କଣା ଭେଣ୍ଡି",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "whitefly_okra",
                "common_name_en": "Whitefly (Yellow Vein Mosaic Virus Vector)",
                "common_name_or": "ଧଳା ମାଛି (ହଳଦିଆ ଶିରା ରୋଗ ବାହକ)",
                "scientific_name": "Bemisia tabaci",
                "local_name_or": "ଧଳା ମାଛି",
                "affected_parts": ["leaf"],
                "etl_en": "5 whiteflies per leaf",
                "etl_or": "ପତ୍ର ପ୍ରତି ୫ଟି ଧଳା ମାଛି",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Trichogramma chilonis", "name_or": "ଟ୍ରାଇକୋଗ୍ରାମା", "role": "Egg parasitoid of Earias"},
            {"name_en": "Ladybird beetles", "name_or": "ସାଧବ ବୋହୂ ପୋକ", "role": "Whitefly predator"}
        ],
        "common_diseases": ["Yellow Vein Mosaic Virus (YVMV)", "Enation Leaf Curl Virus", "Powdery Mildew (Erysiphe cichoracearum)"],
        "nutrient_deficiencies": ["Nitrogen", "Iron"],
        "characteristic_symptoms": ["Network of yellow veins on leaf with green interveinal tissue (YVMV)", "Bored fruit deformed, crooked, with brown chewed exit holes plugged with frass"],
        "scouting_methods": ["Inspect tender shoot tips for withering and fruit clusters for caterpillar bore holes"],
        "cultural_mechanical_control": ["Use YVMV resistant varieties (Kashi Kranti, Arka Anamika, Parbhani Kranti)", "Remove and destroy infested shoots and fruits immediately", "Yellow sticky traps @ 10/acre"],
        "biological_control": ["Release Trichogramma @ 50,000/ha", "Spray NSKE 5% at early vegetative stage"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L", "Observe 3-day PHI"],
        "source_institutions": ["OUAT", "ICAR-IIVR"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🌱"
    },
    "cabbage": {
        "id": "cabbage",
        "common_name_en": "Cabbage",
        "common_name_or": "ବନ୍ଧା କୋବି (Bandha Kobi)",
        "scientific_name": "Brassica oleracea var. capitata L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative / Cupping", "Head Initiation", "Head Firming", "Harvest"],
        "plant_parts": ["leaf", "head", "stem"],
        "major_insect_pests": [
            {
                "pest_id": "diamondback_moth",
                "common_name_en": "Diamondback Moth (DBM)",
                "common_name_or": "ଡାଇମଣ୍ଡବ୍ୟାକ୍ ମଥ୍ (କୋବି କାଟୁଆ ପୋକ)",
                "scientific_name": "Plutella xylostella (L.)",
                "local_name_or": "ପତ୍ର କଣା ପୋକ",
                "affected_parts": ["leaf", "head"],
                "etl_en": "1 larva per plant in vegetative stage; 1 larva per 2 plants during head formation",
                "etl_or": "ଗଛ ପ୍ରତି ୧ଟି ଲାର୍ଭା (ମୁଣ୍ଡ ବାନ୍ଧିବା ପୂର୍ବରୁ)",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Diadegma semiclausum / Cotesia plutellae", "name_or": "ମିତ୍ର ପରଜୀବୀ ପୋକ", "role": "Specialist larval parasitoid of Diamondback moth"}
        ],
        "common_diseases": ["Black Rot (Xanthomonas campestris pv. campestris)", "Clubroot (Plasmodiophora brassicae)", "Alternaria Leaf Spot"],
        "nutrient_deficiencies": ["Boron (hollow stem with brown water-soaked tissue)", "Molybdenum / Whiptail (strap-like deformed leaves)"],
        "characteristic_symptoms": ["DBM: windowing of leaf lamina where lower epidermis is left intact as translucent membrane", "Black rot: V-shaped yellow lesions starting from leaf margins with blackened veins"],
        "scouting_methods": ["Count green wiggling larvae on undersides of 20 random outer leaves"],
        "cultural_mechanical_control": ["Intercrop with Indian Mustard @ 2 rows every 25 rows of cabbage as trap crop for DBM", "Pheromone traps @ 5/acre for monitoring moth flights"],
        "biological_control": ["Spray Bacillus thuringiensis (Bt kurstaki) @ 2 g/L in evening hours", "Beauveria bassiana @ 5 g/L"],
        "chemical_control_safeguards": ["Fail-closed: avoid repeated organophosphates/pyrethroids due to severe DBM insecticide resistance", "CIBRC registered: Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Spinosad 45% SC @ 0.3 ml/L", "Observe 5-day PHI"],
        "source_institutions": ["OUAT", "ICAR-IIVR"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥬"
    },
    "cauliflower": {
        "id": "cauliflower",
        "common_name_en": "Cauliflower",
        "common_name_or": "ଫୁଲ କୋବି (Phula Kobi)",
        "scientific_name": "Brassica oleracea var. botrytis L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative", "Buttoning", "Curd Formation", "Harvest"],
        "plant_parts": ["leaf", "curd", "stem"],
        "major_insect_pests": [
            {
                "pest_id": "dbm_cauliflower",
                "common_name_en": "Diamondback Moth",
                "common_name_or": "ଡାଇମଣ୍ଡବ୍ୟାକ୍ ମଥ୍",
                "scientific_name": "Plutella xylostella",
                "local_name_or": "କୋବି କଣା ପୋକ",
                "affected_parts": ["leaf", "curd"],
                "etl_en": "1 larva per plant before curd initiation",
                "etl_or": "ଫୁଲ ବାନ୍ଧିବା ପୂର୍ବରୁ ଗଛ ପ୍ରତି ୧ଟି ଲାର୍ଭା",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "tobacco_caterpillar_cauliflower",
                "common_name_en": "Tobacco Cutworm",
                "common_name_or": "ପତ୍ର ଖିଆ ଲେଡା ପୋକ",
                "scientific_name": "Spodoptera litura",
                "local_name_or": "କାଟୁଆ ପୋକ",
                "affected_parts": ["leaf", "curd"],
                "etl_en": "1 egg mass per 10 plants or 1 larva/plant",
                "etl_or": "୧୦ଟି ଗଛରେ ୧ଟି ଅଣ୍ଡା ପୁଞ୍ଜା",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Cotesia plutellae", "name_or": "କୋଟେସିଆ ପରଜୀବୀ", "role": "DBM parasitoid"}
        ],
        "common_diseases": ["Black Rot", "Downy Mildew", "Browning (Boron deficiency)", "Whiptail (Molybdenum deficiency)"],
        "nutrient_deficiencies": ["Boron (brown water-soaked spots on white curd)", "Molybdenum"],
        "characteristic_symptoms": ["Windowpane feeding on wrapper leaves", "Chewed curds with black fecal pellets", "Boron: brown discoloration of curd"],
        "scouting_methods": ["Inspect wrapper leaves around developing curds"],
        "cultural_mechanical_control": ["Blanching (tying wrapper leaves over curd to protect white color)", "Mustard trap crop"],
        "biological_control": ["Bt kurstaki @ 2 g/L", "Pheromone traps @ 5/acre"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered formulations only; observe 5-day PHI"],
        "source_institutions": ["OUAT", "ICAR-IIVR"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥦"
    },
    "cucurbits": {
        "id": "cucurbits",
        "common_name_en": "Cucurbits (Bitter Gourd, Pointed Gourd, Bottle Gourd, Pumpkin)",
        "common_name_or": "ପୋଟଳ / କଲରା / ଲାଉ / କଖାରୁ (Potala / Kalara / Lau)",
        "scientific_name": "Cucurbitaceae family",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Vining", "Flowering", "Fruit Setting", "Multiple Pickings"],
        "plant_parts": ["leaf", "vine / stem", "flower", "fruit", "root"],
        "major_insect_pests": [
            {
                "pest_id": "fruit_fly_cucurbit",
                "common_name_en": "Cucurbit Fruit Fly",
                "common_name_or": "ଫଳ ମାଛି ପୋକ",
                "scientific_name": "Bactrocera cucurbitae (Coquillett)",
                "local_name_or": "ଫଳ କଣା ମାଛି",
                "affected_parts": ["fruit"],
                "etl_en": "1 fly per cue-lure trap per day or 5% punctured fruit",
                "etl_or": "ଦିନକୁ ଟ୍ରାପ୍ ପ୍ରତି ୧ଟି ମାଛି ବା ୫% କଣା ଫଳ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "red_pumpkin_beetle",
                "common_name_en": "Red Pumpkin Beetle",
                "common_name_or": "ନାଲି କଖାରୁ ପୋକ",
                "scientific_name": "Aulacophora foveicollis (Lucas)",
                "local_name_or": "ନାଲି ପତ୍ର ପୋକ",
                "affected_parts": ["leaf", "cotyledon", "root"],
                "etl_en": "1 beetle per plant at cotyledon/seedling stage",
                "etl_or": "ଚାରା ଅବସ୍ଥାରେ ଗଛ ପ୍ରତି ୧ଟି ପୋକ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Opius fletcheri", "name_or": "ଓପିୟସ୍ ପରଜୀବୀ ପୋକ", "role": "Fruit fly larval-pupal parasitoid"}
        ],
        "common_diseases": ["Downy Mildew (Pseudoperonospora cubensis)", "Powdery Mildew", "Mosaic Virus (PRSV / CMV)"],
        "nutrient_deficiencies": ["Magnesium", "Calcium"],
        "characteristic_symptoms": ["Fruit fly: resinous brown gum oozing from oviposition punctures on curved deformed rotting fruit containing active white maggots", "Beetles: circular holes chewed in cotyledons and leaves"],
        "scouting_methods": ["Inspect Cue-lure pheromone traps weekly; examine developing fruits for gum drops"],
        "cultural_mechanical_control": ["Collect and deeply bury all fallen and punctured fruits in kerosene-water pits", "Install Cue-lure parapheromone traps @ 10 traps/acre", "Bag tender fruit with paper / polypropylene covers after pollination"],
        "biological_control": ["Bait spray application: Mix Jaggery 100 g + Malathion 10 ml in 10 L water applied as coarse droplets on maize border plants"],
        "chemical_control_safeguards": ["Fail-closed: avoid spraying open vines during morning hours when bee pollinators are active; observe 3-day PHI"],
        "source_institutions": ["OUAT Vegetable Research Station", "ICAR-IIVR"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥒"
    },
    "onion": {
        "id": "onion",
        "common_name_en": "Onion",
        "common_name_or": "ପିଆଜ (Piaja)",
        "scientific_name": "Allium cepa L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Nursery", "Vegetative", "Bulb Initiation", "Bulb Enlargement", "Harvest Maturity"],
        "plant_parts": ["leaf / foliage", "bulb", "neck", "root"],
        "major_insect_pests": [
            {
                "pest_id": "onion_thrips",
                "common_name_en": "Onion Thrips",
                "common_name_or": "ପିଆଜ ଚିପୁଡ଼ା ପୋକ (ଥ୍ରିପ୍ସ)",
                "scientific_name": "Thrips tabaci (Lindeman)",
                "local_name_or": "ପତ୍ର ଶୋଷା ପୋକ",
                "affected_parts": ["leaf / foliage"],
                "etl_en": "15-20 thrips per plant in vegetative; 30 thrips/plant in bulb development",
                "etl_or": "ଗଛ ପ୍ରତି ୧୫-୨୦ଟି ଥ୍ରିପ୍ସ ପୋକ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Predatory mites and minute pirate bugs", "name_or": "ମିତ୍ର ପୋକ", "role": "Thrips natural enemies"}
        ],
        "common_diseases": ["Purple Blotch (Alternaria porri)", "Stemphylium Blight", "Basal Rot (Fusarium oxysporum)"],
        "nutrient_deficiencies": ["Sulphur (essential for allicin pungency and bulb firmness)", "Zinc"],
        "characteristic_symptoms": ["Silvery white blotches and sunken patches on tubular leaves; curled twisted tips", "Purple blotch: sunken oval purple-centered lesions on green scapes"],
        "scouting_methods": ["Part the inner leaf whorls near the neck to expose hidden yellow/brown thrips nymphs"],
        "cultural_mechanical_control": ["Blue or yellow sticky traps @ 15/acre", "Overhead sprinkler irrigation reduces thrips significantly", "Apply Elemental Sulphur @ 15 kg/acre during soil preparation"],
        "biological_control": ["Spray Lecanicillium lecanii @ 5 g/L or Beauveria bassiana @ 5 g/L", "Neem oil 1500 ppm @ 3 ml/L"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered: Fipronil 5% SC @ 1.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L; add sticker/spreader for waxy onion leaves", "Observe 15-day PHI"],
        "source_institutions": ["OUAT", "ICAR-Directorate of Onion and Garlic Research (DOGR) Pune"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🧅"
    },
    "potato": {
        "id": "potato",
        "common_name_en": "Potato",
        "common_name_or": "ଆଳୁ (Aloo)",
        "scientific_name": "Solanum tuberosum L.",
        "category": CropCategory.VEGETABLES,
        "category_name_en": "Vegetables",
        "category_name_or": "ପନିପରିବା ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Sprout Development", "Vegetative Growth", "Tuber Initiation", "Tuber Bulking", "Maturation / Haulm Cutting"],
        "plant_parts": ["leaf", "stem", "tuber", "root", "whole_plant"],
        "major_insect_pests": [
            {
                "pest_id": "potato_aphid",
                "common_name_en": "Green Peach Aphid (Virus Vector)",
                "common_name_or": "ଆଳୁ ଜାଉ ପୋକ",
                "scientific_name": "Myzus persicae (Sulzer)",
                "local_name_or": "ଜାଉ ପୋକ",
                "affected_parts": ["leaf", "stem"],
                "etl_en": "20 aphids per 100 compound leaves (table potato); 2 aphids/100 leaves (seed potato)",
                "etl_or": "୧୦୦ଟି ପତ୍ରରେ ୨୦ଟି ଜାଉ ପୋକ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "potato_tuber_moth",
                "common_name_en": "Potato Tuber Moth (PTM)",
                "common_name_or": "ଆଳୁ ଖୋଳା ପତଙ୍ଗ",
                "scientific_name": "Phthorimaea operculella (Zeller)",
                "local_name_or": "ଆଳୁ ବିନ୍ଧା ପୋକ",
                "affected_parts": ["leaf", "tuber"],
                "etl_en": "5% infested tubers or 2 moths per pheromone trap per week",
                "etl_or": "୫% କଣା ଆଳୁ ବା ସପ୍ତାହକୁ ୨ଟି ପତଙ୍ଗ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Ladybird beetles and Hoverflies", "name_or": "ମିତ୍ର ସାଧବ ବୋହୂ ପୋକ", "role": "Aphid predators"},
            {"name_en": "Copidosoma koehleri", "name_or": "କୋପିଡୋସୋମା ପରଜୀବୀ ପୋକ", "role": "PTM egg-larval parasitoid"}
        ],
        "common_diseases": ["Late Blight (Phytophthora infestans)", "Early Blight", "Bacterial Wilt / Brown Rot (Ralstonia)", "Black Scurf (Rhizoctonia solani)"],
        "nutrient_deficiencies": ["Potassium (crucial for tuber bulking and starch synthesis)", "Magnesium"],
        "characteristic_symptoms": ["Late blight: water-soaked dark lesions on leaf margins with delicate white fungal down on underside during humid cool mornings", "PTM: larval galleries in tubers with dark frass near eye buds"],
        "scouting_methods": ["Inspect lower leaves for late blight water-soaked spots; check yellow sticky traps for aphids"],
        "cultural_mechanical_control": ["Proper earthing up to ensure 10-15 cm soil depth over tubers preventing PTM oviposition", "Use certified disease-free seed tubers treated with Mancozeb @ 2.5 g/L", "Cut haulms (vines) 10 days before harvest to harden tuber skin"],
        "biological_control": ["Cover stored seed potatoes with 2.5 cm layer of dried Lantana camara or eucalyptus leaves to repel PTM", "Spray Bacillus thuringiensis @ 2 g/L"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "Late blight prophylactic sprays: Mancozeb 75% WP @ 2.5 g/L; curative: Cymoxanil + Mancozeb @ 2 g/L", "Observe 14-day PHI"],
        "source_institutions": ["OUAT", "ICAR-Central Potato Research Institute (CPRI) Shimla / Regional Station Bhubaneswar"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥔"
    },

    # ----------------------------------------------------
    # 5. FRUITS & HORTICULTURE
    # ----------------------------------------------------
    "mango": {
        "id": "mango",
        "common_name_en": "Mango",
        "common_name_or": "ଆମ୍ବ (Amba)",
        "scientific_name": "Mangifera indica L.",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Vegetative Flush", "Panicle Initiation", "Full Bloom / Flowering", "Fruit Set / Mustard size", "Marble / Pea size", "Harvest Maturity"],
        "plant_parts": ["leaf", "inflorescence / panicle", "fruit", "bark / stem"],
        "major_insect_pests": [
            {
                "pest_id": "mango_hopper",
                "common_name_en": "Mango Hopper",
                "common_name_or": "ଆମ୍ବ ଡେଇଁ ପୋକ (ହପର୍)",
                "scientific_name": "Amrasca mangiferae / Idioscopus clypealis",
                "local_name_or": "ଡେଇଁ ପୋକ / ମହୁଆ ପୋକ",
                "affected_parts": ["inflorescence / panicle", "leaf"],
                "etl_en": "5 hoppers per panicle during flowering",
                "etl_or": "ମଞ୍ଜୁଳି ପ୍ରତି ୫ଟି ଡେଇଁ ପୋକ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "mango_fruit_fly",
                "common_name_en": "Oriental Fruit Fly",
                "common_name_or": "ଆମ୍ବ ଫଳ ମାଛି ପୋକ",
                "scientific_name": "Bactrocera dorsalis (Hendel)",
                "local_name_or": "ଆମ୍ବ କଣା ମାଛି",
                "affected_parts": ["fruit"],
                "etl_en": "1 fly per methyl eugenol trap per day or 2% stung fruit",
                "etl_or": "ଟ୍ରାପ୍ ପ୍ରତି ଦିନକୁ ୧ଟି ମାଛି",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Chrysoperla carnea", "name_or": "ସବୁଜ ଲେସ୍‌ୱିଙ୍ଗ୍", "role": "Mango hopper nymph predator"},
            {"name_en": "Spiders", "name_or": "ବୁଢ଼ିଆଣୀ", "role": "Canopy predators"}
        ],
        "common_diseases": ["Powdery Mildew (Oidium mangiferae)", "Anthracnose (Colletotrichum gloeosporioides)", "Mango Malformation"],
        "nutrient_deficiencies": ["Boron (internal fruit breakdown / brown corky tissue in pulp)", "Zinc (little leaf)"],
        "characteristic_symptoms": ["Hoppers: drying and withering of flower panicles covered with sticky honeydew and black sooty mold", "Fruit fly: soft sunken spots with dark oviposition puncture and internal white wriggling maggots", "Powdery mildew: white powdery coating on flower panicles"],
        "scouting_methods": ["Gently tap 20 flower panicles over a white board during morning hours to count hoppers", "Install Methyl Eugenol bottle traps @ 4 per acre for fruit fly monitoring"],
        "cultural_mechanical_control": ["Prune congested internal branches after harvest to allow maximum sunlight penetration", "Collect and destroy fallen fruit twice weekly", "Bag developing fruits 30 days before harvest"],
        "biological_control": ["Install Methyl Eugenol pheromone traps @ 6-8 traps/acre", "Spray Verticillium lecanii @ 5 g/L for hopper nymphs", "Apply neem oil 1500 ppm @ 3 ml/L"],
        "chemical_control_safeguards": ["Fail-closed: NEVER spray synthetic insecticides during full bloom to preserve pollinating bees and syrphid flies", "CIBRC registered: Thiamethoxam 25% WG @ 0.3 g/L or Imidacloprid 17.8% SL @ 0.3 ml/L at panicle emergence and after fruit set", "Observe 21-day PHI"],
        "source_institutions": ["OUAT Department of Horticulture & Entomology", "ICAR-Central Institute for Subtropical Horticulture (CISH) Lucknow", "ICAR-CHES Bhubaneswar"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥭"
    },
    "banana": {
        "id": "banana",
        "common_name_en": "Banana",
        "common_name_or": "କଦଳୀ (Kadali)",
        "scientific_name": "Musa acuminata / Musa balbisiana",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Vegetative / Sucker", "Shooting / Inflorescence Emergence", "Bunch Development", "Harvest Maturity"],
        "plant_parts": ["leaf", "pseudostem", "corm / rhizome", "bunch / fruit"],
        "major_insect_pests": [
            {
                "pest_id": "banana_pseudostem_weevil",
                "common_name_en": "Banana Pseudostem Weevil",
                "common_name_or": "କଦଳୀ ଗଣ୍ଡି ବିନ୍ଧା ଶୁଣ୍ଢିଆ ପୋକ",
                "scientific_name": "Odoiporus longicollis (Olivier)",
                "local_name_or": "ଗଣ୍ଡି କଣା ପୋକ",
                "affected_parts": ["pseudostem"],
                "etl_en": "Presence of pinhead holes with brown gelatinous exudate on pseudostem",
                "etl_or": "ଗଣ୍ଡିରେ ଛୋଟ ବିନ୍ଧ କଣାରୁ ଅଠା ବାହାରିଲେ",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "banana_aphid",
                "common_name_en": "Banana Aphid (Bunchy Top Virus Vector)",
                "common_name_or": "କଦଳୀ ଜାଉ ପୋକ (ବଞ୍ଚିଟପ୍ ବାହକ)",
                "scientific_name": "Pentalonia nigronervosa (Coquerel)",
                "local_name_or": "କଳା ଜାଉ ପୋକ",
                "affected_parts": ["pseudostem", "leaf axil"],
                "etl_en": "Colonies in leaf axil or at base of pseudostem",
                "etl_or": "ପତ୍ର ସନ୍ଧିରେ ଜାଉ କଲୋନୀ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Beauveria bassiana", "name_or": "ଜୈବିକ କବକ", "role": "Entomopathogenic fungus attacking adult weevils"}
        ],
        "common_diseases": ["Panama Wilt (Fusarium oxysporum f. sp. cubense)", "Sigatoka Leaf Spot (Mycosphaerella musicola)", "Banana Bunchy Top Virus (BBTV)"],
        "nutrient_deficiencies": ["Potassium (marginal chlorosis and downward curling of older leaves, weak bunches)", "Nitrogen"],
        "characteristic_symptoms": ["Pseudostem weevil: pinhead holes on outer leaf sheaths with jelly-like exudation; pseudostem rot and snapping in wind", "Bunchy top: clustered erect stunted leaves with dark green 'dot-dash' streaks along secondary veins"],
        "scouting_methods": ["Inspect lower pseudostem (up to 1.5 m) for jelly exudates; check leaf axils for aphid colonies"],
        "cultural_mechanical_control": ["Use certified tissue-culture plantlets free of BBTV", "Install split pseudostem longitudinal traps (50 cm length) @ 25 traps/acre treated with Beauveria to trap weevils", "Inject pseudostem with approved biological/botanical extracts"],
        "biological_control": ["Apply Beauveria bassiana @ 10 g per plant in leaf axils", "Spray neem oil 1500 ppm @ 3 ml/L into leaf whorls for aphids"],
        "chemical_control_safeguards": ["Fail-closed: requires verified observation; observe 30-day PHI"],
        "source_institutions": ["OUAT", "ICAR-National Research Centre for Banana (NRCB) Tiruchirappalli"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🍌"
    },
    "papaya": {
        "id": "papaya",
        "common_name_en": "Papaya",
        "common_name_or": "ଅମୃତଭଣ୍ଡା (Amrutabhanda)",
        "scientific_name": "Carica papaya L.",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Seedling", "Vegetative Growth", "Flowering / Sex Differentiation", "Fruit Development", "Continuous Ripening"],
        "plant_parts": ["leaf", "stem", "fruit", "root"],
        "major_insect_pests": [
            {
                "pest_id": "papaya_mealybug",
                "common_name_en": "Papaya Mealybug",
                "common_name_or": "ଅମୃତଭଣ୍ଡା ଦହିଆ ପୋକ (ମିଲିବଗ୍)",
                "scientific_name": "Paracoccus marginatus (Williams and Granara de Willink)",
                "local_name_or": "ଦହିଆ ପୋକ",
                "affected_parts": ["leaf", "stem", "fruit"],
                "etl_en": "White cottony colonies on undersides of leaves or on fruit clusters",
                "etl_or": "ପତ୍ର ଓ ଫଳରେ ଧଳା କପା ଭଳି ମିଲିବଗ୍ ଦେଖାଗଲେ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Acerophagus papayae", "name_or": "ଏସେରୋଫାଗସ୍ ପରଜୀବୀ ପୋକ", "role": "Classic introduced parasitic wasp providing 95% biological control of papaya mealybug"}
        ],
        "common_diseases": ["Papaya Ring Spot Virus (PRSV)", "Foot Rot / Collar Rot (Pythium aphanidermatum)", "Anthracnose"],
        "nutrient_deficiencies": ["Boron (lumpy deformed fruit with white milky latex exudate)", "Nitrogen"],
        "characteristic_symptoms": ["Mealybug: white waxy masses coating fruit and growing tips, heavy black sooty mold", "PRSV: dark green oily water-soaked streaks on petioles and concentric ring spots on fruit"],
        "scouting_methods": ["Inspect growing tip and fruit junctions for cottony white mealybug clumps"],
        "cultural_mechanical_control": ["Rogue out PRSV virus-infected trees immediately", "Conserve Acerophagus papayae parasitoid; NEVER spray synthetic pyrethroids or organophosphates that destroy parasitoids", "Apply Borax @ 2 g/L to prevent fruit deformation"],
        "biological_control": ["Release Acerophagus papayae parasitoids @ 100 per village/orchard", "Apply neem soap or fish oil rosin soap @ 20 g/L with high-pressure water jet"],
        "chemical_control_safeguards": ["Fail-closed: avoid chemicals that destroy Acerophagus natural control"],
        "source_institutions": ["OUAT", "ICAR-IIHR Bengaluru", "NBAIR Bengaluru"],
        "evidence_status": "Staged Research",
        "icon": "🌱"
    },
    "guava": {
        "id": "guava",
        "common_name_en": "Guava",
        "common_name_or": "ପିଜୁଳି (Pijuli)",
        "scientific_name": "Psidium guajava L.",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Vegetative", "Flowering", "Fruit Set", "Fruit Development", "Maturity"],
        "plant_parts": ["leaf", "flower", "fruit", "stem", "root"],
        "major_insect_pests": [
            {
                "pest_id": "guava_fruit_fly",
                "common_name_en": "Guava Fruit Fly",
                "common_name_or": "ପିଜୁଳି ଫଳ ମାଛି ପୋକ",
                "scientific_name": "Bactrocera correcta / Bactrocera dorsalis",
                "local_name_or": "ଫଳ କଣା ମାଛି",
                "affected_parts": ["fruit"],
                "etl_en": "1 fly per trap per day or 2% stung fruit",
                "etl_or": "ଟ୍ରାପ୍ ପ୍ରତି ୧ଟି ମାଛି",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Parasitic wasps (Fopius arisanus)", "name_or": "ଫୋପିୟସ୍ ପରଜୀବୀ", "role": "Fruit fly egg parasitoid"}
        ],
        "common_diseases": ["Guava Wilt (Fusarium oxysporum f. sp. psidii)", "Anthracnose", "Fruit Canker (Pestalotiopsis)"],
        "nutrient_deficiencies": ["Zinc (chlorosis with small leaves)", "Boron"],
        "characteristic_symptoms": ["Soft rotting patches on fruit with oviposition puncture leaking brown droplets; fruit interior crawling with maggots"],
        "scouting_methods": ["Methyl eugenol traps; inspect maturing fruits"],
        "cultural_mechanical_control": ["Bagging of fruits with foam net/paper bags 40 days before harvest", "Deep plowing of basin in summer to expose pupae"],
        "biological_control": ["Install Methyl eugenol traps @ 6/acre", "Bait spray: Jaggery + Malathion on trunk"],
        "chemical_control_safeguards": ["Fail-closed: observe 10-day PHI"],
        "source_institutions": ["OUAT", "ICAR-CISH"],
        "evidence_status": "Staged Research",
        "icon": "🍐"
    },
    "citrus": {
        "id": "citrus",
        "common_name_en": "Citrus / Acid Lime / Lemon",
        "common_name_or": "ଲେମ୍ବୁ (Lembu)",
        "scientific_name": "Citrus aurantiifolia (Christm.) Swingle",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.STAGED_RESEARCH,
        "growth_stages": ["Vegetative Flush", "Flowering", "Fruit Set", "Fruit Enlargement", "Harvest"],
        "plant_parts": ["leaf", "twig", "fruit", "bark"],
        "major_insect_pests": [
            {
                "pest_id": "citrus_leaf_miner",
                "common_name_en": "Citrus Leaf Miner",
                "common_name_or": "ଲେମ୍ବୁ ପତ୍ର ଖୋଳା ପୋକ",
                "scientific_name": "Phyllocnistis citrella (Stainton)",
                "local_name_or": "ପତ୍ର ସୁଡ଼ଙ୍ଗ ପୋକ",
                "affected_parts": ["leaf", "twig"],
                "etl_en": "5% infested tender flush leaves",
                "etl_or": "୫% ନୂଆ ପତ୍ରରେ ସୁଡ଼ଙ୍ଗ ଥିଲେ",
                "validation_status": "staged_research"
            },
            {
                "pest_id": "citrus_psylla",
                "common_name_en": "Citrus Psylla (Greening / Huanglongbing Vector)",
                "common_name_or": "ଲେମ୍ବୁ ସାଇଲା ପୋକ",
                "scientific_name": "Diaphorina citri (Kuwayama)",
                "local_name_or": "ଡେଇଁ ପୋକ",
                "affected_parts": ["leaf", "twig"],
                "etl_en": "Colonies on young tender flush",
                "etl_or": "ନୂଆ ଡାଳରେ ପୋକ କଲୋନୀ",
                "validation_status": "staged_research"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Tamarixia radiata", "name_or": "ତାମାରିକ୍ସିଆ ପରଜୀବୀ ପୋକ", "role": "Specialist nymph parasitoid of Citrus psylla"}
        ],
        "common_diseases": ["Citrus Canker (Xanthomonas citri)", "Citrus Greening / HLB", "Gummosis (Phytophthora)"],
        "nutrient_deficiencies": ["Zinc (mottle leaf)", "Iron", "Manganese"],
        "characteristic_symptoms": ["Silvery serpentine zig-zag mines on lower leaf surface, curling and twisting leaves", "Canker: raised corky brown scabby lesions with yellow halo on leaves and fruit"],
        "scouting_methods": ["Examine new emerging flush leaves for silvery mines and psylla nymphs"],
        "cultural_mechanical_control": ["Prune canker-affected twigs during winter and spray Copper Oxychloride @ 3 g/L + Streptocycline @ 0.1 g/L", "Regulate flushes with proper irrigation"],
        "biological_control": ["Spray NSKE 5% or neem oil @ 3 ml/L on tender flushes"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "Observe 14-day PHI"],
        "source_institutions": ["OUAT", "ICAR-Central Citrus Research Institute (CCRI) Nagpur"],
        "evidence_status": "Staged Research",
        "icon": "🍋"
    },
    "coconut": {
        "id": "coconut",
        "common_name_en": "Coconut",
        "common_name_or": "ନଡ଼ିଆ (Nadia)",
        "scientific_name": "Cocos nucifera L.",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Seedling", "Young Palm (1-5 yrs)", "Bearing Palm (6+ yrs)", "Continuous Nut Production"],
        "plant_parts": ["frond / leaf", "crown", "inflorescence", "nut", "trunk", "root"],
        "major_insect_pests": [
            {
                "pest_id": "rhinoceros_beetle",
                "common_name_en": "Rhinoceros Beetle",
                "common_name_or": "ନଡ଼ିଆ ଗଣ୍ଡେଇ ପୋକ (ଗଣ୍ଡା କାଣ୍ଡ ପୋକ)",
                "scientific_name": "Oryctes rhinoceros (L.)",
                "local_name_or": "ଗଣ୍ଡା ପୋକ / ଗଣ୍ଡେଇ ପୋକ",
                "affected_parts": ["crown", "frond / leaf"],
                "etl_en": "Presence of V-shaped cuts on open fronds or chewed fiber at spindle base",
                "etl_or": "ପତ୍ରରେ ଇଂରାଜୀ V-ଆକାରର କଟା ଦାଗ କିମ୍ବା ମୁକୁଟରେ କଣା",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "red_palm_weevil",
                "common_name_en": "Red Palm Weevil (RPW)",
                "common_name_or": "ନଡ଼ିଆ ନାଲି ଶୁଣ୍ଢିଆ ପୋକ",
                "scientific_name": "Rhynchophorus ferrugineus (Olivier)",
                "local_name_or": "ନାଲି କଣା ପୋକ",
                "affected_parts": ["trunk", "crown"],
                "etl_en": "Presence of chewed fibrous frass with fermented odor from trunk holes",
                "etl_or": "ଗଣ୍ଡିରୁ ଅଠା ବାହାରିବା ଓ ଖଦଡ଼ା ତନ୍ତୁ ନିର୍ଗତ ହେବା",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "coconut_black_headed_caterpillar",
                "common_name_en": "Black Headed Caterpillar",
                "common_name_or": "ନଡ଼ିଆ କଳା ମୁଣ୍ଡିଆ ପତ୍ରଖିଆ ପୋକ",
                "scientific_name": "Opisina arenosella (Walker)",
                "local_name_or": "ପତ୍ର କାଟୁଆ ପୋକ",
                "affected_parts": ["frond / leaf"],
                "etl_en": "Brown dried patches on lower whorl fronds with silken frass galleries",
                "etl_or": "ତଳ ପତ୍ର ପୋଡ଼ିଗଲା ଭଳି ଶୁଖିବା",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Goniozus nephantidis", "name_or": "ଗୋନିଓଜସ୍ ପରଜୀବୀ ପୋକ", "role": "Larval parasitoid providing biological control of black headed caterpillar"},
            {"name_en": "Oryctes nudivirus (OrNV)", "name_or": "ଭୂତାଣୁ ଜୈବିକ ଦମନ", "role": "Biocontrol agent suppressing Rhinoceros beetle populations naturally"}
        ],
        "common_diseases": ["Basal Stem Rot / Thanjavur Wilt (Ganoderma)", "Bud Rot (Phytophthora palmivora)", "Leaf Rot"],
        "nutrient_deficiencies": ["Potassium (orange/yellow spotting on older leaflets with necrotic curling tips)", "Boron (hook leaf or crown choke)"],
        "characteristic_symptoms": ["Rhinoceros beetle: geometrical V-shaped or fan-like cuts on expanded fronds", "Red Palm Weevil: central shoot wilting, chewing sound audible inside trunk, fermented sap ooze", "Opisina: scorched burnt appearance of lower palm canopy from extensive scraping"],
        "scouting_methods": ["Inspect crown for V-shaped frond cuts; place ear against trunk of suspect palms to listen for chewing sound"],
        "cultural_mechanical_control": ["Hook out adult rhinoceros beetles from palm crowns using iron rods with hooked tips during June-September", "Fill leaf axils with equal parts of sand and neem seed powder or naphthalene balls (3-4 balls per palm)", "Clean manure pits where rhinoceros grubs breed; treat with Metarhizium anisopliae"],
        "biological_control": ["Release Goniozus nephantidis @ 20 parasitoids per palm for Opisina", "Install Ferrolure pheromone traps @ 1 trap per 2 hectares for Red Palm Weevil mass trapping"],
        "chemical_control_safeguards": ["Fail-closed: avoid trunk chemical injection unless confirmed by certified horticulture officer", "Observe 45-day PHI for harvested coconuts"],
        "source_institutions": ["OUAT All India Coordinated Research Project on Palms", "ICAR-Central Plantation Crops Research Institute (CPCRI) Kasaragod"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥥"
    },
    "cashew": {
        "id": "cashew",
        "common_name_en": "Cashew / Cashewnut",
        "common_name_or": "କାଜୁ (Kaju)",
        "scientific_name": "Anacardium occidentale L.",
        "category": CropCategory.FRUITS_HORTICULTURE,
        "category_name_en": "Fruits & Horticultural Crops",
        "category_name_or": "ଫଳ ଓ ଉଦ୍ୟାନ କୃଷି ଫସଲ",
        "validation_status": CropValidationStatus.SUPERVISED_FIELD_PILOT,
        "growth_stages": ["Vegetative Flush", "Panicle Emergence / Flowering", "Fruit Setting", "Nut Development / Maturity"],
        "plant_parts": ["leaf", "flush", "inflorescence / panicle", "apple & nut", "bark / trunk"],
        "major_insect_pests": [
            {
                "pest_id": "tea_mosquito_bug_cashew",
                "common_name_en": "Tea Mosquito Bug (TMB)",
                "common_name_or": "କାଜୁ ଟି-ମସ୍କିଟୋ ବଗ୍ (ମହୁଆ ପୋକ)",
                "scientific_name": "Helopeltis antonii (Signoret)",
                "local_name_or": "କାଜୁ ମହୁଆ ପୋକ",
                "affected_parts": ["flush", "inflorescence / panicle", "apple & nut"],
                "etl_en": "5% damaged flushes or panicles with black necrotic feeding lesions and resin exudation",
                "etl_or": "୫% ନୂଆ ପତ୍ର ବା ମଞ୍ଜୁଳିରେ କଳା ଦାଗ ଓ ଅଠା",
                "validation_status": "supervised_field_pilot"
            },
            {
                "pest_id": "cashew_stem_and_root_borer",
                "common_name_en": "Cashew Stem and Root Borer (CSRB)",
                "common_name_or": "କାଜୁ ଗଣ୍ଡି ଓ ଚେର ବିନ୍ଧା ପୋକ",
                "scientific_name": "Plocaederus ferrugineus (L.)",
                "local_name_or": "ଗଣ୍ଡି କଣା ପୋକ",
                "affected_parts": ["bark / trunk", "root"],
                "etl_en": "Trunk extrusion of reddish-brown fibrous frass and resin gumming",
                "etl_or": "ଗଣ୍ଡିରୁ ଲାଲ୍ ଖଦଡ଼ା ଗୁଣ୍ଡ ଓ ଅଠା ବାହାରିଲେ",
                "validation_status": "supervised_field_pilot"
            }
        ],
        "beneficial_insects": [
            {"name_en": "Red ant (Oecophylla smaragdina)", "name_or": "କାଇ ପୋକ / ନାଲି ପିମ୍ପୁଡ଼ି", "role": "Highly aggressive predator of Tea Mosquito Bug nymphs and adults; widely conserved by Odisha cashew farmers"},
            {"name_en": "Spiders and praying mantids", "name_or": "ବୁଢ଼ିଆଣୀ ଓ ଝିଣ୍ଟିକା", "role": "Generalist canopy predators"}
        ],
        "common_diseases": ["Dieback / Pink Disease (Corticium salmonicolor)", "Anthracnose", "Inflorescence Blight"],
        "nutrient_deficiencies": ["Zinc", "Nitrogen"],
        "characteristic_symptoms": ["TMB: angular water-soaked lesions turning dark brown to black on young shoots and panicles; scorched appearance of tree canopy", "CSRB: yellowing and shedding of leaves, gum exudation and fibrous frass at tree collar, progressive tree death"],
        "scouting_methods": ["Inspect 20 fresh shoots and panicles on 10 random trees for black necrosed feeding spots during flush and flowering"],
        "cultural_mechanical_control": ["Encourage red ant (Oecophylla smaragdina) nests in trees; avoid chemical sprays that destroy ant colonies", "Chisel out CSRB grubs and pupae from collar regions and swab trunk with carbaryl or neem oil + copper oxychloride"],
        "biological_control": ["Conserve red weaver ants (Oecophylla)", "Apply Metarhizium anisopliae @ 250 g/tree in collar soil for CSRB"],
        "chemical_control_safeguards": ["Fail-closed: locked until verified ETL breach", "CIBRC registered for TMB: Acetamiprid 20% SP @ 0.5 g/L or Lambda-cyhalothrin 5% EC @ 0.6 ml/L applied synchronized with flush, panicle, and nut set", "Observe 30-day PHI"],
        "source_institutions": ["OUAT Cashew Research Station Bhubaneswar", "ICAR-Directorate of Cashew Research (DCR) Puttur"],
        "evidence_status": "Supervised Field Pilot Staging",
        "icon": "🥜"
    }
}

def get_all_crops() -> List[Dict[str, Any]]:
    return list(ODISHA_CROPS_REGISTRY.values())

def get_crop_by_id(crop_id: str) -> Optional[Dict[str, Any]]:
    if not crop_id:
        return None
    return ODISHA_CROPS_REGISTRY.get(crop_id.lower().strip())

def get_crop_categories() -> List[str]:
    cats = set()
    for c in ODISHA_CROPS_REGISTRY.values():
        cat = c["category"].value if hasattr(c["category"], "value") else str(c["category"])
        cats.add(cat)
    return sorted(list(cats))
