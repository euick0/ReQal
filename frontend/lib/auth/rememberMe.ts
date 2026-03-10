const REMEMBER_ME_KEY = "pap_remember_me";
const REMEMBER_ME_DAYS = 60;

interface RememberMeData {
    expiresAt: number;
}

export const setRememberMe = (): void => {
    const expiresAt = Date.now() + REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000;
    const data: RememberMeData = { expiresAt };
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(data));
};

export const isRememberMeValid = (): boolean => {
    const raw = localStorage.getItem(REMEMBER_ME_KEY);
    if (!raw) return false;
    try {
        const { expiresAt }: RememberMeData = JSON.parse(raw);
        return Date.now() < expiresAt;
    } catch {
        return false;
    }
};

export const clearRememberMe = (): void => {
    localStorage.removeItem(REMEMBER_ME_KEY);
};
