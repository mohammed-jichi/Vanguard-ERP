'use client';

import React, { useState } from 'react';
import { 
  X, 
  Network, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  Truck, 
  Factory, 
  ShoppingCart, 
  Users, 
  Sparkles,
  Search,
  Maximize2
} from 'lucide-react';
import { MATRIX_GRAPH } from './operationsData';

interface MatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEntity?: string;
}

export default function MatrixModal({ isOpen, onClose, selectedEntity }: MatrixModalProps) {
  const [activeLayer, setActiveLayer] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [focusedNode, setFocusedNode] = useState<string | null>(selectedEntity || 'ITEM-01');

  if (!isOpen) return null;

  const filteredLayers = MATRIX_GRAPH.filter(l => 
    activeLayer === 'ALL' || l.layer.toLowerCase().includes(activeLayer.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden font-sans">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r bg-primary text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Network className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Operations Center Matrix & Relational Connections</h2>
                <span className="text-[10px] bg-primary text-black font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live ERP Graph
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Multi-tier topological links across Taxonomy, Procurement, Press Mill Assembly, Inter-Branch Logistics & POS Sales
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS & FILTER BAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Filter Layer:</span>
            {['ALL', 'Taxonomy', 'Procurement', 'Assembly', 'Logistics', 'Sales'].map((ly) => (
              <button
                key={ly}
                onClick={() => setActiveLayer(ly)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeLayer === ly 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {ly}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search matrix nodes (e.g. EVOO, Glass, Mill, Spinneys)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-border"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* MODAL BODY GRAPH */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-100/60 custom-scrollbar">
          
          {/* ARCHITECTURAL CONNECTION SUMMARY BANNER */}
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-bold text-primary">Topological Pipeline:</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">Category</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">Division</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold border border-emerald-200">Group</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold border border-blue-200">Product Item</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded font-semibold border border-amber-200">Assembly / Mill</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded font-semibold border border-purple-200">Transfers & Requests</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-green-50 text-green-900 px-2 py-0.5 rounded font-bold border border-green-200">Customer Sales</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Tenant: <span className="font-bold text-primary">00001 - Southern Olive Oil Products S.A.R.L</span>
            </div>
          </div>

          {/* GRAPH LAYERS */}
          {filteredLayers.map((layerGroup, lIdx) => (
            <div key={lIdx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">{layerGroup.layer}</h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{layerGroup.nodes.length} Connected Nodes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {layerGroup.nodes
                  .filter(n => !searchTerm || n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.id.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((node) => {
                    const isFocused = focusedNode === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setFocusedNode(node.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                          isFocused 
                            ? 'bg-muted border-border ring-2 ring-primary/20 shadow-sm' 
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {node.id}
                          </span>
                          {isFocused && (
                            <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                              Active Focus
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 line-clamp-2">{node.title}</h4>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                          <span className="text-[10px] font-bold text-slate-500 block mb-1">Downstream Mappings:</span>
                          <div className="flex flex-wrap gap-1">
                            {node.connectionsTo.map((target, tIdx) => (
                              <span 
                                key={tIdx}
                                className="text-[9.5px] font-mono bg-white text-primary font-bold px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                ➔ {target}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* MATRIX CONNECTION DETAIL DRAWER */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-primary-foreground font-mono font-bold uppercase tracking-wider block">
                Matrix Topology Insight
              </span>
              <h4 className="text-sm font-black mt-0.5">
                Every unit of finished Extra Virgin Olive Oil is bi-directionally traceable.
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                From grove harvest ticket (<span className="text-primary-foreground">RAW-OLV-SOUR</span>) through pressing centrifuge (<span className="text-primary-foreground">PROD-2026-501</span>), dark glass bottling (<span className="text-primary-foreground">PKG-BTL-750</span>), inter-hub transfer (<span className="text-primary-foreground">REQ-2026-201</span>) to customer invoice (<span className="text-primary-foreground">INV-2026-901</span>).
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-black font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
            >
              Return to Operations Workspace
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
