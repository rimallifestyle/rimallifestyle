"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink2,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Quote,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write product description, highlights, key features, size info, and care instructions...',
  minHeight = '240px',
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'visual' | 'code'>('visual')
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean
    italic: boolean
    underline: boolean
    strikeThrough: boolean
    insertUnorderedList: boolean
    insertOrderedList: boolean
    justifyLeft: boolean
    justifyCenter: boolean
    justifyRight: boolean
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  })

  // Keep internal contentEditable in sync with external value without resetting cursor during typing
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, mode])

  // Update active formatting states based on current selection
  const updateActiveStates = useCallback(() => {
    if (typeof document === 'undefined' || mode !== 'visual') return
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
      })
    } catch {
      // Ignore if document queryCommandState fails
    }
  }, [mode])

  // Handle command execution
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (mode !== 'visual') return
    editorRef.current?.focus()
    try {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
      updateActiveStates()
    } catch (err) {
      console.error('execCommand failed:', err)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
      updateActiveStates()
    }
  }

  const handleFormatBlock = (tag: string) => {
    executeCommand('formatBlock', tag)
  }

  const handleCreateLink = () => {
    const url = prompt('Enter the link URL (e.g. https://...):', 'https://')
    if (url && url !== 'https://') {
      executeCommand('createLink', url)
    }
  }

  // Count words and characters
  const stripHtml = (html: string) => {
    const tmp = typeof document !== 'undefined' ? document.createElement('div') : null
    if (tmp) {
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    }
    return html.replace(/<[^>]*>?/gm, '')
  }

  const plainText = stripHtml(value || '').trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const charCount = plainText.length

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col', className)}>
      {/* WordPress Top Header: Mode Switcher */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border-b border-white/10 select-none">
        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
          <span>WordPress Rich Editor</span>
        </span>

        {/* Visual / Text Tabs */}
        <div className="flex items-center gap-1 bg-black/30 p-0.5 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              mode === 'visual'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('code')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              mode === 'code'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            )}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Text (HTML)</span>
          </button>
        </div>
      </div>

      {/* WordPress Formatting Toolbar (Active in Visual Mode) */}
      {mode === 'visual' ? (
        <div className="p-2 border-b border-white/10 bg-white/[0.02] flex items-center gap-1 flex-wrap select-none text-white/80">
          {/* Format Block Select */}
          <select
            aria-label="Format Block"
            onChange={(e) => {
              if (e.target.value) {
                handleFormatBlock(e.target.value)
                e.target.value = ''
              }
            }}
            defaultValue=""
            className="h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="" disabled className="bg-neutral-900 text-white">Paragraph / Headings</option>
            <option value="<p>" className="bg-neutral-900 text-white">Paragraph</option>
            <option value="<h2>" className="bg-neutral-900 text-white">Heading 2</option>
            <option value="<h3>" className="bg-neutral-900 text-white">Heading 3</option>
            <option value="<h4>" className="bg-neutral-900 text-white">Heading 4</option>
          </select>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('bold') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.bold ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4 font-bold" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('italic') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.italic ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('underline') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.underline ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('strikeThrough') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.strikeThrough ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Bullet List / Points */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertUnorderedList') }}
            className={cn(
              'h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-xs font-semibold',
              activeFormats.insertUnorderedList ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Bullet List (Points)"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Points</span>
          </button>

          {/* Numbered List / Numbers */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('insertOrderedList') }}
            className={cn(
              'h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-xs font-semibold',
              activeFormats.insertOrderedList ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden sm:inline">Numbered</span>
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleFormatBlock('<blockquote>') }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          {/* Align Left */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyLeft') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.justifyLeft ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Align Center */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyCenter') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.justifyCenter ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>

          {/* Align Right */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyRight') }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer',
              activeFormats.justifyRight ? 'bg-gold/20 text-gold border border-gold/40' : 'hover:bg-white/10 text-white/80'
            )}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Insert Link */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleCreateLink() }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Insert Link"
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Unlink */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('unlink') }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Remove Link"
          >
            <Unlink2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* Undo */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('undo') }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('redo') }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); executeCommand('removeFormat') }}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/80 flex items-center justify-center transition-all cursor-pointer"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/10 text-xs text-white/50 flex items-center justify-between">
          <span>Editing raw HTML code</span>
          <span className="font-mono text-[11px] text-gold">Tags: &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;ol&gt;</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="relative flex-1">
        {mode === 'visual' ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="rich-description-editor p-4 text-sm text-white focus:outline-none focus:bg-white/[0.02] transition-colors overflow-y-auto custom-scrollbar empty:before:content-[attr(data-placeholder)] empty:before:text-white/30 empty:before:pointer-events-none"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            placeholder={placeholder}
            className="w-full p-4 text-xs font-mono text-emerald-300 bg-black/40 focus:outline-none focus:bg-black/50 transition-colors resize-y custom-scrollbar"
          />
        )}
      </div>

      {/* Editor Footer / Info Bar */}
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-white font-semibold">{wordCount}</strong></span>
          <span>Characters: <strong className="text-white font-semibold">{charCount}</strong></span>
        </div>
        <div className="hidden sm:block text-white/40">
          Tip: Highlight text and click <strong>Points (•)</strong> or <strong>Numbered (1.)</strong> to create styled lists.
        </div>
      </div>
    </div>
  )
}
