import styles from './MatchedPage.module.css';
import { useNavigate } from "react-router";

export function MatchedPage(props) {
  const { username, stateData } = props;
  const { opponent_username, difficulties = [], topics = [] } = stateData;
  const navigate = useNavigate();
  
  function goToCollab() {
    navigate("/collab", {
      state: { match_id: stateData.match_id },
    });
  }

  console.log(topics, difficulties);

  const diffColor = {
    easy: styles.easy,
    medium: styles.medium,
    hard: styles.hard,
  };

  return (
    <div className={styles.matchedPage}>
      <div className={styles.container}>
        {/* Match found badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Match found
        </div>

        {/* VS row */}
        <div className={styles.vsRow}>
          <div className={styles.player}>
            <div className={styles.avatar}>{username?.[0]?.toUpperCase()}</div>
            <span className={styles.playerName}>{username}</span>
          </div>
          <span className={styles.vs}>vs</span>
          <div className={`${styles.player} ${styles.playerRight}`}>
            <div className={styles.avatar}>
              {opponent_username?.[0]?.toUpperCase()}
            </div>
            <span className={styles.playerName}>{opponent_username}</span>
          </div>
        </div>

        {/* Match info */}
        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Topic</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {topics.map((topic) => (
                <span key={topic} className={styles.infoValue}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Difficulty</span>
            <div style={{ display: "flex", gap: "4px" }}>
              {difficulties.map((difficulty) => (
                <span
                  className={`${styles.diffBadge} ${diffColor[difficulty] ?? ""}`}
                >
                  {difficulty}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button onClick={goToCollab}>Start Coding</button>
      </div>
    </div>
  );
}