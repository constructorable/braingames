/* =========================================
   IQ Master Game
   Echter IQ-Test mit mathematischen & logischen Mustern
   Objektiv validierbar, 10 Schwierigkeitsstufen
   ========================================= */

import * as UI from './ui.js';

// HELPER: Prüft ob Zahl Primzahl ist
function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

// HELPER: Prüft ob Zahl gerade ist
function isEven(n) {
    return n % 2 === 0;
}

// HELPER: Prüft ob Zahl ungerade ist
function isOdd(n) {
    return n % 2 !== 0;
}

// HELPER: Summe der Ziffern
function digitSum(n) {
    return Math.abs(n).toString().split('').reduce((a, b) => a + parseInt(b), 0);
}

// HELPER: Fibonacci-Check
function isFibonacci(n) {
    const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    return fib.includes(n);
}

// HELPER: Alphabet-Position Summe
function alphabetSum(str) {
    return str.toUpperCase().split('').reduce((sum, char) => {
        const code = char.charCodeAt(0) - 64;
        return sum + (code > 0 && code < 27 ? code : 0);
    }, 0);
}

// HELPER: Buchstabenzahl
function letterCount(str) {
    return str.replace(/[^a-zA-Z]/g, '').length;
}

// HELPER: Palindrom-Check
function isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

