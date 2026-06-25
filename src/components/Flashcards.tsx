import React, { useState, useMemo, useCallback } from 'react';
import type { WordEntry } from '../types';

interface Props {
  library: WordEntry[];
  onBack: () => void;
}

type FlashcardMode = 'setup' | 'session' | 'results';

interface SessionResult {
  word: string;
  got: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CARD_COUNT_OPTIONS = [5, 10, 15, 20, 25];

const Flashcards: React.FC<Props> = ({ library, onBack }) => {
  const [mode, setMode] = useState<FlashcardMode>('setup');
  const [greOnly, setGreOnly] = useState(false);
  const [cardCount, setCardCount] = useState(10);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [deck, setDeck] = useState<WordEntry[]>([]);

  const availableWords = useMemo(() => {
    return greOnly ? library.filter((w) => w.isGREWord) : library;
  }, [library, greOnly]);

  const greCount = library.filter((w) => w.isGREWord).length;

  const startSession = useCallback(() => {
    const pool = greOnly ? library.filter((w) => w.isGREWord) : library;
    const count = Math.min(cardCount, pool.length);
    const shuffled = shuffle(pool).slice(0, count);
    setDeck(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setFlipped(false);
    setMode('session');
  }, [library, greOnly, cardCount]);

  const handleAnswer = useCallback((got: boolean) => {
    const card = deck[currentIndex];
    const newResults = [...results, { word: card.word, got }];
    setResults(newResults);

    if (currentIndex + 1 >= deck.length) {
      setMode('results');
    } else {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  }, [deck, currentIndex, results]);

  const restartSetup = () => {
    setMode('setup');
    setDeck([]);
    setResults([]);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const restartSame = () => {
    const reshuffled = shuffle(deck);
    setDeck(reshuffled);
    setCurrentIndex(0);
    setResults([]);
    setFlipped(false);
    setMode('session');
  };

  // ── Setup Screen ──────────────────────────────────────────────────
  if (mode === 'setup') {
    const maxAvailable = availableWords.length;
    const actualCount = Math.min(cardCount, maxAvailable);

    return (
      <div className="flashcards">
        <div className="flashcards__header">
          <button className="btn btn--ghost" onClick={onBack}>← Back</button>
          <h2 className="flashcards__title">⚡ Flashcard Quiz</h2>
        </div>

        <div className="fc-setup">
          <p className="fc-setup__desc">
            Test yourself on your saved vocabulary. Flip each card to reveal the meaning, then mark whether you knew it.
          </p>

          {/* Word set toggle */}
          <div className="fc-setup__section">
            <label className="fc-setup__label">Word Set</label>
            <div className="fc-setup__toggle-group">
              <button
                className={`fc-toggle-btn ${!greOnly ? 'fc-toggle-btn--active' : ''}`}
                onClick={() => setGreOnly(false)}
              >
                📚 All Words
                <span className="fc-toggle-btn__count">{library.length}</span>
              </button>
              <button
                className={`fc-toggle-btn ${greOnly ? 'fc-toggle-btn--active' : ''}`}
                onClick={() => setGreOnly(true)}
                disabled={greCount === 0}
                title={greCount === 0 ? 'No GRE words tagged yet' : ''}
              >
                🎓 GRE Only
                <span className="fc-toggle-btn__count">{greCount}</span>
              </button>
            </div>
            {greOnly && greCount === 0 && (
              <p className="fc-setup__hint">Tag words as GRE in your vault first.</p>
            )}
          </div>

          {/* Card count */}
          <div className="fc-setup__section">
            <label className="fc-setup__label">Number of Cards</label>
            <div className="fc-setup__count-group">
              {CARD_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  className={`fc-count-btn ${cardCount === n ? 'fc-count-btn--active' : ''}`}
                  onClick={() => setCardCount(n)}
                  disabled={n > maxAvailable}
                  title={n > maxAvailable ? `Only ${maxAvailable} words available` : ''}
                >
                  {n}
                </button>
              ))}
            </div>
            {maxAvailable < cardCount && maxAvailable > 0 && (
              <p className="fc-setup__hint">
                Only {maxAvailable} word{maxAvailable !== 1 ? 's' : ''} available — session will use {maxAvailable}.
              </p>
            )}
          </div>

          <button
            className="btn btn--primary fc-setup__start"
            onClick={startSession}
            disabled={maxAvailable === 0}
          >
            {maxAvailable === 0
              ? 'No words available'
              : `Start Quiz · ${actualCount} card${actualCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    );
  }

  // ── Session Screen ────────────────────────────────────────────────
  if (mode === 'session') {
    const card = deck[currentIndex];
    const meaning = card.customMeaning || card.meaning;
    const progress = ((currentIndex) / deck.length) * 100;
    const gotCount = results.filter((r) => r.got).length;

    return (
      <div className="flashcards">
        <div className="flashcards__header">
          <button className="btn btn--ghost" onClick={restartSetup}>✕ Exit</button>
          <div className="fc-session__meta">
            <span className="fc-session__counter">
              Card {currentIndex + 1} of {deck.length}
            </span>
            <span className="fc-session__score">
              ✅ {gotCount} &nbsp;❌ {currentIndex - gotCount}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="fc-progress">
          <div className="fc-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div className="fc-card-wrap">
          <div
            className={`fc-card ${flipped ? 'fc-card--flipped' : ''}`}
            onClick={() => !flipped && setFlipped(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !flipped && setFlipped(true)}
            aria-label={flipped ? 'Card is flipped' : 'Click to reveal meaning'}
          >
            {/* Front */}
            <div className="fc-card__face fc-card__front">
              {card.isGREWord && <span className="fc-card__tag">🎓 GRE</span>}
              <p className="fc-card__hint">What does this mean?</p>
              <h2 className="fc-card__word">{card.word}</h2>
              <p className="fc-card__tap">Tap to reveal ↓</p>
            </div>

            {/* Back */}
            <div className="fc-card__face fc-card__back">
              {card.isGREWord && <span className="fc-card__tag">🎓 GRE</span>}
              <h3 className="fc-card__word fc-card__word--back">{card.word}</h3>
              <p className="fc-card__meaning">{meaning}</p>
              {card.example && (
                <p className="fc-card__example">"{card.example}"</p>
              )}
              {card.synonyms?.length > 0 && (
                <div className="fc-card__synonyms">
                  {card.synonyms.slice(0, 3).map((s) => (
                    <span key={s} className="fc-card__syn">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answer buttons — only show after flip */}
        {flipped ? (
          <div className="fc-actions">
            <button
              className="btn fc-btn fc-btn--nope"
              onClick={() => handleAnswer(false)}
            >
              ❌ Not Got It
            </button>
            <button
              className="btn fc-btn fc-btn--got"
              onClick={() => handleAnswer(true)}
            >
              ✅ Got It!
            </button>
          </div>
        ) : (
          <div className="fc-actions fc-actions--hint">
            <p className="fc-actions__prompt">Tap the card to reveal the meaning</p>
          </div>
        )}
      </div>
    );
  }

  // ── Results Screen ────────────────────────────────────────────────
  const gotCount = results.filter((r) => r.got).length;
  const total = results.length;
  const pct = Math.round((gotCount / total) * 100);
  const missed = results.filter((r) => !r.got);

  let emoji = '🌟';
  let verdict = 'Excellent!';
  if (pct < 50) { emoji = '📖'; verdict = 'Keep Studying!'; }
  else if (pct < 75) { emoji = '💪'; verdict = 'Good Effort!'; }
  else if (pct < 90) { emoji = '🎯'; verdict = 'Well Done!'; }

  return (
    <div className="flashcards">
      <div className="flashcards__header">
        <button className="btn btn--ghost" onClick={onBack}>← Back to Vault</button>
        <h2 className="flashcards__title">Results</h2>
      </div>

      <div className="fc-results">
        <div className="fc-results__score-wrap">
          <span className="fc-results__emoji">{emoji}</span>
          <h3 className="fc-results__verdict">{verdict}</h3>
          <div className="fc-results__fraction">
            <span className="fc-results__num">{gotCount}</span>
            <span className="fc-results__sep"> / </span>
            <span className="fc-results__den">{total}</span>
          </div>
          <p className="fc-results__pct">{pct}% correct</p>

          {/* Score bar */}
          <div className="fc-results__bar-bg">
            <div
              className="fc-results__bar-fill"
              style={{ width: `${pct}%`, background: pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)' }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="fc-results__breakdown">
          <div className="fc-results__pill fc-results__pill--got">✅ Got It: {gotCount}</div>
          <div className="fc-results__pill fc-results__pill--nope">❌ Missed: {missed.length}</div>
        </div>

        {/* Missed words */}
        {missed.length > 0 && (
          <div className="fc-results__missed">
            <h4 className="fc-results__missed-title">Words to Review</h4>
            <div className="fc-results__missed-list">
              {missed.map((r) => {
                const entry = deck.find((d) => d.word === r.word);
                return (
                  <div key={r.word} className="fc-results__missed-item">
                    <span className="fc-results__missed-word">{r.word}</span>
                    {entry && (
                      <span className="fc-results__missed-meaning">
                        {entry.customMeaning || entry.meaning}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="fc-results__actions">
          <button className="btn btn--outline" onClick={restartSame}>
            🔁 Retry Same Cards
          </button>
          <button className="btn btn--primary" onClick={restartSetup}>
            ✨ New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
