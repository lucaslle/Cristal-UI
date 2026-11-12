import { AttachInternals, Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { replayError } from '../../utils/field-error';
import { FieldHeader, describedBy, ErrorAnimation } from '../../utils/field';
import { FileList, accepts, sameFile } from '../../utils/file-upload';
import { t } from '../../utils/i18n';

/**
 * Dépôt de fichiers : une zone où glisser des fichiers, qui est aussi un vrai sélecteur de fichiers natif, atteignable au clavier.
 * Les fichiers choisis s'affichent en liste, avec leur taille et un bouton Retirer. La zone respire quand on y glisse des fichiers.
 * @part label - Le libellé.
 * @part zone - La zone de dépôt.
 * @part files - La liste des fichiers.
 * @part file - Un fichier de la liste.
 * @part hint - Le texte d'aide.
 * @part error - Le message des fichiers refusés.
 */
@Component({
  tag: 'cr-file-upload',
  styleUrls: ['../../global/field.css', '../../global/field-error.css', '../../global/field-error-motion.css', 'cr-file-upload.css'],
  shadow: { delegatesFocus: true },
  formAssociated: true,
})
export class CrFileUpload {
  @Element() el!: HTMLCrFileUploadElement;
  @AttachInternals() internals: ElementInternals;

  /** Libellé affiché au-dessus de la zone (obligatoire). */
  @Prop() label!: string;
  /** Texte d'aide (formats, taille), lu par les lecteurs d'écran. */
  @Prop() hint?: string;
  /** Nom envoyé avec le formulaire, une fois par fichier. */
  @Prop({ reflect: true }) name?: string;
  /** Types acceptés, comme l'attribut accept natif (« .pdf,image/* ») ; appliqué aussi aux fichiers déposés. */
  @Prop() accept?: string;
  /** Plusieurs fichiers ; sinon un nouveau fichier remplace le précédent. */
  @Prop() multiple = false;
  /** Désactive le champ. */
  @Prop({ reflect: true }) disabled = false;
  /** Animation de l'erreur quand elle apparaît et à chaque envoi refusé : none (par défaut), zigzag, pop, drop, echo, jitter ou wobble. */
  @Prop({ reflect: true }) errorAnimation: ErrorAnimation = 'none';

  /** Émis quand la liste des fichiers change ; detail : les fichiers. */
  @Event() crChange: EventEmitter<File[]>;

  @State() files: File[] = [];
  @State() rejected: string[] = [];
  @State() over = false;
  @State() status = '';

  private input?: HTMLInputElement;
  private focusAfterRemove?: number;

  componentDidRender() {
    const data = new FormData();
    this.files.forEach((file) => data.append(this.name!, file));
    this.internals.setFormValue(this.name && this.files.length ? data : null);
    if (this.focusAfterRemove === undefined) return;
    // Le bouton retiré disparaît : le focus passe au fichier suivant, au précédent, ou au sélecteur quand la liste est vide.
    const buttons = this.el.shadowRoot!.querySelectorAll<HTMLElement>('.remove');
    (buttons[Math.min(this.focusAfterRemove, buttons.length - 1)] ?? this.input)?.focus();
    this.focusAfterRemove = undefined;
  }

  formResetCallback() {
    this.files = [];
    this.rejected = [];
    this.status = '';
  }

  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  private add(picked: File[]) {
    const m = t(this.el);
    const kept = picked.filter((file) => accepts(file, this.accept));
    this.rejected = picked.filter((file) => !kept.includes(file)).map((file) => file.name);
    if (this.rejected.length) replayError(this.el);
    const added = this.multiple ? kept.filter((file) => !this.files.some((other) => sameFile(other, file))) : kept.slice(0, 1);
    if (added.length) {
      this.files = this.multiple ? [...this.files, ...added] : added;
      this.crChange.emit(this.files);
    }
    const addedText = added.length ? m.filesAdded(added.map((file) => file.name), m.fileCount(this.files.length)) : '';
    this.status = [addedText, this.rejected.length ? m.filesRejected(this.rejected) : ''].filter(Boolean).join(' ');
  }

  private remove = (index: number) => {
    const m = t(this.el);
    const removed = this.files[index];
    this.files = this.files.filter((_, other) => other !== index);
    this.rejected = [];
    this.status = m.fileRemoved(removed.name, m.fileCount(this.files.length));
    this.focusAfterRemove = index;
    this.crChange.emit(this.files);
  };

  private onChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.add(Array.from(input.files ?? []));
    // Vidé pour que choisir de nouveau le même fichier déclenche change ; la liste vit dans l'état du composant.
    input.value = '';
  };

  private onDrop = (event: DragEvent) => {
    event.preventDefault();
    this.over = false;
    this.add(Array.from(event.dataTransfer?.files ?? []));
  };

  render() {
    const m = t(this.el);
    const id = 'control';
    const error = this.rejected.length ? m.filesRejected(this.rejected) : '';
    return (
      <div class="field">
        <FieldHeader id={id} label={this.label} required={false} hint={this.hint} error={error} animation={this.errorAnimation} />
        <div class="zone error-frame" part="zone" data-over={this.over ? '' : undefined}>
          <svg class="icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path d="M12 16V4m0 0L7 9m5-5l5 5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span class="prompt" aria-hidden="true">
            {m.fileDrop} <span class="browse">{m.fileBrowse}</span>
          </span>
          <input
            ref={(el) => (this.input = el)}
            id={id}
            class="input"
            type="file"
            accept={this.accept}
            multiple={this.multiple}
            disabled={this.disabled}
            aria-describedby={describedBy({ id, hint: this.hint, error })}
            onChange={this.onChange}
            onDragOver={(event: DragEvent) => (event.preventDefault(), (this.over = true))}
            onDragLeave={() => (this.over = false)}
            onDrop={this.onDrop}
          />
        </div>
        <FileList files={this.files} m={m} disabled={this.disabled} onRemove={this.remove} />
        <span class="sr-only" role="status">
          {this.status}
        </span>
      </div>
    );
  }
}
