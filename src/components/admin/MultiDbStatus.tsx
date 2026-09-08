import React, { useState } from 'react';
import { Database, Server, Plus, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

export const MultiDbStatus: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const envSample = `# Primary CockroachDB (Postgres compatible)
DATABASE_URL=postgresql://user:secret@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full

# Secondary Database (Auto-discovered when primary fills up)
DATABASE_URL_2=postgresql://user2:secret2@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full

# Tertiary Database (Expandable infinitely)
DATABASE_URL_3=`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Multi-Database Architecture</h3>
        </div>
        <p className="text-zinc-400 mt-1">
          CockroachDB distributed database status and seamless multi-database failover support.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* DB 1 */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Primary DB (Active)
            </span>
            <span className="text-zinc-500 text-[11px]">Key: DATABASE_URL</span>
          </div>
          <h4 className="text-base font-bold text-white">CockroachDB Cluster Node 1</h4>
          <p className="text-zinc-400 leading-relaxed">
            Standard read-write node. All newly created titles, settings updates, and categories write to this active instance.
          </p>
        </div>

        {/* DB 2 */}
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
              Secondary Failover Node
            </span>
            <span className="text-zinc-500 text-[11px]">Key: DATABASE_URL_2</span>
          </div>
          <h4 className="text-base font-bold text-white">Multi-Database Expansion Slot</h4>
          <p className="text-zinc-400 leading-relaxed">
            When your first CockroachDB cluster approaches capacity limits, configure <code className="text-amber-400">DATABASE_URL_2</code> in Cloudflare Pages.
          </p>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">How Multi-Database Works</h4>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Config Example'}</span>
          </button>
        </div>

        <p className="text-zinc-300 leading-relaxed">
          The <code className="text-amber-400">MultiDbManager</code> backend automatically detects all configured database pools (<code className="text-zinc-300">DATABASE_URL</code>, <code className="text-zinc-300">DATABASE_URL_2</code>, <code className="text-zinc-300">DATABASE_URL_3</code>, etc.):
        </p>

        <ul className="list-disc list-inside space-y-2 text-zinc-400 pl-2 leading-relaxed">
          <li>
            <strong className="text-white">Unified Reads:</strong> When users search or browse movies, the API queries across all connected databases and combines the results without duplicate IDs.
          </li>
          <li>
            <strong className="text-white">Automatic Failover:</strong> If one database cluster experiences a connection outage, the system gracefully falls back to available clusters.
          </li>
          <li>
            <strong className="text-white">Easy Expansion:</strong> In Cloudflare Pages dashboard &rarr; Settings &rarr; Environment Variables, simply add <code className="text-amber-400">DATABASE_URL_2</code> with your second CockroachDB connection string.
          </li>
        </ul>
      </div>
    </div>
  );
};
