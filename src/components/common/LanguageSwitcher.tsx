import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  SelectChangeEvent
} from '@mui/material';
import { Language } from '@mui/icons-material';

interface LanguageSwitcherProps {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'outlined',
  size = 'small',
  showIcon = true
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
  };

  const languages = [
    { code: 'vi', name: t('language.vi') },
    { code: 'en', name: t('language.en') }
  ];

  return (
    <Box sx={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
      {showIcon && <Language sx={{ color: 'text.secondary' }} />}
      <FormControl variant={variant} size={size} fullWidth>
        <InputLabel id="language-select-label">Language</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={i18n.language}
          label="Language"
          onChange={handleLanguageChange}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              {language.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;