import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export type NavigationTransition =
    | 'fade'
    | 'slide'
    | 'zoom'
    | 'parallax'
    | 'modal'
    | 'quick'
    | 'important';

interface NavigationOptions {
    transition?: NavigationTransition;
    replace?: boolean;
}

export const useCustomNavigation = () => {
    const router = useRouter();

    const navigate = useCallback((route: any, options: NavigationOptions = {}) => {
        const { transition = 'slide', replace = false } = options;

        // Apply different transition configurations based on context
        switch (transition) {
            case 'fade':
                // Quick fade for loading states or simple transitions
                router.push(route);
                break;

            case 'slide':
                // Standard slide transition
                router.push(route);
                break;

            case 'zoom':
                // Zoom transition for important actions
                router.push(route);
                break;

            case 'parallax':
                // Parallax effect for onboarding flows
                router.push(route);
                break;

            case 'modal':
                // Modal presentation for overlays
                router.push(route);
                break;

            case 'quick':
                // Quick transition for immediate feedback
                router.push(route);
                break;

            case 'important':
                // Important action transition
                router.push(route);
                break;

            default:
                router.push(route);
        }
    }, [router]);

    const goBack = useCallback((options: NavigationOptions = {}) => {
        const { transition = 'slide' } = options;

        // Use slide from left for back navigation
        router.back();
    }, [router]);

    const replace = useCallback((route: any, options: NavigationOptions = {}) => {
        const { transition = 'fade' } = options;

        // Use fade for replacements
        router.replace(route);
    }, [router]);

    return {
        navigate,
        goBack,
        replace,
    };
};

// Context-specific navigation helpers
export const useNavigationHelpers = () => {
    const { navigate, goBack, replace } = useCustomNavigation();

    return {
        // Tab navigation - smooth fade
        navigateToTab: (route: any) => navigate(route, { transition: 'fade' }),

        // Stack navigation - slide
        navigateToScreen: (route: any) => navigate(route, { transition: 'slide' }),

        // Modal navigation - slide up
        navigateToModal: (route: any) => navigate(route, { transition: 'modal' }),

        // Important actions - zoom
        navigateToImportant: (route: any) => navigate(route, { transition: 'zoom' }),

        // Onboarding - parallax
        navigateToOnboarding: (route: any) => navigate(route, { transition: 'parallax' }),

        // Quick actions - quick fade
        navigateQuick: (route: any) => navigate(route, { transition: 'quick' }),

        // Back navigation - slide from left
        goBackWithTransition: () => goBack({ transition: 'slide' }),

        // Replace with fade
        replaceWithFade: (route: any) => replace(route, { transition: 'fade' }),
    };
}; 