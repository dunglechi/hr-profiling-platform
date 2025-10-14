import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Language,
  Check
} from '@mui/icons-material';
import { useSecureTranslation } from '../../hooks/useSecureTranslation';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  {
    code: 'vi',
    name: 'Vietnamese',
    flag: '🇻🇳',
    nativeName: 'Tiếng Việt'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  }
];

interface LanguageSwitcherProps {
  variant?: 'icon' | 'chip' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'icon',
  size = 'medium'
}) => {
  const { language, changeLanguage, isLoading } = useSecureTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== language) {
      await changeLanguage(languageCode);
    }
    handleClose();
  };

  const renderTrigger = () => {
    switch (variant) {
      case 'chip':
        return (
          <Tooltip title="Chọn ngôn ngữ / Select Language">
            <Chip
              icon={<Language />}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <span>{currentLanguage.flag}</span>
                  <span>{currentLanguage.nativeName}</span>
                </Box>
              }
              onClick={handleClick}
              disabled={isLoading}
              variant="outlined"
              sx={{ cursor: 'pointer' }}
            />
          </Tooltip>
        );
      
      case 'text':
        return (
          <Box 
            onClick={handleClick}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <span style={{ fontSize: '1.2em' }}>{currentLanguage.flag}</span>
            <Typography variant="body2">
              {currentLanguage.nativeName}
            </Typography>
          </Box>
        );
      
      case 'icon':
      default:
        return (
          <Tooltip title="Chọn ngôn ngữ / Select Language">
            <IconButton
              onClick={handleClick}
              size={size}
              disabled={isLoading}
              sx={{
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Language />
            </IconButton>
          </Tooltip>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === language}
            disabled={isLoading}
          >
            <ListItemIcon>
              {lang.code === language ? (
                <Check color="primary" />
              ) : (
                <span style={{ fontSize: '1.2em', width: '24px', textAlign: 'center' }}>
                  {lang.flag}
                </span>
              )}
            </ListItemIcon>
            <ListItemText>
              <Box display="flex" flexDirection="column">
                <Typography variant="body2" fontWeight={lang.code === language ? 'bold' : 'normal'}>
                  {lang.nativeName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lang.name}
                </Typography>
              </Box>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;