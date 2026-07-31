import librosa
import soundfile as sf
import numpy as np
import noisereduce as nr
from pydub import AudioSegment
import os

def preprocess_audio(filename):
    input_path = f"../uploads/{filename}"
    converted_path = "../uploads/version1.wav"
    output_path = "../uploads/preprocessed.wav"

    sound = AudioSegment.from_file(input_path)
    sound.export(converted_path, format="wav")

    y, sr = librosa.load(converted_path, mono=False, sr=None)
    mono = librosa.to_mono(y) if y.ndim > 1 else y

    # Trim only clearly-silent edges, not general pauses
    trimmed, _ = librosa.effects.trim(mono, top_db=40)  # was 30 — less aggressive

    # Light denoise: prop_decrease controls how much noise is removed (0-1)
    # 0.5-0.6 is much gentler than the default full-strength reduction
    denoised = nr.reduce_noise(
        y=trimmed, sr=sr,
        stationary=True,
        prop_decrease=0.6,
    )

    # Normalize to a safer headroom, not right up against 0dB
    peak = np.max(np.abs(denoised))
    if peak > 0:
        denoised = denoised / peak * 0.85  # more headroom than 0.95

    os.remove(input_path)
    os.remove(converted_path)
    sf.write(output_path, denoised, sr)