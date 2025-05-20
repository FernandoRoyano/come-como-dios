# 🧠 Come Como Dios – Planificador Nutricional IA

Plataforma inteligente de nutrición personalizada que genera planes semanales completos, listas de la compra y recetas saludables adaptadas a tus objetivos físicos y estilo de vida.

## 🚀 Tecnologías

- [Next.js 14](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI API](https://platform.openai.com/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)

## 🛠️ Instalación

1. Clona el repo:

```bash
git clone https://github.com/FernandoRoyano/come-como-dios.git
cd come-como-dios
```

2. Instala dependencias:

```bash
npm install
# o
yarn install
```

3. Crea un archivo `.env.local` con tu clave de OpenAI:

```env
OPENAI_API_KEY=sk-xxxxxx
```

4. Inicia el servidor:

```bash
npm run dev
```

## 🧬 Características

- Planes semanales hiperpersonalizados (7 días completos)
- Cálculo de TDEE + distribución de macronutrientes
- Lista de la compra clasificada y optimizada
- Recetas con enlaces a sitios verificados
- Exportación en PDF
- Interfaz limpia y moderna
- Preparado para expansión (login, seguimiento de usuario, etc.)

## 📁 Estructura del proyecto

```bash
src/
├── components/         # Componentes de UI
├── pages/              # Rutas Next.js
├── lib/                # Utilidades (prompt, validación)
└── styles/             # CSS Modules
```

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
2. Haz tus cambios y commits: `git commit -m 'Nueva funcionalidad'`
3. Sube tu rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## 📄 Licencia

MIT

---
Creado con 💙 por [Fernando Royano](https://github.com/FernandoRoyano)