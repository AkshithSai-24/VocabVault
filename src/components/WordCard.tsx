import React from 'react';
import type { AIWordResult } from '../types';

interface Props {
  word: string;
  result: AIWordResult;
  customMeaning: string;
  useCustom: boolean;
  isGREWord: boolean;
  onCustomMeaningChange: (v: string) => void;
  onToggleCustom: (v: boolean) => void;
  onToggleGRE: (v: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  isAlreadySaved: boolean;
}

const WordCard: React.FC<Props> = ({
  word, result, customMeaning, useCustom, isGREWord,
  onCustomMeaningChange, onToggleCustom, onToggleGRE, onSave, isSaving, isAlreadySaved,
}) => {
  return (
    <div className="word-card">
      <div className="word-card__header">
        <h2 className="word-card__word">{word}</h2>
        <span className="word-card__badge">AI Generated</span>
      </div>

      <div className="word-card__section">
        <span className="word-card__label">MEANING</span>
        <p className="word-card__text">{result.meaning}</p>
      </div>

      <div className="word-card__section">
        <span className="word-card__label">EXAMPLE</span>
        <p className="word-card__text word-card__example">"{result.example}"</p>
      </div>

      <div className="word-card__section">
        <span className="word-card__label">SYNONYMS</span>
        <div className="word-card__synonyms">
          {result.synonyms.map((s) => (
            <span key={s} className="word-card__synonym">{s}</span>
          ))}
        </div>
      </div>

      <div className="word-card__custom">
        <label className="word-card__toggle">
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => onToggleCustom(e.target.checked)}
          />
          <span className="word-card__toggle-text">Add my own meaning</span>
        </label>
        {useCustom && (
          <textarea
            className="word-card__textarea"
            placeholder="Write your personal definition, memory aid, or notes..."
            value={customMeaning}
            onChange={(e) => onCustomMeaningChange(e.target.value)}
            rows={3}
          />
        )}
      </div>

      <label className="word-card__toggle word-card__toggle--gre">
        <input
          type="checkbox"
          checked={isGREWord}
          onChange={(e) => onToggleGRE(e.target.checked)}
        />
        <span className="word-card__toggle-text">
          <span className="word-card__gre-icon">🎓</span>
          Mark as GRE Word
        </span>
      </label>

      <button
        className="btn btn--primary"
        onClick={onSave}
        disabled={isSaving || isAlreadySaved}
      >
        {isSaving ? (
          <span className="btn__spinner" />
        ) : isAlreadySaved ? (
          '✓ Saved to Vault'
        ) : (
          'Save to Vault →'
        )}
      </button>
    </div>
  );
};

export default WordCard;