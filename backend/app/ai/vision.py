import logging
# lazy imports in methods to avoid startup overhead on small VPS
logger = logging.getLogger(__name__)

class VisionAgent:
    def __init__(self):
        self.model = None
        self.processor = None

    def load_model(self):
        if not self.model:
            from transformers import CLIPProcessor, CLIPModel
            logger.info("Loading CLIP Model...")
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    async def generate_image_embedding(self, image_path: str):
        self.load_model()
        from PIL import Image
        image = Image.open(image_path)
        inputs = self.processor(images=image, return_tensors="pt")
        outputs = self.model.get_image_features(**inputs)
        return outputs.detach().numpy().flatten().tolist()

    async def extract_text(self, image_path: str):
        import easyocr
        reader = easyocr.Reader(['en', 'ar'])
        result = reader.readtext(image_path, detail=0)
        return " ".join(result)
