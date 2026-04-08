const isProduction = import.meta.env.PROD;

const GA_MEASUREMENT_ID = "G-4H3Z388Z6P";

export function GoogleAnalyticsProvider() {
  return isProduction ? (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  ) : null;
}
