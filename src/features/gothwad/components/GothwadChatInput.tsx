import React, { useRef, useEffect, useState } from "react";
import { Send, Plus, ArrowUp, Mic, MicOff } from "lucide-react";

interface GothwadChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  generating: boolean;
  accentColor: string;
  activeModelName: string;
  temperature: number;
}

export default function GothwadChatInput({
  inputText,
  setInputText,
  onSubmit,
  generating,
  accentColor,
  activeModelName
}: GothwadChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea to fit content nicely
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 180); // Max height of 180px
    textarea.style.height = `${newHeight}px`;
  }, [inputText]);

  // Handle keydown for submit on Enter (but new line on Shift + Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !generating) {
        // Trigger form submit
        const form = textareaRef.current?.form;
        if (form) {
          const event = new Event("submit", { cancelable: true, bubbles: true });
          form.dispatchEvent(event);
        }
      }
    }
  };

  // Toggle Speech Recognition dictation
  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in your browser. Please try Chrome, Safari, or Edge.");
        return;
      }
      
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(inputText ? `${inputText} ${transcript}` : transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="pt-0.5 pb-1 px-1 md:px-2 shrink-0 bg-transparent relative z-10 w-full">
      <div className="w-full mx-auto">
        {/* Gemini-like Capsule Container */}
        <form 
          onSubmit={onSubmit} 
          className="relative flex items-end gap-1.5 bg-zinc-900 border border-zinc-800/80 focus-within:border-zinc-700/60 rounded-2xl pl-2 pr-2 py-2 transition-all shadow-xl w-full"
        >
          {/* Plus icon on the left (Gemini attachment style) */}
          <button
            type="button"
            onClick={() => setInputText("")}
            className="p-2 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800/80 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95 mb-0.5 flex items-center justify-center"
            title="Reset text"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gothwad AI 1.0 Tech..."
            disabled={generating}
            className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none px-1 py-2 text-sm placeholder-zinc-550 text-zinc-100 outline-none resize-none no-scrollbar min-h-[22px] max-h-[180px] leading-relaxed disabled:opacity-50"
            style={{ caretColor: accentColor }}
          />

          {/* Action Area: Microphone and Send button */}
          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            {/* Microphone button (visible only when input text is empty) */}
            {!inputText.trim() && (
              <button
                type="button"
                onClick={startListening}
                className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-90 ${
                  isListening
                    ? "bg-rose-950/40 border-rose-800 text-rose-400 animate-pulse"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850"
                }`}
                title={isListening ? "Listening... Click to stop" : "Use microphone / Voice input"}
              >
                {isListening ? (
                  <MicOff className="w-4.5 h-4.5 text-rose-400" />
                ) : (
                  <Mic className="w-4.5 h-4.5" />
                )}
              </button>
            )}

            {/* Circle Send Button */}
            <button
              type="submit"
              disabled={generating || !inputText.trim()}
              className={`p-2 rounded-xl transition-all flex items-center justify-center border ${
                inputText.trim() && !generating
                  ? "cursor-pointer active:scale-90 hover:scale-105 border-zinc-700/80 text-white shadow-md"
                  : "cursor-not-allowed opacity-40 bg-zinc-950 border-zinc-800/80 text-zinc-650"
              }`}
              style={{ 
                backgroundColor: inputText.trim() && !generating ? accentColor : undefined
              }}
              title="Send message"
            >
              <ArrowUp className="w-4.5 h-4.5 font-bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