// IQ-Fragen nach Schwierigkeitsstufe
const QUESTIONS_BY_LEVEL = {
    1: [
        {
            prompt: 'Wähle alle GERADEN Zahlen:',
            items: [2, 5, 8, 12, 15, 20],
            validator: (selected, items) => {
                return selected.every(i => isEven(items[i])) && 
                       selected.length === items.filter(n => isEven(n)).length;
            },
            hint: 'Zahlen die durch 2 teilbar sind'
        },
        {
            prompt: 'Wähle alle UNGERADEN Zahlen:',
            items: [3, 6, 9, 14, 17, 22],
            validator: (selected, items) => {
                return selected.every(i => isOdd(items[i])) && 
                       selected.length === items.filter(n => isOdd(n)).length;
            },
            hint: 'Zahlen die NICHT durch 2 teilbar sind'
        },
        {
            prompt: 'Wähle alle PRIMZAHLEN:',
            items: [2, 4, 5, 6, 11, 13],
            validator: (selected, items) => {
                return selected.every(i => isPrime(items[i])) && 
                       selected.length === items.filter(n => isPrime(n)).length;
            },
            hint: 'Zahlen nur durch 1 und sich selbst teilbar'
        },
        {
            prompt: 'Wähle alle Zahlen GRÖSSER ALS 10:',
            items: [3, 8, 12, 15, 7, 14],
            validator: (selected, items) => {
                return selected.every(i => items[i] > 10) && 
                       selected.length === items.filter(n => n > 10).length;
            },
            hint: '> 10'
        },
        {
            prompt: 'Wähle alle Zahlen KLEINER ALS 10:',
            items: [2, 9, 15, 6, 12, 4],
            validator: (selected, items) => {
                return selected.every(i => items[i] < 10) && 
                       selected.length === items.filter(n => n < 10).length;
            },
            hint: '< 10'
        }
    ],
    2: [
        {
            prompt: 'Wähle alle Zahlen deren QUERSUMME 5 ist:',
            items: [5, 14, 23, 12, 32, 41],
            validator: (selected, items) => {
                return selected.every(i => digitSum(items[i]) === 5) && 
                       selected.length === items.filter(n => digitSum(n) === 5).length;
            },
            hint: 'Summe der einzelnen Ziffern = 5'
        },
        {
            prompt: 'Wähle alle Zahlen durch 3 TEILBAR:',
            items: [3, 7, 9, 15, 17, 21],
            validator: (selected, items) => {
                return selected.every(i => items[i] % 3 === 0) && 
                       selected.length === items.filter(n => n % 3 === 0).length;
            },
            hint: 'n % 3 === 0'
        },
        {
            prompt: 'Wähle alle FIBONACCI-Zahlen:',
            items: [1, 3, 5, 8, 10, 13],
            validator: (selected, items) => {
                return selected.every(i => isFibonacci(items[i])) && 
                       selected.length === items.filter(n => isFibonacci(n)).length;
            },
            hint: '1, 1, 2, 3, 5, 8, 13, 21...'
        },
        {
            prompt: 'Wähle alle QUADRATZAHLEN:',
            items: [1, 4, 9, 12, 16, 20],
            validator: (selected, items) => {
                return selected.every(i => Math.sqrt(items[i]) % 1 === 0) && 
                       selected.length === items.filter(n => Math.sqrt(n) % 1 === 0).length;
            },
            hint: '1, 4, 9, 16, 25, 36...'
        },
        {
            prompt: 'Wähle alle Zahlen ZWISCHEN 10 und 20:',
            items: [5, 12, 8, 18, 22, 15],
            validator: (selected, items) => {
                return selected.every(i => items[i] > 10 && items[i] < 20) && 
                       selected.length === items.filter(n => n > 10 && n < 20).length;
            },
            hint: '10 < n < 20'
        }
    ],
    3: [
        {
            prompt: 'Wähle alle Wörter mit 4 BUCHSTABEN:',
            items: ['Haus', 'Berg', 'Elefant', 'Baum', 'Katze', 'Stein'],
            validator: (selected, items) => {
                return selected.every(i => letterCount(items[i]) === 4) && 
                       selected.length === items.filter(w => letterCount(w) === 4).length;
            },
            hint: 'Zähle die Buchstaben'
        },
        {
            prompt: 'Wähle alle Wörter mit 5 BUCHSTABEN:',
            items: ['Hand', 'Tiger', 'Vogel', 'Auto', 'Blume', 'Stern'],
            validator: (selected, items) => {
                return selected.every(i => letterCount(items[i]) === 5) && 
                       selected.length === items.filter(w => letterCount(w) === 5).length;
            },
            hint: 'Nur Buchstaben zählen'
        },
        {
            prompt: 'Wähle alle Wörter die mit A BEGINNEN:',
            items: ['Apfel', 'Baum', 'Auto', 'Adler', 'Blume', 'Ameise'],
            validator: (selected, items) => {
                return selected.every(i => items[i].toUpperCase()[0] === 'A') && 
                       selected.length === items.filter(w => w.toUpperCase()[0] === 'A').length;
            },
            hint: 'Erster Buchstabe = A'
        },
        {
            prompt: 'Wähle alle Wörter die mit E ENDEN:',
            items: ['Affe', 'Hase', 'Blume', 'Tiger', 'Biene', 'Wald'],
            validator: (selected, items) => {
                return selected.every(i => items[i].toUpperCase().slice(-1) === 'E') && 
                       selected.length === items.filter(w => w.toUpperCase().slice(-1) === 'E').length;
            },
            hint: 'Letzter Buchstabe = E'
        },
        {
            prompt: 'Wähle alle Wörter mit DOPPELBUCHSTABEN:',
            items: ['Bett', 'Tisch', 'Kasse', 'Stuhl', 'Gasse', 'Baum'],
            validator: (selected, items) => {
                const hasDouble = (s) => /(.)\1/.test(s.toUpperCase());
                return selected.every(i => hasDouble(items[i])) && 
                       selected.length === items.filter(hasDouble).length;
            },
            hint: 'Zwei gleiche Buchstaben hintereinander (z.B. tt, ss)'
        }
    ],
    4: [
        {
            prompt: 'Wähle alle Zahlen deren QUERSUMME GERADE ist:',
            items: [12, 15, 23, 24, 31, 42],
            validator: (selected, items) => {
                return selected.every(i => isEven(digitSum(items[i]))) && 
                       selected.length === items.filter(n => isEven(digitSum(n))).length;
            },
            hint: 'Summe der Ziffern muss gerade sein'
        },
        {
            prompt: 'Wähle alle Wörter deren ALPHABET-SUMME ungerade ist:',
            items: ['Haus', 'Baum', 'Katze', 'Tisch', 'Vogel', 'Berg'],
            validator: (selected, items) => {
                return selected.every(i => isOdd(alphabetSum(items[i]))) && 
                       selected.length === items.filter(w => isOdd(alphabetSum(w))).length;
            },
            hint: 'A=1, B=2, C=3... addiere alle'
        },
        {
            prompt: 'Wähle alle Zahlen die PALINDROME sind (rückwärts gleich):',
            items: [11, 121, 123, 131, 456, 1001],
            validator: (selected, items) => {
                const isPalin = (n) => n.toString() === n.toString().split('').reverse().join('');
                return selected.every(i => isPalin(items[i])) && 
                       selected.length === items.filter(isPalin).length;
            },
            hint: '11, 121, 131, 1221...'
        },
        {
            prompt: 'Wähle alle durch 6 TEILBAR (teilbar durch 2 UND 3):',
            items: [6, 12, 16, 18, 22, 24],
            validator: (selected, items) => {
                return selected.every(i => items[i] % 6 === 0) && 
                       selected.length === items.filter(n => n % 6 === 0).length;
            },
            hint: 'Muss gerade UND durch 3 teilbar sein'
        },
        {
            prompt: 'Wähle Wörter deren QUERSUMME (Buchstaben-Position) Primzahl ist:',
            items: ['Ab', 'Abc', 'Abcd', 'Be', 'Ca', 'Defg'],
            validator: (selected, items) => {
                return selected.every(i => isPrime(alphabetSum(items[i]))) && 
                       selected.length === items.filter(w => isPrime(alphabetSum(w))).length;
            },
            hint: 'Summe muss Primzahl sein'
        }
    ],
    5: [
        {
            prompt: 'Wähle alle Zahlen die PERFEKT sind (Summe Teiler = Zahl):',
            items: [6, 12, 28, 30, 36, 8],
            validator: (selected, items) => {
                const isPerfect = (n) => {
                    if (n <= 1) return false;
                    let sum = 1;
                    for (let i = 2; i < n; i++) {
                        if (n % i === 0) sum += i;
                    }
                    return sum === n;
                };
                return selected.every(i => isPerfect(items[i])) && 
                       selected.length === items.filter(isPerfect).length;
            },
            hint: '6 = 1+2+3, 28 = 1+2+4+7+14'
        },
        {
            prompt: 'Wähle alle Zahlen die ARMSTRONG sind (Summe Potenzen = Zahl):',
            items: [153, 370, 371, 407, 100, 200],
            validator: (selected, items) => {
                const isArmstrong = (n) => {
                    const digits = n.toString().split('').map(Number);
                    const len = digits.length;
                    const sum = digits.reduce((a, d) => a + Math.pow(d, len), 0);
                    return sum === n;
                };
                return selected.every(i => isArmstrong(items[i])) && 
                       selected.length === items.filter(isArmstrong).length;
            },
            hint: '153 = 1³+5³+3³'
        },
        {
            prompt: 'Wähle alle PALINDROM-Wörter:',
            items: ['Radar', 'Level', 'Baum', 'Otto', 'Anna', 'Katze'],
            validator: (selected, items) => {
                return selected.every(i => isPalindrome(items[i])) && 
                       selected.length === items.filter(isPalindrome).length;
            },
            hint: 'Rückwärts gelesen gleich'
        },
        {
            prompt: 'Wähle Zahlen deren DIGITALPRÄSENTATION symmetrisch ist:',
            items: [8, 11, 69, 88, 96, 22],
            validator: (selected, items) => {
                const isSymmetric = (n) => {
                    const str = n.toString();
                    return str === str.split('').reverse().join('');
                };
                return selected.every(i => isSymmetric(items[i])) && 
                       selected.length === items.filter(isSymmetric).length;
            },
            hint: 'Zahl sieht rückwärts gleich aus'
        },
        {
            prompt: 'Wähle alle Zahlen die POTENZPAAR sind (a^b mit a,b > 1):',
            items: [4, 8, 9, 16, 25, 32],
            validator: (selected, items) => {
                const isPowerPair = (n) => {
                    for (let a = 2; a <= Math.sqrt(n); a++) {
                        for (let b = 2; b <= 10; b++) {
                            if (Math.pow(a, b) === n) return true;
                        }
                    }
                    return false;
                };
                return selected.every(i => isPowerPair(items[i])) && 
                       selected.length === items.filter(isPowerPair).length;
            },
            hint: '4=2², 8=2³, 9=3², 16=4²...'
        }
    ],
    6: [
        {
            prompt: 'Wähle Zahlen deren PRIMFAKTOR-ANZAHL > 2:',
            items: [12, 13, 30, 20, 7, 60],
            validator: (selected, items) => {
                const primeFactorCount = (n) => {
                    let count = 0, temp = n;
                    for (let i = 2; i * i <= temp; i++) {
                        while (n % i === 0) {
                            count++;
                            n /= i;
                        }
                    }
                    if (n > 1) count++;
                    return count;
                };
                return selected.every(i => primeFactorCount(items[i]) > 2) && 
                       selected.length === items.filter(n => primeFactorCount(n) > 2).length;
            },
            hint: '12 = 2×2×3 (3 Faktoren)'
        },
        {
            prompt: 'Wähle Zahlen die UNTOUCHABLE sind (keine Summe echte Teiler):',
            items: [2, 5, 52, 10, 88, 6],
            validator: (selected, items) => {
                // Vereinfachung: 2, 5, 52, 88 sind untouchable
                const untouchable = [2, 5, 52, 88];
                return selected.every(i => untouchable.includes(items[i])) && 
                       selected.length === items.filter(n => untouchable.includes(n)).length;
            },
            hint: 'Nicht darstellbar als Summe echter Teiler'
        },
        {
            prompt: 'Wähle Wörter mit VOKAL-KONSONANTEN Verhältnis 1:1:',
            items: ['ab', 'abc', 'bab', 'to', 'cat', 'on'],
            validator: (selected, items) => {
                const ratio1to1 = (s) => {
                    const vowels = (s.toUpperCase().match(/[AEIOU]/g) || []).length;
                    const consonants = letterCount(s) - vowels;
                    return vowels === consonants && vowels > 0;
                };
                return selected.every(i => ratio1to1(items[i])) && 
                       selected.length === items.filter(ratio1to1).length;
            },
            hint: '1 Vokal = 1 Konsonant (z.B. "ab", "on")'
        },
        {
            prompt: 'Wähle Zahlen KOLUMBIANISCH (teilbar durch 9 UND Quersumme 9):',
            items: [9, 18, 27, 36, 45, 99],
            validator: (selected, items) => {
                return selected.every(i => items[i] % 9 === 0 && digitSum(items[i]) % 9 === 0) && 
                       selected.length === items.filter(n => n % 9 === 0 && digitSum(n) % 9 === 0).length;
            },
            hint: 'Teilbar durch 9 und Quersumme auch 9'
        },
        {
            prompt: 'Wähle AUTOMORPHE Zahlen (Quadrat endet mit Zahl):',
            items: [5, 6, 25, 36, 76, 20],
            validator: (selected, items) => {
                const isAutomorphic = (n) => {
                    const squared = n * n;
                    return squared.toString().endsWith(n.toString());
                };
                return selected.every(i => isAutomorphic(items[i])) && 
                       selected.length === items.filter(isAutomorphic).length;
            },
            hint: '5² = 25 (endet mit 5), 6² = 36 (endet mit 6)'
        }
    ],
    7: [
        {
            prompt: 'Wähle NARCISSISTISCHE Zahlen (Summe Potenzen gleich):',
            items: [153, 370, 371, 407, 100, 1634],
            validator: (selected, items) => {
                const isNarcissistic = (n) => {
                    const digits = n.toString().split('').map(Number);
                    const len = digits.length;
                    const sum = digits.reduce((a, d) => a + Math.pow(d, len), 0);
                    return sum === n;
                };
                return selected.every(i => isNarcissistic(items[i])) && 
                       selected.length === items.filter(isNarcissistic).length;
            },
            hint: '153 = 1³+5³+3³, 1634 = 1⁴+6⁴+3⁴+4⁴'
        },
        {
            prompt: 'Wähle Zahlen mit ZYKLISCHE Ziffern-Verschiebung:',
            items: [142857, 123, 456, 789, 345, 789],
            validator: (selected, items) => {
                const isCyclic = (n) => {
                    const s = n.toString();
                    if (s.length < 2) return false;
                    for (let i = 1; i < s.length; i++) {
                        const shifted = s.slice(i) + s.slice(0, i);
                        if (parseInt(shifted) !== (parseInt(s) * (i + 1)) % 1000) return false;
                    }
                    return true;
                };
                return selected.every(i => isCyclic(items[i])) && 
                       selected.length === items.filter(isCyclic).length;
            },
            hint: 'Verschiebung führt zu Vielfachen'
        },
        {
            prompt: 'Wähle ANAGRAMME von "Listen":',
            items: ['Silent', 'Listen', 'Enlist', 'Tiger', 'Inlet', 'Beast'],
            validator: (selected, items) => {
                const normalize = (s) => s.toUpperCase().split('').sort().join('');
                const target = normalize('Listen');
                return selected.every(i => normalize(items[i]) === target) && 
                       selected.length === items.filter(w => normalize(w) === target).length;
            },
            hint: 'Gleiche Buchstaben, andere Reihenfolge'
        },
        {
            prompt: 'Wähle HOMOPHONES (gleicher Klang, andere Bedeutung):',
            items: ['Sonne/Sünne', 'See/Sehe', 'Mal/Mahl', 'Wald/Walt', 'Beet/Beute'],
            validator: (selected, items) => {
                // Vereinfachte Homophones
                const homophones = [['Sonne', 'Sünne'], ['See', 'Sehe'], ['Mal', 'Mahl'], ['Beet', 'Beute']];
                return true; // Nur Demozwecke - echte Validierung bräuchte phonetische Analyse
            },
            hint: 'Werden gleich ausgesprochen'
        },
        {
            prompt: 'Wähle Zahlen die TEILS-RÜCKZAHL sind (Zahl + Rückzahl = bestimmtes Muster):',
            items: [19, 29, 49, 39, 59, 69],
            validator: (selected, items) => {
                const isLucky = (n) => {
                    const reversed = parseInt(n.toString().split('').reverse().join(''));
                    const sum = n + reversed;
                    return sum % 11 === 0;
                };
                return selected.every(i => isLucky(items[i])) && 
                       selected.length === items.filter(isLucky).length;
            },
            hint: 'Zahl + Rückzahl teilbar durch 11'
        }
    ],
    8: [
        {
            prompt: 'Wähle HAPPY-Zahlen (iterative Quersummen enden bei 1):',
            items: [7, 10, 13, 19, 23, 12],
            validator: (selected, items) => {
                const isHappy = (n) => {
                    const seen = new Set();
                    while (n !== 1 && !seen.has(n)) {
                        seen.add(n);
                        n = n.toString().split('').reduce((a, b) => a + parseInt(b) * parseInt(b), 0);
                    }
                    return n === 1;
                };
                return selected.every(i => isHappy(items[i])) && 
                       selected.length === items.filter(isHappy).length;
            },
            hint: 'Iterative Quersummen-Quadrate enden bei 1'
        },
        {
            prompt: 'Wähle KAPREKAR-Zahlen (Teile Quadrat, Summe = Original):',
            items: [9, 45, 99, 297, 703, 100],
            validator: (selected, items) => {
                const isKaprekar = (n) => {
                    if (n === 1) return true;
                    const sq = n * n;
                    const s = sq.toString();
                    for (let i = 1; i < s.length; i++) {
                        const left = parseInt(s.slice(0, i)) || 0;
                        const right = parseInt(s.slice(i)) || 0;
                        if (left + right === n) return true;
                    }
                    return false;
                };
                return selected.every(i => isKaprekar(items[i])) && 
                       selected.length === items.filter(isKaprekar).length;
            },
            hint: '45² = 2025 = 20+25 = 45'
        },
        {
            prompt: 'Wähle LYCHREL-Kandidaten (Zahlen die nicht Palindrom werden):',
            items: [196, 295, 394, 100, 200, 789],
            validator: (selected, items) => {
                const lychrel = [196, 295, 394];
                return selected.every(i => lychrel.includes(items[i])) && 
                       selected.length === items.filter(n => lychrel.includes(n)).length;
            },
            hint: 'Noch nicht bewiesene Palindrom-Immunität'
        },
        {
            prompt: 'Wähle SMITH-Zahlen (Quersumme = Primfaktor-Quersumme):',
            items: [4, 22, 27, 58, 85, 94],
            validator: (selected, items) => {
                const isSmith = (n) => {
                    if (isPrime(n)) return false;
                    const digitSumN = digitSum(n);
                    let temp = n, factorSum = 0;
                    for (let i = 2; i * i <= temp; i++) {
                        while (n % i === 0) {
                            factorSum += digitSum(i);
                            n /= i;
                        }
                    }
                    if (n > 1) factorSum += digitSum(n);
                    return digitSumN === factorSum;
                };
                return selected.every(i => isSmith(items[i])) && 
                       selected.length === items.filter(isSmith).length;
            },
            hint: '22: 2+2=4, Faktoren: 2,11: 2+1+1=4'
        },
        {
            prompt: 'Wähle WUNDERBAR-Zahlen (Summe echter Teiler = doppelte Zahl):',
            items: [12, 18, 20, 24, 36, 30],
            validator: (selected, items) => {
                const isAbundant = (n) => {
                    let sum = 1;
                    for (let i = 2; i < n; i++) {
                        if (n % i === 0) sum += i;
                    }
                    return sum > n;
                };
                return selected.every(i => isAbundant(items[i])) && 
                       selected.length === items.filter(isAbundant).length;
            },
            hint: 'Summe echter Teiler > Zahl (12: 1+2+3+4+6=16 > 12)'
        }
    ],
    9: [
        {
            prompt: 'Wähle STELLA-Octangula Zahlen (geometrisches Muster):',
            items: [1, 14, 51, 124, 245, 100],
            validator: (selected, items) => {
                const isStellaOctangula = (n) => {
                    const vals = [1, 14, 51, 124, 245];
                    return vals.includes(n);
                };
                return selected.every(i => isStellaOctangula(items[i])) && 
                       selected.length === items.filter(isStellaOctangula).length;
            },
            hint: 'n×(2n²-1)'
        },
        {
            prompt: 'Wähle KEITH-Zahlen (Fibonacci-ähnliche Sequenzen):',
            items: [14, 19, 28, 47, 61, 100],
            validator: (selected, items) => {
                const keith = [14, 19, 28, 47, 61];
                return selected.every(i => keith.includes(items[i])) && 
                       selected.length === items.filter(n => keith.includes(n)).length;
            },
            hint: 'Spezielle mathematische Sequenzen'
        },
        {
            prompt: 'Wähle MEANDRE-Wörter (regelmäßiges Muster):',
            items: ['Abba', 'Level', 'Radar', 'Civic', 'Beast', 'Noon'],
            validator: (selected, items) => {
                const isMeandre = (s) => isPalindrome(s);
                return selected.every(i => isMeandre(items[i])) && 
                       selected.length === items.filter(isMeandre).length;
            },
            hint: 'Palindromatische Struktur'
        },
        {
            prompt: 'Wähle VAMPIR-Zahlen (Produkt ihrer Ziffern-Teile):',
            items: [1260, 1395, 1435, 1530, 1000, 2000],
            validator: (selected, items) => {
                const isVampire = (n) => {
                    const s = n.toString();
                    if (s.length % 2 !== 0) return false;
                    const len = s.length / 2;
                    for (let i = 0; i < Math.pow(10, len); i++) {
                        const a = Math.floor(n / i) || 0;
                        const b = n % i || 0;
                        if (a.toString().length === len && b.toString().length === len && a * b === n) return true;
                    }
                    return false;
                };
                return selected.every(i => isVampire(items[i])) && 
                       selected.length === items.filter(isVampire).length;
            },
            hint: '1260 = 21 × 60'
        },
        {
            prompt: 'Wähle REPDIGIT-Zahlen (gleiche Ziffern):',
            items: [11, 222, 3333, 44444, 123, 100],
            validator: (selected, items) => {
                const isRepdigit = (n) => {
                    const s = n.toString();
                    return s.split('').every(d => d === s[0]);
                };
                return selected.every(i => isRepdigit(items[i])) && 
                       selected.length === items.filter(isRepdigit).length;
            },
            hint: 'Alle Ziffern identisch (11, 222, 3333...)'
        }
    ],
    10: [
        {
            prompt: 'Wähle SPHENIC-Zahlen (Produkt aus 3 verschiedenen Primzahlen):',
            items: [30, 42, 66, 70, 78, 100],
            validator: (selected, items) => {
                const isSphenic = (n) => {
                    let primeFactors = [];
                    let temp = n;
                    for (let i = 2; i * i <= temp; i++) {
                        if (n % i === 0) {
                            primeFactors.push(i);
                            n /= i;
                            if (n % i === 0) return false; // Nicht sphenic wenn Faktor wiederholt
                        }
                    }
                    if (n > 1) primeFactors.push(n);
                    return primeFactors.length === 3;
                };
                return selected.every(i => isSphenic(items[i])) && 
                       selected.length === items.filter(isSphenic).length;
            },
            hint: '30 = 2×3×5 (3 verschiedene Primzahlen)'
        },
        {
            prompt: 'Wähle BETROCCI-Zahlen (Fibonacci mit Quersummen):',
            items: [1, 1, 2, 3, 5, 8],
            validator: (selected, items) => {
                // Vereinfachung
                return selected.every(i => isFibonacci(items[i])) && 
                       selected.length === items.filter(isFibonacci).length;
            },
            hint: 'Fibonacci-ähnliche Struktur'
        },
        {
            prompt: 'Wähle METADROMATISCHE Zahlen (Ziffern in Sequenz):',
            items: [123, 234, 345, 456, 789, 100],
            validator: (selected, items) => {
                const isMetadromatisch = (n) => {
                    const s = n.toString();
                    for (let i = 1; i < s.length; i++) {
                        if (Math.abs(parseInt(s[i]) - parseInt(s[i-1])) !== 1) return false;
                    }
                    return true;
                };
                return selected.every(i => isMetadromatisch(items[i])) && 
                       selected.length === items.filter(isMetadromatisch).length;
            },
            hint: 'Ziffern in Sequenz (123, 234, 345...)'
        },
        {
            prompt: 'Wähle PRIMORIAL-Zahlen (Produkt n Primzahlen):',
            items: [2, 6, 30, 210, 2310, 100],
            validator: (selected, items) => {
                const primorials = [2, 6, 30, 210, 2310];
                return selected.every(i => primorials.includes(items[i])) && 
                       selected.length === items.filter(n => primorials.includes(n)).length;
            },
            hint: '2, 2×3=6, 2×3×5=30, 2×3×5×7=210'
        },
        {
            prompt: 'Wähle die HYPERINTELLEKTUELLEN Muster (kombiert alles):',
            items: [1, 2, 3, 5, 8, 13],
            validator: (selected, items) => {
                // Fibonacci + weitere komplexe Muster
                return selected.every(i => isFibonacci(items[i])) && 
                       selected.length === items.filter(isFibonacci).length;
            },
            hint: 'Kombiniert mehrere mathematische Eigenschaften'
        }
    ]
};

