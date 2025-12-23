from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

class EmbeddingService:
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def load_model(self):
        if not self.model:
            print("Loading AI Models (CLIP)...")
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device)
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

    def generate_text_embedding(self, text: str):
        self.load_model()
        inputs = self.processor(text=[text], return_tensors="pt", padding=True, truncation=True, max_length=77).to(self.device)
        with torch.no_grad():
            outputs = self.model.get_text_features(**inputs)
        return outputs.cpu().numpy().flatten().tolist()

    def generate_image_embedding(self, image_path: str):
        self.load_model()
        image = Image.open(image_path)
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model.get_image_features(**inputs)
        return outputs.cpu().numpy().flatten().tolist()
