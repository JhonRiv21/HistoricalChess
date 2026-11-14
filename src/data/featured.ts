// Champions shown in the home lineup, in chronological order. Photo ids point to src/content/photos.
import type { Localized } from '../i18n/ui';

export interface FeaturedChampion {
  id: string;
  photo: string;
  reign: string;
  matchSlug: string;
  line: Localized;
}

export const FEATURED: FeaturedChampion[] = [
  {
    id: 'capablanca', photo: 'capablanca-1921-rol', reign: '1921–1927', matchSlug: '1921-capablanca-lasker',
    line: {
      es: 'Le ganó el título a Lasker en La Habana sin perder una sola partida: 4 victorias y 10 tablas.',
      en: 'Took the title from Lasker in Havana without losing a single game: 4 wins and 10 draws.',
    },
  },
  {
    id: 'tal', photo: 'tal-1973', reign: '1960–1961', matchSlug: '1960-tal-botvinnik',
    line: {
      es: 'El mago de Riga. Derrotó a Botvinnik con 23 años, sacrificando piezas que nadie más se atrevía a dar.',
      en: 'The magician from Riga. Beat Botvinnik at 23 with sacrifices nobody else dared to make.',
    },
  },
  {
    id: 'fischer', photo: 'fischer-1971', reign: '1972–1975', matchSlug: '1972-fischer-spassky',
    line: {
      es: 'Rompió 24 años de dominio soviético en Reikiavik y renunció al título sin volver a defenderlo.',
      en: 'Ended 24 years of Soviet rule in Reykjavík, then gave up the title without defending it.',
    },
  },
  {
    id: 'karpov', photo: 'karpov-1979', reign: '1975–1985', matchSlug: '1978-karpov-korchnoi',
    line: {
      es: 'Campeón sin jugar en 1975 por la renuncia de Fischer. Luego lo defendió dos veces ante Korchnoi.',
      en: 'Became champion without playing in 1975 when Fischer withdrew, then defended it twice against Korchnoi.',
    },
  },
  {
    id: 'kasparov', photo: 'kasparov-1985', reign: '1985–2000', matchSlug: '1985-kasparov-karpov',
    line: {
      es: 'Cinco matches contra Karpov, 144 partidas entre los dos. Campeón a los 22 años.',
      en: 'Five matches against Karpov, 144 games between them. Champion at 22.',
    },
  },
  {
    id: 'carlsen', photo: 'carlsen-portrait', reign: '2013–2023', matchSlug: '2013-carlsen-anand',
    line: {
      es: 'Defendió el título cuatro veces y en 2023 decidió no volver a jugarlo.',
      en: 'Defended the title four times, then chose not to play for it in 2023.',
    },
  },
];
