import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { languages } from '../hooks/useCodeExecution.jsx';
import { PrimaryButton } from '../components/PrimaryButton.jsx';

export function MatchHeader({ 
  lang, setLang, onRun, onSubmit, onLeave, loading, showRun = false,
}) {
  const styles = {
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.5rem 1.5rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: 'white',
    },
    left: {
      display: 'flex',
      alignItems: 'center',
    },
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      gap: '12px',
    },
    right: {
      display: 'flex',
      alignItems: 'center',
    },
    formControl: {
      width: '140px',
    },
    button: {
      minWidth: '80px',
    },
    runButtonContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  return (
    <div style={styles.header}>
      {showRun ? (
        <div style={styles.left}>
          <FormControl size="small" sx={styles.formControl}>
            <InputLabel shrink id="language-select-label">
              Code
            </InputLabel>
            <Select
              labelId="language-select-label"
              label="Code"
              value={lang}
              onChange={(ev) => setLang(ev.target.value)}
            >
              {Object.values(languages).map((l) => (
                <MenuItem key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      ) : <div style={styles.left} /> }

      <div style={styles.center}>
        {showRun && (
          <>
            <PrimaryButton
              text={
                <div style={styles.runButtonContent}>
                  <PlayArrowIcon sx={{ fontSize: '1.2rem' }} />
                  <span>Run</span>
                </div>
              }
              onClick={onRun}
              disabled={loading}
              color="blue"
              fullWidth={false}
            />
            <PrimaryButton
              text="Submit"
              onClick={onSubmit}
              disabled={loading}
              color="green-outline"
              fullWidth={false}
            />
          </>
        )}
      </div>

      <div style={styles.right}>
        <PrimaryButton
          text="Leave"
          onClick={onLeave}
          color="red"
          fullWidth={false}
        />
      </div>
    </div>
  );
}