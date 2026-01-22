import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, X, GripVertical, Move, Trash2, CheckSquare, Square, XSquare } from 'lucide-react';
import { cardStyle } from '../styles';
import { zonesApi } from '@/services/api';

interface TablesTabProps {
  tables: any[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onUpdateZone?: (tableId: string, newZone: string) => void;
  onReorder?: (tableId: string, newSortOrder: number) => void;
}

export default function TablesTab({ tables, onAdd, onDelete, onBulkDelete, onUpdateZone, onReorder }: TablesTabProps) {
  const [draggedTable, setDraggedTable] = useState<any>(null);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch zones from API
  const { data: apiZones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: zonesApi.getAll,
  });

  // Get zone names from API
  const ZONES = apiZones.map(z => z.name);

  const tablesByZone = ZONES.reduce((acc, zone) => {
    acc[zone] = tables.filter((t: any) => t.zone === zone).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    return acc;
  }, {} as Record<string, any[]>);

  const handleDragStart = (e: React.DragEvent, table: any) => {
    if (isSelectionMode) return;
    setDraggedTable(table);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTable(null);
    setDragOverZone(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, zone: string, index?: number) => {
    e.preventDefault();
    setDragOverZone(zone);
    if (index !== undefined) setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetZone: string, targetIndex?: number) => {
    e.preventDefault();
    if (!draggedTable) return;
    if (draggedTable.zone !== targetZone && onUpdateZone) onUpdateZone(draggedTable.id, targetZone);
    if (targetIndex !== undefined && onReorder) onReorder(draggedTable.id, targetIndex);
    handleDragEnd();
  };

  const toggleSelection = (id: string) => {
    const s = new Set(selectedTables);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedTables(s);
  };

  const selectAll = () => setSelectedTables(new Set(tables.map(t => t.id)));
  const deselectAll = () => setSelectedTables(new Set());

  const handleBulkDelete = () => {
    if (selectedTables.size === 0) return;
    if (onBulkDelete) onBulkDelete(Array.from(selectedTables));
    else selectedTables.forEach(id => onDelete(id));
    setSelectedTables(new Set());
    setIsSelectionMode(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={onAdd} style={{
          padding: '14px 20px', borderRadius: '12px', background: 'rgba(48,209,88,0.1)',
          border: '1px solid rgba(48,209,88,0.2)', color: '#30D158',
          fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Plus size={18} /> Masa Ekle
        </button>

        {!isSelectionMode ? (
          <>
            <button onClick={() => setIsSelectionMode(true)} style={{
              padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,69,58,0.1)',
              border: '1px solid rgba(255,69,58,0.2)', color: '#FF453A',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <Trash2 size={18} /> Toplu Sil
            </button>
            <div style={{ marginLeft: 'auto', padding: '10px 14px', borderRadius: '10px', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Move size={16} style={{ color: '#0A84FF' }} />
              <span style={{ fontSize: '13px', color: '#0A84FF' }}>Sürükle-bırak ile taşı</span>
            </div>
          </>
        ) : (
          <>
            <button onClick={selectAll} style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(10,132,255,0.1)', border: '1px solid rgba(10,132,255,0.2)', color: '#0A84FF', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} /> Tümünü Seç
            </button>
            <button onClick={deselectAll} style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Square size={18} /> Seçimi Kaldır
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{selectedTables.size} masa seçili</span>
              <button onClick={handleBulkDelete} disabled={selectedTables.size === 0} style={{ padding: '14px 24px', borderRadius: '12px', background: '#FF453A', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: selectedTables.size === 0 ? 0.5 : 1 }}>
                <Trash2 size={18} /> Seçilenleri Sil
              </button>
              <button onClick={() => { setIsSelectionMode(false); setSelectedTables(new Set()); }} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <XSquare size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tables by Zone */}
      {ZONES.map((zone) => {
        const zoneTables = tablesByZone[zone] || [];
        const isDropTarget = dragOverZone === zone && !isSelectionMode;
        return (
          <div key={zone} style={{ ...cardStyle, border: isDropTarget ? '2px dashed #30D158' : '1px solid rgba(255,255,255,0.06)', background: isDropTarget ? 'rgba(48,209,88,0.05)' : 'rgba(255,255,255,0.03)' }}
            onDragOver={(e) => !isSelectionMode && handleDragOver(e, zone)} onDragLeave={() => { setDragOverZone(null); setDragOverIndex(null); }} onDrop={(e) => !isSelectionMode && handleDrop(e, zone)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>{zone}</h3>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{zoneTables.length} masa</span>
            </div>
            {zoneTables.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {zoneTables.map((table: any, index: number) => {
                  const isDragging = draggedTable?.id === table.id;
                  const isSelected = selectedTables.has(table.id);
                  return (
                    <div key={table.id} draggable={!isSelectionMode} onClick={() => isSelectionMode && toggleSelection(table.id)}
                      onDragStart={(e) => handleDragStart(e, table)} onDragEnd={handleDragEnd} onDragOver={(e) => !isSelectionMode && handleDragOver(e, zone, index)} onDrop={(e) => !isSelectionMode && handleDrop(e, zone, index)}
                      style={{ padding: '16px', borderRadius: '12px', background: isSelected ? 'rgba(255,69,58,0.15)' : isDragging ? 'rgba(48,209,88,0.2)' : 'rgba(255,255,255,0.05)', border: isSelected ? '2px solid #FF453A' : isDragging ? '2px solid #30D158' : '1px solid rgba(255,255,255,0.08)', textAlign: 'center', position: 'relative', cursor: isSelectionMode ? 'pointer' : 'grab', opacity: isDragging ? 0.5 : 1 }}>
                      <div style={{ position: 'absolute', top: '8px', left: '8px', color: isSelected ? '#FF453A' : 'rgba(255,255,255,0.3)' }}>
                        {isSelectionMode ? (isSelected ? <CheckSquare size={16} /> : <Square size={16} />) : <GripVertical size={14} />}
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{table.name}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{table.capacity} kişi</p>
                      {!isSelectionMode && (
                        <button onClick={(e) => { e.stopPropagation(); onDelete(table.id); }} style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', borderRadius: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '40px 20px', borderRadius: '12px', border: '2px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>Bu bölgede masa yok</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
