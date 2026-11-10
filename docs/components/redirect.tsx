const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Redirection d'un site statique : balise meta pour tous, lien si elle est bloquée. */
export function Redirect({ to, detect = false }: { to: string; detect?: boolean }) {
  const url = `${base}${to}`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${url}`} />
      {detect && (
        // À l'accueil, un navigateur réglé en français arrive sur /fr/, les autres sur /en/.
        <script dangerouslySetInnerHTML={{ __html: `if (/^fr\\b/i.test(navigator.language)) location.replace('${base}/fr/');` }} />
      )}
      <p>
        <a href={url}>Cristal documentation</a>
      </p>
    </>
  );
}
