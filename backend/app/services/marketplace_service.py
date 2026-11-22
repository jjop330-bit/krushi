import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.models.marketplace import (
    ProductCategory, Product, ProductCreate, ProductUpdate, ProductStatusEnum,
    SellerProfile, SellerRegisterRequest, SellerStatusEnum, SellerBusinessTypeEnum,
    ShoppingCart, CartItem, CartItemAdd, CartItemUpdate,
    Order, OrderItem, SellerSuborder, CheckoutRequest, OrderStatusEnum, PaymentStatusEnum, SuborderStatusEnum,
    ProductReview, ProductReviewCreate
)

class MarketplaceService:
    """
    Production-grade multi-vendor agricultural marketplace service.
    Handles product catalog, multi-vendor cart splitting, transactional stock reservations,
    order lifecycles, commission accounting, seller portals, and product reviews.
    """

    def __init__(self):
        self._categories: Dict[str, ProductCategory] = {}
        self._sellers: Dict[str, SellerProfile] = {}
        self._products: Dict[str, Product] = {}
        self._carts: Dict[str, Dict[str, int]] = {}  # user_id -> {product_id: quantity}
        self._orders: Dict[str, Order] = {}
        self._reviews: Dict[str, List[ProductReview]] = {}  # product_id -> list of reviews
        self._commission_rate: float = 5.00  # Admin configurable platform commission %

        self._initialize_default_catalog()

    def _initialize_default_catalog(self):
        """Initializes categories and verified authentic agricultural inputs for Odisha."""
        categories_data = [
            ("seeds", "Seeds & Planting Materials", "ବିହନ ଏବଂ ରୋପଣ ସାମଗ୍ରୀ", "Certified high-yield, disease-resistant seeds verified for Odisha agro-climatic conditions", "ଓଡ଼ିଶା ଜଳବାୟୁ ଅନୁକୂଳ ପ୍ରମାଣିତ ଅଧିକ ଅମଳକ୍ଷମ ବିହନ", "Sprout"),
            ("fertilizers", "Fertilizers & Soil Nutrients", "ଖତ ଓ ମୃତ୍ତିକା ପୋଷକ ତତ୍ତ୍ୱ", "NPK mixtures, micronutrients, bio-fertilizers, and soil conditioning supplements", "ଜୈବିକ ଓ ରାସାୟନିକ ସାର ଏବଂ ଅଣୁସାର", "Layers"),
            ("organic", "Organic Farming Products", "ଜୈବିକ କୃଷି ଉତ୍ପାଦ", "Neem formulations, Trichoderma, Pseudomonas, vermicompost, and bio-stimulants", "ନିମ୍ବ ତେଲ, ଟ୍ରାଇକୋଡର୍ମା, ଜିଆ ଖତ ଓ ପ୍ରାକୃତିକ କୀଟନାଶକ", "Leaf"),
            ("irrigation", "Irrigation Equipment", "ଜଳସେଚନ ଉପକରଣ", "Drip kits, sprinkler systems, HDPE pipes, filters, and smart solar pump accessories", "ବିନ୍ଦୁ ଜଳସେଚନ, ସ୍ପ୍ରିଙ୍କଲର ଓ ପାଇପ୍ ସାମଗ୍ରୀ", "Droplet"),
            ("machinery", "Agricultural Machinery", "କୃଷି ଯନ୍ତ୍ରପାତି", "Power tillers, reapers, seed drills, multi-crop threshers, and power sprayers", "ପାୱାର ଟିଲର, ଧାନ କଟା ମେସିନ୍ ଓ ସ୍ପ୍ରେୟାର", "Cpu"),
            ("tools", "Farming Tools", "କୃଷି ଉପକରଣ ଓ ହସ୍ତକଳା", "Weeders, sickles, pruning shears, manual knapsack sprayers, and protective gear", "ଘାସ ବଛା ଯନ୍ତ୍ର, ଦାଆ ଓ ସୁରକ୍ଷା ଉପକରଣ", "Wrench"),
            ("crop_protection", "Crop Protection & Traps", "ଫସଲ ସୁରକ୍ଷା ଓ ଫାନ୍ଦ", "Yellow/blue sticky traps, pheromone lure traps, light traps, and biological shields", "ଫେରୋମୋନ ଫାନ୍ଦ, ଆଲୋକ ଫାନ୍ଦ ଓ ସୁରକ୍ଷା ଜାଲ", "ShieldCheck"),
            ("harvesting", "Harvesting & Storage Equipment", "ଅମଳ ଓ ସଂରକ୍ଷଣ ଉପକରଣ", "Hermetic grain storage bags (PICS), tarpaulins, moisture meters, and drying mats", "ଶସ୍ୟ ସଂରକ୍ଷଣ ବ୍ୟାଗ, ତିର୍ପାଲ ଓ ଆର୍ଦ୍ରତା ମାପକ", "PackageCheck"),
        ]

        for cat_id, name_en, name_or, desc_en, desc_or, icon in categories_data:
            self._categories[cat_id] = ProductCategory(
                id=cat_id,
                name_en=name_en,
                name_or=name_or,
                description_en=desc_en,
                description_or=desc_or,
                icon_name=icon,
                is_active=True
            )

        # Verified authentic Odisha agricultural cooperatives & suppliers
        seller_ossc = SellerProfile(
            id="seller-ossc-bargarh",
            business_name="Odisha State Seeds Corporation (OSSC) Bargarh",
            contact_person="Manoj Kumar Mishra",
            phone_number="06646-234567",
            email="bargarh@orissaseeds.com",
            business_address="At/PO Canal Road, Near Main Canal, Bargarh, Odisha 768028",
            operating_district="bargarh",
            business_type=SellerBusinessTypeEnum.FPO,
            license_number="OSSC/BRG/2026/A-09",
            bank_account_number_masked="XXXXXX4512",
            bank_ifsc="SBIN0000028",
            status=SellerStatusEnum.VERIFIED,
            commission_rate=5.00,
            rating=4.95,
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )
        self._sellers[seller_ossc.id] = seller_ossc

        seller_samaleswari = SellerProfile(
            id="seller-samaleswari-agro",
            business_name="Maa Samaleswari Bio-Agro & Solar Systems",
            contact_person="Priyabrata Sahu",
            phone_number="0663-2541890",
            email="samaleswari.agro@gmail.com",
            business_address="NH-53 Bypass, Dhanupali, Sambalpur, Odisha 768005",
            operating_district="sambalpur",
            business_type=SellerBusinessTypeEnum.RETAILER,
            license_number="OD/SMB/PEST/2024/041",
            bank_account_number_masked="XXXXXX8901",
            bank_ifsc="PUNB0123400",
            status=SellerStatusEnum.VERIFIED,
            commission_rate=5.00,
            rating=4.88,
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )
        self._sellers[seller_samaleswari.id] = seller_samaleswari

        # Seed Authentic Verified Products matching Odisha crops & diagnostic pests
        sample_products = [
            Product(
                id="prod-mtu-1010-seed",
                seller_id=seller_ossc.id,
                seller_name=seller_ossc.business_name,
                seller_district=seller_ossc.operating_district,
                category_id="seeds",
                title_en="Certified MTU-1010 Paddy Seeds (Cottondora Sannalu)",
                title_or="ପ୍ରମାଣିତ ଏମଟିୟୁ-୧୦୧୦ ଧାନ ବିହନ (ଫାଉଣ୍ଡେସନ୍ ଗ୍ରେଡ୍)",
                description_en="Official foundation certified paddy seeds with 98% germination rate. High resistance to lodging, 120-125 days maturity duration, ideal for Kharif and Rabi in western Odisha canal commands.",
                description_or="୯୮% ଗଜା ହେବାର କ୍ଷମତା ଥିବା ପ୍ରମାଣିତ ଧାନ ବିହନ। ବରଗଡ଼ ଓ ସମ୍ବଲପୁର ଅଞ୍ଚଳ ପାଇଁ ଉତ୍ତମ। ୧୨୦-୧୨୫ ଦିନ ଅବଧି।",
                price=850.00,
                original_price=950.00,
                unit="30 kg bag",
                stock_quantity=150,
                image_urls=["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy"],
                target_pests=[],
                is_organic=False,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.9,
                total_reviews=28,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-pooja-cr1018-seed",
                seller_id=seller_ossc.id,
                seller_name=seller_ossc.business_name,
                seller_district=seller_ossc.operating_district,
                category_id="seeds",
                title_en="CR Dhan 1018 (Pooja) Certified Paddy Seeds",
                title_or="ସି.ଆର. ଧାନ ୧୦୧୮ (ପୂଜା) ଧାନ ବିହନ",
                description_en="Long duration (145-150 days) flood-tolerant and BPH field-tolerant variety developed by ICAR-NRRI Cuttack. Excellent grain quality and high head rice recovery.",
                description_or="ଜାତୀୟ ଧାନ ଗବେଷଣା ପ୍ରତିଷ୍ଠାନ (NRRI) କଟକ ଦ୍ୱାରା ପ୍ରସ୍ତୁତ ବନ୍ୟା ଓ ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ସହନଶୀଳ ଧାନ ବିହନ।",
                price=920.00,
                original_price=1050.00,
                unit="30 kg bag",
                stock_quantity=95,
                image_urls=["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy"],
                target_pests=["bph"],
                is_organic=False,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.8,
                total_reviews=16,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-neem-oil-10000ppm",
                seller_id=seller_samaleswari.id,
                seller_name=seller_samaleswari.business_name,
                seller_district=seller_samaleswari.operating_district,
                category_id="organic",
                title_en="Cold-Pressed Neem Oil Biopesticide (10,000 PPM Azadirachtin)",
                title_or="ପ୍ରାକୃତିକ ନିମ୍ବ ତେଲ ଜୈବିକ କୀଟନାଶକ (୧୦,୦୦୦ PPM)",
                description_en="Pure botanical insect growth regulator (IGR) repellent and anti-feedant. Suppresses Brown Planthopper, Leaf Folder, and early Yellow Stem Borer larvae without harming beneficial predatory spiders.",
                description_or="ଜୈବିକ କୀଟନାଶକ। ମାଟିଆ ଗୁଣ୍ଡି, ପତ୍ରମୋଡ଼ା ଓ ମଜା ପୋକ ଦମନ ପାଇଁ ପରମ ଉପଯୋଗୀ। କଲମ ବୁଢ଼ିଆଣୀ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ।",
                price=480.00,
                original_price=550.00,
                unit="1 Litre bottle",
                stock_quantity=180,
                image_urls=["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy", "maize", "vegetables", "pulses"],
                target_pests=["bph", "leaf_folder", "stem_borer", "armyworm"],
                is_organic=True,
                is_chemical_regulated=False,
                cibrc_registration_number="CIBRC-BIO-2023-882",
                status=ProductStatusEnum.ACTIVE,
                rating=4.95,
                total_reviews=42,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-trichoderma-viride",
                seller_id=seller_samaleswari.id,
                seller_name=seller_samaleswari.business_name,
                seller_district=seller_samaleswari.operating_district,
                category_id="organic",
                title_en="Trichoderma Viride 1.5% WP Bio-Fungicide",
                title_or="ଟ୍ରାଇକୋଡର୍ମା ଭିରିଡି ୧.୫% WP ଜୈବିକ କବକନାଶକ",
                description_en="Antagonistic fungal biocontrol agent for seed treatment and soil application. Controls sheath blight, root rot, and damping off in rice, groundnut, and vegetables.",
                description_or="ବିହନ ବିଶୋଧନ ଓ ମାଟି ଉପଚାର ପାଇଁ ଫଳପ୍ରଦ ଜୈବିକ କବକନାଶକ। ଶିଥ୍ ବ୍ଲାଇଟ୍ ଓ ଚେର ସଢ଼ା ରୋଗ ପ୍ରତିରୋଧକ।",
                price=220.00,
                original_price=260.00,
                unit="1 kg pack",
                stock_quantity=220,
                image_urls=["https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy", "pulses", "groundnut", "tomato", "chilli"],
                target_pests=[],
                is_organic=True,
                is_chemical_regulated=False,
                cibrc_registration_number="CIBRC-BIO-2022-104",
                status=ProductStatusEnum.ACTIVE,
                rating=4.7,
                total_reviews=19,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-yellow-sticky-traps",
                seller_id=seller_samaleswari.id,
                seller_name=seller_samaleswari.business_name,
                seller_district=seller_samaleswari.operating_district,
                category_id="crop_protection",
                title_en="High-Density Yellow Sticky Traps with Dual Glue (Pack of 25)",
                title_or="ହଳଦିଆ ଅଠାଳିଆ କୀଟ ଫାନ୍ଦ (୨୫ ଟି ବିଶିଷ୍ଟ ପ୍ୟାକେଟ୍)",
                description_en="Weatherproof UV-stabilized monitoring and mass-trapping plates. Highly attractive to adult Brown Planthopper, Whiteflies, Thrips, and Aphids. Non-toxic pest suppression.",
                description_or="ବର୍ଷା ଓ ଖରା ସହନଶୀଳ ହଳଦିଆ କୀଟ ଫାନ୍ଦ। ମାଟିଆ ଗୁଣ୍ଡି ପୋକ ଏବଂ ଶୋଷକ କୀଟଙ୍କ ସ୍ୱୟଂଚାଳିତ ନିୟନ୍ତ୍ରଣ।",
                price=340.00,
                original_price=420.00,
                unit="Pack of 25 sheets",
                stock_quantity=140,
                image_urls=["https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy", "tomato", "chilli", "brinjal"],
                target_pests=["bph", "black_thrips"],
                is_organic=True,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.9,
                total_reviews=35,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-scirpophaga-lures",
                seller_id=seller_samaleswari.id,
                seller_name=seller_samaleswari.business_name,
                seller_district=seller_samaleswari.operating_district,
                category_id="crop_protection",
                title_en="Yellow Stem Borer Pheromone Lure + Sleeve Trap (Pack of 5)",
                title_or="ହଳଦିଆ ମଜା ପୋକ ଫେରୋମୋନ ଲିୟୋର ଓ ଟ୍ରାପ୍ (୫ ଟି ସେଟ୍)",
                description_en="ICAR-grade female sex pheromone lure for mass trapping male Yellow Stem Borer moths (Scirpophaga incertulas). Reduces dead hearts and white earhead formation.",
                description_or="ହଳଦିଆ ମଜା ପୋକ ମାଈ ଗନ୍ଧ ଫାନ୍ଦ। କାଣ୍ଡ ବିନ୍ଧା ପୋକ ସଂଖ୍ୟା ହ୍ରାସ କରି ଧାନ ଶିଁଷା ଧଳା ହେବାରୁ ରକ୍ଷା କରେ।",
                price=390.00,
                original_price=480.00,
                unit="5 Trap Kits",
                stock_quantity=80,
                image_urls=["https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy"],
                target_pests=["stem_borer"],
                is_organic=True,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.85,
                total_reviews=22,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-battery-sprayer-16l",
                seller_id=seller_samaleswari.id,
                seller_name=seller_samaleswari.business_name,
                seller_district=seller_samaleswari.operating_district,
                category_id="tools",
                title_en="16L 12V Dual-Motor Knapsack Battery Sprayer with Brass Nozzles",
                title_or="୧୬ ଲିଟର ଡୁଆଲ୍-ମୋଟର ବ୍ୟାଟେରୀ ସ୍ପ୍ରେୟାର (ପିତ୍ତଳ ନୋଜଲ ସହିତ)",
                description_en="High-pressure agricultural sprayer with heavy-duty rechargeable battery, telescopic stainless lance, pressure regulator, and 4 specialized nozzles for deep canopy penetration.",
                description_or="ଶକ୍ତିଶାଳୀ ବ୍ୟାଟେରୀ ସ୍ପ୍ରେୟାର। ଧାନ କିଆରୀର ମୂଳ ପର୍ଯ୍ୟନ୍ତ କୀଟନାଶକ ଓ ଔଷଧ ସଠିକ୍ ଭାବେ ସିଞ୍ଚନ କରିବା ପାଇଁ ଉପଯୁକ୍ତ।",
                price=2490.00,
                original_price=2999.00,
                unit="1 Complete Kit",
                stock_quantity=45,
                image_urls=["https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy", "vegetables", "maize", "pulses"],
                target_pests=[],
                is_organic=False,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.9,
                total_reviews=14,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            ),
            Product(
                id="prod-pics-storage-bags",
                seller_id=seller_ossc.id,
                seller_name=seller_ossc.business_name,
                seller_district=seller_ossc.operating_district,
                category_id="harvesting",
                title_en="Hermetic Grain Storage Bags (PICS Standard, 50 kg capacity, Pack of 5)",
                title_or="ବାୟୁରୋଧକ ଶସ୍ୟ ସଂରକ୍ଷଣ ବ୍ୟାଗ (୫୦ କେଜି, ୫ ଟି ର ପ୍ୟାକ୍)",
                description_en="Triple-layer hermetic bags preventing grain weevil, moisture deterioration, and fungal growth without using hazardous chemical fumigants for up to 2 years.",
                description_or="ବିନା କୀଟନାଶକରେ ଧାନ ଓ ଡାଲି ଜାତୀୟ ଶସ୍ୟକୁ ୨ ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ ସୁରକ୍ଷିତ ରଖିବା ପାଇଁ ଉନ୍ନତ ବାୟୁରୋଧକ ବ୍ୟାଗ୍।",
                price=580.00,
                original_price=690.00,
                unit="Pack of 5 bags",
                stock_quantity=110,
                image_urls=["https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=600&auto=format&fit=crop"],
                compatible_crops=["paddy", "pulses", "maize"],
                target_pests=[],
                is_organic=True,
                is_chemical_regulated=False,
                cibrc_registration_number=None,
                status=ProductStatusEnum.ACTIVE,
                rating=4.9,
                total_reviews=18,
                created_at=datetime.now(timezone.utc).isoformat(),
                updated_at=datetime.now(timezone.utc).isoformat()
            )
        ]

        for p in sample_products:
            self._products[p.id] = p

    # --- CATEGORY MANAGEMENT ---
    def get_categories(self) -> List[ProductCategory]:
        return list(self._categories.values())

    def get_category(self, category_id: str) -> Optional[ProductCategory]:
        return self._categories.get(category_id)

    # --- PRODUCT CATALOG ---
    def list_products(
        self,
        category_id: Optional[str] = None,
        crop_id: Optional[str] = None,
        pest_id: Optional[str] = None,
        search_query: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        is_organic: Optional[bool] = None,
        seller_district: Optional[str] = None,
        seller_id: Optional[str] = None,
        status: Optional[str] = "active"
    ) -> List[Product]:
        results = list(self._products.values())

        if status:
            results = [p for p in results if p.status.value == status]

        if category_id:
            results = [p for p in results if p.category_id == category_id]

        if crop_id:
            results = [p for p in results if crop_id in p.compatible_crops or len(p.compatible_crops) == 0]

        if pest_id:
            results = [p for p in results if pest_id in p.target_pests]

        if is_organic is not None:
            results = [p for p in results if p.is_organic == is_organic]

        if seller_district:
            results = [p for p in results if p.seller_district and p.seller_district.lower() == seller_district.lower()]

        if seller_id:
            results = [p for p in results if p.seller_id == seller_id]

        if min_price is not None:
            results = [p for p in results if p.price >= min_price]

        if max_price is not None:
            results = [p for p in results if p.price <= max_price]

        if search_query and search_query.strip():
            q = search_query.lower().strip()
            results = [
                p for p in results
                if q in p.title_en.lower()
                or q in p.title_or.lower()
                or q in p.description_en.lower()
                or q in p.description_or.lower()
                or (p.seller_name and q in p.seller_name.lower())
            ]

        return results

    def get_product(self, product_id: str) -> Optional[Product]:
        return self._products.get(product_id)

    # --- SELLER MANAGEMENT ---
    def register_seller(self, req: SellerRegisterRequest) -> SellerProfile:
        seller_id = f"seller-{uuid.uuid4().hex[:8]}"
        masked_acc = f"XXXXXX{req.bank_account_number[-4:]}" if req.bank_account_number and len(req.bank_account_number) >= 4 else "NOT_PROVIDED"

        profile = SellerProfile(
            id=seller_id,
            business_name=req.business_name,
            contact_person=req.contact_person,
            phone_number=req.phone_number,
            email=req.email,
            business_address=req.business_address,
            operating_district=req.operating_district.lower(),
            business_type=req.business_type,
            license_number=req.license_number,
            bank_account_number_masked=masked_acc,
            bank_ifsc=req.bank_ifsc,
            status=SellerStatusEnum.PENDING,  # requires admin verification
            commission_rate=self._commission_rate,
            rating=5.0,
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )
        self._sellers[seller_id] = profile
        return profile

    def get_seller(self, seller_id: str) -> Optional[SellerProfile]:
        return self._sellers.get(seller_id)

    def list_sellers(self, status: Optional[SellerStatusEnum] = None) -> List[SellerProfile]:
        sellers = list(self._sellers.values())
        if status:
            sellers = [s for s in sellers if s.status == status]
        return sellers

    def update_seller_status(self, seller_id: str, new_status: SellerStatusEnum) -> Optional[SellerProfile]:
        seller = self._sellers.get(seller_id)
        if not seller:
            return None
        seller.status = new_status
        seller.updated_at = datetime.now(timezone.utc).isoformat()
        return seller

    def add_product(self, seller_id: str, req: ProductCreate) -> Product:
        seller = self._sellers.get(seller_id)
        if not seller:
            raise ValueError(f"Seller {seller_id} not found.")
        if seller.status != SellerStatusEnum.VERIFIED:
            raise PermissionError(f"Seller {seller.business_name} is not verified. Only verified sellers can publish products.")

        prod_id = f"prod-{uuid.uuid4().hex[:8]}"
        product = Product(
            id=prod_id,
            seller_id=seller.id,
            seller_name=seller.business_name,
            seller_district=seller.operating_district,
            category_id=req.category_id,
            title_en=req.title_en,
            title_or=req.title_or,
            description_en=req.description_en,
            description_or=req.description_or,
            price=req.price,
            original_price=req.original_price or req.price,
            unit=req.unit,
            stock_quantity=req.stock_quantity,
            image_urls=req.image_urls,
            compatible_crops=req.compatible_crops,
            target_pests=req.target_pests,
            is_organic=req.is_organic,
            is_chemical_regulated=req.is_chemical_regulated,
            cibrc_registration_number=req.cibrc_registration_number,
            status=ProductStatusEnum.ACTIVE,
            rating=5.0,
            total_reviews=0,
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )
        self._products[prod_id] = product
        return product

    def update_product(self, seller_id: str, product_id: str, update: ProductUpdate) -> Product:
        product = self._products.get(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found.")
        if product.seller_id != seller_id:
            raise PermissionError("Access denied: You can only edit your own products.")

        update_data = update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(product, k, v)
        product.updated_at = datetime.now(timezone.utc).isoformat()
        return product

    # --- SHOPPING CART ---
    def get_cart(self, user_id: str) -> ShoppingCart:
        user_items = self._carts.get(user_id, {})
        items: List[CartItem] = []
        subtotal = 0.0

        for prod_id, qty in list(user_items.items()):
            prod = self._products.get(prod_id)
            if not prod or prod.status != ProductStatusEnum.ACTIVE:
                continue
            item_total = prod.price * qty
            subtotal += item_total
            items.append(CartItem(
                id=f"item-{prod_id}",
                product_id=prod_id,
                product=prod,
                quantity=qty,
                total_price=round(item_total, 2)
            ))

        delivery_fee = 0.0 if subtotal == 0 or subtotal >= 1000.0 else 50.0
        total = subtotal + delivery_fee

        return ShoppingCart(
            id=f"cart-{user_id}",
            user_id=user_id,
            items=items,
            subtotal=round(subtotal, 2),
            delivery_fee=round(delivery_fee, 2),
            total=round(total, 2)
        )

    def add_to_cart(self, user_id: str, item: CartItemAdd) -> ShoppingCart:
        prod = self._products.get(item.product_id)
        if not prod:
            raise ValueError(f"Product {item.product_id} not found.")
        if prod.stock_quantity < item.quantity:
            raise ValueError(f"Insufficient stock: Only {prod.stock_quantity} available.")

        if user_id not in self._carts:
            self._carts[user_id] = {}

        current_qty = self._carts[user_id].get(item.product_id, 0)
        new_qty = current_qty + item.quantity
        if new_qty > prod.stock_quantity:
            raise ValueError(f"Cannot add {item.quantity}: Total quantity ({new_qty}) exceeds available stock ({prod.stock_quantity}).")

        self._carts[user_id][item.product_id] = new_qty
        return self.get_cart(user_id)

    def update_cart_item(self, user_id: str, product_id: str, update: CartItemUpdate) -> ShoppingCart:
        prod = self._products.get(product_id)
        if not prod:
            raise ValueError("Product not found.")
        if update.quantity > prod.stock_quantity:
            raise ValueError(f"Requested quantity {update.quantity} exceeds available stock ({prod.stock_quantity}).")

        if user_id in self._carts:
            if update.quantity <= 0:
                self._carts[user_id].pop(product_id, None)
            else:
                self._carts[user_id][product_id] = update.quantity

        return self.get_cart(user_id)

    def remove_from_cart(self, user_id: str, product_id: str) -> ShoppingCart:
        if user_id in self._carts:
            self._carts[user_id].pop(product_id, None)
        return self.get_cart(user_id)

    def clear_cart(self, user_id: str):
        self._carts.pop(user_id, None)

    # --- ORDER CREATION & MULTI-VENDOR SPLITTING ---
    def checkout(self, user_id: str, req: CheckoutRequest) -> Order:
        cart = self.get_cart(user_id)
        if not cart.items:
            raise ValueError("Shopping cart is empty.")

        # 1. Transactional stock verification
        for item in cart.items:
            prod = self._products.get(item.product_id)
            if not prod or prod.stock_quantity < item.quantity:
                raise ValueError(f"Stock unavailable for {item.product.title_en}. Only {prod.stock_quantity if prod else 0} left.")

        # 2. Transactional stock deduction
        for item in cart.items:
            prod = self._products[item.product_id]
            prod.stock_quantity -= item.quantity
            if prod.stock_quantity == 0:
                prod.status = ProductStatusEnum.OUT_OF_STOCK
            prod.updated_at = datetime.now(timezone.utc).isoformat()

        # 3. Multi-Vendor Suborder Splitting: group items by seller_id
        items_by_seller: Dict[str, List[CartItem]] = {}
        for item in cart.items:
            seller_id = item.product.seller_id
            if seller_id not in items_by_seller:
                items_by_seller[seller_id] = []
            items_by_seller[seller_id].append(item)

        order_id = f"ord-{uuid.uuid4().hex[:10]}"
        order_num = f"KM-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

        suborders: List[SellerSuborder] = []
        for s_id, s_items in items_by_seller.items():
            seller = self._sellers.get(s_id)
            seller_name = seller.business_name if seller else "Agricultural Supplier"
            subtotal = sum(i.total_price for i in s_items)
            comm_rate = seller.commission_rate if seller else self._commission_rate
            comm_amount = round(subtotal * (comm_rate / 100.0), 2)
            seller_net = round(subtotal - comm_amount, 2)

            sub_order_id = f"sub-{uuid.uuid4().hex[:8]}"
            sub_order_num = f"{order_num}-S{len(suborders)+1}"

            order_items = [
                OrderItem(
                    id=f"oi-{uuid.uuid4().hex[:6]}",
                    product_id=i.product_id,
                    product_title=i.product.title_en,
                    unit_price=i.product.price,
                    quantity=i.quantity,
                    total_price=i.total_price,
                    seller_id=s_id
                )
                for i in s_items
            ]

            suborders.append(SellerSuborder(
                id=sub_order_id,
                order_id=order_id,
                seller_id=s_id,
                seller_name=seller_name,
                suborder_number=sub_order_num,
                subtotal=round(subtotal, 2),
                commission_rate=comm_rate,
                commission_amount=comm_amount,
                seller_earnings=seller_net,
                fulfilment_status=SuborderStatusEnum.PROCESSING,
                tracking_number=f"TRK-{uuid.uuid4().hex[:8].upper()}",
                shipping_carrier="Odisha Rural Krushi Express",
                payout_status="PENDING",
                items=order_items,
                created_at=datetime.now(timezone.utc).isoformat()
            ))

        parent_order = Order(
            id=order_id,
            order_number=order_num,
            user_id=user_id,
            farmer_name=req.farmer_name,
            farmer_phone=req.farmer_phone,
            shipping_address=req.shipping_address,
            district=req.district,
            subtotal=cart.subtotal,
            platform_fee=0.0,
            delivery_fee=cart.delivery_fee,
            total_amount=cart.total,
            payment_method=req.payment_method,
            payment_status=PaymentStatusEnum.PAID if req.payment_method == "COD" else PaymentStatusEnum.PENDING,
            order_status=OrderStatusEnum.CONFIRMED,
            suborders=suborders,
            created_at=datetime.now(timezone.utc).isoformat(),
            updated_at=datetime.now(timezone.utc).isoformat()
        )

        self._orders[order_id] = parent_order
        self.clear_cart(user_id)
        return parent_order

    def get_order(self, order_id: str) -> Optional[Order]:
        return self._orders.get(order_id)

    def list_farmer_orders(self, user_id: str) -> List[Order]:
        return [o for o in self._orders.values() if o.user_id == user_id]

    def list_seller_suborders(self, seller_id: str) -> List[SellerSuborder]:
        suborders: List[SellerSuborder] = []
        for order in self._orders.values():
            for sub in order.suborders:
                if sub.seller_id == seller_id:
                    suborders.append(sub)
        return suborders

    def update_suborder_status(
        self,
        seller_id: str,
        suborder_id: str,
        new_status: SuborderStatusEnum,
        tracking_number: Optional[str] = None
    ) -> Optional[SellerSuborder]:
        for order in self._orders.values():
            for sub in order.suborders:
                if sub.id == suborder_id:
                    if sub.seller_id != seller_id:
                        raise PermissionError("Access denied: You can only update your own suborders.")
                    sub.fulfilment_status = new_status
                    if tracking_number:
                        sub.tracking_number = tracking_number
                    order.updated_at = datetime.now(timezone.utc).isoformat()
                    return sub
        return None

    # --- REVIEWS ---
    def add_review(self, product_id: str, user_id: str, req: ProductReviewCreate) -> ProductReview:
        prod = self._products.get(product_id)
        if not prod:
            raise ValueError(f"Product {product_id} not found.")

        review = ProductReview(
            id=f"rev-{uuid.uuid4().hex[:8]}",
            product_id=product_id,
            user_id=user_id,
            farmer_name=req.farmer_name,
            rating=req.rating,
            comment=req.comment,
            verified_purchase=True,
            created_at=datetime.now(timezone.utc).isoformat()
        )

        if product_id not in self._reviews:
            self._reviews[product_id] = []
        self._reviews[product_id].insert(0, review)

        # Recompute rating
        all_revs = self._reviews[product_id]
        prod.total_reviews = len(all_revs)
        prod.rating = round(sum(r.rating for r in all_revs) / len(all_revs), 2)
        prod.updated_at = datetime.now(timezone.utc).isoformat()

        return review

    def get_product_reviews(self, product_id: str) -> List[ProductReview]:
        return self._reviews.get(product_id, [])

    # --- ADMIN METRICS ---
    def get_admin_metrics(self) -> Dict[str, Any]:
        total_sales = sum(o.total_amount for o in self._orders.values())
        total_commissions = sum(
            sub.commission_amount
            for o in self._orders.values()
            for sub in o.suborders
        )
        pending_payouts = sum(
            sub.seller_earnings
            for o in self._orders.values()
            for sub in o.suborders
            if sub.payout_status == "PENDING"
        )

        return {
            "total_sellers": len(self._sellers),
            "verified_sellers": len([s for s in self._sellers.values() if s.status == SellerStatusEnum.VERIFIED]),
            "active_products": len([p for p in self._products.values() if p.status == ProductStatusEnum.ACTIVE]),
            "total_orders": len(self._orders),
            "total_sales": round(total_sales, 2),
            "marketplace_commissions": round(total_commissions, 2),
            "pending_seller_payouts": round(pending_payouts, 2),
            "platform_commission_rate": self._commission_rate
        }

    def set_platform_commission(self, new_rate: float):
        if new_rate < 0 or new_rate > 50:
            raise ValueError("Commission rate must be between 0% and 50%.")
        self._commission_rate = new_rate

marketplace_service = MarketplaceService()
