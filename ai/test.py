import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

model = ChatterboxMultilingualTTS.from_pretrained(device="cpu")

wav = model.generate(
    text="Mais mon gars, j'ai jamais dis que pedri étais mieux que Bellingham, c'est complétement faux.",
    language_id="fr",
    audio_prompt_path="../uploads/preprocessed.wav",
    exaggeration=0.75
)

ta.save("../output/output.wav")