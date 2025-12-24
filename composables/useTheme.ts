export function useTheme() {
    const isDark = useDark({
        selector: 'html',
        attribute: 'class',
        valueDark: 'dark',
        valueLight: '',
    });

    const toggleDark = useToggle(isDark);

    function toggleTheme() {
        toggleDark();
    }

    function setTheme(theme: 'light' | 'dark') {
        isDark.value = theme === 'dark';
    }

    return {
        isDark,
        toggleTheme,
        setTheme,
    };
}
