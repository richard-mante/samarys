const highlights = [
  {
    title: "Clear product information",
    description:
      "Review the product details, packaging and seller-provided information before deciding whether to order.",
  },
  {
    title: "Two ways to order",
    description:
      "Choose online checkout or contact the seller directly through WhatsApp.",
  },
  {
    title: "A straightforward experience",
    description:
      "Get clear order references, payment status and seller contact information throughout your order.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="text-xl font-semibold tracking-tight">
          Samary&apos;s<span className="text-[#66836c]">.</span>
        </a>
        <a
          href="#contact"
          className="rounded-full border border-[#d9dfd5] px-5 py-2.5 text-sm font-medium transition hover:bg-white"
        >
          Contact seller
        </a>
      </header>

      <section className="mx-auto grid min-h-[70vh] w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#66836c]">
            Product information & ordering
          </p>
          <h1 className="font-serif text-5xl leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            A more considered way to discover Samary&apos;s.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#68766c] sm:text-lg">
            Explore product information and available ordering options. We are
            preparing the full product catalogue and checkout experience.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#product"
              className="rounded-full bg-[#244b36] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#183a28]"
            >
              Explore product
            </a>
            <a
              href="https://wa.me/233559448932"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#d9dfd5] px-7 py-3.5 text-sm font-semibold transition hover:bg-white"
            >
              Chat on WhatsApp
            </a>
          </div>
          <p className="mt-5 text-xs leading-6 text-[#7b857c]">
            Product information and ordering availability will be updated
            following seller verification.
          </p>
        </div>

        <div
          aria-label="Botanical-inspired placeholder artwork"
          className="relative flex aspect-[4/5] min-h-[380px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#e8ede4] p-8"
        >
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#cbd9c8]" />
          <div className="absolute -bottom-16 -left-12 h-72 w-72 rounded-full bg-[#d7e1d2]" />
          <div className="relative flex h-[78%] w-[65%] flex-col items-center justify-center rounded-[1.5rem] border border-white/70 bg-[#f9f8f1]/90 p-8 text-center shadow-[0_30px_80px_rgba(37,65,45,0.12)]">
            <span className="text-xs uppercase tracking-[0.28em] text-[#66836c]">
              Samary&apos;s
            </span>
            <span className="mt-5 font-serif text-3xl leading-tight text-[#244b36]">
              Product
              <br />
              collection
            </span>
            <span className="mt-5 text-[10px] uppercase tracking-[0.18em] text-[#7b857c]">
              Product photography to be supplied
            </span>
          </div>
        </div>
      </section>

      <section id="product" className="border-t border-[#e6e8df] bg-white/70">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#66836c]">
            The experience
          </p>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
            Information first. Ordering made simple.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {highlights.map((item, index) => (
              <article key={item.title} className="border-t border-[#dfe4dc] pt-6">
                <p className="text-xs text-[#819083]">0{index + 1}</p>
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#68766c]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-[#68766c] sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>Samary&apos;s</span>
        <a href="https://wa.me/233559448932" target="_blank" rel="noreferrer">
          WhatsApp: +233 55 944 8932
        </a>
      </footer>
    </main>
  );
}
