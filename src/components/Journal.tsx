import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Search, 
  Plus, 
  Calendar, 
  Trash2, 
  MoreVertical,
  Save,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

import { AppState, Note } from '../types';

export function Journal({ state, updateState }: { state: AppState, updateState: (updater: (prev: AppState) => AppState) => void }) {
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');

  const createNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '',
      date: new Date().toISOString(),
      category: 'General'
    };
    updateState(prev => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])]
    }));
    setActiveNote(newNote);
  };

  const saveNote = (id: string, updates: Partial<Note>) => {
    updateState(prev => ({
      ...prev,
      notes: (prev.notes || []).map(n => n.id === id ? { ...n, ...updates } : n)
    }));
  };

  const deleteNote = (id: string) => {
    updateState(prev => ({
      ...prev,
      notes: (prev.notes || []).filter(n => n.id !== id)
    }));
    if (activeNote?.id === id) setActiveNote(null);
  };

  const filteredNotes = (state.notes || []).filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-80px)] flex bg-white/30 backdrop-blur-sm">
      {/* Sidebar List */}
      <div className={cn(
        "w-full md:w-80 border-r border-brand-sand flex flex-col transition-all duration-300",
        activeNote && "hidden md:flex"
      )}>
        <div className="p-6 border-b border-brand-sand space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display text-brand-ink">Notes</h3>
            <button 
              onClick={createNote}
              className="p-2 bg-brand-ink text-white rounded-xl hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-brand-sand/30 border border-transparent rounded-xl focus:bg-white focus:border-brand-peach transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={cn(
                "w-full p-6 border-b border-brand-sand text-left hover:bg-white/50 transition-colors group",
                activeNote?.id === note.id && "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-brand-peach uppercase">{note.category}</span>
                <span className="text-[10px] text-brand-muted">{format(new Date(note.date), 'MMM d')}</span>
              </div>
              <h4 className="text-sm font-semibold text-brand-ink line-clamp-1 mb-1">{note.title || 'Untitled'}</h4>
              <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                {note.content || 'Start writing your thoughts...'}
              </p>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="p-10 text-center text-brand-muted">
              <Book className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-sm">No thoughts yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-white/50 transition-all duration-300",
        !activeNote && "hidden md:flex"
      )}>
        {activeNote ? (
          <>
            <div className="p-6 border-b border-brand-sand flex items-center justify-between bg-white/80">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setActiveNote(null)}
                  className="md:hidden p-2 hover:bg-brand-sand rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2 text-xs text-brand-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(activeNote.date), 'MMMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-brand-peach/10 text-brand-peach rounded-xl font-medium text-xs hover:bg-brand-peach/20 transition-all">
                  <Save className="w-3.5 h-3.5" />
                  <span>Auto-saved</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-10 max-w-3xl mx-auto w-full space-y-6">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={e => saveNote(activeNote.id, { title: e.target.value })}
                placeholder="Title"
                className="w-full text-4xl font-display font-medium text-brand-ink placeholder:text-brand-sand bg-transparent border-none outline-none focus:ring-0"
              />
              <textarea 
                value={activeNote.content}
                onChange={e => saveNote(activeNote.id, { content: e.target.value })}
                placeholder="Let it all out..."
                className="w-full flex-1 text-lg text-brand-ink leading-relaxed placeholder:text-brand-sand bg-transparent border-none outline-none focus:ring-0 resize-none min-h-[500px]"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-muted p-10">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-brand-peach/10 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-lg">
                <PenTool className="w-8 h-8 text-brand-peach" />
              </div>
            </div>
            <h3 className="text-xl font-display font-medium text-brand-ink mb-2 text-center">Capture the moment</h3>
            <p className="text-center max-w-xs leading-relaxed text-sm">
              Select a note or create a new one to start documenting your journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PenTool(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 5 5" />
      <path d="m9.5 6.5 4 4" />
    </svg>
  );
}