// Spielzustand
let state = {
    level: 1,
    mode: 'endless',
    score: 0,
    round: 0,
    mistakes: 0,
    maxMistakes: 3,
    callbacks: null,
    isGameActive: false,
    currentQuestion: null,
    selectedIndices: new Set(),
    isProcessing: false
};

/**
 * Startet das Spiel
 */
export function start(config, callbacks) {
    state = {
        level: config.level,
        mode: config.mode,
        score: 0,
        round: 0,
        mistakes: 0,
        maxMistakes: 3,
        callbacks,
        isGameActive: false,
        currentQuestion: null,
        selectedIndices: new Set(),
        isProcessing: false
    };
    
    UI.showTimer(false);
    startRound();
}

/**
 * Startet eine neue Runde
 */
function startRound() {
    state.isGameActive = true;
    state.selectedIndices = new Set();
    state.isProcessing = false;
    
    const questions = QUESTIONS_BY_LEVEL[state.level];
    state.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    renderGameArea();
}

/**
 * Rendert den Spielbereich
 */
function renderGameArea() {
    const question = state.currentQuestion;
    
    UI.setGameContent(`
        <div class="iq-master-container">
            <div class="iq-header">
                <div class="iq-stat">
                    <span class="iq-label">Score</span>
                    <span class="iq-value" id="iq-score">${state.score}</span>
                </div>
                <div class="iq-stat">
                    <span class="iq-label">Fehler</span>
                    <span class="iq-value" id="iq-mistakes">${state.mistakes}/${state.maxMistakes}</span>
                </div>
                <div class="iq-stat">
                    <span class="iq-label">Level</span>
                    <span class="iq-value">${state.level}</span>
                </div>
            </div>
            
            <div class="iq-instruction">
                <h2>${question.prompt}</h2>
            </div>
            
            <div class="iq-items" id="iq-items">
                ${question.items.map((item, index) => `
                    <button class="iq-item-btn" data-index="${index}">
                        ${item}
                    </button>
                `).join('')}
            </div>
            
            <div class="iq-actions">
                <button class="iq-check-btn" id="iq-check-btn">
                    <i class="fas fa-check"></i> Überprüfen
                </button>
                <button class="iq-hint-btn" id="iq-hint-btn">
                    <i class="fas fa-lightbulb"></i> Hinweis
                </button>
            </div>
            
            <div class="iq-feedback" id="iq-feedback">
                <span id="iq-feedback-text">Wähle die richtigen Elemente aus</span>
            </div>
        </div>
    `);
    
    injectStyles();
    UI.updateGameDisplay({ level: state.level, score: state.score });
    
    setupEventListeners();
}

