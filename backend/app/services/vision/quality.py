import io
from PIL import Image, ImageStat, ImageFilter
from app.models.pest import ImageQualityAssessment

class ImageValidationResult:
    def __init__(
        self,
        assessment: ImageQualityAssessment,
        is_corrupted: bool = False,
        is_blank: bool = False,
        image_format: str = "JPEG",
        dimensions: tuple = (0, 0)
    ):
        self.assessment = assessment
        self.is_corrupted = is_corrupted
        self.is_blank = is_blank
        self.image_format = image_format
        self.dimensions = dimensions

def validate_image_bytes(image_bytes: bytes) -> ImageQualityAssessment:
    """
    Evaluates image quality on server side:
    - Verifies image can be opened and parsed
    - Measures lighting / average luminance
    - Measures sharpness using RMS contrast of pixel variance
    - Detects empty / solid-color images, underexposed, or overexposed captures
    """
    if not image_bytes or len(image_bytes) < 16:
        return ImageQualityAssessment(
            is_clear=False,
            lighting_score=0,
            sharpness_score=0,
            warning_message_en="Image file is empty or corrupted.",
            warning_message_or="ଫଟୋ ଫାଇଲଟି ଖାଲି ଅଛି କିମ୍ବା ତ୍ରୁଟିପୂର୍ଣ୍ଣ ଅଟେ।"
        )

    try:
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size
        
        if width < 32 or height < 32:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=0,
                sharpness_score=0,
                warning_message_en="Image dimensions are too small (minimum 32x32 required for insect recognition).",
                warning_message_or="ଫଟୋର ଆକାର ବହୁତ ଛୋଟ ଅଟେ। ଅନ୍ତତଃ ସ୍ପଷ୍ଟ କ୍ୟାମେରା ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।"
            )

        image = image.convert("RGB")
        
        # Resize thumbnail for fast metric calculation
        thumb = image.resize((160, 120))
        stat = ImageStat.Stat(thumb)
        
        # Luminance based on standard Rec. 601 coefficients
        r, g, b = stat.mean[:3]
        avg_brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        lighting_score = min(100, max(1, int((avg_brightness / 255.0) * 100)))
        
        # Contrast variance for dynamic range
        stddev = stat.stddev
        avg_contrast = (stddev[0] + stddev[1] + stddev[2]) / 3.0

        # True high-frequency edge content via FIND_EDGES on grayscale
        gray = image.convert("L")
        edge_mean = ImageStat.Stat(gray.filter(ImageFilter.FIND_EDGES)).mean[0]
        # edge_mean < 2.2 indicates heavy blur / lack of entomological edge features
        sharpness_score = min(100, max(1, int((edge_mean / 6.0) * 100)))
        
        # Check for blank / solid color images (variance almost zero)
        if avg_contrast < 3.0:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="The uploaded photograph appears completely uniform or empty. No agricultural subject detected.",
                warning_message_or="ଫଟୋଟି ସମ୍ପୂର୍ଣ୍ଣ ଖାଲି କିମ୍ବା ଏକା ରଙ୍ଗର ଦେଖାଯାଉଛି। କୌଣସି ଫସଲ କିମ୍ବା ପୋକ ଚିହ୍ନଟ ହେଲାନାହିଁ।"
            )

        # Blur check: edge_mean below 2.2 produces sharpness_score < 36
        if sharpness_score < 36 or edge_mean < 2.2:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="Warning: The photograph appears blurry or out of focus. Fine entomological features cannot be verified.",
                warning_message_or="ସତର୍କତା: ଫଟୋଟି ଝାପ୍‌ସା କିମ୍ବା ଅସ୍ପଷ୍ଟ ଦେଖାଯାଉଛି। ପୋକର ସୂକ୍ଷ୍ମ ଚିହ୍ନଟ ପାଇଁ ସ୍ଥିର ଭାବେ ଫଟୋ ନିଅନ୍ତୁ।"
            )
            
        # Severe underexposure (too dark)
        if lighting_score < 15:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="Warning: The photograph is severely underexposed (too dark). Pest color patterns cannot be distinguished.",
                warning_message_or="ସତର୍କତା: ଫଟୋଟି ବହୁତ ଅନ୍ଧକାରରେ ଉଠାଯାଇଛି। ଦିନ ଆଲୋକରେ ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।"
            )

        # Severe overexposure (washed out white)
        if avg_brightness > 248 and avg_contrast < 10.0:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="Warning: The photograph is washed out by excessive light or glare.",
                warning_message_or="ସତର୍କତା: ଫଟୋରେ ଅତ୍ୟଧିକ ଆଲୋକ ଯୋଗୁଁ ବିବରଣୀ ସ୍ପଷ୍ଟ ନାହିଁ।"
            )
        
        return ImageQualityAssessment(
            is_clear=True,
            lighting_score=lighting_score,
            sharpness_score=sharpness_score
        )
    except Exception as e:
        return ImageQualityAssessment(
            is_clear=False,
            lighting_score=0,
            sharpness_score=0,
            warning_message_en=f"Invalid or corrupted image format: {str(e)}",
            warning_message_or="ଅପଲୋଡ୍ କରାଯାଇଥିବା ଫଟୋ ଫର୍ମାଟ୍ ତ୍ରୁଟିପୂର୍ଣ୍ଣ ଅଟେ।"
        )
