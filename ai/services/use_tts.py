import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
import os

model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")

def use_tts_model(sentence, language):

    wav = model.generate(
        text= sentence,
        language_id= language,
        audio_prompt_path="../uploads/preprocessed.wav",
        exaggeration=0.5
    )

    ta.save("../output/output.wav", wav, model.sr)
    os.remove("../uploads/preprocessed.wav")