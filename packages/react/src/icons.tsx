import type { CSSProperties, SVGProps } from 'react';
import {
  iconChevronDown,
  iconChevronUp,
  iconChevronLeft,
  iconChevronRight,
  iconArrowLeft,
  iconArrowRight,
  iconClose,
  iconCheck,
  iconPlus,
  iconMinus,
  iconSearch,
  iconMenu,
  iconMore,
  iconFilter,
  iconSettings,
  iconEdit,
  iconTrash,
  iconCopy,
  iconDownload,
  iconUpload,
  iconLink,
  iconExternalLink,
  iconRefresh,
  iconHome,
  iconUser,
  iconMail,
  iconBell,
  iconCalendar,
  iconClock,
  iconLock,
  iconEye,
  iconEyeOff,
  iconHeart,
  iconStar,
  iconCart,
  iconInfo,
  iconSuccess,
  iconWarning,
  iconError,
} from '@cristal-ui/core/dist/components';

export type CrIconProps = Omit<SVGProps<SVGSVGElement>, 'color'> & {
  /** Taille : un nombre en pixels ou une longueur CSS. Par défaut, --cr-icon-size, sinon 24 px. */
  size?: number | string;
  /** Couleur du trait. Par défaut, la couleur du texte. */
  color?: string;
  /** Nom lu par les lecteurs d'écran. Sans lui, l'icône est décorative et masquée. */
  label?: string;
};

/** Une icône Cristal en SVG, rendue telle quelle côté serveur comme côté client. */
const icon = (name: string, paths: string[]) => {
  const Icon = ({ size, color, label, style, ...props }: CrIconProps) => {
    const length = typeof size === 'number' ? `${size}px` : (size ?? 'var(--cr-icon-size, 24px)');
    const box: CSSProperties = { flex: 'none', width: length, height: length, color, ...style };
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        style={box}
        {...props}
      >
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    );
  };
  Icon.displayName = name;
  return Icon;
};

export const CrIconChevronDown = /* @__PURE__ */ icon('CrIconChevronDown', iconChevronDown);
export const CrIconChevronUp = /* @__PURE__ */ icon('CrIconChevronUp', iconChevronUp);
export const CrIconChevronLeft = /* @__PURE__ */ icon('CrIconChevronLeft', iconChevronLeft);
export const CrIconChevronRight = /* @__PURE__ */ icon('CrIconChevronRight', iconChevronRight);
export const CrIconArrowLeft = /* @__PURE__ */ icon('CrIconArrowLeft', iconArrowLeft);
export const CrIconArrowRight = /* @__PURE__ */ icon('CrIconArrowRight', iconArrowRight);
export const CrIconClose = /* @__PURE__ */ icon('CrIconClose', iconClose);
export const CrIconCheck = /* @__PURE__ */ icon('CrIconCheck', iconCheck);
export const CrIconPlus = /* @__PURE__ */ icon('CrIconPlus', iconPlus);
export const CrIconMinus = /* @__PURE__ */ icon('CrIconMinus', iconMinus);
export const CrIconSearch = /* @__PURE__ */ icon('CrIconSearch', iconSearch);
export const CrIconMenu = /* @__PURE__ */ icon('CrIconMenu', iconMenu);
export const CrIconMore = /* @__PURE__ */ icon('CrIconMore', iconMore);
export const CrIconFilter = /* @__PURE__ */ icon('CrIconFilter', iconFilter);
export const CrIconSettings = /* @__PURE__ */ icon('CrIconSettings', iconSettings);
export const CrIconEdit = /* @__PURE__ */ icon('CrIconEdit', iconEdit);
export const CrIconTrash = /* @__PURE__ */ icon('CrIconTrash', iconTrash);
export const CrIconCopy = /* @__PURE__ */ icon('CrIconCopy', iconCopy);
export const CrIconDownload = /* @__PURE__ */ icon('CrIconDownload', iconDownload);
export const CrIconUpload = /* @__PURE__ */ icon('CrIconUpload', iconUpload);
export const CrIconLink = /* @__PURE__ */ icon('CrIconLink', iconLink);
export const CrIconExternalLink = /* @__PURE__ */ icon('CrIconExternalLink', iconExternalLink);
export const CrIconRefresh = /* @__PURE__ */ icon('CrIconRefresh', iconRefresh);
export const CrIconHome = /* @__PURE__ */ icon('CrIconHome', iconHome);
export const CrIconUser = /* @__PURE__ */ icon('CrIconUser', iconUser);
export const CrIconMail = /* @__PURE__ */ icon('CrIconMail', iconMail);
export const CrIconBell = /* @__PURE__ */ icon('CrIconBell', iconBell);
export const CrIconCalendar = /* @__PURE__ */ icon('CrIconCalendar', iconCalendar);
export const CrIconClock = /* @__PURE__ */ icon('CrIconClock', iconClock);
export const CrIconLock = /* @__PURE__ */ icon('CrIconLock', iconLock);
export const CrIconEye = /* @__PURE__ */ icon('CrIconEye', iconEye);
export const CrIconEyeOff = /* @__PURE__ */ icon('CrIconEyeOff', iconEyeOff);
export const CrIconHeart = /* @__PURE__ */ icon('CrIconHeart', iconHeart);
export const CrIconStar = /* @__PURE__ */ icon('CrIconStar', iconStar);
export const CrIconCart = /* @__PURE__ */ icon('CrIconCart', iconCart);
export const CrIconInfo = /* @__PURE__ */ icon('CrIconInfo', iconInfo);
export const CrIconSuccess = /* @__PURE__ */ icon('CrIconSuccess', iconSuccess);
export const CrIconWarning = /* @__PURE__ */ icon('CrIconWarning', iconWarning);
export const CrIconError = /* @__PURE__ */ icon('CrIconError', iconError);
