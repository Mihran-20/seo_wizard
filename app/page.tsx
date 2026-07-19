"use client";

import { useState } from "react";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [webpSize, setWebpSize] = useState<number>(0);
  
  const [results, setResults] = useState<{
    descriptive: string;
    keywordOptimized: string;
    creative: string;
  } | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const convertToWebP = (file: File): Promise<{ blob: Blob; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas context error");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const webpUrl = URL.createObjectURL(blob);
                resolve({ blob, dataUrl: webpUrl });
              } else {
                reject("Conversion failed");
              }
            },
            "image/webp",
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setOriginalSize(file.size);
      setResults(null);
      try {
        const { blob, dataUrl } = await convertToWebP(file);
        setWebpBlob(blob);
        setWebpSize(blob.size);
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error("WebP conversion error:", err);
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const generateAltText = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Image = await convertToBase64(image);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      if (!response.ok) throw new Error("Failed to generate alt text");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your API connection.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWebP = () => {
    if (!webpBlob || !image) return;
    const url = URL.createObjectURL(webpBlob);
    const a = document.createElement("a");
    a.href = url;
    const originalName = image.name.substring(0, image.name.lastIndexOf("."));
    a.download = `${originalName}_optimized.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const compressionSavings = originalSize && webpSize 
    ? Math.round(((originalSize - webpSize) / originalSize) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
      
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            <span>⚡ SEO Wizard</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#tool" className="hover:text-teal-400 transition-colors">Generator</a>
            <a href="#features" className="hover:text-teal-400 transition-colors">Features</a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
          <a 
            href="https://buymeacoffee.com/mihranseo" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Buy Me a Coffee
          </a>
          </div>
        </div>
      </header>

      <main id="tool" className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full flex flex-col items-center justify-center">
        
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            100% Free & No Registration Required
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            AI Alt Text & WebP Wizard
          </h1>
          <p className="text-slate-400 mt-4 text-base md:text-lg max-w-xl">
            Optimize your images instantly. Reduce file sizes with WebP and generate context-aware SEO Alt texts to rank higher on Google.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start bg-slate-900/20 border border-slate-900 rounded-3xl p-4 md:p-8 backdrop-blur-sm shadow-2xl">
          
          <div className="lg:col-span-5 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950/60 hover:border-teal-500/50 transition-all duration-300 min-h-[340px] w-full">
            {previewUrl ? (
              <div className="w-full flex flex-col items-center gap-5">
                <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-60 w-full flex items-center justify-center bg-slate-950">
                  <img src={previewUrl} alt="Preview" className="max-h-60 object-contain p-2" />
                </div>
                
                {webpSize > 0 && (
                  <div className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-xs flex justify-around text-center">
                    <div>
                      <p className="text-slate-500 font-medium">Original</p>
                      <p className="text-slate-300 font-bold mt-0.5">{(originalSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="border-r border-slate-900"></div>
                    <div>
                      <p className="text-teal-400 font-medium">WebP</p>
                      <p className="text-teal-300 font-bold mt-0.5">{(webpSize / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="border-r border-slate-900"></div>
                    <div>
                      <p className="text-blue-400 font-medium">Saved</p>
                      <p className="text-blue-300 font-bold mt-0.5">{compressionSavings > 0 ? `${compressionSavings}%` : "0%"}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 w-full">
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        setImage(null);
                        setPreviewUrl(null);
                        setResults(null);
                        setWebpBlob(null);
                        setWebpSize(0);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-medium text-xs transition-colors text-slate-300"
                    >
                      Remove
                    </button>
                    <button
                      onClick={generateAltText}
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 font-semibold text-xs transition-opacity disabled:opacity-50 text-white shadow-md shadow-teal-500/10"
                    >
                      {loading ? "Generating..." : "Generate Alt Text"}
                    </button>
                  </div>
                  
                  <button
                    onClick={downloadWebP}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs transition-colors text-white shadow-lg shadow-emerald-600/15 flex items-center justify-center gap-2"
                  >
                    Download Optimized WebP
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center py-16 w-full h-full group">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:border-teal-500/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-300 font-semibold tracking-wide">Click to upload or drag & drop</p>
                <p className="text-[11px] text-slate-600 mt-1">PNG, JPG, WEBP up to 10MB</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/40 border border-slate-900 rounded-2xl p-6 min-h-[340px] w-full">
            <div>
              <h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2 mb-5">
                <span className="w-1.5 h-3 rounded-full bg-gradient-to-b from-teal-400 to-blue-500"></span>
                Generated SEO Alt Texts
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                  <p className="text-slate-500 mt-4 text-xs font-medium tracking-wide">AI engine is processing image context...</p>
                </div>
              ) : results ? (
                <div className="space-y-4">
                  {[
                    { label: "Descriptive Alt", val: results.descriptive, color: "text-teal-400 border-teal-500/20 bg-teal-500/5" },
                    { label: "Keyword-Optimized", val: results.keywordOptimized, color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
                    { label: "Creative / Social", val: results.creative, color: "text-purple-400 border-purple-500/20 bg-purple-500/5" }
                  ].map((item, idx) => (
                    <div key={idx} className="group/item">
                      <label className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${item.color}`}>
                        {item.label}
                      </label>
                      <div className="mt-2 p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between gap-3 text-xs group-hover/item:border-slate-800 transition-colors">
                        <span className="text-slate-300 font-medium select-all leading-relaxed">{item.val}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(item.val)}
                          className="text-[10px] font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:text-white text-slate-400 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <svg className="w-8 h-8 text-slate-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.813 15.904L9 21l8.913-6.096M21 12h-9m0 0l-3 3m3-3l-3-3" />
                  </svg>
                  <p className="text-xs text-slate-600 font-medium">Upload an asset to unlock metadata variations</p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="w-full mt-8 p-4 bg-slate-900/10 border border-slate-900 rounded-xl text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 block mb-1">Sponsored Advertisement</span>
          <div className="h-20 flex items-center justify-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-900 border-dashed">
            Ad slot placeholder — income channel active after AdSense integration
          </div>
        </div>

      </main>

      <section id="features" className="border-t border-slate-900 bg-slate-950/40 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black tracking-tight text-slate-200">Why Optimize Images with Us?</h2>
            <p className="text-sm text-slate-500 mt-2">Everything you need for perfect web performance and accessible SEO.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 font-bold text-sm">🚀</div>
              <h3 className="text-sm font-bold text-slate-300">Lightning Fast Speed</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">WebP images decrease file sizes by up to 80%, substantially reducing page load times and boosting your Google PageSpeed scores.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 font-bold text-sm">🤖</div>
              <h3 className="text-sm font-bold text-slate-300">Contextual AI Vision</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Powered by state-of-the-art vision models to extract deep descriptive properties, giving search engine crawlers rich textual index data.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-bold text-sm">🔒</div>
              <h3 className="text-sm font-bold text-slate-300">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Your images are converted directly inside your local web browser canvas. Your raw media files never hit any remote database servers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-900 bg-slate-950 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black tracking-tight text-slate-200">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 mt-2">Learn more about how image optimization impacts your site ranking.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Why is WebP better than PNG or JPEG?",
                a: "WebP provides superior lossless and lossy compression for images on the web. Using WebP, webmasters can create smaller, richer images that make the web faster, saving up to 30-80% in file size compared to PNG and JPEG without losing visible quality."
              },
              {
                q: "What is Image Alt Text and why does it matter for SEO?",
                a: "Alt text (alternative text) describes an image on a web page. It helps search engine crawlers understand the content of the image, allowing it to rank in Google Images. It also enhances accessibility for visually impaired users using screen readers."
              },
              {
                q: "Are my images safely processed?",
                a: "Yes, absolutely. The core WebP image conversion happens 100% locally in your browser using the HTML5 Canvas API. Your files are never stored or processed on external server hard drives, ensuring complete asset privacy."
              }
            ].map((faq, index) => (
              <div key={index} className="border border-slate-900 rounded-xl bg-slate-900/10 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left font-bold text-xs text-slate-300 hover:text-white flex justify-between items-center transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-500">{openFaq === index ? "−" : "+"}</span>
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-xs text-slate-500 leading-relaxed border-t border-slate-900/50 bg-slate-950/30">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600 font-medium">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} SEO Wizard. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Built for maximum core web vitals and speed optimization.
          </p>
        </div>
      </footer>

    </div>
  );
}