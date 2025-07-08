import { Platform } from 'react-native';

// Custom transition configurations for different navigation scenarios
export const transitionConfigs = {
    // Smooth fade transition for tab navigation - gentler and longer with dark background
    tabTransition: {
        animation: 'fade',
        animationDuration: 500,
        animationTypeForReplace: 'push',
        presentation: 'card',
    },

    // Slide up transition for modals and overlays
    slideUpTransition: {
        animation: 'slide_from_bottom',
        animationDuration: 400,
        presentation: 'modal',
    },

    // Fade transition for stack navigation
    fadeTransition: {
        animation: 'fade',
        animationDuration: 250,
    },

    // Slide transition with different directions
    slideTransition: {
        animation: 'slide_from_right',
        animationDuration: 300,
    },

    // Zoom transition for important actions
    zoomTransition: {
        animation: 'default',
        animationDuration: 350,
        presentation: 'transparentModal',
    },

    // Parallax effect for onboarding
    parallaxTransition: {
        animation: 'slide_from_right',
        animationDuration: 500,
        presentation: 'card',
    },

    // Quick fade for loading states
    quickFadeTransition: {
        animation: 'fade',
        animationDuration: 150,
    },

    // Slide from left for back navigation
    slideFromLeftTransition: {
        animation: 'slide_from_left',
        animationDuration: 300,
    },

    // Scale transition for important actions
    scaleTransition: {
        animation: 'default',
        animationDuration: 400,
        presentation: 'transparentModal',
    },
};

// Platform-specific transition adjustments
export const getPlatformTransition = (baseTransition: any) => {
    if (Platform.OS === 'ios') {
        return {
            ...baseTransition,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
        };
    }

    return {
        ...baseTransition,
        gestureEnabled: false,
    };
};

// Transition presets for different scenarios
export const transitionPresets = {
    // For tab navigation - smoother and gentler with dark background
    tabs: getPlatformTransition({
        ...transitionConfigs.tabTransition,
        animationDuration: 800,
        presentation: 'card',
        cardStyle: {
            backgroundColor: '#000000', // Dark background to prevent light flash
        },
        cardOverlayEnabled: false,
    }),

    // For modal screens
    modal: getPlatformTransition(transitionConfigs.slideUpTransition),

    // For stack navigation
    stack: getPlatformTransition(transitionConfigs.slideTransition),

    // For onboarding flows
    onboarding: getPlatformTransition(transitionConfigs.parallaxTransition),

    // For quick transitions
    quick: getPlatformTransition(transitionConfigs.quickFadeTransition),

    // For important actions
    important: getPlatformTransition(transitionConfigs.zoomTransition),

    // For back navigation
    back: getPlatformTransition(transitionConfigs.slideFromLeftTransition),

    // For fade transitions
    fade: getPlatformTransition(transitionConfigs.fadeTransition),

    // For slide transitions
    slide: getPlatformTransition(transitionConfigs.slideTransition),

    // For parallax transitions
    parallax: getPlatformTransition(transitionConfigs.parallaxTransition),
}; 