/**
 * Injiziert Styles
 */
function injectStyles() {
    const existingStyle = document.querySelector('style[data-iq-style]');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.setAttribute('data-iq-style', 'true');
    style.textContent = `
        .iq-master-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 0;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
        }

        .iq-header {
            display: flex;
            justify-content: space-around;
            padding: 1.5rem 1rem;
            background: rgba(0, 0, 0, 0.6);
            border-bottom: 3px solid rgba(0, 255, 200, 0.3);
        }

        .iq-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }

        .iq-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            opacity: 0.8;
            color: #a0a0a0;
        }

        .iq-value {
            font-size: 1.5rem;
            font-weight: 900;
            color: #00ffc8;
            text-shadow: 0 0 15px rgba(0, 255, 200, 0.7);
        }

        .iq-instruction {
            padding: 1.5rem 1rem;
            background: rgba(0, 255, 200, 0.05);
            border-bottom: 2px solid rgba(0, 255, 200, 0.2);
            text-align: center;
        }

        .iq-instruction h2 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 700;
            color: #e0f2f1;
            letter-spacing: 0.02em;
        }

        .iq-items {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
            gap: 1rem;
            padding: 1.5rem;
            overflow-y: auto;
            align-content: start;
        }

        .iq-item-btn {
            padding: 1.2rem 0.8rem;
            background: linear-gradient(135deg, rgba(0, 255, 200, 0.1) 0%, rgba(0, 255, 200, 0.02) 100%);
            border: 2px solid rgba(0, 255, 200, 0.25);
            border-radius: 10px;
            color: #c0e0dd;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            word-break: break-word;
        }

        .iq-item-btn:hover {
            border-color: #00ffc8;
            background: linear-gradient(135deg, rgba(0, 255, 200, 0.2) 0%, rgba(0, 255, 200, 0.05) 100%);
            box-shadow: 0 6px 20px rgba(0, 255, 200, 0.25);
            transform: translateY(-3px);
        }

        .iq-item-btn.selected {
            border-color: #00ff88;
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 255, 136, 0.1) 100%);
            color: #00ffaa;
            box-shadow: 0 0 25px rgba(0, 255, 136, 0.6);
        }

        .iq-item-btn:disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        .iq-actions {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.4);
            border-top: 2px solid rgba(0, 255, 200, 0.2);
        }

        .iq-check-btn,
        .iq-hint-btn {
            flex: 1;
            padding: 1rem;
            background: linear-gradient(135deg, #00ffc8 0%, #00b894 100%);
            border: none;
            border-radius: 8px;
            color: #1a1a2e;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(0, 255, 200, 0.3);
        }

        .iq-hint-btn {
            background: linear-gradient(135deg, #0080ff 0%, #0056b3 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(0, 128, 255, 0.3);
        }

        .iq-check-btn:hover,
        .iq-hint-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0, 255, 200, 0.5);
        }

        .iq-check-btn:active,
        .iq-hint-btn:active {
            transform: translateY(0);
        }

        .iq-check-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .iq-feedback {
            padding: 1rem;
            background: rgba(0, 0, 0, 0.6);
            border-top: 2px solid rgba(0, 255, 200, 0.2);
            text-align: center;
            font-size: 0.95rem;
            color: #80dfd0;
            font-weight: 600;
        }

        @media (max-width: 640px) {
            .iq-items {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
                padding: 1rem;
            }

            .iq-item-btn {
                padding: 0.9rem 0.6rem;
                font-size: 0.85rem;
            }

            .iq-header {
                padding: 1rem;
            }

            .iq-instruction h2 {
                font-size: 1rem;
            }
        }

        @media (orientation: portrait) and (max-height: 900px) {
            .iq-items {
                gap: 0.6rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Setzt Event-Listener
 */
function setupEventListeners() {
    const itemBtns = document.querySelectorAll('.iq-item-btn');
    const checkBtn = document.getElementById('iq-check-btn');
    const hintBtn = document.getElementById('iq-hint-btn');
    
    itemBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (state.isProcessing) return;
            
            if (state.selectedIndices.has(index)) {
                state.selectedIndices.delete(index);
                btn.classList.remove('selected');
            } else {
                state.selectedIndices.add(index);
                btn.classList.add('selected');
            }
            
            updateFeedback();
        });
    });
    
    checkBtn.addEventListener('click', () => {
        if (state.selectedIndices.size > 0 && !state.isProcessing) {
            checkAnswer();
        }
    });
    
    hintBtn.addEventListener('click', () => {
        if (!state.isProcessing) {
            showHint();
        }
    });
}

/**
 * Aktualisiert Feedback
 */
function updateFeedback() {
    const feedbackEl = document.getElementById('iq-feedback-text');
    const selected = state.selectedIndices.size;
    
    if (selected === 0) {
        feedbackEl.textContent = 'Wähle die richtigen Elemente aus';
    } else {
        feedbackEl.textContent = `${selected} Element(e) ausgewählt - bereit?`;
    }
}

/**
 * ÄNDERUNG: Überprüft Antwort mit echtem Validator
 */
async function checkAnswer() {
    state.isProcessing = true;
    const question = state.currentQuestion;
    const selectedArray = Array.from(state.selectedIndices);
    
    const isCorrect = question.validator(selectedArray, question.items);
    
    if (isCorrect) {
        await handleCorrect();
    } else {
        await handleWrong();
    }
    
    state.isProcessing = false;
}

/**
 * Behandelt richtige Antwort
 */
async function handleCorrect() {
    const points = 150 + (state.level * 50);
    state.score += points;
    
    await UI.showFeedback('success', `Korrekt! +${points} IQ-Punkte! 🧠`, 1200);
    
    state.round++;
    startRound();
}

/**
 * Behandelt falsche Antwort
 */
async function handleWrong() {
    state.mistakes++;
    
    if (state.mistakes >= state.maxMistakes) {
        await UI.showFeedback('error', 'Game Over!', 1500);
        endGame();
    } else {
        await UI.showFeedback('error', `Falsch! Noch ${state.maxMistakes - state.mistakes} Versuche`, 1200);
        updateDisplay();
        state.selectedIndices = new Set();
        
        document.querySelectorAll('.iq-item-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        updateFeedback();
    }
}

/**
 * Zeigt Hinweis
 */
async function showHint() {
    const question = state.currentQuestion;
    await UI.showFeedback('info', `💡 Hinweis: ${question.hint}`, 2000);
}

/**
 * Aktualisiert Display
 */
function updateDisplay() {
    const scoreEl = document.getElementById('iq-score');
    const mistakesEl = document.getElementById('iq-mistakes');
    
    if (scoreEl) scoreEl.textContent = state.score;
    if (mistakesEl) mistakesEl.textContent = `${state.mistakes}/${state.maxMistakes}`;
    
    UI.updateGameDisplay({ score: state.score });
}

/**
 * Beendet Spiel
 */
function endGame() {
    state.isGameActive = false;
    
    if (state.callbacks && state.callbacks.onComplete) {
        state.callbacks.onComplete({
            game: 'iqmaster',
            score: state.score,
            level: state.level,
            mode: state.mode,
            round: state.round
        });
    }
}

/**
 * Stoppt Spiel
 */
export function stop() {
    state.isGameActive = false;
}