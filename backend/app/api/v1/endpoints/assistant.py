import uuid
import json
import logging
import httpx
from fastapi import APIRouter
from app.core.config import settings
from app.models.chat import ChatRequest, ChatResponse
from app.services.knowledge import get_pest_knowledge

logger = logging.getLogger(__name__)

router = APIRouter()

import uuid
import json
import logging
import re
import httpx
from fastapi import APIRouter
from app.core.config import settings
from app.models.chat import ChatRequest, ChatResponse
from app.services.knowledge import get_pest_knowledge

logger = logging.getLogger(__name__)

router = APIRouter()

def clean_and_format_steps_en(steps: list[str]) -> str:
    """
    Cleans and joins treatment steps without double periods,
    avoiding lowercase 'followed by' after a period, and ensuring mid-sentence
    capitalization is corrected.
    """
    if not steps:
        return ""
    step0 = steps[0].strip().rstrip(".")
    if len(steps) == 1:
        return f"{step0}."
    step1 = steps[1].strip().rstrip(".")
    if step1:
        step1 = step1[0].lower() + step1[1:]
    return f"{step0}, followed by {step1}."

def clean_and_format_steps_or(steps: list[str]) -> str:
    if not steps:
        return ""
    step0 = steps[0].strip().rstrip(".।")
    if len(steps) == 1:
        return f"{step0}। "
    step1 = steps[1].strip().rstrip(".।")
    return f"{step0} ଏବଂ {step1}। "

def check_greeting_or_smalltalk(query: str) -> tuple[bool, str]:
    """
    Detects greetings and gratitude/small talk in English, Odia, and transliterations.
    Returns (True, 'greeting' | 'gratitude') or (False, '').
    """
    q_clean = query.strip().lower()
    q_normalized = re.sub(r"[!?.,;:।]+$", "", q_clean).strip()
    
    # Greetings regex & terms
    greeting_terms = [
        "hi", "hii", "hiii", "hello", "hey", "namaste", "namaskar", "namaskara",
        "good morning", "good afternoon", "good evening", "greetings",
        "how are you", "who are you",
        "ନମସ୍କାର", "ନମସ୍କାର୍", "ଜୁହାର", "ନମସ୍ତେ", "ହେଲୋ", "ହାଏ", "କେମିତି ଅଛନ୍ତି", "କେମିତି ଅଛ", "ଆପଣ କିଏ"
    ]
    if q_normalized in greeting_terms or any(q_normalized.startswith(g + " ") for g in greeting_terms):
        return True, "greeting"
    if re.match(r"^(h+i+|h+e+y+|h+e+l+o+|namaste|namaskar|ନମସ୍କାର|ଜୁହାର)\b", q_normalized):
        return True, "greeting"

    # Gratitude terms
    gratitude_terms = [
        "thanks", "thank you", "thank u", "thx", "dhanyabad", "dhanyavad", "dhanyawad",
        "ଧନ୍ୟବାଦ", "ଧନ୍ୟବାଦ୍"
    ]
    if q_normalized in gratitude_terms or any(q_normalized.startswith(t + " ") for t in gratitude_terms):
        return True, "gratitude"

    return False, ""

