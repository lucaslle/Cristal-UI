import { CrSelect } from '@cristal/react';

const cities = ['Austin', 'Boston', 'Chicago', 'Denver', 'London', 'Manchester', 'Montréal', 'New York', 'Québec', 'Seattle'];

export default function SelectSearchable() {
  return (
    <>
      <CrSelect label="City" name="city" placeholder="Choose a city" searchable>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </CrSelect>
      <CrSelect label="Skills" name="skills" placeholder="Choose skills" multiple searchable>
        {['Accessibility', 'Animation', 'CSS', 'Design system', 'React', 'Testing', 'TypeScript', 'Web Components'].map((skill) => (
          <option key={skill} value={skill}>
            {skill}
          </option>
        ))}
      </CrSelect>
    </>
  );
}
