import torch
from TTS.api import TTS
# --- Fix 1: allow XTTS config classes to unpickle under PyTorch 2.6+ weights_only default ---
from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.models.xtts import XttsAudioConfig, XttsArgs
from TTS.config.shared_configs import BaseDatasetConfig
import os

torch.serialization.add_safe_globals([
    XttsConfig,
    XttsAudioConfig,
    XttsArgs,
    BaseDatasetConfig,
])

# --- Fix 2: bypass torchaudio/torchcodec for loading the reference wav ---
import soundfile as sf
import torchaudio.functional as AF
import TTS.tts.models.xtts as xtts_module

def load_audio_soundfile(audiopath, sampling_rate):
    audio, sr = sf.read(audiopath, dtype="float32")
    audio = torch.from_numpy(audio)
    if audio.ndim == 1:
        audio = audio.unsqueeze(0)
    else:
        audio = audio.T
    if sr != sampling_rate:
        audio = AF.resample(audio, sr, sampling_rate)
    return audio

# "Frère, déjà Yamal cette année il est meilleur joueur de la Liga, en plus d'être le meilleur passeur. Il fait une très belle coupe du monde, surtout à son âge. Donc s'il gagne le Ballon d'or, ça reste mérité, genre c'est pas du vol."

xtts_module.load_audio = load_audio_soundfile
device = "cpu"
model = TTS('tts_models/multilingual/multi-dataset/xtts_v2').to(device)

def use_tts_model(sentence, language):

    model.tts_to_file(
        text= sentence,
        speaker_wav="../uploads/preprocessed.wav",
        language=language,
        file_path="../output/output.wav",
        speed=0.75,
        
    )
    os.remove("../uploads/preprocessed.wav")