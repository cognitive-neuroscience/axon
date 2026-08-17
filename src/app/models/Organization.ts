import { SupportedLangs } from './enums';

export interface Organization {
    id: number;
    name: string;
    logoPath: string;
    supportedLangs: SupportedLangs[];
}

const SELECTABLE_LANGS: SupportedLangs[] = [SupportedLangs.EN, SupportedLangs.FR, SupportedLangs.NL];

export function parseSupportedLangs(supportedLangs: SupportedLangs[] | string | null | undefined): SupportedLangs[] {
    let parsed: unknown = supportedLangs;

    if (typeof supportedLangs === 'string') {
        try {
            parsed = JSON.parse(supportedLangs);
        } catch {
            parsed = [];
        }
    }

    if (!Array.isArray(parsed)) {
        return [...SELECTABLE_LANGS];
    }

    const langs = parsed.filter((lang): lang is SupportedLangs => SELECTABLE_LANGS.includes(lang as SupportedLangs));
    return langs.length > 0 ? langs : [...SELECTABLE_LANGS];
}

export function getOrganizationSupportedLangs(organization: Organization | null | undefined): SupportedLangs[] {
    return parseSupportedLangs(organization?.supportedLangs);
}

export function isOrganizationSupportedLang(
    lang: SupportedLangs | string | null | undefined,
    organization: Organization | null | undefined
): boolean {
    if (!lang || lang === SupportedLangs.NONE) return false;
    return getOrganizationSupportedLangs(organization).includes(lang as SupportedLangs);
}
