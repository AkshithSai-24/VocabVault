import { useState, useEffect } from 'react';
import { useVocab } from './hooks/useVocab';
import WordCard from './components/WordCard';
import Library from './components/Library';

function LogoIcon() {
  return (
    <img
      src="/logo.svg"
      alt="VocabVault logo"
      className="app__logo-img"
      width={36}
      height={36}
    />
  );
}

function App() {
  const vocab = useVocab();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vv-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vv-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const header = (
    <header className="app__header">
      <div className="app__logo">
        <LogoIcon />
        <span className="app__logo-text">VocabVault</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px,1vw,12px)' }}>
        {vocab.view === 'lookup' && (
          <button className="btn btn--outline" onClick={vocab.handleViewLibrary}>
            My Vault
            {vocab.library.length > 0 && (
              <span className="btn__badge">{vocab.library.length}</span>
            )}
          </button>
        )}
        {vocab.view === 'library' && (
          <button className="btn btn--ghost" onClick={() => vocab.setView('lookup')}>
            ← Back
          </button>
        )}
        <button
          className="btn btn--theme"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );

  if (vocab.view === 'library') {
    return (
      <div className="app">
        {header}
        <main className="app__main">
          <Library
            library={vocab.library}
            isFetching={vocab.isFetching}
            onDelete={vocab.handleDelete}
            onToggleGRE={vocab.handleToggleGRE}
            onBack={() => vocab.setView('lookup')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {header}

      <main className="app__main">
        <div className="lookup">
          <div className="lookup__hero">
            <h1 className="lookup__heading">
              Expand your<br />
              <em>lexicon</em>
            </h1>
            <p className="lookup__subtext">
              Look up any word. Get AI-powered definitions, examples, and synonyms.
              Save your favorites to build a personal vocabulary library.
            </p>
            <p className="lookup__credit">Developed by Akshith Sai Kondamadugu</p>
          </div>

          <div className="lookup__form">
            <div className="input-group">
              <input
                className="lookup__input"
                type="text"
                placeholder="Enter a word..."
                value={vocab.inputWord}
                onChange={(e) => vocab.setInputWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && vocab.handleLookup()}
                autoFocus
              />
              <button
                className="btn btn--primary lookup__btn"
                onClick={vocab.handleLookup}
                disabled={vocab.isLooking || !vocab.inputWord.trim()}
              >
                {vocab.isLooking ? (
                  <>
                    <span className="btn__spinner" />
                    <span>Looking up...</span>
                  </>
                ) : (
                  'Look Up'
                )}
              </button>
            </div>
          </div>

          {vocab.error && (
            <div className="alert alert--error">{vocab.error}</div>
          )}

          {vocab.successMsg && (
            <div className="alert alert--success">{vocab.successMsg}</div>
          )}

          {vocab.aiResult && (
            <div className="lookup__result">
              <WordCard
                word={vocab.currentWord}
                result={vocab.aiResult}
                customMeaning={vocab.customMeaning}
                useCustom={vocab.useCustom}
                isGREWord={vocab.isGREWord}
                onCustomMeaningChange={vocab.setCustomMeaning}
                onToggleCustom={vocab.setUseCustom}
                onToggleGRE={vocab.setIsGREWord}
                onSave={vocab.handleSave}
                isSaving={vocab.isSaving}
                isAlreadySaved={vocab.isAlreadySaved}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="app__footer">
        Powered by OpenRouter · Stored in Firebase
        <br />
        Developed by Akshith Sai Kondamadugu
      </footer>
    </div>
  );
}

export default App;