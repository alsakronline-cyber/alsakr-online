import logging

logger = logging.getLogger(__name__)

class VoiceProcessor:
    def __init__(self):
        self.model = None

    def load_model(self):
        if self.model:
            return

        from faster_whisper import WhisperModel
        logger.info("Loading Whisper Model...")
        # Use 'tiny' or 'base' for VPS performance
        self.model = WhisperModel("base", device="cpu", compute_type="int8")

    async def transcribe_audio(self, audio_path: str, language: str = None):
        self.load_model()
        if not self.model:
            return {
                "text": "Voice transcription unavailable (Dependency missing).",
                "language": "en",
                "confidence": 0.0
            }

        segments, info = self.model.transcribe(audio_path, language=language)
        text = " ".join([segment.text for segment in segments])
        
        return {
            "text": text,
            "language": info.language,
            "confidence": info.language_probability
        }
