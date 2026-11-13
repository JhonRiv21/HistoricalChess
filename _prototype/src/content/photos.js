// Photo registry: every image carries its source, author and license for the credits.
import capablanca from '../assets/photos/capablanca.jpg';
import tal from '../assets/photos/tal.jpg';
import fischer71 from '../assets/photos/fischer71.jpg';
import fischer72 from '../assets/photos/fischer72.jpg';
import euwe72 from '../assets/photos/euwe72.jpg';
import karpov from '../assets/photos/karpov.jpg';
import kasparov from '../assets/photos/kasparov.jpg';
import kasparovKarpov from '../assets/photos/kasparov-karpov.jpg';
import carlsen from '../assets/photos/carlsen.jpg';
import carlsenBust from '../assets/photos/carlsen-bust.jpg';
import spassky70 from '../assets/photos/spassky70.jpg';
import spassky73 from '../assets/photos/spassky73.jpg';

const ANEFO = { author: 'Anefo / Nationaal Archief', license: 'CC0' };

export const PHOTOS = {
  capablanca: { src: capablanca, focus: '50% 38%', author: 'Agence Rol (Gallica, BnF)', license: 'Dominio público', year: 1921,
    caption: 'José Raúl Capablanca en 1921, el año en que le quitó el título a Lasker.' },
  tal: { src: tal, focus: '62% 30%', ...ANEFO, author: 'R. Mieremet / Anefo', year: 1973,
    caption: 'Mijaíl Tal en el torneo de Hoogovens, Wijk aan Zee, 1973.' },
  fischer71: { src: fischer71, focus: '50% 30%', ...ANEFO, year: 1971,
    caption: 'Bobby Fischer frente al tablero, foto de archivo de 1971.' },
  fischer72: { src: fischer72, focus: '50% 25%', ...ANEFO, author: 'Bert Verhoeff / Anefo', year: 1972,
    caption: 'Fischer en Ámsterdam, enero de 1972, cuando se negociaban las condiciones del match.' },
  euwe72: { src: euwe72, focus: '50% 40%', ...ANEFO, author: 'Bert Verhoeff / Anefo', year: 1972,
    caption: 'Fischer con Max Euwe, presidente de la FIDE y excampeón mundial, en Ámsterdam.' },
  spassky70: { src: spassky70, focus: '30% 40%', ...ANEFO, year: 1970,
    caption: 'Spassky (izquierda) ante Bent Larsen en Leiden, 1970, ya como campeón del mundo.' },
  spassky73: { src: spassky73, focus: '50% 25%', ...ANEFO, author: 'Rob Croes / Anefo', year: 1973,
    caption: 'Borís Spassky en el torneo IBM de Ámsterdam, 1973.' },
  karpov: { src: karpov, focus: '42% 28%', ...ANEFO, author: 'Rob Croes / Anefo', year: 1979,
    caption: 'Anatoli Karpov en Tilburg, 1979.' },
  kasparov: { src: kasparov, focus: '64% 36%', ...ANEFO, author: 'Rob Bogaerts / Anefo', year: 1985,
    caption: 'Garri Kasparov ante Jan Timman, Hilversum, diciembre de 1985, semanas después de ser campeón.' },
  kasparovKarpov: { src: kasparovKarpov, focus: '50% 45%', ...ANEFO, author: 'Rob Croes / Anefo', year: 1988,
    caption: 'Kasparov y Karpov frente a frente en Ámsterdam, 1988. Jugaron cinco matches por el título.' },
  carlsen: { src: carlsen, focus: '50% 14%', author: 'Autopilot (Wikimedia Commons)', license: 'CC BY-SA 3.0', year: 2012,
    caption: 'Magnus Carlsen en 2012, un año antes de ganar el título.' },
  carlsenBust: { src: carlsenBust, focus: '50% 30%', author: 'Autopilot (Wikimedia Commons), recortada', license: 'CC BY-SA 3.0', year: 2012,
    caption: 'Magnus Carlsen en 2012, un año antes de ganar el título.' },
};
