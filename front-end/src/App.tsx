import { useState, useRef, useEffect } from "react";
import logo from "./assets/logo.svg";
import { getResult, getStatus, uploadFile } from "./api/client";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "عربية" },
];

export default function App() {
  const [lang, setLang] = useState("en");
  const [sentence, setSentence] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [job_id, setJob_id] = useState("")
  const uploadedFile = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"upload" | "record">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canSubmit = sentence.trim().length > 0 && uploadedFile.current && status !== "submitting";

  useEffect(() => {
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
  };
}, [recordedUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    uploadedFile.current = file;
    setFileName(file?.name ?? null);
    
  };

  const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "recording.webm", { type: "audio/webm" });

      uploadedFile.current = file;
      setFileName(file.name);
      setRecordedUrl(URL.createObjectURL(blob));

      stream.getTracks().forEach((track) => track.stop()); // release the mic
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setRecordingSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
  } catch (err) {
    console.error("Microphone access denied or unavailable:", err);
  }
};

const stopRecording = () => {
  mediaRecorderRef.current?.stop();
  setIsRecording(false);
  if (timerRef.current) clearInterval(timerRef.current);
};

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const fetchStatus = (jobId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const check = async () => {
      const response = await getStatus(jobId);
      if (!response) {
        reject(new Error("Failed to fetch status"));
        return;
      }
      if (response.data.status === "done") {
        resolve(response);
      } else if (response.data.status === "error") {
        reject(new Error(response.data.detail));
      } else {
        setTimeout(check, 3000);
      }
    };
    check();
  });
};

const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!canSubmit || !uploadedFile.current) return;

  setStatus("submitting");
  setErrorMessage(null);

  const uploadResponse = await uploadFile(uploadedFile.current, sentence, lang);
  if (!uploadResponse) {
    setStatus("error");
    setErrorMessage("Upload failed — check the console.");
    return;
  }

  const jobId = uploadResponse.data.job_id;
  setJob_id(jobId);

  try {
    await fetchStatus(jobId);
    const blob = await getResult(jobId);
    console.log("blob:", blob, "is Blob:", blob instanceof Blob);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("done");
    } else {
      setStatus("error");
      setErrorMessage("No audio was returned.");
    }
  } catch (err) {
    console.error("Generation failed:", err);
    setStatus("error");
    setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
  }
};



  return (
    <main className="min-h-screen w-full bg-[#FAF7F2] flex justify-center">
      <div className="max-w-3xl w-full flex flex-col gap-16 px-6 py-8">
        {/* Nav */}
        <nav className="flex justify-between items-center">
          <div className="flex gap-2.5 items-center">
            <img src={logo} alt="Imitate logo" height={36} width={36} />
            <span className="text-xl font-semibold tracking-tight text-[#1C1917]">
              IMITATE
            </span>
          </div>
          <span className="text-sm text-[#78716C] italic font-bold">
            ai powered by anas
          </span>
        </nav>

        {/* Hero */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-[#A8A29E]">
            {/* signature: simple waveform mark, echoes what the tool does */}
            <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
              <path d="M1 8h2M6 4v8M10 1v14M14 6v4M18 3v10M22 5v6M26 8h1"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#1C1917] tracking-tight">
            Clone your voice
          </h1>
          <p className="text-[#78716C] max-w-md">
            Upload a short sample, write what they should say, and get the audio back in their voice.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* Language */}
          <div className="flex flex-col gap-2">
            <label htmlFor="language" className="text-sm font-medium text-[#1C1917]">
              Speaker's language
            </label>
            <select
              id="language"
              name="language"
              className="bg-white w-fit px-4 py-2.5 rounded-xl border border-[#E7E2DA] text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]/30 transition"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Sentence */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="sentence" className="text-sm font-medium text-[#1C1917]">
                What should they say?
              </label>
              <span className="text-xs text-[#A8A29E]">{sentence.length} characters</span>
            </div>
            <textarea
              id="sentence"
              name="sentence"
              className="bg-white text-[#1C1917] placeholder-[#A8A29E] rounded-xl p-4 resize-none border border-[#E7E2DA] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]/30 transition"
              placeholder="The weather here is kinda hot..."
              rows={4}
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
            />
          </div>

          {/* File upload */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-[#1C1917]">
                Voice sample
              </label>
              <div className="flex text-xs bg-[#F5F0EA] rounded-full p-0.5">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 rounded-full transition ${
                    inputMode === "upload" ? "bg-white text-[#1C1917] shadow-sm" : "text-[#78716C]"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("record")}
                  className={`px-3 py-1 rounded-full transition ${
                    inputMode === "record" ? "bg-white text-[#1C1917] shadow-sm" : "text-[#78716C]"
                  }`}
                >
                  Record
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex items-center gap-4 bg-white rounded-xl border border-dashed border-[#D6D0C4] hover:border-[#1C1917]/30 px-5 py-5 text-left transition"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#F5F0EA] flex items-center justify-center text-[#78716C] group-hover:text-[#1C1917] transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v12m0-12l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-[#1C1917] font-medium">
                      {fileName ?? "Choose an audio file"}
                    </span>
                    <span className="text-xs text-[#A8A29E]">
                      {fileName ? "Click to replace" : "a clean audio clip with a single speaker works best"}
                    </span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="voice"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <div className="flex items-center gap-4 bg-white rounded-xl border border-[#E7E2DA] px-5 py-5">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${
                    isRecording ? "bg-red-500 text-white" : "bg-[#F5F0EA] text-[#78716C] hover:text-[#1C1917]"
                  }`}
                >
                  {isRecording ? (
                    <span className="w-3 h-3 bg-white rounded-sm" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  )}
                </button>

                <div className="flex flex-col flex-1">
                  {isRecording ? (
                    <span className="text-sm text-[#1C1917] font-medium">
                      Recording... {formatTime(recordingSeconds)}
                    </span>
                  ) : recordedUrl ? (
                    <>
                      <span className="text-sm text-[#1C1917] font-medium">Recording captured</span>
                      <audio controls src={recordedUrl} className="h-8 mt-1" />
                    </>
                  ) : (
                    <span className="text-sm text-[#A8A29E]">Tap to start recording</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="self-start px-6 py-3 rounded-xl bg-[#1C1917] text-[#FAF7F2] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1C1917]/90 transition flex items-center gap-2"
          >
            {status === "submitting" ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Generating...
              </>
            ) : (
              "Generate voice"
            )}
          </button>
        </form>
          
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

        {audioUrl && (
          <div className="flex flex-col gap-3">
            <audio controls src={audioUrl} className="w-full" />
            <a
              href={audioUrl}
              download="cloned-voice.wav"
              className="text-sm text-[#1C1917] underline underline-offset-2"
            >
              Download audio
            </a>
          </div>
        )}
      </div>
    </main>
  );
}