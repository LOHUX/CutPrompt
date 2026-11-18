export default function VercelAttribution() {
  return (
    <div className="flex justify-center pt-8 pb-1" data-testid="vercel-attribution">
      <a
        href="https://vercel.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Powered by Vercel"
        className="inline-flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <img
          src="/static/powered-by-vercel.svg"
          alt="Powered by Vercel"
          width="145"
          height="28"
          className="block w-[145px] h-auto max-w-full"
        />
      </a>
    </div>
  );
}
