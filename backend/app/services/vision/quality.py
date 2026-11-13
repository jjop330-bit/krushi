import io
from PIL import Image, ImageStat
from app.models.pest import ImageQualityAssessment

def validate_image_bytes(image_bytes: bytes) -> ImageQualityAssessment:
    """
    Evaluates image quality on server side:
    - Verifies image can be opened and parsed
    - Measures lighting / average luminance
    - Measures sharpness using RMS contrast of Laplacian / pixel variance
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        
        # Resize thumbnail for fast metric calculation
        thumb = image.resize((160, 120))
        stat = ImageStat.Stat(thumb)
        
        # Luminance based on standard Rec. 601 coefficients
        r, g, b = stat.mean[:3]
        avg_brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        lighting_score = min(100, max(10, int((avg_brightness / 255.0) * 100)))
        
        # Contrast variance for sharpness approximation
        stddev = stat.stddev
        avg_contrast = (stddev[0] + stddev[1] + stddev[2]) / 3.0
        sharpness_score = min(100, max(15, int((avg_contrast / 45.0) * 100)))
        
        # Uncertainty checks
        if sharpness_score < 25:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="Warning: The photograph appears blurry or out of focus. Fine entomological features cannot be verified with statistical confidence.",
                warning_message_or="ସତର୍କତା: ଫଟୋଟି ଝାପ୍‌ସା କିମ୍ବା ଅସ୍ପଷ୍ଟ ଦେଖାଯାଉଛି। ଏହାଦ୍ୱାରା ପୋକର ସଠିକ ଚିହ୍ନଟରେ ଅନିଶ୍ଚିତତା ରହିପାରେ।"
            )
        elif lighting_score < 20:
            return ImageQualityAssessment(
                is_clear=False,
                lighting_score=lighting_score,
                sharpness_score=sharpness_score,
                warning_message_en="Warning: The photograph is severely underexposed (too dark). Pest color patterns cannot be distinguished.",
                warning_message_or="ସତର୍କତା: ଫଟୋଟି ବହୁତ ଅନ୍ଧକାରରେ ଉଠାଯାଇଛି। ଦିନ ଆଲୋକରେ ପୁଣି ଫଟୋ ଉଠାନ୍ତୁ।"
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
