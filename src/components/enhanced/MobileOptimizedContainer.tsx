import React from 'react';
import {
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Fab,
  Zoom,
  useScrollTrigger
} from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

interface MobileOptimizedContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

// Scroll to top button component
const ScrollTop: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
};

const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({ 
  children, 
  maxWidth = 'lg' 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Container
        maxWidth={maxWidth}
        sx={{
          px: isMobile ? 1 : isTablet ? 2 : 3,
          py: isMobile ? 1 : 2,
          minHeight: '100vh',
          // Optimize for mobile touch scrolling
          WebkitOverflowScrolling: 'touch',
          // Prevent horizontal scroll on mobile
          overflowX: 'hidden',
          // Improve mobile performance
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </Container>

      {/* Scroll to top button for mobile */}
      {isMobile && (
        <ScrollTop>
          <Fab 
            color="primary" 
            size="small" 
            aria-label="scroll back to top"
            sx={{
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </ScrollTop>
      )}
    </>
  );
};

export default MobileOptimizedContainer;