import data from '@/generated/components.json';

interface Doc {
  name: string;
  docs: string;
}

interface Prop extends Doc {
  type: string;
  default?: string;
  required: boolean;
}

interface EventDoc {
  event: string;
  detail: string;
  docs: string;
}

interface ComponentDoc {
  tag: string;
  props: Prop[];
  events: EventDoc[];
  slots: Doc[];
  parts: Doc[];
}

const components = data.components as unknown as ComponentDoc[];
const reactEvent = (event: string) => `on${event[0].toUpperCase()}${event.slice(1)}`;

const labels = {
  en: { props: 'Properties', prop: 'Property', default: 'Default', events: 'Events', fallback: 'default', parts: 'CSS parts', partsLead: 'To style it from outside:', name: 'name' },
  fr: { props: 'Propriétés', prop: 'Propriété', default: 'Défaut', events: 'Événements', fallback: 'par défaut', parts: 'Parts CSS', partsLead: "Pour personnaliser le style depuis l'extérieur :", name: 'nom' },
};

// shortcut: les descriptions viennent des commentaires du code (en français) ; seuls les intitulés sont traduits.
export function ApiReference({ tag, lang = 'en' }: { tag: string; lang?: string }) {
  const l = labels[lang === 'fr' ? 'fr' : 'en'];
  const component = components.find((item) => item.tag === tag);
  if (!component) throw new Error(`Composant inconnu : ${tag}`);

  return (
    <>
      <h3>{l.props}</h3>
      <table>
        <thead>
          <tr>
            <th>{l.prop}</th>
            <th>Type</th>
            <th>{l.default}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {component.props.map((prop) => (
            <tr key={prop.name}>
              <td>
                <code>{prop.name}</code>
                {prop.required && ' (obligatoire)'}
              </td>
              <td>
                <code>{prop.type}</code>
              </td>
              <td>{prop.default ? <code>{prop.default}</code> : '—'}</td>
              <td>{prop.docs}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {component.events.length > 0 && (
        <>
          <h3>{l.events}</h3>
          <table>
            <thead>
              <tr>
                <th>React</th>
                <th>
                  <code>event.detail</code>
                </th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {component.events.map((event) => (
                <tr key={event.event}>
                  <td>
                    <code>{reactEvent(event.event)}</code>
                  </td>
                  <td>
                    <code>{event.detail}</code>
                  </td>
                  <td>{event.docs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {component.slots.length > 0 && (
        <>
          <h3>Slots</h3>
          <table>
            <thead>
              <tr>
                <th>Slot</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {component.slots.map((slot) => (
                <tr key={slot.name}>
                  <td>{slot.name ? <code>slot=&quot;{slot.name}&quot;</code> : l.fallback}</td>
                  <td>{slot.docs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>{l.parts}</h3>
      <p>
        {l.partsLead} <code>{`${tag}::part(${l.name}) { … }`}</code>
      </p>
      <table>
        <thead>
          <tr>
            <th>Part</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {component.parts.map((part) => (
            <tr key={part.name}>
              <td>
                <code>{part.name}</code>
              </td>
              <td>{part.docs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
