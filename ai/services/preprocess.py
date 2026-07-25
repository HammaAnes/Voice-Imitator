import librosa
import soundfile as sf
from pydub import AudioSegment
import os

def preprocess_audio(filename):
    sound = AudioSegment.from_mp3(f"../uploads/{filename}")

    sound.export(f"../uploads/version1.wav", format="wav")

    y, sr = librosa.load(f"../uploads/version1.wav", mono=False, sr=None)

    mono = librosa.to_mono(y)

    os.remove(f"../uploads/{filename}")
    os.remove(f"../uploads/version1.wav")
    sf.write("../uploads/preprocessed.wav", mono, sr)