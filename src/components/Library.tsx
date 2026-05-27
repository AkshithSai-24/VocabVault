import React, { useState } from 'react';
import type { WordEntry } from '../types';

interface Props {
  library: WordEntry[];
  isFetching: boolean;
  onDelete: (id: string, word: string) => void;
  onBack: () => void;
}

const Library: React.FC<Props> = ({ library, isFetching, onDelete, onBack }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = library.filter((w) =>
    w.word.toLowerCase().includes(search.toLowerCase())
  );

  const totalWords = library.length;
  const aiWords = library.filter((w) => w.source === 'ai').length;
  const customWords = library.filter((w) => w.source === 'custom').length;

  return (
    <div className="library">
      <div className="library__header">
        <button className="btn btn--ghost" onClick={onBack}>← Back</button>
        <h2 className="library__title">Your Vault</h2>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card__num">{totalWords}</span>
          <span className="stat-card__label">Total Words</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{aiWords}</span>
          <span className="stat-card__label">AI Definitions</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{customWords}</span>
          <span className="stat-card__label">Custom Notes</span>
        </div>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="Search your words..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isFetching ? (
        <div className="library__loading">
          <div className="spinner" />
          <p>Loading vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="library__empty">
          {search ? `No words matching "${search}"` : 'Your vault is empty. Look up some words!'}
        </div>
      ) : (
        <div className="library__list">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className={`lib-entry ${isExpanded ? 'lib-entry--expanded' : ''}`}
              >
                <div
                  className="lib-entry__header"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id ?? null)}
                >
                  <div className="lib-entry__title">
                    <span className="lib-entry__word">{entry.word}</span>
                    {entry.source === 'custom' && (
                      <span className="lib-entry__tag">custom</span>
                    )}
                  </div>
                  <div className="lib-entry__actions">
                    <span className="lib-entry__date">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      className="btn btn--danger-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (entry.id) onDelete(entry.id, entry.word);
                      }}
                    >
                      ✕
                    </button>
                    <span className="lib-entry__chevron">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="lib-entry__body">
                    <div className="lib-entry__row">
                      <span className="lib-entry__label">MEANING</span>
                      <p>{entry.customMeaning || entry.meaning}</p>
                    </div>
                    {entry.customMeaning && (
                      <div className="lib-entry__row">
                        <span className="lib-entry__label">AI MEANING</span>
                        <p className="lib-entry__dimmed">{entry.meaning}</p>
                      </div>
                    )}
                    <div className="lib-entry__row">
                      <span className="lib-entry__label">EXAMPLE</span>
                      <p className="lib-entry__example">"{entry.example}"</p>
                    </div>
                    <div className="lib-entry__row">
                      <span className="lib-entry__label">SYNONYMS</span>
                      <div className="word-card__synonyms">
                        {entry.synonyms.map((s) => (
                          <span key={s} className="word-card__synonym">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Library;
