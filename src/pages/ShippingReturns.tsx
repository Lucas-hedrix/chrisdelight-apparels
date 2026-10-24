export default function ShippingReturns() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide">SHIPPING &amp; RETURNS</h1>

      <div className="mt-8 rounded-3xl border border-line bg-card p-6 sm:p-10">
        <section>
          <h2 className="font-display text-2xl tracking-wide">SHIPPING POLICY</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            At Cybernexus, we strive to deliver your everyday essentials as quickly and securely as
            possible. All orders are processed within 1-2 business days.
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            <li>Standard Shipping (3-5 business days): ₦2,500</li>
            <li>Express Shipping (1-2 business days): ₦5,000</li>
            <li>International Shipping: Calculated at checkout based on location.</li>
          </ul>
          <p className="mt-5 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-cream">
            Free shipping above ₦200,000 in Abuja!
          </p>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className="font-display text-2xl tracking-wide">RETURNS &amp; EXCHANGES</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            We want you to love your Cybernexus pieces. If you are not entirely satisfied with your
            purchase, we&apos;re here to help.
          </p>
          <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            <li>Items can be returned within 14 days of delivery.</li>
            <li>Products must be unworn, unwashed, and in their original condition with tags attached.</li>
            <li>Refunds will be processed to the original payment method within 5-7 business days of receiving the return.</li>
            <li>Exchange items will be shipped out free of charge once the original item is received.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
