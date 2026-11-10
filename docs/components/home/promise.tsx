import Link from 'next/link';
import { Logo } from '@/components/logo';

const promises = [
  ['Clavier partout', 'Flèches, Origine, Fin, Échap : chaque composant suit les motifs ARIA connus, et tout ce qui se fait à la souris se fait au clavier.'],
  ['Lecteurs d’écran', 'Libellés obligatoires, changements annoncés (« Statut déplacée en position 3 »), erreurs reliées aux champs.'],
  ['Mouvement maîtrisé', 'Animations seulement en réponse à vos gestes, jamais au chargement, et coupées avec « réduire les animations ».'],
  ['Formulaires natifs', 'Valeur envoyée, validation en français et réinitialisation, comme un champ HTML.'],
  ['Rendu serveur', 'Avec Next.js, les composants arrivent déjà dessinés dans le HTML.'],
  ['Contraste calculé', 'Quelle que soit votre couleur, le texte posé dessus reste lisible.'],
];

export function Pledge() {
  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-fd-primary">Accessibilité</p>
        <h2 className="font-display mt-3 max-w-3xl text-4xl font-bold sm:text-5xl">Accessible pour de vrai, pas en option.</h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border bg-fd-border sm:grid-cols-2 lg:grid-cols-3">
          {promises.map(([title, text]) => (
            <li key={title} className="flex flex-col gap-2 bg-fd-background p-8">
              <span className="grid size-10 place-items-center rounded-xl bg-fd-primary text-fd-primary-foreground" aria-hidden="true">
                ✓
              </span>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="text-fd-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="stage">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center">
          <Logo size={56} />
          <h2 className="font-display text-4xl font-extrabold sm:text-6xl">
            Prêt à faire <span className="prism-text">briller</span> votre interface ?
          </h2>
          <p className="stage-muted max-w-xl text-lg">Deux paquets, une ligne d&apos;import, et vos écrans React et Next.js gagnent des composants soignés et accessibles.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/docs/installation" className="btn-glow">
              Installer Cristal <span aria-hidden="true">→</span>
            </Link>
            <Link href="/docs/accessibilite" className="btn-ghost">
              Notre engagement accessibilité
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
