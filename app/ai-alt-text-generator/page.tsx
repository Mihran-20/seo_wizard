"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";

type AltResults = {
  descriptive: string;
  keywordOptimized: string;
  creative: string;
};

type AnalyticsParams = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  gtag?: (
    command: "event",
    eventName: string,
    params?: AnalyticsParams
  ) => void;
};

export default function AiAltTextGeneratorPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<AltResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const trackEvent = (
    eventName: string,
    params: AnalyticsParams = {}
  ) => {
    if (typeof window === "undefined") return;

    const analyticsWindow = window as AnalyticsWindow;

    if (typeof analyticsWindow.gtag === "function") {
      analyticsWindow.gtag("event", eventName, params);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Please upload an image smaller than 10MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImage(file);
    setPreview(previewUrl);
    setResults(null);

    trackEvent("alt_page_image_upload", {
      file_type: file.type,
      file_size_kb: Math.round(file.size / 1024),
    });
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read image."));
      };
    });
  };

  const generateAltText = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const base64Image = await convertToBase64(image);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate alt text.");
      }

      const data: AltResults = await response.json();

      setResults(data);

      trackEvent("alt_text_generated", {
        page: "ai_alt_text_generator",
      });
    } catch (error) {
      console.error(error);

      trackEvent("alt_text_error", {
        page: "ai_alt_text_generator",
      });

      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);

      trackEvent("alt_text_copy", {
        type,
        page: "ai_alt_text_generator",
      });
    } catch {
      alert("Could not copy the text.");
    }
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
    setResults(null);
  };

  const faqItems = [
    {
      question: "What is image alt text?",
      answer:
        "Alt text is a short description of an image. It helps search engines understand image content and improves accessibility for people using screen readers.",
    },
    {
      question: "How does the AI Alt Text Generator work?",
      answer:
        "Upload an image and the AI analyzes its visible content. It then generates several alt text variations that you can copy and use on your website.",
    },
    {
      question: "Should I include keywords in alt text?",
      answer:
        "Use relevant keywords only when they naturally describe the image. Alt text should remain useful and descriptive instead of being filled with keywords.",
    },
    {
      question: "Is the AI Alt Text Generator free?",
      answer:
        "Yes. SEO Wizard lets you generate image alt text without registration.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-black text-xl bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent"
          >
            ⚡ SEO Wizard
          </Link>

          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            All Tools
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-5">
              100% Free • No Registration Required
            </span>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Free AI Alt Text Generator
            </h1>

            <p className="mt-5 text-slate-400 text-base md:text-lg leading-relaxed">
              Upload an image and generate descriptive, SEO-friendly alt text
              with AI in seconds.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="border border-slate-800 rounded-3xl bg-slate-900/30 p-6 min-h-[420px] flex items-center justify-center">
              {!preview ? (
                <label className="cursor-pointer w-full min-h-[360px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:border-teal-500/50 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-teal-500/10 flex items-center justify-center text-2xl mb-4">
                    🖼️
                  </div>

                  <p className="font-semibold text-slate-200">
                    Click to upload an image
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    PNG, JPG or WebP up to 10MB
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div className="w-full">
                  <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[280px]">
                    <img
                      src={preview}
                      alt="Uploaded image preview"
                      className="max-h-[350px] w-full object-contain p-3"
                    />
                  </div>

                  {image && (
                    <div className="mt-3 text-center text-xs text-slate-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold transition-colors"
                    >
                      Remove
                    </button>

                    <button
                      type="button"
                      onClick={generateAltText}
                      disabled={loading}
                      className="py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {loading ? "Generating..." : "Generate Alt Text"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-slate-800 rounded-3xl bg-slate-900/30 p-6 min-h-[420px]">
              <h2 className="text-xl font-bold mb-6">
                Generated SEO Alt Texts
              </h2>

              {loading ? (
                <div className="h-[320px] flex flex-col items-center justify-center">
                  <div className="w-9 h-9 border-2 border-slate-700 border-t-teal-400 rounded-full animate-spin" />

                  <p className="text-sm text-slate-500 mt-4">
                    AI is analyzing your image...
                  </p>
                </div>
              ) : results ? (
                <div className="space-y-5">
                  <AltResult
                    title="Descriptive Alt"
                    text={results.descriptive}
                    onCopy={() =>
                      copyText(results.descriptive, "descriptive")
                    }
                  />

                  <AltResult
                    title="Keyword-Optimized Alt"
                    text={results.keywordOptimized}
                    onCopy={() =>
                      copyText(
                        results.keywordOptimized,
                        "keyword_optimized"
                      )
                    }
                  />

                  <AltResult
                    title="Creative / Social"
                    text={results.creative}
                    onCopy={() =>
                      copyText(results.creative, "creative")
                    }
                  />
                </div>
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4">✨</div>

                  <p className="text-slate-400 font-medium">
                    Your AI-generated alt text will appear here
                  </p>

                  <p className="text-slate-600 text-sm mt-2">
                    Upload an image to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-900 bg-slate-900/20 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black">
                How Our AI Alt Text Generator Works
              </h2>

              <p className="text-slate-500 mt-3">
                Generate useful image alt text in three simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <InfoCard
                number="01"
                title="Upload an Image"
                text="Choose a JPG, PNG or WebP image from your device."
              />

              <InfoCard
                number="02"
                title="Generate with AI"
                text="AI analyzes the visible image content and generates multiple text variations."
              />

              <InfoCard
                number="03"
                title="Copy Your Alt Text"
                text="Choose the best result and copy it directly into your website."
              />
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black">
              AI Alt Text Examples
            </h2>

            <p className="text-slate-500 mt-3">
              Good alt text describes the important content of an image
              naturally and clearly.
            </p>
          </div>

          <div className="space-y-4">
            <ExampleCard
              image="Product photo"
              weak="image123.jpg"
              better="Black wireless headphones resting on a wooden desk"
            />

            <ExampleCard
              image="Travel photo"
              weak="vacation image"
              better="Mountain lake surrounded by green pine trees under a clear blue sky"
            />

            <ExampleCard
              image="Business image"
              weak="business picture"
              better="Team members discussing a project around a conference table"
            />
          </div>
        </section>

        <section className="border-t border-slate-900 py-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black">
                Frequently Asked Questions
              </h2>

              <p className="text-slate-500 mt-3">
                Learn more about image alt text and SEO.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="w-full p-5 flex items-center justify-between text-left font-semibold hover:bg-slate-900/50 transition-colors"
                  >
                    <span>{faq.question}</span>

                    <span className="text-slate-500 text-xl">
                      {openFaq === index ? "−" : "+"}
                    </span>
                  </button>

                  {openFaq === index && (
                    <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-4 justify-between text-sm text-slate-600">
          <p>© {new Date().getFullYear()} SEO Wizard</p>

          <Link
            href="/"
            className="hover:text-slate-300 transition-colors"
          >
            Back to SEO Wizard
          </Link>
        </div>
      </footer>
    </div>
  );
}

function AltResult({
  title,
  text,
  onCopy,
}: {
  title: string;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-teal-400 font-bold mb-2">
        {title}
      </p>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          {text}
        </p>

        <button
          type="button"
          onClick={onCopy}
          className="mt-3 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold transition-colors"
        >
          Copy Alt Text
        </button>
      </div>
    </div>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="p-6 border border-slate-800 rounded-2xl bg-slate-950">
      <span className="text-teal-400 text-sm font-black">
        {number}
      </span>

      <h3 className="font-bold text-lg mt-3">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function ExampleCard({
  image,
  weak,
  better,
}: {
  image: string;
  weak: string;
  better: string;
}) {
  return (
    <div className="grid md:grid-cols-3 gap-4 items-center border border-slate-800 rounded-2xl p-5">
      <div>
        <p className="text-xs text-slate-600 uppercase">
          Example
        </p>

        <p className="font-semibold mt-1">
          {image}
        </p>
      </div>

      <div>
        <p className="text-xs text-red-400 uppercase">
          Weak Alt Text
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {weak}
        </p>
      </div>

      <div>
        <p className="text-xs text-emerald-400 uppercase">
          Better Alt Text
        </p>

        <p className="text-sm text-slate-300 mt-1">
          {better}
        </p>
      </div>
    </div>
  );
}