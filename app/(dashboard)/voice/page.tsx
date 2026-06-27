"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2, Loader2, Copy, Play, StopCircle, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TTS_VOICES = [
  { id: "alloy", name: "Alloy", desc: "Netral & profesional" },
  { id: "echo", name: "Echo", desc: "Maskulin & dalam" },
  { id: "fable", name: "Fable", desc: "Ekspresif & hangat" },
  { id: "onyx", name: "Onyx", desc: "Kuat & tegas" },
  { id: "nova", name: "Nova", desc: "Feminin & muda" },
  { id: "shimmer", name: "Shimmer", desc: "Lembut & santai" },
];

export default function VoicePage() {
  const [activeTab, setActiveTab] = useState<"stt" | "tts">("stt");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [ttsText, setTtsText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      toast.error("Tidak dapat mengakses mikrofon. Pastikan izin diberikan.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/voice/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setTranscript(data.text || "");
      } else {
        toast.error(data.error || "Gagal transkripsi");
      }
    } catch {
      toast.error("Gagal mentranskripsi audio");
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async () => {
    if (!ttsText.trim()) {
      toast.error("Masukkan teks untuk dikonversi");
      return;
    }
    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText, voice: selectedVoice }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e: any) {
      toast.error(e.message || "Gagal menghasilkan suara");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <Mic className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Voice AI</h1>
          <p className="text-sm text-muted-foreground">Speech-to-Text dan Text-to-Speech menggunakan AI</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "stt" as const, label: "Speech → Text", icon: Mic },
          { id: "tts" as const, label: "Text → Speech", icon: Volume2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === id
                ? "bg-nexus-500/15 text-nexus-400 border border-nexus-500/30"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* STT Tab */}
      {activeTab === "stt" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-6">
            {/* Record button */}
            <div className="relative">
              {recording && (
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              )}
              <button
                onClick={recording ? stopRecording : startRecording}
                className={cn(
                  "relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
                  recording
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                    : "bg-nexus-500 hover:bg-nexus-600 shadow-nexus-500/30"
                )}
              >
                {recording ? (
                  <StopCircle className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </button>
            </div>

            <div className="text-center">
              {recording ? (
                <p className="text-red-400 font-medium text-sm animate-pulse">Merekam... Klik untuk berhenti</p>
              ) : loading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mentranskripsikan...</span>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Klik tombol mikrofon untuk mulai merekam</p>
              )}
            </div>
          </div>

          {/* Transcript result */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <Label>Hasil Transkripsi</Label>
              {transcript && (
                <button
                  onClick={() => { navigator.clipboard.writeText(transcript); toast.success("Disalin!"); }}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Hasil transkripsi akan muncul di sini..."
              rows={6}
              className="resize-none"
            />
          </div>
        </motion.div>
      )}

      {/* TTS Tab */}
      {activeTab === "tts" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Teks untuk Dikonversi</Label>
            <Textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Masukkan teks yang ingin dikonversi menjadi suara..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">{ttsText.length} karakter</p>
          </div>

          {/* Voice selection */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Label>Pilih Suara</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TTS_VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    selectedVoice === voice.id
                      ? "border-nexus-500 bg-nexus-500/10"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <p className="text-sm font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{voice.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generateSpeech} disabled={loading || !ttsText.trim()} className="w-full gap-2 h-11">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Menghasilkan Suara...</>
            ) : (
              <><Volume2 className="w-4 h-4" />Buat Suara</>
            )}
          </Button>

          {audioUrl && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <Label className="mb-3 block">Audio Hasil</Label>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
