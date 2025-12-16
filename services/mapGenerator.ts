import { HexData, ResourceType, PortType } from '../types';

export const generateMap = (size: number): HexData[] => {
  // size 3 = Standard (Land Radius 2)
  // size 5 = Large (Land Radius 3)
  const landRadius = size === 5 ? 3 : 2;
  const waterRadius = landRadius + 1;

  // 1. Define Resources
  let landResources: ResourceType[] = [];
  if (size === 3) {
    // Standard 19 hexes
    landResources = [
      ...Array(4).fill(ResourceType.FOREST),
      ...Array(4).fill(ResourceType.PASTURE),
      ...Array(4).fill(ResourceType.GRAIN),
      ...Array(3).fill(ResourceType.HILLS),
      ...Array(3).fill(ResourceType.MOUNTAINS),
      ResourceType.DESERT
    ];
  } else {
    // Large 37 hexes (filled radius 3)
    // Approx distribution for large map
    landResources = [
      ...Array(6).fill(ResourceType.FOREST),
      ...Array(6).fill(ResourceType.PASTURE),
      ...Array(6).fill(ResourceType.GRAIN),
      ...Array(5).fill(ResourceType.HILLS),
      ...Array(5).fill(ResourceType.MOUNTAINS),
      ...Array(9).fill(ResourceType.DESERT).map((_, i) => i === 0 ? ResourceType.DESERT : [ResourceType.FOREST, ResourceType.PASTURE][i%2]) // Fill rest casually
    ];
    // Ensure exact count matches 37 for radius 3
    const targetCount = 37;
    // Basic large set (Standard + Extension is usually 30, but radius 3 is 37. We fill with generic mix)
    // Let's just generate a rich mix
    landResources = [
       ResourceType.DESERT, ResourceType.DESERT,
       ...Array(7).fill(ResourceType.FOREST),
       ...Array(7).fill(ResourceType.PASTURE),
       ...Array(7).fill(ResourceType.GRAIN),
       ...Array(7).fill(ResourceType.HILLS),
       ...Array(7).fill(ResourceType.MOUNTAINS),
    ].slice(0, 37);
  }

  // 2. Define Numbers
  let numberTokens: number[] = [];
  if (size === 3) {
    numberTokens = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];
  } else {
    // Just double the standard set for large map and trim
    const base = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];
    numberTokens = [...base, ...base].slice(0, 35); // 37 hexes - 2 deserts
  }

  // Shuffle
  const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const shuffledResources = shuffle(landResources);
  const shuffledNumbers = shuffle(numberTokens);
  
  // 3. Define Ports
  // Standard: 4 generic, 1 of each resource (5) = 9 ports
  const standardPorts = [
    PortType.GENERIC, PortType.GENERIC, PortType.GENERIC, PortType.GENERIC,
    PortType.GRAIN, PortType.FOREST, PortType.HILLS, PortType.MOUNTAINS, PortType.PASTURE
  ];
  const portsToPlace = size === 5 
    ? [...standardPorts, PortType.GENERIC, PortType.PASTURE, PortType.GENERIC] // Add a few for large
    : standardPorts;
    
  const shuffledPorts = shuffle(portsToPlace);

  const hexes: HexData[] = [];
  let resIndex = 0;
  let numIndex = 0;

  // 4. Generate Land Hexes (Radius 0 to landRadius)
  for (let q = -landRadius; q <= landRadius; q++) {
    const r1 = Math.max(-landRadius, -q - landRadius);
    const r2 = Math.min(landRadius, -q + landRadius);
    for (let r = r1; r <= r2; r++) {
       const res = shuffledResources[resIndex++];
       let num: number | null = null;
       if (res !== ResourceType.DESERT) {
         num = shuffledNumbers[numIndex++] || null;
       }
       hexes.push({
         id: `${q},${r}`,
         q, r,
         resource: res,
         number: num
       });
    }
  }

  // 5. Generate Water Hexes (The Ring at waterRadius)
  // We walk around the ring
  let portIndex = 0;
  
  // Directions for hex neighbors (used to walk the ring)
  const directions = [
      { dq: 1, dr: 0 }, { dq: 1, dr: -1 }, { dq: 0, dr: -1 },
      { dq: -1, dr: 0 }, { dq: -1, dr: 1 }, { dq: 0, dr: 1 }
  ];
  
  // Start at a corner of the water ring
  let currentQ = -waterRadius;
  let currentR = 0; // Starting at left edge? No, let's start at a defined corner.
  // Corner 4 (Bottom Left) is usually (-N, N) or similar depending on coord system.
  // Let's just generate the ring by iterating q/r bounds logic restricted to boundary
  
  // Better approach: Calculate coordinates for the ring explicitly
  const waterHexes: {q: number, r: number}[] = [];
  let q = -waterRadius;
  let r = 0;
  
  // Walk the 6 sides of the hexagon ring
  for (let i = 0; i < 6; i++) {
      for (let j = 0; j < waterRadius; j++) {
          waterHexes.push({ q, r });
          // Move to next hex in ring
          // Directions: +q, -r then +r, -q ... wait.
          // Standard cube coordinate walking:
          // start at (-N, 0, N). 
          // Move (1, 0, -1) x N
          // Move (0, 1, -1) x N
          // etc
          const dir = directions[i]; // Actually map generation usually differs, but let's use the explicit loop logic below which is safer
          // Instead of walking, let's just use the loop range logic for only the edge
      }
      // Update corner for next side start? 
      // Actually simpler:
      // Start corner: (-waterRadius, 0)
      // Side 0: (+1, -1) direction? No.
      // Let's use the standard loop but filter by distance.
  }

  // Revert to standard loop for Water Ring, it's safer for order
  const ringHexes: HexData[] = [];
  for (let q = -waterRadius; q <= waterRadius; q++) {
    const r1 = Math.max(-waterRadius, -q - waterRadius);
    const r2 = Math.min(waterRadius, -q + waterRadius);
    for (let r = r1; r <= r2; r++) {
      const dist = (Math.abs(q) + Math.abs(q + r) + Math.abs(r)) / 2;
      if (dist === waterRadius) {
        // This is a water hex
        ringHexes.push({
            id: `${q},${r}`,
            q, r,
            resource: ResourceType.SEA,
            number: null
        });
      }
    }
  }

  // Sort ring hexes by angle to ensure they are in order (for nice port distribution)
  ringHexes.sort((a, b) => {
      const angleA = Math.atan2(a.r + a.q/2, a.q * Math.sqrt(3)/2); // Approx angle
      const angleB = Math.atan2(b.r + b.q/2, b.q * Math.sqrt(3)/2);
      return angleA - angleB;
  });

  // Distribute Ports
  // Pattern: Port - Skip - Port - Skip - Skip (Standard Catan varies, but typically 1 port every 2 edges)
  // For simplicity: Every 2nd hex gets a port until we run out.
  
  // We need to determine rotation. The port should point to (0,0).
  // Calculate angle from hex center to 0,0.
  const getRotation = (hexQ: number, hexR: number): number => {
     // Hex center in pixel coords (simplified unit)
     const x = hexQ * Math.sqrt(3); // width-ish
     const y = 2 * hexR + hexQ; // height-ish... actually let's use Math.atan2(y, x) of the hex center relative to 0,0
     // x_pixel = size * sqrt(3) * (q + r/2)
     // y_pixel = size * 3/2 * r
     // Wait, standard axial to pixel:
     // x = size * (3/2 * q)
     // y = size * (sqrt(3)/2 * q + sqrt(3) * r)
     const px = 1.5 * hexQ;
     const py = (Math.sqrt(3)/2 * hexQ) + (Math.sqrt(3) * hexR);
     
     // We want the vector pointing TO (0,0), which is (-px, -py)
     const angleRad = Math.atan2(-py, -px);
     let angleDeg = angleRad * 180 / Math.PI;
     return angleDeg + 90; // Adjust for icon orientation (assuming icon points up by default)
  };

  ringHexes.forEach((hex, i) => {
      // Simple pattern: Place port if index is even, and we have ports left
      // Standard board has 18 water hexes. 9 Ports. Perfect 1 yes, 1 no.
      if (i % 2 === 0 && portIndex < shuffledPorts.length) {
          hex.port = shuffledPorts[portIndex++];
          hex.rotation = getRotation(hex.q, hex.r);
      } else {
          hex.port = PortType.NONE;
      }
  });

  return [...hexes, ...ringHexes];
};