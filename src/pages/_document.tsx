import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Fonte Roboto */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />

        {/* Favicon para navegador */}
        <link rel="icon" href="/favicon.ico" />

        {/* Web App Manifest (para ícone em celular) */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <meta name="theme-color" content="#0F172A" />
        <meta name="description" content="Painel Gerencial Interativo com Gráficos e IA" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
