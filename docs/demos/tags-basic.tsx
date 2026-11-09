import { CrTagInput } from '@cristal/react';

export default function TagsBasic() {
  return <CrTagInput label="Sujets" name="topics" placeholder="design, animation…" values={['design', 'animation']} style={{ width: '100%', maxWidth: 420 }} />;
}