def is_suggestion_chip_query(query: str) -> str | None:
    """
    Matches only the 3 canonical suggestion chips or their specific entomological questions:
    - Chip 1: why did pest attack / outbreak causes
    - Chip 2: control without chemicals / non-chemical / organic / biological
    - Chip 3: chemical dosage / pesticide recommendation
    """
    q_lower = query.strip().lower()
    
    # Chip 1: Why did pest attack
    if (
        "why is this pest attacking" in q_lower or
        "why did this pest attack" in q_lower or
        "why is pest attacking" in q_lower or
        "why did pest attack" in q_lower or
        "ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି" in q_lower or
        "ପୋକ କାହିଁକି ଲାଗିଛି" in q_lower or
        (any(k in q_lower for k in ["why", "cause", "reason", "କାହିଁକି"]) and any(p in q_lower for p in ["pest", "attack", "attacking", "outbreak", "ଧାନ", "ପୋକ"]))
    ):
        return "chip_why"

    # Chip 2: Control without chemicals
    if (
        "control without chemicals" in q_lower or
        "without chemicals" in q_lower or
        "without chemical" in q_lower or
        "ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି" in q_lower or
        "ଔଷଧ ନ ପକାଇ" in q_lower or
        "ବିନା ଔଷଧ" in q_lower or
        "organic control" in q_lower or
        "biological control" in q_lower or
        "ଜୈବିକ" in q_lower
    ):
        return "chip_non_chemical"

    # Chip 3: Chemical dosage
    if (
        "correct chemical dosage" in q_lower or
        "chemical dosage" in q_lower or
        "what is the correct chemical dosage" in q_lower or
        "ଏହି ପୋକ କିପରି ଦୂର କରିବି" in q_lower or
        "କେତେ ମାତ୍ରା" in q_lower or
        ("dosage" in q_lower or "dose" in q_lower) and ("chemical" in q_lower or "pesticide" in q_lower)
    ):
        return "chip_dosage"

    # Beneficial spiders specific query
    if any(k in q_lower for k in ["ବୁଢ଼ିଆଣୀ", "spider", "predator", "ବନ୍ଧୁ ପୋକ"]):
        return "chip_spider"

    return None

