// Match page content for Fischer–Spassky 1972. Game results come from the PGN (pgnmentor).
import analysis from '../data/game-1972-6.json';

export const MATCH_1972 = {
  id: 'match-1972',
  title: 'Campeonato del Mundo 1972',
  site: 'Reikiavik, Islandia',
  dates: '11 de julio al 1 de septiembre',
  white: { name: 'Bobby Fischer', short: 'Fischer', country: 'Estados Unidos', elo: 2785, photo: 'fischer71', role: 'Retador' },
  black: { name: 'Borís Spassky', short: 'Spassky', country: 'URSS', elo: 2660, photo: 'spassky73', role: 'Campeón' },
  score: [12.5, 8.5],
  // Winner per game from Fischer's point of view: 1 win, 0.5 draw, 0 loss.
  results: [0, 0, 1, 0.5, 1, 1, 0.5, 1, 0.5, 1, 0, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1],
  notes: { 2: 'Fischer no se presentó', 3: 'Jugada en un cuarto trasero' },
  featuredGame: { round: 6, opening: 'Gambito de Dama, defensa Tartakower', eco: 'D59', analysis },
  gallery: ['fischer72', 'euwe72', 'spassky70', 'fischer71', 'spassky73'],
  galleryNote: 'No hay fotos del match en Reikiavik con licencia libre. Mostramos a los dos jugadores en esa época.',
  facts: [
    { text: 'Fischer empezó perdiendo 0–2: cayó en la partida 1 y no se presentó a la 2 en protesta por las cámaras.', },
    { text: 'La partida 3 se jugó en un cuarto trasero, lejos del público. Fue la primera victoria de su vida contra Spassky.', },
    { text: 'En la partida 6 Fischer abrió con 1.c4 en vez de su eterno 1.e4. Al terminar, Spassky se unió al aplauso del público.', },
    { text: 'El financista británico Jim Slater duplicó la bolsa a 250.000 dólares para convencer a Fischer de jugar.', },
    { text: 'Fischer fue el primer campeón no soviético desde 1948 y el primero nacido en Estados Unidos.', },
  ],
  sources: [{ label: 'Wikipedia: World Chess Championship 1972', href: 'https://en.wikipedia.org/wiki/World_Chess_Championship_1972' }],
};
