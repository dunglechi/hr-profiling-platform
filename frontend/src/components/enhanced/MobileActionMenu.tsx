import React from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  useMediaQuery,
  useTheme,
  Backdrop
} from '@mui/material';
import {
  Menu as MenuIcon,
  Share,
  Download,
  Refresh,
  KeyboardArrowUp,
  Language
} from '@mui/icons-material';

interface MobileActionMenuProps {
  onShare?: () => void;
  onDownload?: () => void;
  onRefresh?: () => void;
  onScrollToTop?: () => void;
  onLanguageChange?: () => void;
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

const MobileActionMenu: React.FC<MobileActionMenuProps> = ({
  onShare,
  onDownload,
  onRefresh,
  onScrollToTop,
  onLanguageChange,
  open = false,
  onToggle
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isMobile) return null;

  const actions = [
    onLanguageChange && { icon: <Language />, name: 'Ngôn ngữ', onClick: onLanguageChange },
    onScrollToTop && { icon: <KeyboardArrowUp />, name: 'Lên đầu', onClick: onScrollToTop },
    onShare && { icon: <Share />, name: 'Chia sẻ', onClick: onShare },
    onDownload && { icon: <Download />, name: 'Tải về', onClick: onDownload },
    onRefresh && { icon: <Refresh />, name: 'Làm mới', onClick: onRefresh },
  ].filter(Boolean) as Array<{ icon: React.ReactElement; name: string; onClick: () => void }>;

  const handleOpen = () => onToggle?.(true);
  const handleClose = () => onToggle?.(false);

  return (
    <>
      <Backdrop open={open} onClick={handleClose} sx={{ zIndex: 999 }} />
      <SpeedDial
        ariaLabel="Mobile Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          zIndex: 1000,
          '& .MuiSpeedDial-fab': {
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            }
          }
        }}
        icon={<MenuIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        {actions.map((action, index) => (
          <SpeedDialAction
            key={index}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            sx={{
              '& .MuiSpeedDialAction-fab': {
                minHeight: 40,
                width: 40,
                height: 40
              }
            }}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default MobileActionMenu;