async def generate_gemini_chat_response(query: str, pest_info: dict | None, district: str) -> dict | None:
    """
    Invokes Gemini 3.5 Flash Lite API to produce natural Odia in Odia script
    and structured English guidance for Odisha farmers.
    """
    if not settings.GEMINI_API_KEY:
        return None

    pest_desc = ""
    if pest_info:
        pest_desc = (
            f"Active Crop Pest Context:\n"
            f"- Common Name: {pest_info.get('common_name_en', 'N/A')} ({pest_info.get('common_name_or', 'N/A')})\n"
            f"- Scientific Name: {pest_info.get('scientific_name', 'N/A')}\n"
            f"- Symptoms: {', '.join(pest_info.get('key_symptoms_en', []))}\n"
            f"- Biological Control: {', '.join(pest_info.get('immediate_next_steps_en', []))}\n"
        )
        if pest_info.get("chemical_control"):
            chems = pest_info["chemical_control"]
            chem = chems[0] if isinstance(chems, list) and len(chems) > 0 else (chems if isinstance(chems, dict) else {})
            if isinstance(chem, dict):
                mol = chem.get("active_ingredient") or chem.get("molecule_en", "")
                trade = chem.get("trade_names")
                brand = ", ".join(trade) if isinstance(trade, list) else (chem.get("popular_brand") or "")
                dose = chem.get("dosage_per_acre") or chem.get("dosage_per_acre_en", "")
                brand_str = f" ({brand})" if brand else ""
                dose_str = f" @ {dose}" if dose else ""
                pest_desc += f"- CIBRC Chemical: {mol}{brand_str}{dose_str}\n"

    system_prompt = (
        "You are Krushi Mitra AI (କୃଷି ମିତ୍ର AI), an expert agricultural scientist and field advisor for farmers in Odisha, India.\n"
        "Your duty is to provide practical, authentic, and empathetic agricultural advice for paddy and major Odisha crops.\n"
        "\n"
        "CRITICAL RULES:\n"
        "1. For 'reply_or', produce natural, highly fluent Odia written strictly in Odia script (ଓଡ଼ିଆ ଲିପି). Never use Hindi words or Latin transliteration for Odia.\n"
        "2. Preserve scientific binomials (e.g., Nilaparvata lugens, Scirpophaga incertulas) and local crop names.\n"
        "3. Prioritize non-chemical Integrated Pest Management (cultural, mechanical, biological) before mentioning chemicals.\n"
        "4. Never invent synthetic pesticide molecules, doses, or pre-harvest intervals (PHI). Strictly adhere to CIBRC and OUAT recommendations.\n"
        "5. Keep the advice actionable, direct, and farmer-friendly.\n"
        "6. Answer the farmer's specific query directly (e.g., weather questions, general questions, crop health) while using any active crop pest as helpful context.\n"
        "\n"
        f"Farmer District: {district}\n"
        f"{pest_desc}\n"
        f"Farmer Query: {query}\n"
        "\n"
        "Respond ONLY with a valid JSON object matching this exact schema:\n"
        "{\n"
        '  "reply_or": "Comprehensive, natural Odia advice in Odia script",\n'
        '  "reply_en": "Clear English summary of the agricultural guidance",\n'
        '  "suggested_action_pills_or": ["ସୁପାରିଶ ୧", "ସୁପାରିଶ ୨", "ସୁପାରିଶ ୩"],\n'
        '  "suggested_action_pills_en": ["Action recommendation 1", "Action 2", "Action 3"]\n'
        "}"
    )

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [{"text": system_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.15,
            "response_mime_type": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=14.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                if parsed.get("reply_or") and parsed.get("reply_en"):
                    return parsed
            else:
                logger.warning("Gemini Assistant call returned HTTP %s: %s", resp.status_code, resp.text[:120])
    except Exception as exc:
        logger.warning("Gemini Assistant generation failed or timed out: %s.", exc)

    return None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Odia & English AI Agricultural Chat Assistant.
    1. Intent handling for greetings and small talk (returns friendly greeting + 3 suggested questions).
    2. Canned answers ONLY for the 3 suggestion chips.
    3. Live Gemini model generation with scanned pest context for any free-form question.
    """
    pest = get_pest_knowledge(request.pest_context) if request.pest_context else None
    
    default_pills_en = [
        "Why did this pest attack my paddy?",
        "How can I control it without chemicals?",
        "What is the correct chemical dosage?"
    ]
    default_pills_or = [
        "ମୋ ଧାନ ଗଛରେ ଏହି ପୋକ କାହିଁକି ଲାଗିଛି?",
        "ଔଷଧ ନ ପକାଇ କଣ କରିପାରିବି?",
        "ଏହି ପୋକ କିପରି ଦୂର କରିବି?"
    ]

    # 1. Greetings and small talk intent handling
    is_greeting, intent_type = check_greeting_or_smalltalk(request.query)
    if is_greeting:
        if intent_type == "greeting":
            if pest:
                reply_en = f"Namaste! How can I help you with your {pest['common_name_en']} problem?"
                reply_or = f"ନମସ୍କାର! ଆପଣଙ୍କ {pest['common_name_or']} ସମସ୍ୟାରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?"
            else:
                reply_en = "Namaste! How can I help you with your crop today?"
                reply_or = "ନମସ୍କାର! ଆଜି ଆପଣଙ୍କ ଫସଲ ସମ୍ପର୍କରେ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?"
        else:  # gratitude / thanks
            if pest:
                reply_en = f"You're welcome! Let me know if you need more help with {pest['common_name_en']}."
                reply_or = f"ସ୍ୱାଗତମ୍! {pest['common_name_or']} ସମ୍ପର୍କରେ ଆଉ କିଛି ସହାୟତା ଆବଶ୍ୟକ ହେଲେ ପଚାରନ୍ତୁ।"
            else:
                reply_en = "You're welcome! Feel free to ask if you have more questions about your crops."
                reply_or = "ସ୍ୱାଗତମ୍! ଆପଣଙ୍କ ଫସଲ ସମ୍ପର୍କରେ ଆଉ କିଛି ପ୍ରଶ୍ନ ଥିଲେ ପଚାରନ୍ତୁ।"

        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=reply_en,
            reply_or=reply_or,
            pest_context=request.pest_context,
            suggested_action_pills_en=default_pills_en,
            suggested_action_pills_or=default_pills_or
        )

    # 2. Canned answers ONLY for the three suggestion chips
    chip_type = is_suggestion_chip_query(request.query)
    if chip_type == "chip_why":
        if pest:
            reply_or = f"{pest['common_name_or']} କ୍ଷେତରେ ଲାଗିବାର ମୁଖ୍ୟ କାରଣ: {pest['conditions_favoring_or'][0]} ଏବଂ କ୍ଷେତରେ ଅତ୍ୟଧିକ ୟୁରିଆ ସାର ଓ ଲଗାତାର ପାଣି ଜମି ରହିବା।"
            reply_en = f"The primary outbreak driver for {pest['common_name_en']} is: {pest['conditions_favoring_en'][0]} along with narrow planting density and excessive urea."
        else:
            reply_or = "ଧାନ ଫସଲରେ ପୋକ ଲାଗିବାର ପ୍ରଧାନ କାରଣ ହେଉଛି ଅତ୍ୟଧିକ ଆର୍ଦ୍ରତା, ମେଘୁଆ ପାଗ, ଘଞ୍ଚ ରୋପଣ ଏବଂ ମାତ୍ରାଧିକ ୟୁରିଆ (ଯବକ୍ଷାରଜାନ) ସାରର ଅଣ-ନିୟନ୍ତ୍ରିତ ବ୍ୟବହାର।"
            reply_en = "Pest outbreaks in rice are primarily driven by sustained humidity above 80%, cloudy weather, close spacing, and unbalanced nitrogen fertilization."

        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=reply_en,
            reply_or=reply_or,
            pest_context=request.pest_context,
            suggested_action_pills_en=default_pills_en,
            suggested_action_pills_or=default_pills_or
        )

    elif chip_type == "chip_non_chemical":
        if pest and pest.get("immediate_next_steps_or"):
            reply_or = f"ବିନା ରାସାୟନିକ ଔଷଧରେ: ୧) {pest['immediate_next_steps_or'][0]} ୨) {pest['immediate_next_steps_or'][1]} ୩) ନିମ୍ବ ତେଲ (୧୫୦୦ ପିପିଏମ୍) ଲିଟର ପ୍ରତି ୪ ମିଲି ସିଞ୍ଚନ କରନ୍ତୁ।"
            reply_en = f"Without synthetic chemicals: 1) {pest['immediate_next_steps_en'][0]} 2) {pest['immediate_next_steps_en'][1]} 3) Spray botanical Neem oil (1500 ppm) @ 3-5 ml/L."
        else:
            reply_or = "ବିନା ଔଷଧରେ: କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ (AWD), ୨ ମିଟରରେ ୩୦ ସେମି ବାଟ ଛାଡ଼ନ୍ତୁ, ଫେରୋମୋନ୍ ଫାନ୍ଦ ଲଗାନ୍ତୁ ଏବଂ ବନ୍ଧୁ ବୁଢ଼ିଆଣୀଙ୍କୁ ସୁରକ୍ଷା ଦିଅନ୍ତୁ।"
            reply_en = "Non-chemical IPM methods: Practice Alternate Wetting and Drying (AWD), create 30cm alleyways every 2m, install pheromone traps, and conserve predatory spiders."

        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=reply_en,
            reply_or=reply_or,
            pest_context=request.pest_context,
            suggested_action_pills_en=default_pills_en,
            suggested_action_pills_or=default_pills_or
        )

    elif chip_type == "chip_dosage":
        chems = pest.get("chemical_control") if pest else None
        chem = chems[0] if isinstance(chems, list) and len(chems) > 0 else (chems if isinstance(chems, dict) else None)
        if pest and chem:
            mol_en = chem.get("active_ingredient") or chem.get("molecule_en", "")
            mol_or = chem.get("molecule_or") or mol_en
            trade = chem.get("trade_names")
            brand = ", ".join(trade) if isinstance(trade, list) else (chem.get("popular_brand") or "")
            brand_str_en = f" ({brand})" if brand else ""
            brand_str_or = f" (ବ୍ୟାପାରିକ ନାମ: {brand})" if brand else ""
            dose_en = chem.get("dosage_per_acre") or chem.get("dosage_per_acre_en", "as recommended on product label")
            dose_or = chem.get("dosage_per_acre_or") or dose_en
            reply_or = f"କେନ୍ଦ୍ରୀୟ କୀଟନାଶକ ବୋର୍ଡ଼ (CIBRC) ଅନୁମୋଦିତ ସୁପାରିଶ: {mol_or}{brand_str_or}। ଏହାର ନିର୍ଦ୍ଦିଷ୍ଟ ମାତ୍ରା ଏକର ପ୍ରତି {dose_or}। ସିଞ୍ଚନ ବେଳେ ମାସ୍କ ଓ ହାତମୋଜା ନିଶ୍ଚୟ ପିନ୍ଧନ୍ତୁ।"
            reply_en = f"CIBRC approved prescription for {pest.get('common_name_en', 'pest')}: {mol_en}{brand_str_en}. Apply exactly {dose_en} with proper PPE mask and gloves."
        else:
            reply_or = "କୌଣସି ବି କୀଟନାଶକ ପ୍ରୟୋଗ କରିବା ପୂର୍ବରୁ ଆର୍ଥିକ କ୍ଷତି ସୀମା (ETL) ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ କୃଷି ବିଶେଷଜ୍ଞ କିମ୍ବା ବ୍ଲକ୍ କୃଷି ଅଧିକାରୀଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।"
            reply_en = "Before applying any chemical pesticide, always verify Economic Threshold Levels (ETL) and consult your local Assistant Agriculture Officer (AAO)."

        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=reply_en,
            reply_or=reply_or,
            pest_context=request.pest_context,
            suggested_action_pills_en=default_pills_en,
            suggested_action_pills_or=default_pills_or
        )

    elif chip_type == "chip_spider":
        reply_or = "ବୁଢ଼ିଆଣୀ (ଲାଇକୋସା ବୁଢ଼ିଆଣୀ) ଚାଷୀଙ୍କର ପରମ ବନ୍ଧୁ! ଗୋଟିଏ ବୁଢ଼ିଆଣୀ ଦିନକୁ ୧୫-୨୫ଟି ଗୁଣ୍ଡି ପୋକ ଖାଇ ଫସଲ ରକ୍ଷା କରେ। କ୍ଷେତରେ ବୁଢ଼ିଆଣୀ ଥିଲେ କୌଣସି ବିଷାକ୍ତ କୀଟନାଶକ ସିଞ୍ଚନ କରନ୍ତୁ ନାହିଁ।"
        reply_en = "The Wolf Spider (Lycosa pseudoannulata) is a beneficial natural enemy! A single spider preys on 15 to 25 planthoppers per day. Never spray broad-spectrum insecticides when spiders are active."
        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=reply_en,
            reply_or=reply_or,
            pest_context=request.pest_context,
            suggested_action_pills_en=default_pills_en,
            suggested_action_pills_or=default_pills_or
        )

    # 3. For any free-form question: Send to Gemini model with scanned pest as context
    gemini_result = await generate_gemini_chat_response(
        query=request.query,
        pest_info=pest,
        district=request.farmer_district
    )

    if gemini_result:
        return ChatResponse(
            id=f"chat-{uuid.uuid4().hex[:10]}",
            reply_en=gemini_result.get("reply_en", ""),
            reply_or=gemini_result.get("reply_or", ""),
            pest_context=request.pest_context,
            suggested_action_pills_en=gemini_result.get("suggested_action_pills_en", default_pills_en),
            suggested_action_pills_or=gemini_result.get("suggested_action_pills_or", default_pills_or)
        )

    # Graceful message if Gemini is temporarily unreachable - do not dump static pest treatment fallback for free-form queries!
    if pest:
        reply_en = f"Regarding your query about '{request.query}' in the context of {pest['common_name_en']}: Live AI response is temporarily unavailable. Please verify your connection or try again shortly."
        reply_or = f"ଆପଣଙ୍କ {pest['common_name_or']} ସମ୍ପର୍କିତ ପ୍ରଶ୍ନ '{request.query}' ପାଇଁ ଲାଇଭ୍ AI ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି କିଛି ସମୟ ପରେ ପୁଣି ପଚାରନ୍ତୁ।"
    else:
        reply_en = f"I received your question '{request.query}', but the AI model is temporarily unreachable. Please check your network connection and try again."
        reply_or = f"ଆପଣଙ୍କ ପ୍ରଶ୍ନ '{request.query}' ପାଇଁ ଲାଇଭ୍ AI ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ଇଣ୍ଟରନେଟ୍ ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।"

    return ChatResponse(
        id=f"chat-{uuid.uuid4().hex[:10]}",
        reply_en=reply_en,
        reply_or=reply_or,
        pest_context=request.pest_context,
        suggested_action_pills_en=default_pills_en,
        suggested_action_pills_or=default_pills_or
    )
