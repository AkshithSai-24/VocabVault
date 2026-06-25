import { useState, useCallback } from 'react';
import { lookupWord } from '../lib/openrouter';
import { saveWord, fetchAllWords, deleteWord, updateWordGREStatus } from '../lib/firebase';
import type { WordEntry, AIWordResult } from '../types';

export type AppView = 'lookup' | 'library' | 'flashcards';

export function useVocab() {
  const [view, setView] = useState<AppView>('lookup');
  const [inputWord, setInputWord] = useState('');
  const [aiResult, setAiResult] = useState<AIWordResult | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [customMeaning, setCustomMeaning] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [isGREWord, setIsGREWord] = useState(false);
  const [isLooking, setIsLooking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [library, setLibrary] = useState<WordEntry[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleLookup = useCallback(async () => {
    const word = inputWord.trim();
    if (!word) return;
    setError(null);
    setAiResult(null);
    setCustomMeaning('');
    setUseCustom(false);
    setIsGREWord(false);
    setIsLooking(true);
    try {
      const result = await lookupWord(word);
      setAiResult(result);
      setCurrentWord(word);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsLooking(false);
    }
  }, [inputWord]);

  const handleSave = useCallback(async () => {
    if (!aiResult || !currentWord) return;
    setIsSaving(true);
    setError(null);
    try {
      const hasCustom = useCustom && customMeaning.trim().length > 0;

      // Build entry without undefined — omit customMeaning entirely if not set
      const entry: Omit<WordEntry, 'id'> = {
        word: currentWord,
        meaning: aiResult.meaning,
        example: aiResult.example,
        synonyms: aiResult.synonyms,
        source: hasCustom ? 'custom' : 'ai',
        createdAt: Date.now(),
        isGREWord: isGREWord,
        ...(hasCustom ? { customMeaning: customMeaning.trim() } : {}),
      };

      const id = await saveWord(entry);
      setSavedIds((prev) => new Set(prev).add(currentWord.toLowerCase()));
      flashSuccess(`"${currentWord}" saved to your vault!`);
      setLibrary((prev) => [{ ...entry, id }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save word');
    } finally {
      setIsSaving(false);
    }
  }, [aiResult, currentWord, useCustom, customMeaning, isGREWord]);

  const handleViewFlashcards = useCallback(async () => {
    // If library is empty, fetch first
    if (library.length === 0) {
      setIsFetching(true);
      try {
        const words = await fetchAllWords();
        setLibrary(words);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load library');
        return;
      } finally {
        setIsFetching(false);
      }
    }
    setView('flashcards');
  }, [library]);

  const handleViewLibrary = useCallback(async () => {
    setView('library');
    setIsFetching(true);
    setError(null);
    try {
      const words = await fetchAllWords();
      setLibrary(words);
      const ids = new Set(words.map((w) => w.word.toLowerCase()));
      setSavedIds(ids);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleToggleGRE = useCallback(async (id: string, currentValue: boolean) => {
    const next = !currentValue;
    // Optimistic update
    setLibrary((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isGREWord: next } : w))
    );
    try {
      await updateWordGREStatus(id, next);
    } catch (e) {
      // Revert on failure
      setLibrary((prev) =>
        prev.map((w) => (w.id === id ? { ...w, isGREWord: currentValue } : w))
      );
      setError(e instanceof Error ? e.message : 'Failed to update GRE status');
    }
  }, []);

  const handleDelete = useCallback(async (id: string, word: string) => {
    try {
      await deleteWord(id);
      setLibrary((prev) => prev.filter((w) => w.id !== id));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(word.toLowerCase());
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete word');
    }
  }, []);

  const isAlreadySaved = savedIds.has(currentWord.toLowerCase());

  return {
    view, setView,
    inputWord, setInputWord,
    aiResult, currentWord,
    customMeaning, setCustomMeaning,
    useCustom, setUseCustom,
    isGREWord, setIsGREWord,
    isLooking, isSaving, isFetching,
    error, successMsg,
    library,
    handleLookup, handleSave, handleViewLibrary, handleViewFlashcards, handleDelete, handleToggleGRE,
    isAlreadySaved,
  };
}