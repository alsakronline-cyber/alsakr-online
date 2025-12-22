import logging

logger = logging.getLogger(__name__)

class VoiceProcessor:
    def __init__(self):
        self.model = None

    def load_model(self):
        if self.model:
            return

        import whisper
        logger.info("Loading OpenAI Whisper Model...")
        # Use 'base' for balance of speed/accuracy
        self.model = whisper.load_model("base")

    async def transcribe_audio(self, audio_path: str, language: str = None):
        self.load_model()
        
        # Sync run in executor to avoid blocking asyncio loop
        import asyncio
        loop = asyncio.get_event_loop()
        
        # basic transcribe
        func = lambda: self.model.transcribe(audio_path, language=language) if language else self.model.transcribe(audio_path)
        result = await loop.run_in_executor(None, func)
        
        return {
            "text": result.get("text", "").strip(),
            "language": result.get("language", "en"),
            "confidence": 0.0 # Standard whisper doesn't provide easy confidence score per full text
        }

