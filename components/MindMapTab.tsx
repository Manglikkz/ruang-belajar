'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Edit3,
  Check,
  Lightbulb,
  X,
  TrendingUp,
  User,
  Tag,
  DollarSign,
  Scale,
  Sparkles,
  PlusCircle,
  Trash2,
  Network,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  Compass,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { MindMapNode } from '@/lib/types';

interface MindMapTabProps {
  mindmap: {
    title: string;
    nodes: MindMapNode[];
  };
  materialTitle: string;
  onUpdateMindmap: (updatedNodes: MindMapNode[]) => void;
}

export function MindMapTab({
  mindmap,
  materialTitle,
  onUpdateMindmap
}: MindMapTabProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>(mindmap.nodes);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'canvas' | 'tree'>('canvas');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  
  // Dragging node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // Panning canvas state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Tree view state
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile & auto-fit on load
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth || window.innerWidth;
        if (mobile) {
          // Fit canvas to screen width: canvas coordinate span is ~920px
          const optimalZoom = Math.min(85, Math.max(45, Math.round(((containerWidth - 24) / 920) * 100)));
          setZoom(optimalZoom);
          // Center the root node (at roughly 420, 280)
          const centerX = (containerWidth / 2) - 420 * (optimalZoom / 100);
          setPan({ x: Math.round(centerX), y: 10 });
        } else {
          setZoom(100);
          setPan({ x: 0, y: 0 });
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 160));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 35));
  
  const handleFitScreen = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current.clientHeight || 500;
    
    // Calculate bounding box of all nodes
    let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
    nodes.forEach(n => {
      const x = n.x ?? 420;
      const y = n.y ?? 280;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const contentWidth = Math.max(600, (maxX - minX) + 240);
    const contentHeight = Math.max(400, (maxY - minY) + 160);

    const zoomX = (containerWidth - 32) / contentWidth;
    const zoomY = (containerHeight - 32) / contentHeight;
    const optimalZoom = Math.min(110, Math.max(40, Math.round(Math.min(zoomX, zoomY) * 100)));
    
    setZoom(optimalZoom);

    // Center content
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const targetPanX = Math.round((containerWidth / 2) - (midX * (optimalZoom / 100)));
    const targetPanY = Math.round((containerHeight / 2) - (midY * (optimalZoom / 100)));

    setPan({ x: targetPanX, y: targetPanY });
  };

  const handleResetPanAndZoom = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // --- MOUSE & TOUCH PANNING ON CANVAS ---
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Only pan if clicking the background, not nodes
    if (draggedNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (draggedNodeId && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const newX = (e.clientX - containerRect.left - pan.x) / scale - 60;
      const newY = (e.clientY - containerRect.top - pan.y) / scale - 20;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId
            ? { ...n, x: Math.max(20, Math.min(960, newX)), y: Math.max(20, Math.min(650, newY)) }
            : n
        )
      );
    }
  };

  const handleMouseUpCanvas = () => {
    if (isPanning) setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
      onUpdateMindmap(nodes);
    }
  };

  // Touch panning for mobile
  const handleTouchStartCanvas = (e: React.TouchEvent) => {
    if (draggedNodeId) return;
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMoveCanvas = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y
      });
    } else if (draggedNodeId && e.touches.length === 1 && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const newX = (e.touches[0].clientX - containerRect.left - pan.x) / scale - 60;
      const newY = (e.touches[0].clientY - containerRect.top - pan.y) / scale - 20;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId
            ? { ...n, x: Math.max(20, Math.min(960, newX)), y: Math.max(20, Math.min(650, newY)) }
            : n
        )
      );
    }
  };

  const handleTouchEndCanvas = () => {
    if (isPanning) setIsPanning(false);
    if (draggedNodeId) {
      setDraggedNodeId(null);
      onUpdateMindmap(nodes);
    }
  };

  // Node Dragging Start
  const handleStartDragNode = (e: React.MouseEvent | React.TouchEvent, node: MindMapNode) => {
    e.stopPropagation();
    setDraggedNodeId(node.id);
  };

  // Node Selection & Editing
  const handleSelectNode = (node: MindMapNode) => {
    setSelectedNodeId(node.id);
    setEditingLabel(node.label);
  };

  const handleSaveEditLabel = () => {
    if (!selectedNodeId || !editingLabel.trim()) return;
    const updated = nodes.map((n) =>
      n.id === selectedNodeId ? { ...n, label: editingLabel.trim() } : n
    );
    setNodes(updated);
    onUpdateMindmap(updated);
    setSelectedNodeId(null);
  };

  const handleAddChildNode = (parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      label: 'Subtopik Baru',
      parent_id: parent.id,
      level: parent.level + 1,
      x: (parent.x || 420) + (parent.x && parent.x < 450 ? -130 : 130),
      y: (parent.y || 280) + 40
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    onUpdateMindmap(updated);
    setSelectedNodeId(newId);
    setEditingLabel('Subtopik Baru');
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter((n) => n.id !== id && n.parent_id !== id);
    setNodes(updated);
    onUpdateMindmap(updated);
    setSelectedNodeId(null);
  };

  const getNodeIcon = (iconName?: string, level?: number) => {
    if (level === 0) return <BookOpen className="w-5 h-5 text-white" />;
    switch (iconName) {
      case 'User':
        return <User className="w-4 h-4 text-sky-500" />;
      case 'Tag':
        return <Tag className="w-4 h-4 text-sky-500" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-sky-500" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-sky-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-sky-500" />;
    }
  };

  // Helper to render smooth curved bezier SVG connections
  const renderEdge = (parent: MindMapNode, child: MindMapNode) => {
    const startX = (parent.x ?? 420) + (parent.level === 0 ? 80 : 60);
    const startY = (parent.y ?? 280) + 20;
    const endX = (child.x ?? 200) + 50;
    const endY = (child.y ?? 160) + 15;

    const dx = endX - startX;
    const cp1X = startX + dx * 0.5;
    const cp1Y = startY;
    const cp2X = startX + dx * 0.5;
    const cp2Y = endY;

    const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

    return (
      <path
        key={`edge-${parent.id}-${child.id}`}
        d={pathData}
        fill="none"
        stroke={child.level === 1 ? '#0EA5E9' : '#7DD3FC'}
        strokeWidth={child.level === 1 ? 2.5 : 1.75}
        strokeOpacity={child.level === 1 ? 0.9 : 0.75}
        strokeDasharray={child.level > 1 ? '4 2' : 'none'}
        className="transition-all duration-150"
      />
    );
  };

  // Structured tree data for Mobile Outliner View
  const rootNode = useMemo(() => {
    return nodes.find((n) => n.level === 0 || !n.parent_id) || nodes[0];
  }, [nodes]);

  const level1Branches = useMemo(() => {
    if (!rootNode) return [];
    return nodes.filter((n) => n.id !== rootNode.id && (n.level === 1 || n.parent_id === rootNode.id));
  }, [nodes, rootNode]);

  const getChildrenOfNode = React.useCallback(
    (parentId: string) => {
      return nodes.filter((n) => n.parent_id === parentId);
    },
    [nodes]
  );

  const toggleBranchCollapse = (branchId: string) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };

  const toggleAllBranches = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    level1Branches.forEach((b) => {
      newState[b.id] = !expand;
    });
    setCollapsedBranches(newState);
  };

  // Filtered branches for tree search
  const filteredBranches = useMemo(() => {
    if (!searchQuery.trim()) return level1Branches;
    const q = searchQuery.toLowerCase();
    return level1Branches.filter((branch) => {
      const matchBranch = branch.label.toLowerCase().includes(q);
      const subNodes = getChildrenOfNode(branch.id);
      const matchChild = subNodes.some((c) => c.label.toLowerCase().includes(q));
      return matchBranch || matchChild;
    });
  }, [level1Branches, searchQuery, getChildrenOfNode]);

  return (
    <div className="w-full space-y-4">
      {/* Top Header Row with View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mind Map</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
              {nodes.length} Konsep
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{materialTitle}</p>
        </div>

        {/* View Switcher: Kanvas Visual vs Pohon Struktur */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Kanvas Bagan</span>
            </button>

            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Struktur Pohon</span>
            </button>
          </div>

          {/* Edit Mode Toggle Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isEditMode
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-700 bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {isEditMode ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-sky-500" />}
            <span className="hidden xs:inline">{isEditMode ? 'Selesai Edit' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Edit Mode Notification Helper */}
      {isEditMode && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">Mode Edit Aktif:</span>
            <span>Geser node untuk memindahkan posisi, atau klik node untuk mengedit teks & menambah cabang baru.</span>
          </div>
          {selectedNodeId && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                className="px-2.5 py-1 bg-white border border-sky-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
                placeholder="Nama konsep..."
              />
              <button
                onClick={handleSaveEditLabel}
                className="px-3 py-1 bg-sky-500 text-white rounded-lg font-bold hover:bg-sky-600 cursor-pointer"
              >
                Simpan
              </button>
              <button
                onClick={() => handleAddChildNode(selectedNodeId)}
                className="px-2.5 py-1 bg-white border border-sky-300 rounded-lg font-semibold hover:bg-sky-100 flex items-center gap-1 cursor-pointer text-sky-700"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Cabang</span>
              </button>
              {selectedNodeId !== rootNode?.id && (
                <button
                  onClick={() => handleDeleteNode(selectedNodeId)}
                  className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VIEW MODE: KANVAS VISUAL (INTERACTIVE ZOOM & TOUCH PAN) */}
      {/* ======================================================== */}
      {viewMode === 'canvas' && (
        <div className="space-y-3">
          {/* Canvas Floating Controls Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Mobile gesture guidance hint */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Geser dengan jari atau mouse untuk menjelajah kanvas</span>
            </div>

            {/* Zoom and Fit Screen controls */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleResetPanAndZoom}
                className="text-xs font-bold text-slate-700 w-10 text-center hover:text-sky-600"
                title="Reset ke 100%"
              >
                {zoom}%
              </button>

              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

              {/* Fit Screen Button */}
              <button
                onClick={handleFitScreen}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                title="Pusatkan & sesuaikan dengan layar"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pusatkan</span>
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Layar penuh"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDownCanvas}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            onTouchStart={handleTouchStartCanvas}
            onTouchMove={handleTouchMoveCanvas}
            onTouchEnd={handleTouchEndCanvas}
            className={`w-full h-[480px] sm:h-[580px] bg-white rounded-3xl border border-slate-200 shadow-2xs relative overflow-hidden bg-dotted-grid select-none cursor-grab ${
              isPanning ? 'cursor-grabbing' : ''
            }`}
          >
            {/* Scaled & Panned Canvas Surface */}
            <div
              className="w-full h-full relative transform-gpu origin-top-left"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                transition: isPanning || draggedNodeId ? 'none' : 'transform 0.15s ease-out'
              }}
            >
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-[1200px] h-[900px] pointer-events-none z-0">
                {nodes
                  .filter((n) => n.parent_id)
                  .map((child) => {
                    const parent = nodes.find((p) => p.id === child.parent_id);
                    return parent ? renderEdge(parent, child) : null;
                  })}
              </svg>

              {/* Interactive Nodes Layer */}
              {nodes.map((node) => {
                const isRoot = node.level === 0 || node.id === rootNode?.id;
                const isLevel1 = node.level === 1;
                const isSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => isEditMode && handleStartDragNode(e, node)}
                    onTouchStart={(e) => isEditMode && handleStartDragNode(e, node)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectNode(node);
                    }}
                    className={`absolute transition-shadow duration-150 z-10 select-none ${
                      isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                    } ${isSelected ? 'ring-3 ring-sky-400 ring-offset-2' : ''}`}
                    style={{
                      left: `${node.x ?? 420}px`,
                      top: `${node.y ?? 280}px`
                    }}
                  >
                    {/* 1. Root Central Node (Solid Blue rounded card) */}
                    {isRoot && (
                      <div className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-sky-200/80 flex items-center gap-2.5 border border-sky-400 font-bold text-sm sm:text-base min-w-[190px] max-w-[260px] justify-center text-center">
                        <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          {getNodeIcon(node.icon, 0)}
                        </div>
                        <span className="tracking-tight leading-tight">{node.label}</span>
                      </div>
                    )}

                    {/* 2. Level 1 Branch Topics (White Pill with Blue Border + Icon) */}
                    {isLevel1 && (
                      <div className="bg-white hover:bg-sky-50/60 text-slate-800 px-3.5 py-2.5 rounded-2xl shadow-xs border border-sky-400 flex items-center gap-2 font-bold text-xs sm:text-sm min-w-[130px] max-w-[210px]">
                        <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                          {getNodeIcon(node.icon, 1)}
                        </div>
                        <span className="leading-snug">{node.label}</span>
                      </div>
                    )}

                    {/* 3. Level 2 Sub-nodes (White rounded box with subtle cyan border) */}
                    {!isRoot && !isLevel1 && (
                      <div className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl shadow-2xs border border-sky-200 font-medium text-xs min-w-[100px] max-w-[180px] text-center">
                        <span>{node.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Floating Learning Tips Card (Collapsible) */}
            <div className="absolute bottom-3 right-3 z-20">
              {showTips ? (
                <div className="max-w-xs bg-white/95 backdrop-blur-md border border-sky-200 rounded-2xl p-3.5 shadow-lg shadow-sky-100/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Tips Membaca Mind Map</h4>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Mulai dari topik utama di tengah, lalu telusuri cabang utama searah jarum jam untuk memahami hubungan konsep.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTips(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowTips(true)}
                  className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-sky-200 hover:bg-white text-sky-700 rounded-xl shadow-xs text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tips Belajar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VIEW MODE: STRUKTUR POHON (PERFECT FOR MOBILE SCREEN) */}
      {/* ======================================================== */}
      {viewMode === 'tree' && (
        <div className="space-y-4">
          {/* Search & Tree Actions Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari konsep atau subtopik..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Expand / Collapse All Buttons */}
            <div className="flex items-center gap-2 justify-end text-xs">
              <button
                onClick={() => toggleAllBranches(true)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Buka Semua
              </button>
              <button
                onClick={() => toggleAllBranches(false)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* Root Concept Display Card */}
          {rootNode && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl shadow-sm shadow-sky-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-100">Topik Inti</span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">{rootNode.label}</h3>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white shrink-0">
                {level1Branches.length} Cabang Utama
              </span>
            </div>
          )}

          {/* Branches Accordion List */}
          <div className="space-y-3">
            {filteredBranches.map((branch, index) => {
              const subNodes = getChildrenOfNode(branch.id);
              const isCollapsed = collapsedBranches[branch.id];

              return (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                >
                  {/* Branch Header (Clickable to toggle) */}
                  <div
                    onClick={() => toggleBranchCollapse(branch.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                        {getNodeIcon(branch.icon, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded">
                            Cabang {index + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{branch.label}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {subNodes.length} Subtopik
                      </span>
                      <div className="text-slate-400">
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Subtopics Nested List */}
                  {!isCollapsed && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/40">
                      {subNodes.length > 0 ? (
                        <div className="space-y-2 mt-2 pl-2 sm:pl-4 border-l-2 border-sky-200">
                          {subNodes.map((child) => (
                            <div
                              key={child.id}
                              onClick={() => {
                                handleSelectNode(child);
                              }}
                              className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-sky-300 hover:bg-sky-50/30 transition-all flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                <span>{child.label}</span>
                              </div>
                              {isEditMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNode(child.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2 pl-4">
                          Belum ada subtopik pada cabang ini.
                        </p>
                      )}

                      {/* Add Subtopic Button in Edit Mode */}
                      {isEditMode && (
                        <button
                          onClick={() => handleAddChildNode(branch.id)}
                          className="mt-3 text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Tambah Subtopik ke {branch.label}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredBranches.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                Tidak ada konsep yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
