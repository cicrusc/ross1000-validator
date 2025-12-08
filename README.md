<!-- Tecnologie usate -->
![Next.js](https://img.shields.io/badge/Next.js-⚡-black?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-TS-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Tailwind%20CSS-black?style=for-the-badge&logo=tailwindcss&logoColor=38B2AC)


# ROSS 1000 Validator

A web-based tool for validating and formatting ROSS 1000 files according to ISTAT specifications. Fully client-side, runs directly in the browser without any server.

## Features

- **File Validation**: Upload and validate TXT files in the ROSS 1000 format (fixed-width 128 characters per line).
- **Inline Editing**: Correct errors directly in the table interface with real-time validation feedback.
- **Download Corrected Files**: Export valid records as TXT files compliant with ISTAT specifications.
- **Privacy First**: All processing happens in the browser. No data is sent to external servers.
- **Offline Support**: Works completely offline after initial page load.

## Technologies Used

- **Next.js 15**: React framework with static export for GitHub Pages deployment.
- **TypeScript 5**: Strongly-typed JavaScript for better code quality.
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: Accessible UI components based on Radix UI.
- **Lucide React**: Icon library for consistent visual elements.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/cicrusc/ross1000-validator.git
cd ross1000-validator
```

### 2. Install Dependencies

You need Node.js 18+ and npm 8+ installed on your machine. After installing them, run:

```bash
npm install
```

### 3. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Build for Production

To generate static files for GitHub Pages:

```bash
npm run build
```

Static files will be generated in the `out/` folder.

## Usage

### Workflow

1. **Upload File**: Click "Carica File" and select a TXT file in ROSS 1000 format.
2. **View Results**: The application displays valid and invalid records in separate tabs.
3. **Correct Errors**: Click on a cell to edit. Changes are validated in real-time.
4. **Download**: Export valid records or review invalid ones by downloading the respective files.

### Validation Rules

The application validates records according to ISTAT ROSS 1000 specifications (v.4 - 20/10/2022), including:

- Required field validation
- Date format validation (DD/MM/YYYY)
- Cross-field validation (e.g., departure date must be after arrival date)
- Conditional field requirements based on record type

## Project Structure

```
src/
├── app/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Main layout
│   └── page.tsx           # Main validation page
├── components/
│   └── ui/                # shadcn/ui components
└── lib/
    └── utils.ts           # Helper functions
```

## Deployment

### GitHub Pages

The project includes a GitHub Actions workflow for automatic deployment. On every push to `main`:

1. The project is built with `npm run build`
2. The `out/` folder is deployed to GitHub Pages

After deployment, the app is available at:
```
https://cicrusc.github.io/ross1000-validator/
```

### Manual Deployment

1. Run `npm run build`
2. Upload the contents of `out/` to any static hosting service

## Troubleshooting

### Build Failed

```bash
rm -rf .next out node_modules
npm install
npm run build
```

### 404 on GitHub Pages

- Ensure `output: 'export'` is set in `next.config.ts`
- Check that the `out/` folder was created successfully

### Files Not Downloading

- Check the browser console for JavaScript errors
- Ensure the browser supports the Blob API (all modern browsers do)

## Contributing

Feel free to fork the repository and contribute by submitting pull requests. All improvements and bug fixes are welcome.

## License

This project is open-source and available under the [MIT License](LICENSE).
