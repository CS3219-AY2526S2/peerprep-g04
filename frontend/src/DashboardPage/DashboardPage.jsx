import { useContext, useEffect, useState } from "react";
import styles from "./DashboardPage.module.css";
import { UserContext } from "../hooks/useUserService";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { toast } from "react-toastify";
import { submission_api } from "../hooks/useSubmissionService";

function buildActivityData(activity) {
  const map = {};
  for (const { date, count } of activity) map[date] = count;

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: map[key] ?? 0 });
  }
  return days;
}

const STATUS_COLOR = {
  Accepted: "#16a34a",
  Failed: "#dc2626",
  Error: "#ea580c",
};

export function DashboardPage() {
  const { accessToken } = useContext(UserContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    submission_api
      .get("/user-stats", { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((res) => setStats(res.data))
      .catch((err) => toast(err?.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  const activityData = buildActivityData(stats?.activity ?? []);
  const maxActivity = Math.max(1, ...activityData.map((d) => d.count));
  const langs = Object.entries(stats?.languages_used ?? {}).sort((a, b) => b[1] - a[1]);
  const maxLang = langs.length > 0 ? langs[0][1] : 1;
  const hasActivity = activityData.some((d) => d.count > 0);

  return (
    <div className={styles.main}>
      <div className={styles.body}>
        <h1 className={styles.title}>Your Stats</h1>

        {/* Row 1: acceptance rate + stat cards */}
        <div className={styles.statsRow}>
          <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 180 }}>
            <div className={styles.rateLabel}>Acceptance Rate</div>
            <div className={styles.rateValue}>
              {stats?.acceptance_rate ?? 0}
              <span className={styles.ratePercent}>%</span>
            </div>
            <div className={styles.rateSubLabel}>
              {stats?.accepted_count ?? 0} / {stats?.total_submissions ?? 0} accepted
            </div>
          </Card>

          <div className={styles.miniCards}>
            <Card>
              <div className={styles.miniValue}>{stats?.total_submissions ?? 0}</div>
              <div className={styles.miniLabel}>Total Submissions</div>
            </Card>
            <Card>
              <div className={styles.miniValue}>{stats?.questions_attempted ?? 0}</div>
              <div className={styles.miniLabel}>Questions Attempted</div>
            </Card>
            <Card>
              <div className={styles.miniValue}>{stats?.questions_solved ?? 0}</div>
              <div className={styles.miniLabel}>Questions Solved</div>
            </Card>
            <Card>
              <div className={styles.miniValue}>{stats?.total_matches ?? "—"}</div>
              <div className={styles.miniLabel}>Matches Played</div>
            </Card>
          </div>
        </div>

        {/* Row 2: languages + activity */}
        <div className={styles.chartsRow}>
          <Card title="Languages Used" style={{ flex: "0 0 260px" }}>
            {langs.length === 0 ? (
              <div className={styles.empty}>No submissions yet</div>
            ) : (
              langs.map(([lang, count]) => (
                <div key={lang} className={styles.langRow}>
                  <span className={styles.langName}>{lang}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${(count / maxLang) * 100}%` }}
                    />
                  </div>
                  <span className={styles.langCount}>{count}</span>
                </div>
              ))
            )}
          </Card>

          <Card title="Activity — last 30 days" style={{ flex: 1 }}>
            {!hasActivity ? (
              <div className={styles.empty}>No activity yet</div>
            ) : (
              <div className={styles.activityChart}>
                {activityData.map(({ date, count }) => (
                  <div key={date} className={styles.activityCol} title={`${date}: ${count}`}>
                    <div
                      className={styles.activityBar}
                      style={{ height: `${(count / maxActivity) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Row 3: recent submissions */}
        <Table emptyMessage="No submissions yet." style={{ width: "100%" }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Question ID</th>
                <th>Language</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent_submissions ?? []).map((s, i) => (
                <tr key={i}>
                  <td>{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td>{s.question_id}</td>
                  <td>{s.lang}</td>
                  <td style={{ color: STATUS_COLOR[s.status] ?? "#64748b" }}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </div>
    </div>
  );
}
