import { h } from '@stencil/core';
import type { Messages } from './i18n';

/** Même règle que l'attribut accept du sélecteur natif, qu'un dépôt contourne : extensions (.pdf), types (application/pdf) ou familles (image/*). */
export const accepts = (file: File, accept?: string) =>
  !accept ||
  accept
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .some((type) => (type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type));

/** Taille lisible dans la langue du composant : « 12 ko », « 1,4 Mo », « 12 KB ». */
export const formatSize = (bytes: number, m: Messages) => {
  const index = Math.min(m.sizeUnits.length - 1, Math.floor(Math.log10(Math.max(bytes, 1)) / 3));
  return `${new Intl.NumberFormat(m.locale, { maximumFractionDigits: index > 1 ? 1 : 0 }).format(bytes / 1000 ** index)} ${m.sizeUnits[index]}`;
};

export const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

interface FileListProps {
  files: File[];
  m: Messages;
  disabled: boolean;
  onRemove: (index: number) => void;
}

export const FileList = ({ files, m, disabled, onRemove }: FileListProps) =>
  files.length > 0 && (
    <ul class="files" part="files">
      {files.map((file, index) => (
        <li class="file" part="file" key={`${file.name}-${file.size}-${file.lastModified}`}>
          <span class="name">{file.name}</span>
          <span class="size">{formatSize(file.size, m)}</span>
          <button type="button" class="remove" aria-label={m.fileRemove(file.name)} disabled={disabled} onClick={() => onRemove(index)}>
            {m.remove}
          </button>
        </li>
      ))}
    </ul>
  );
