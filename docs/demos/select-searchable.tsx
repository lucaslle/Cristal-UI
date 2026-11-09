import { CrSelect } from '@cristal/react';

const cities = ['Bordeaux', 'Écully', 'Évry', 'Lille', 'Lyon', 'Marseille', 'Nantes', 'Paris', 'Strasbourg', 'Toulouse'];

export default function SelectSearchable() {
  return (
    <>
      <CrSelect label="Ville" name="city" placeholder="Choisir une ville" searchable>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </CrSelect>
      <CrSelect label="Compétences" name="skills" placeholder="Choisir des compétences" multiple searchable>
        {['Accessibilité', 'Animation', 'CSS', 'Design system', 'React', 'Tests', 'TypeScript', 'Web Components'].map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
      </CrSelect>
    </>
  );
}
