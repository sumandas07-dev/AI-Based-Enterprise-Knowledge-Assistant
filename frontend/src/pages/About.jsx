import React from 'react';
import { BookOpen, ShieldCheck, Database, Zap, HardDrive } from 'lucide-react';

export const About = () => {
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="border-b border-border-subtle pb-5">
          <h2 className="text-base font-bold text-white">System Architecture</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">Overview of the Enterprise Knowledge RAG pipeline.</p>
        </div>

        {/* Introduction */}
        <div className="bg-panel-light border border-border-subtle rounded-xl p-6 flex flex-col gap-4 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-accent-purple" />
            <span>Hybrid RAG Pipeline Strategy</span>
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            The AI Knowledge Assistant operates as an advanced Retrieval-Augmented Generation (RAG) platform, combining local vector indexing semantics with remote open-source generation frameworks.
          </p>
        </div>

        {/* Technical Stack Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-panel-dark/40 border border-border-subtle p-5 rounded-xl flex flex-col gap-2.5">
            <div className="p-2 bg-panel-secondary text-accent-purple rounded-lg w-fit shrink-0">
              <Database size={15} />
            </div>
            <h4 className="text-xs font-bold text-white">Pinecone Vector Database</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Stores dense vector embeddings computed from document text splits. Performs cosine similarity queries to retrieve contexts under 20ms.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-panel-dark/40 border border-border-subtle p-5 rounded-xl flex flex-col gap-2.5">
            <div className="p-2 bg-panel-secondary text-accent-purple rounded-lg w-fit shrink-0">
              <Zap size={15} />
            </div>
            <h4 className="text-xs font-bold text-white">Llama 3.3 Synthesis</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Uses Groq's high-speed API instances to run the Llama 3.3 (70B) model, synthesizing answers matching vector citations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-panel-dark/40 border border-border-subtle p-5 rounded-xl flex flex-col gap-2.5">
            <div className="p-2 bg-panel-secondary text-accent-purple rounded-lg w-fit shrink-0">
              <HardDrive size={15} />
            </div>
            <h4 className="text-xs font-bold text-white">Express Gateway Routing</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Acts as the central API orchestration gateway, handling Cloudinary uploads and local db JSON caching fallbacks.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-panel-dark/40 border border-border-subtle p-5 rounded-xl flex flex-col gap-2.5">
            <div className="p-2 bg-panel-secondary text-accent-purple rounded-lg w-fit shrink-0">
              <ShieldCheck size={15} />
            </div>
            <h4 className="text-xs font-bold text-white">Security-First Ingestion</h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Bypasses public CDN listings by sending files to secure storage pipelines, preserving corporate guideline assets.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
