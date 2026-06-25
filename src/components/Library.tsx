import React, { useState } from 'react';
import type { WordEntry } from '../types';

interface Props {
  library: WordEntry[];
  isFetching: boolean;
  onDelete: (id: string, word: string) => void;
  onToggleGRE: (id: string, current: boolean) => void;
  onBack: () => void;
}

const Library: React.FC<Props> = ({ library, isFetching, onDelete, onToggleGRE, onBack }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterGRE, setFilterGRE] = useState(false);

  const filtered = library.filter((w) => {
    const matchesSearch = w.word.toLowerCase().includes(search.toLowerCase());
    const matchesGRE = filterGRE ? w.isGREWord === true : true;
    return matchesSearch && matchesGRE;
  });

  const totalWords = library.length;
  const aiWords = library.filter((w) => w.source === 'ai').length;
  const customWords = library.filter((w) => w.source === 'custom').length;
  const greWords = library.filter((w) => w.isGREWord).length;

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
        <div className="stat-card stat-card--gre">
          <span className="stat-card__num">{greWords}</span>
          <span className="stat-card__label">GRE Words</span>
        </div>
      </div>

      <div className="library__filters">
        <input
          className="search-input"
          type="text"
          placeholder="Search your words..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={`btn btn--filter-gre ${filterGRE ? 'btn--filter-gre--active' : ''}`}
          onClick={() => setFilterGRE((v) => !v)}
          title="Show only GRE words"
        >
          🎓 GRE Only
        </button>
      </div>

      {isFetching ? (
        <div className="library__loading">
          <div className="spinner" />
          <p>Loading vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="library__empty">
          {search || filterGRE
            ? `No words matching your filters`
            : 'Your vault is empty. Look up some words!'}
        </div>
      ) : (
        <div className="library__list">
          {filtered.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className={`lib-entry ${isExpanded ? 'lib-entry--expanded' : ''} ${entry.isGREWord ? 'lib-entry--gre' : ''}`}
              >
                <div
                  className="lib-entry__header"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id ?? null)}
                >
                  <div className="lib-entry__title">
                    <span className="lib-entry__word">{entry.word}</span>
                    {entry.isGREWord && (
                      <span className="lib-entry__tag lib-entry__tag--gre">🎓 GRE</span>
                    )}
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
                    <div className="lib-entry__row lib-entry__row--gre-toggle">
                      <button
                        className={`btn lib-entry__gre-btn ${entry.isGREWord ? 'lib-entry__gre-btn--active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (entry.id) onToggleGRE(entry.id, !!entry.isGREWord);
                        }}
                      >
                        🎓 {entry.isGREWord ? 'Remove GRE Tag' : 'Mark as GRE Word'}
                      </button>
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