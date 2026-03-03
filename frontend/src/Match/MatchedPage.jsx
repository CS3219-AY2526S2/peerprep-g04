import Typography from '@mui/material/Typography';
import styles from './MatchedPage.module.css';
import MDEditor from "@uiw/react-md-editor";

// this is just a placeholder component.
export function MatchedPage(props) {
  const { state } = props;
  const { users, question } = state

  return (
    <div className={styles.matchedPage}>
      <Typography>{'Users: ' + users.join(' ')}</Typography>
      <MDEditor
        value={question?.title}
        preview="preview"   // makes it view-only
        height={400}        // optional, set height
      />
    </div>
  )
}