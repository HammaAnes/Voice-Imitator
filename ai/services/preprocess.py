import librosa
import soundfile as sf
from pydub import AudioSegment

sound = AudioSegment.from_mp3("salim.mp3")

sound.export("salim.wav", format="wav")

y, sr = librosa.load("salim.wav", mono=False)

mono = librosa.to_mono(y)

sf.write("preprocessed.wav", mono, sr)