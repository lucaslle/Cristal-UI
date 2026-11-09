'use client';

import type React from 'react';
import { CrAccordion, CrAccordionItem } from '@cristal/react';

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--cr-spacing-xl)' };
const scene = (from: string, to: string): React.CSSProperties => ({ height: '100%', minHeight: 140, borderRadius: 'var(--cr-radius-m)', background: `linear-gradient(160deg, ${from}, ${to})` });

export function AccordionDemo() {
  return (
    <div style={grid}>
      <section>
        <h3>Recette</h3>
        <CrAccordion toggleAll>
          <CrAccordionItem label="Présentation">Une tarte fine aux pommes, prête en 45 minutes.</CrAccordionItem>
          <CrAccordionItem label="Ingrédients">4 pommes, 1 pâte feuilletée, 30 g de beurre, 2 cuillères de sucre.</CrAccordionItem>
          <CrAccordionItem label="Étapes">Étaler la pâte, couper les pommes en lamelles, cuire 25 minutes à 200 °C.</CrAccordionItem>
        </CrAccordion>
      </section>

      <section>
        <h3>Randonnées</h3>
        <CrAccordion variant="panels">
          <CrAccordionItem label="Sommets">
            <div style={scene('#4c1d95', '#f59e0b')} />
          </CrAccordionItem>
          <CrAccordionItem label="Côte">
            <div style={scene('#0e7490', '#a5f3fc')} />
          </CrAccordionItem>
          <CrAccordionItem label="Prairie">
            <div style={scene('#3f6212', '#bef264')} />
          </CrAccordionItem>
          <CrAccordionItem label="Forêt">
            <div style={scene('#14532d', '#4ade80')} />
          </CrAccordionItem>
        </CrAccordion>
      </section>

      <section>
        <h3>Projet</h3>
        <CrAccordion animation="accent-bar" numbered>
          <CrAccordionItem label="Conception">Maquettes et parcours validés avec l'équipe.</CrAccordionItem>
          <CrAccordionItem label="Développement">Composants, tests et intégration continue.</CrAccordionItem>
          <CrAccordionItem label="Lancement">Mise en ligne et suivi des premiers retours.</CrAccordionItem>
        </CrAccordion>
      </section>

      <section>
        <h3>Facture</h3>
        <CrAccordion animation="cascade">
          <CrAccordionItem label="Total">
            <span slot="meta">128,40 €</span>
            <Line label="Abonnement" amount="99" text="99,00 €" />
            <Line label="Options" amount="19.9" text="19,90 €" />
            <Line label="TVA" amount="9.5" text="9,50 €" />
          </CrAccordionItem>
        </CrAccordion>
      </section>

      <section>
        <h3>Statistiques</h3>
        <CrAccordion animation="cascade">
          <CrAccordionItem label="Vues cette semaine">
            <span slot="meta">4 200 (+12 %)</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }} role="img" aria-label="Vues par jour, de 300 le lundi à 900 le dimanche">
              {[30, 45, 40, 60, 55, 75, 90].map((value, i) => (
                <div key={i} data-cr-grow="" style={{ flex: 1, height: `${value}%`, borderRadius: 4, background: 'var(--cr-color-primary)' }} />
              ))}
            </div>
          </CrAccordionItem>
        </CrAccordion>
      </section>
    </div>
  );
}

function Line({ label, amount, text }: { label: string; amount: string; text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span>{label}</span>
      <span data-cr-count={amount}>{text}</span>
    </div>
  );
}
