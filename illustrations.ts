/**
 * Educational Vector Illustration Generator for Class 2 NCERT Topics
 * Provides instant, colorful, high-fidelity SVGs as base64 data URIs
 */

export function getEducationalIllustration(prompt: string): string {
  const p = prompt.toLowerCase();

  let svg = '';

  if (p.includes('apple') || p.includes('fruit') || p.includes('count') || p.includes('add') || p.includes('plus')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E0F2FE"/>
          <stop offset="100%" stop-color="#BAE6FD"/>
        </linearGradient>
        <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#86EFAC"/>
          <stop offset="100%" stop-color="#4ADE80"/>
        </linearGradient>
        <linearGradient id="appleRed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FF5252"/>
          <stop offset="100%" stop-color="#DC2626"/>
        </linearGradient>
        <linearGradient id="appleGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4ADE80"/>
          <stop offset="100%" stop-color="#16A34A"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.15"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="800" height="420" fill="url(#sky)"/>
      <rect y="420" width="800" height="180" fill="url(#grass)"/>
      <circle cx="720" cy="80" r="50" fill="#FDE047" opacity="0.9"/>

      <!-- Title Card -->
      <rect x="180" y="30" width="440" height="60" rx="16" fill="#FFFFFF" filter="url(#shadow)"/>
      <text x="400" y="68" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0F172A" text-anchor="middle">
        🍎 Counting Apples: 5 Red + 3 Green = 8
      </text>

      <!-- Row 1: 5 Red Apples -->
      <g filter="url(#shadow)">
        <!-- Apple 1 -->
        <g transform="translate(110, 150)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleRed)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#22C55E"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">1</text>
        </g>
        <!-- Apple 2 -->
        <g transform="translate(230, 150)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleRed)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#22C55E"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">2</text>
        </g>
        <!-- Apple 3 -->
        <g transform="translate(350, 150)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleRed)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#22C55E"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">3</text>
        </g>
        <!-- Apple 4 -->
        <g transform="translate(470, 150)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleRed)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#22C55E"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">4</text>
        </g>
        <!-- Apple 5 -->
        <g transform="translate(590, 150)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleRed)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#22C55E"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">5</text>
        </g>
      </g>

      <!-- Plus Indicator -->
      <circle cx="400" cy="290" r="22" fill="#FF6321" filter="url(#shadow)"/>
      <text x="400" y="298" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF" text-anchor="middle">+</text>

      <!-- Row 2: 3 Green Apples -->
      <g filter="url(#shadow)">
        <g transform="translate(230, 330)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleGreen)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#15803D"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">6</text>
        </g>
        <g transform="translate(350, 330)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleGreen)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#15803D"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">7</text>
        </g>
        <g transform="translate(470, 330)">
          <path d="M40,25 C10,5 0,35 0,55 C0,85 25,105 40,105 C55,105 80,85 80,55 C80,35 70,5 40,25 Z" fill="url(#appleGreen)"/>
          <path d="M40,25 Q45,5 50,0" stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M45,10 Q65,5 60,20 Q50,20 45,10" fill="#15803D"/>
          <circle cx="28" cy="45" r="5" fill="#FFFFFF" opacity="0.4"/>
          <text x="40" y="70" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">8</text>
        </g>
      </g>

      <!-- Bottom Result Banner -->
      <rect x="220" y="475" width="360" height="50" rx="25" fill="#1E293B" filter="url(#shadow)"/>
      <text x="400" y="507" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#38BDF8" text-anchor="middle">
        Total: 5 + 3 = 8 Apples ✨
      </text>
    </svg>`;
  } else if (p.includes('shape') || p.includes('circle') || p.includes('square') || p.includes('triangle')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#EEF2F6"/>
        </linearGradient>
        <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.1"/>
        </filter>
      </defs>

      <rect width="800" height="600" fill="url(#bg)"/>

      <text x="400" y="60" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#1E293B" text-anchor="middle">
        🔷 Class 2 Basic 2D Geometric Shapes
      </text>

      <!-- Circle Card -->
      <g filter="url(#cardShadow)" transform="translate(60, 110)">
        <rect width="190" height="380" rx="24" fill="#FFFFFF"/>
        <circle cx="95" cy="110" r="60" fill="#3B82F6"/>
        <circle cx="80" cy="100" r="6" fill="#FFFFFF"/>
        <circle cx="110" cy="100" r="6" fill="#FFFFFF"/>
        <path d="M80,125 Q95,140 110,125" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
        <text x="95" y="220" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#1E3A8A" text-anchor="middle">Circle</text>
        <text x="95" y="260" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 0 Corners</text>
        <text x="95" y="290" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 1 Curved Edge</text>
        <text x="95" y="320" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• Round like a coin</text>
      </g>

      <!-- Square Card -->
      <g filter="url(#cardShadow)" transform="translate(290, 110)">
        <rect width="210" height="380" rx="24" fill="#FFFFFF"/>
        <rect x="45" y="55" width="120" height="120" rx="8" fill="#10B981"/>
        <circle cx="85" cy="105" r="6" fill="#FFFFFF"/>
        <circle cx="125" cy="105" r="6" fill="#FFFFFF"/>
        <path d="M85,135 Q105,150 125,135" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
        <text x="105" y="220" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#064E3B" text-anchor="middle">Square</text>
        <text x="105" y="260" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 4 Equal Sides</text>
        <text x="105" y="290" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 4 Straight Corners</text>
        <text x="105" y="320" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• Like a carrom board</text>
      </g>

      <!-- Triangle Card -->
      <g filter="url(#cardShadow)" transform="translate(540, 110)">
        <rect width="200" height="380" rx="24" fill="#FFFFFF"/>
        <polygon points="100,50 35,170 165,170" fill="#F59E0B"/>
        <circle cx="85" cy="125" r="5" fill="#FFFFFF"/>
        <circle cx="115" cy="125" r="5" fill="#FFFFFF"/>
        <path d="M88,145 Q100,155 112,145" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="100" y="220" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#78350F" text-anchor="middle">Triangle</text>
        <text x="100" y="260" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 3 Straight Sides</text>
        <text x="100" y="290" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• 3 Sharp Corners</text>
        <text x="100" y="320" font-family="system-ui, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">• Like a samosa slice</text>
      </g>
    </svg>`;
  } else if (p.includes('solar') || p.includes('space') || p.includes('planet') || p.includes('sun')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <rect width="800" height="600" fill="#090D16"/>
      <!-- Twinkling stars -->
      <circle cx="100" cy="80" r="2" fill="#FFFFFF" opacity="0.8"/>
      <circle cx="220" cy="150" r="3" fill="#FDE047" opacity="0.9"/>
      <circle cx="340" cy="70" r="2" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="500" cy="120" r="2.5" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="680" cy="90" r="3" fill="#FDE047" opacity="0.8"/>
      <circle cx="750" cy="220" r="2" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="120" cy="450" r="2.5" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="420" cy="520" r="2" fill="#FFFFFF" opacity="0.8"/>

      <text x="400" y="55" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#F8FAFC" text-anchor="middle">
        🪐 Our Solar System & Earth
      </text>

      <!-- Golden Sun -->
      <circle cx="60" cy="300" r="140" fill="#F59E0B" opacity="0.3"/>
      <circle cx="60" cy="300" r="100" fill="#EAB308"/>
      <text x="60" y="305" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#78350F" text-anchor="middle">Sun ☀️</text>

      <!-- Orbits -->
      <ellipse cx="60" cy="300" rx="220" ry="170" stroke="#334155" stroke-dasharray="6,6" fill="none"/>
      <ellipse cx="60" cy="300" rx="360" ry="210" stroke="#334155" stroke-dasharray="6,6" fill="none"/>
      <ellipse cx="60" cy="300" rx="520" ry="250" stroke="#334155" stroke-dasharray="6,6" fill="none"/>

      <!-- Mercury -->
      <circle cx="240" cy="220" r="14" fill="#94A3B8"/>
      <text x="240" y="255" font-family="system-ui, sans-serif" font-size="12" fill="#CBD5E1" text-anchor="middle">Mercury</text>

      <!-- Venus -->
      <circle cx="310" cy="370" r="22" fill="#F97316"/>
      <text x="310" y="410" font-family="system-ui, sans-serif" font-size="12" fill="#CBD5E1" text-anchor="middle">Venus</text>

      <!-- Earth with Moon -->
      <g transform="translate(420, 240)">
        <circle cx="0" cy="0" r="32" fill="#0284C7"/>
        <!-- Continents -->
        <circle cx="-6" cy="-8" r="12" fill="#22C55E"/>
        <circle cx="10" cy="8" r="10" fill="#22C55E"/>
        <!-- Moon -->
        <circle cx="45" cy="-20" r="8" fill="#F1F5F9"/>
        <text x="0" y="48" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#38BDF8" text-anchor="middle">Earth 🌍 (Our Home)</text>
      </g>

      <!-- Mars -->
      <circle cx="560" cy="390" r="18" fill="#EF4444"/>
      <text x="560" y="425" font-family="system-ui, sans-serif" font-size="12" fill="#CBD5E1" text-anchor="middle">Mars</text>

      <!-- Jupiter with Big Red Spot -->
      <g transform="translate(680, 220)">
        <circle cx="0" cy="0" r="50" fill="#D97706"/>
        <ellipse cx="0" cy="-10" rx="46" ry="8" fill="#B45309" opacity="0.6"/>
        <ellipse cx="0" cy="15" rx="46" ry="8" fill="#B45309" opacity="0.6"/>
        <circle cx="18" cy="12" r="8" fill="#991B1B"/>
        <text x="0" y="68" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#FDE68A" text-anchor="middle">Jupiter</text>
      </g>
    </svg>`;
  } else if (p.includes('clock') || p.includes('time') || p.includes('hour')) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <rect width="800" height="600" fill="#F8FAFC"/>
      <text x="400" y="60" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#1E293B" text-anchor="middle">
        ⏰ Reading Time: 3 O'Clock
      </text>

      <!-- Clock Outer Body -->
      <circle cx="400" cy="320" r="190" fill="#1E293B"/>
      <circle cx="400" cy="320" r="175" fill="#FFFFFF"/>
      <circle cx="400" cy="320" r="165" fill="#F1F5F9"/>

      <!-- Numbers -->
      <text x="400" y="195" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="#0F172A" text-anchor="middle">12</text>
      <text x="525" y="332" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="#0F172A" text-anchor="middle">3</text>
      <text x="400" y="465" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="#0F172A" text-anchor="middle">6</text>
      <text x="275" y="332" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="#0F172A" text-anchor="middle">9</text>

      <!-- Other Hour Markers -->
      <circle cx="465" cy="210" r="4" fill="#64748B"/>
      <circle cx="510" cy="260" r="4" fill="#64748B"/>
      <circle cx="510" cy="380" r="4" fill="#64748B"/>
      <circle cx="465" cy="430" r="4" fill="#64748B"/>
      <circle cx="335" cy="430" r="4" fill="#64748B"/>
      <circle cx="290" cy="380" r="4" fill="#64748B"/>
      <circle cx="290" cy="260" r="4" fill="#64748B"/>
      <circle cx="335" cy="210" r="4" fill="#64748B"/>

      <!-- Minute Hand pointing to 12 (Long Blue) -->
      <line x1="400" y1="320" x2="400" y2="210" stroke="#2563EB" stroke-width="8" stroke-linecap="round"/>
      <!-- Hour Hand pointing to 3 (Short Red) -->
      <line x1="400" y1="320" x2="485" y2="320" stroke="#DC2626" stroke-width="12" stroke-linecap="round"/>
      <!-- Center Pin -->
      <circle cx="400" cy="320" r="10" fill="#0F172A"/>
      <circle cx="400" cy="320" r="4" fill="#FFFFFF"/>

      <text x="400" y="550" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#2563EB" text-anchor="middle">
        Long Hand at 12 &amp; Short Hand at 3 = 3:00 (3 o'clock)
      </text>
    </svg>`;
  } else {
    // Joyful Elementary Classroom Illustration
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FEF3C7"/>
          <stop offset="100%" stop-color="#FDE68A"/>
        </linearGradient>
        <linearGradient id="board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#064E3B"/>
          <stop offset="100%" stop-color="#022C22"/>
        </linearGradient>
      </defs>

      <!-- Classroom Wall -->
      <rect width="800" height="460" fill="url(#wall)"/>
      <rect y="460" width="800" height="140" fill="#78350F"/>

      <!-- Chalkboard Frame -->
      <rect x="100" y="40" width="600" height="340" rx="16" fill="#854D0E"/>
      <rect x="120" y="60" width="560" height="300" rx="8" fill="url(#board)"/>

      <!-- Board Content -->
      <text x="400" y="110" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#FDE047" text-anchor="middle">
        🌟 NCERT Class 2 Smart Classroom
      </text>
      <text x="400" y="160" font-family="system-ui, sans-serif" font-size="20" fill="#A7F3D0" text-anchor="middle">
        Learning Topic: ${escapeXml(prompt.substring(0, 45))}
      </text>

      <g transform="translate(180, 200)">
        <!-- Book Icon -->
        <rect width="100" height="70" rx="8" fill="#3B82F6"/>
        <text x="50" y="45" font-family="system-ui, sans-serif" font-size="30" text-anchor="middle">📖</text>
        <text x="50" y="90" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#F8FAFC" text-anchor="middle">Read</text>
      </g>

      <g transform="translate(350, 200)">
        <!-- Pencil Icon -->
        <rect width="100" height="70" rx="8" fill="#F97316"/>
        <text x="50" y="45" font-family="system-ui, sans-serif" font-size="30" text-anchor="middle">✏️</text>
        <text x="50" y="90" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#F8FAFC" text-anchor="middle">Practice</text>
      </g>

      <g transform="translate(520, 200)">
        <!-- Star Icon -->
        <rect width="100" height="70" rx="8" fill="#10B981"/>
        <text x="50" y="45" font-family="system-ui, sans-serif" font-size="30" text-anchor="middle">🏆</text>
        <text x="50" y="90" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#F8FAFC" text-anchor="middle">Succeed</text>
      </g>

      <!-- Chalk ledge -->
      <rect x="140" y="355" width="520" height="10" rx="4" fill="#A16207"/>
      <rect x="250" y="350" width="30" height="6" rx="2" fill="#FFFFFF"/>
      <rect x="300" y="350" width="25" height="6" rx="2" fill="#FDE047"/>

      <!-- Desk and supplies -->
      <rect x="260" y="440" width="280" height="110" rx="12" fill="#B45309"/>
      <text x="400" y="500" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#FEF3C7" text-anchor="middle">
        Ms. Priya's Live Interactive Desk
      </text>
    </svg>`;
  }

  const base64 = Buffer.from(svg.trim()).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
