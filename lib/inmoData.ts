import { User, Invitation, DocItem, ActivityLog } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Carlos Mendoza (Admin)',
    email: 'admin@inmopredict.pe',
    role: 'ADMIN',
    title: 'Director de Analítica & Tasación',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-08-01',
    isCurrentUser: true,
  },
  {
    id: 'usr-2',
    name: 'Ing. Sofía Valenzuela',
    email: 'sofia.v@inmopredict.pe',
    role: 'EDITOR',
    title: 'Tasadora Senior & Perito Inmobiliario',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-08-15',
  },
  {
    id: 'usr-3',
    name: 'Diego Ramos',
    email: 'diego.r@invercapital.com',
    role: 'READER',
    title: 'Analista de Inversión Inmobiliaria',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedAt: '2026-08-28',
  },
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    email: 'profesor.evaluador@universidad.edu',
    role: 'EDITOR',
    token: 'token-profesor-inmo-2026',
    status: 'PENDING',
    invitedBy: 'Carlos Mendoza (Admin)',
    createdAt: '2026-09-06T14:30:00Z',
    expiresAt: '2026-09-13T14:30:00Z',
  },
  {
    id: 'inv-2',
    email: 'tasador.asociado@peritajes.pe',
    role: 'EDITOR',
    token: 'token-tasador-9941',
    status: 'PENDING',
    invitedBy: 'Carlos Mendoza (Admin)',
    createdAt: '2026-09-07T09:15:00Z',
    expiresAt: '2026-09-14T09:15:00Z',
  },
  {
    id: 'inv-3',
    email: 'inversiones.lima@grupoinmo.com',
    role: 'READER',
    token: 'token-grupoinmo-88',
    status: 'ACCEPTED',
    invitedBy: 'Carlos Mendoza (Admin)',
    createdAt: '2026-08-20T10:00:00Z',
    expiresAt: '2026-08-27T10:00:00Z',
  },
];

