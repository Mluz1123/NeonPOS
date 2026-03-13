'use client';

import { usePOSStore } from '@/stores/usePOSStore';
import { X, Plus, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function POSTabs() {
  const { tabs, activeTabId, setActiveTab, addTab, removeTab, renameTab } = usePOSStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "group relative flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all duration-200 border whitespace-nowrap",
            activeTabId === tab.id
              ? "bg-white border-primary shadow-sm"
              : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
          )}
        >
          {editingId === tab.id ? (
            <input
              autoFocus
              className="bg-transparent border-none outline-none font-semibold w-24"
              defaultValue={tab.name}
              onBlur={(e) => {
                renameTab(tab.id, e.target.value);
                setEditingId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameTab(tab.id, e.currentTarget.value);
                  setEditingId(null);
                }
              }}
            />
          ) : (
            <span className="font-semibold">{tab.name}</span>
          )}
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(tab.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-lg"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className="p-1 hover:bg-red-100 text-red-500 rounded-lg"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
      
      <button
        onClick={() => addTab()}
        className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-background-dark rounded-2xl transition-all duration-200"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
