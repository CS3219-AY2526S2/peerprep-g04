import { useEffect, useState } from "react";
import styles from './MatchPage.module.css';
import { get_all_question_tags } from "../hooks/useQuestionService.jsx";

const difficulties = ['easy', 'medium', 'hard'];

const difficultyConfig = {
  easy: { emoji: '🌱', color: '#16a34a' },
  medium: { emoji: '⚡', color: '#d97706' },
  hard: { emoji: '🔥', color: '#dc2626' },
};

export function MatchPage(props) {
  const { request_match, username } = props;
  const [tags, setTags] = useState([]);
  const [selectedDiff, setSelectedDiff] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isReady, setIsReady] = useState(false);

  function addDiff(diff) { setSelectedDiff([...selectedDiff, diff]); }
  function delDiff(diff) { setSelectedDiff(selectedDiff.filter(d => d !== diff)); }
  function addTag(tag) { setSelectedTags([...selectedTags, tag]); }
  function delTag(tag) { setSelectedTags(selectedTags.filter(t => t !== tag)); }

  useEffect(() => {
    get_all_question_tags().then(tags => { tags && setTags(tags); });
    setTimeout(() => setIsReady(true), 100);
  }, []);

  const canMatch = selectedDiff.length > 0 && selectedTags.length > 0;

  return (
    <div className={`${styles.matchPage} ${isReady ? styles.ready : ''}`}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title} style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontWeight: 800,
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>Choose your challenge</h1>
          <p className={styles.subtitle}>Select a difficulty and topics to find your match</p>
        </div>

        {/* Difficulty */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Difficulty</h2>
            {selectedDiff.length > 0 && (
              <span className={styles.badge}>{selectedDiff.length} selected</span>
            )}
          </div>
          <div className={styles.diffGrid}>
            {difficulties.map((d) => {
              const selected = selectedDiff.includes(d);
              const config = difficultyConfig[d];
              return (
                <button
                  key={d}
                  className={`${styles.diffBtn} ${selected ? styles.diffBtnSelected : ''}`}
                  style={selected ? { '--accent': config.color } : {}}
                  onClick={() => selected ? delDiff(d) : addDiff(d)}
                >
                  <span className={styles.diffEmoji}>{config.emoji}</span>
                  <span className={styles.diffLabel}>{d}</span>
                  {selected && <span className={styles.checkmark}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Topics</h2>
            {selectedTags.length > 0 && (
              <span className={styles.badge}>{selectedTags.length} selected</span>
            )}
          </div>
          <div className={styles.tagCloud}>
            {tags.map(t => {
              const selected = selectedTags.includes(t);
              return (
                <button
                  key={t}
                  className={`${styles.tag} ${selected ? styles.tagSelected : ''}`}
                  onClick={() => selected ? delTag(t) : addTag(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Match button */}
        {canMatch && (
          <button
            className={`${styles.matchBtn} ${styles.matchBtnActive}`}
            onClick={() => request_match(selectedDiff, selectedTags)}
          >
            <span className={styles.matchBtnText}>🚀 Find My Match</span>
          </button>
        )}
      </div>
    </div>
  );
}