export const INITIAL_DOCS: DocItem[] = [
  {
    id: 'doc-1',
    slug: 'metodologia-algoritmo-prediccion-inmobiliaria',
    title: 'Metodología Matemática del Algoritmo de Predicción de Precios',
    description: 'Fundamento teórico, ponderación de variables (área, recámaras, sanitarios) y multiplicadores de zona para la valuación de inmuebles.',
    category: 'Metodología',
    tags: ['Algoritmo', 'Metodología', 'Tasación', 'Machine Learning', 'Regresión'],
    authorId: 'usr-1',
    authorName: 'Carlos Mendoza (Admin)',
    createdAt: '2026-08-10',
    updatedAt: '2026-09-05',
    currentVersion: 2,
    content: `# Metodología del Algoritmo de Predicción Inmobiliaria

Este documento técnico explica la formulación matemática implementada en el **Módulo Predictor de Bienes Raíces** de InmoPredict.

---

### 1. Variables de Entrada y Ponderación

El valor comercial estimado (\`V_c\`) de un inmueble se calcula a partir de cuatro dimensiones primarias:
1. **Área Construida (\`A_m2\`):** Base fundamental del costo por metro cuadrado según el dataset histórico.
2. **Habitaciones (\`N_hab\`):** Factor multiplicativo de habitabilidad.
3. **Baños (\`N_banos\`):** Ponderación de infraestructura sanitaria de alta demanda.
4. **Zona de Ubicación (\`F_zona\`):** Factor de ajuste geográfico y plusvalía.

> [!IMPORTANT]
> El factor de zona no es un valor lineal; representa el costo de la tierra y la concentración comercial del distrito analizado en los datasets CSV.

\`\`\`
Precio_Estimado = (Base_Zona * Coef_Metros * A_m2) + (N_hab * Peso_Hab) + (N_banos * Peso_Bano)
\`\`\`

---

### 2. Parámetros de Zona Referenciales

| Zona Evaluada | Precio Promedio Base | Multiplicador | Nivel de Demanda |
| :--- | :---: | :---: | :---: |
| **Cercado / Tradicional** | S/. 75,000 | 1.00x | Media / Residencial media |
| **Residencial Moderna** | S/. 195,000 | 1.85x | Alta / Familiar |
| **Comercial / Financiera** | S/. 256,000 | 2.40x | Muy Alta / Renta intensiva |

---

### 3. Estimación del Rango de Incertidumbre

Para dotar de confiabilidad profesional a la tasación, el sistema no emite un único valor determinista, sino un **intervalo de confianza del 95%**:
- **Rango Mínimo:** \`Precio_Estimado * 0.92\` (Descuento por negociación rápida o estado de conservación estándar).
- **Rango Máximo:** \`Precio_Estimado * 1.08\` (Valor óptimo con acabados de primera o amenidades completas).

\`\`\`typescript
// Lógica de cálculo en el motor de predicción
const calcularRango = (estimado: number) => ({
  precioEstimado: estimado,
  rangoMinimo: Math.round(estimado * 0.92),
  rangoMaximo: Math.round(estimado * 1.08),
});
\`\`\`
`,
    versions: [
      {
        id: 'ver-1-1',
        version: 1,
        title: 'Metodología Matemática del Algoritmo de Predicción de Precios',
        content: '# Metodología Inicial\nBorrador preliminar con coeficientes base.',
        commitMessage: 'Commit inicial: formulación del modelo de predicción',
        authorId: 'usr-1',
        authorName: 'Carlos Mendoza (Admin)',
        createdAt: '2026-08-10T10:00:00Z',
      },
      {
        id: 'ver-1-2',
        version: 2,
        title: 'Metodología Matemática del Algoritmo de Predicción de Precios',
        content: '',
        commitMessage: 'Actualizada tabla de multiplicadores por zona y cálculo de intervalos de confianza',
        authorId: 'usr-2',
        authorName: 'Ing. Sofía Valenzuela',
        createdAt: '2026-09-05T16:20:00Z',
      },
    ],
  },
  {
    id: 'doc-2',
    slug: 'estudio-mercado-plusvalia-peru',
    title: 'Estudio de Mercado Inmobiliario: Plusvalía y Tendencias de Precios',
    description: 'Análisis comparativo de los datasets de casas, departamentos y locales comerciales en distritos urbanos.',
    category: 'Estudio de Mercado',
    tags: ['Mercado', 'Plusvalía', 'Perú', 'Datasets', 'Estadísticas'],
    authorId: 'usr-2',
    authorName: 'Ing. Sofía Valenzuela',
    createdAt: '2026-08-20',
    updatedAt: '2026-09-02',
    currentVersion: 1,
    content: `# Estudio de Mercado Inmobiliario y Plusvalía

Informe analítico derivado del análisis de los registros de \`dataset_casas.csv\` y \`dataset_nacional_peru.csv\`.

---

### Hallazgos Principales del Mercado

1. **Departamentos vs Casas Unifamiliares**: Los departamentos de 60m² a 85m² concentran el 64% de la liquidez transaccional en zonas residenciales.
2. **Impacto de Servicios y Transporte**: Propiedades ubicadas a menos de 500 metros de avenidas troncales experimentan una plusvalía promedio anual del **6.8%**.
3. **Distribución de Precios**: El gráfico de dispersión confirma una fuerte correlación lineal positiva (\`r = 0.84\`) entre metros cuadrados y precio de cierre en soles (PEN).

> [!NOTE]
> Los datos reflejan transacciones consolidadas del último bienio, eliminando valores atípicos (outliers) en ambos extremos de la curva.
`,
    versions: [
      {
        id: 'ver-2-1',
        version: 1,
        title: 'Estudio de Mercado Inmobiliario: Plusvalía y Tendencias de Precios',
        content: '',
        commitMessage: 'Publicación del informe analítico de mercado y correlaciones',
        authorId: 'usr-2',
        authorName: 'Ing. Sofía Valenzuela',
        createdAt: '2026-08-20T12:00:00Z',
      },
    ],
  },
  {
    id: 'doc-3',
    slug: 'protocolo-tecnico-tasacion-inmuebles',
    title: 'Protocolo Técnico de Tasación para Departamentos y Casas',
    description: 'Guía práctica para peritos y tasadores: inspección física, evaluación de estado de conservación y factores de depreciación.',
    category: 'Tasación',
    tags: ['Tasación', 'Peritaje', 'Guía', 'Protocolo', 'Valuación'],
    authorId: 'usr-1',
    authorName: 'Carlos Mendoza (Admin)',
    createdAt: '2026-08-28',
    updatedAt: '2026-09-01',
    currentVersion: 1,
    content: `# Protocolo Técnico de Tasación Inmobiliaria

Guía estándar para la homologación de valores calculados en la plataforma InmoPredict.

---

### Checklist de Homologación Pericial

- [x] Verificación de títulos de dominio e inscripción en Registros Públicos (SUNARP).
- [x] Inspección ocular de instalaciones eléctricas, sanitarias y acabados.
- [x] Cálculo del área ocupada versus área techada efectiva.
- [x] Corroboración con el simulador algorítmico del portal.

\`\`\`
Depreciación_Ross_Heidecke = Edad_Inmueble * Factor_Conservacion / Vida_Util
\`\`\`
`,
    versions: [
      {
        id: 'ver-3-1',
        version: 1,
        title: 'Protocolo Técnico de Tasación para Departamentos y Casas',
        content: '',
        commitMessage: 'Creación del protocolo y checklist de inspección',
        authorId: 'usr-1',
        authorName: 'Carlos Mendoza (Admin)',
        createdAt: '2026-08-28T15:00:00Z',
      },
    ],
  },
];

// Ensure version content synchronization
INITIAL_DOCS[0].versions[1].content = INITIAL_DOCS[0].content;
INITIAL_DOCS[1].versions[0].content = INITIAL_DOCS[1].content;
INITIAL_DOCS[2].versions[0].content = INITIAL_DOCS[2].content;

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'INVITATION',
    description: 'Carlos Mendoza (Admin) invitó a profesor.evaluador@universidad.edu con rol EDITOR.',
    authorName: 'Carlos Mendoza (Admin)',
    timestamp: 'Hace 2 horas',
  },
  {
    id: 'act-2',
    type: 'PREDICTION',
    description: 'Ing. Sofía Valenzuela calculó una tasación residencial de 90m² por S/. 195,000.',
    authorName: 'Ing. Sofía Valenzuela',
    timestamp: 'Hace 4 horas',
  },
  {
    id: 'act-3',
    type: 'DOC',
    description: 'Ing. Sofía Valenzuela actualizó la "Metodología del Algoritmo de Predicción" (v2).',
    authorName: 'Ing. Sofía Valenzuela',
    timestamp: 'Hace 1 día',
  },
  {
    id: 'act-4',
    type: 'MEMBER',
    description: 'Diego Ramos aceptó la invitación y se unió como Lector (Inversionista).',
    authorName: 'Diego Ramos',
    timestamp: 'Hace 3 días',
  },
];

