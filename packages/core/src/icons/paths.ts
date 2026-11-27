/**
 * Icônes Cristal : grille de 24 × 24, trait de 2 aux bouts arrondis, sans remplissage, couleur du texte (currentColor).
 * Chaque icône est une liste de tracés SVG (attribut d), exportée seule pour que le bundler ne garde que celles importées.
 */
const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`;
const dot = (cx: number, cy: number) => circle(cx, cy, 1);

export const iconChevronDown = ['M6 9l6 6 6-6'];
export const iconChevronUp = ['M6 15l6-6 6 6'];
export const iconChevronLeft = ['M15 6l-6 6 6 6'];
export const iconChevronRight = ['M9 6l6 6-6 6'];
export const iconArrowLeft = ['M19 12H5', 'M11 6l-6 6 6 6'];
export const iconArrowRight = ['M5 12h14', 'M13 6l6 6-6 6'];
export const iconClose = ['M6 6l12 12', 'M18 6L6 18'];
export const iconCheck = ['M5 12l5 5 9-10'];
export const iconPlus = ['M12 5v14', 'M5 12h14'];
export const iconMinus = ['M5 12h14'];
export const iconSearch = [circle(11, 11, 6.5), 'M20 20l-4.4-4.4'];
export const iconMenu = ['M4 7h16', 'M4 12h16', 'M4 17h16'];
export const iconMore = [dot(5, 12), dot(12, 12), dot(19, 12)];
export const iconFilter = ['M4 5h16l-6 7.5V19l-4-2v-4.5z'];
export const iconSettings = ['M4 7h4', 'M12 7h8', circle(10, 7, 2), 'M4 12h10', 'M18 12h2', circle(16, 12, 2), 'M4 17h2', 'M10 17h10', circle(8, 17, 2)];
export const iconEdit = ['M4 20h4L19 9l-4-4L4 16z', 'M13 7l4 4'];
export const iconTrash = ['M4 7h16', 'M10 7V4h4v3', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'];
export const iconCopy = ['M10 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z', 'M15 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h4'];
export const iconDownload = ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'];
export const iconUpload = ['M12 15V4', 'M7 9l5-5 5 5', 'M5 20h14'];
export const iconLink = ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'];
export const iconExternalLink = ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'];
export const iconRefresh = ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v5h-5'];
export const iconHome = ['M4 11l8-7 8 7', 'M6 9.5V20h12V9.5', 'M10 20v-5h4v5'];
export const iconUser = [circle(12, 8, 4), 'M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6'];
export const iconMail = ['M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M3 7l9 6 9-6'];
export const iconBell = ['M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z', 'M10 21h4'];
export const iconCalendar = ['M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M4 10h16', 'M8 3v4', 'M16 3v4'];
export const iconClock = [circle(12, 12, 9), 'M12 7v5l3 2'];
export const iconLock = ['M8 11V8a4 4 0 0 1 8 0v3', 'M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z'];
export const iconEye = ['M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z', circle(12, 12, 3)];
export const iconEyeOff = ['M10.6 5.1A9 9 0 0 1 12 5c6 0 9.5 7 9.5 7a16 16 0 0 1-2.2 3.2', 'M6.6 6.6C3.9 8.4 2.5 12 2.5 12s3.5 7 9.5 7a9 9 0 0 0 5.4-1.6', 'M9.9 9.9a3 3 0 0 0 4.2 4.2', 'M4 4l16 16'];
export const iconHeart = ['M12 20s-8-4.6-8-10.3A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.7C20 15.4 12 20 12 20z'];
export const iconStar = ['M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z'];
export const iconCart = ['M3 4h2.5l2.2 11h10.6L20 7.5H6.2', dot(9.5, 19.5), dot(17, 19.5)];
export const iconInfo = [circle(12, 12, 9), 'M12 11v5', 'M12 8h.01'];
export const iconSuccess = [circle(12, 12, 9), 'M8 12.5l2.7 2.7L16 9.5'];
export const iconWarning = ['M12 4l9 16H3z', 'M12 10v4', 'M12 17h.01'];
export const iconError = [circle(12, 12, 9), 'M12 7.5v5.5', 'M12 16.5h.01'];
