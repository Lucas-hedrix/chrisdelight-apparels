const SECTIONS = [
  {
    title: 'Orders and Payments',
    paragraphs: [
      'All orders are subject to product availability and payment confirmation. Please ensure that your delivery details and contact information are correct when placing an order.',
      'Prices and product availability may change from time to time. Any applicable delivery fees will be communicated during the ordering process.',
    ],
  },
  {
    title: 'Secure Payments',
    paragraphs: [
      'At Cybernexus, we take the security of your payments seriously. Our online payment processing is supported by Paystack, a payment service provider that uses security measures designed to help protect payment transactions.',
      'Customers should only submit payment details through the designated payment channels provided on our website. Cybernexus does not ask customers to share their card PINs or banking passwords.',
    ],
  },
  {
    title: 'Delivery and Shipping',
    paragraphs: [
      'We aim to deliver orders to customers\u2019 doorsteps, making shopping convenient and straightforward.',
      'Our estimated delivery time is approximately two weeks from order confirmation. However, delivery times may vary depending on product availability, logistics, location, and other circumstances. Some orders may take longer than the estimated timeframe.',
      'We will make reasonable efforts to support the delivery process, but we cannot guarantee an exact delivery date. Cybernexus is not responsible for delays caused by circumstances beyond our reasonable control, although we will assist customers with delivery enquiries where possible.',
      'Customers are responsible for providing accurate delivery addresses and reachable contact details to help ensure successful delivery.',
    ],
  },
  {
    title: 'Product Information',
    paragraphs: [
      'We aim to provide accurate product descriptions, photographs, and pricing. Some products offered on Cybernexus may be pre-owned or previously used.',
      'Customers are encouraged to review the product description, condition, size, and other available details before purchasing.',
      'Any claims that an item was previously owned or worn by a particular artist or public figure will be made only where there is a reasonable basis for the claim. Product availability may be limited.',
    ],
  },
  {
    title: 'Customer Information and Privacy',
    paragraphs: [
      'We value the privacy and security of our customers. Information provided when placing an order, such as names, contact details, and delivery addresses, is used to process orders, arrange deliveries, communicate with customers, and provide our services.',
      'We take reasonable steps to protect customer information against unauthorised access, loss, or misuse. Payment transactions are processed through Paystack\u2019s payment systems, subject to its applicable security and privacy practices.',
      'We do not intentionally sell customers\u2019 personal information. Information may be shared with service providers when necessary to process payments, fulfil orders, or deliver products, or where required by law.',
    ],
  },
  {
    title: 'Returns, Refunds, and Exchanges',
    paragraphs: [
      'Customers should contact Cybernexus if an item arrives damaged, is incorrect, or differs significantly from its description.',
      'Return, exchange, and refund requests will be reviewed according to our applicable policies and Nigerian consumer protection laws. Customers should contact us promptly with their order details and supporting information.',
      'Nothing in these terms removes any consumer rights that cannot legally be excluded.',
    ],
  },
  {
    title: 'Order Changes and Cancellations',
    paragraphs: [
      'Customers who need to change or cancel an order should contact us as soon as possible. Requests may depend on whether the order has already been processed or dispatched.',
      'If an order cannot be fulfilled, we will communicate the available options, including a refund where applicable.',
    ],
  },
  {
    title: 'Website Use',
    paragraphs: [
      'Customers agree to use our website lawfully and provide accurate information when placing orders. Unauthorised access, fraudulent activity, or misuse of the website is prohibited.',
      'We reserve the right to restrict access where necessary to protect our website, customers, and business operations, subject to applicable law.',
    ],
  },
  {
    title: 'Changes to These Terms',
    paragraphs: [
      'Cybernexus may update these Terms and Conditions when necessary. Updated terms will be published on this page and will apply as permitted by applicable law.',
    ],
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'If you have questions about these Terms and Conditions, an order, a payment, or a delivery, please contact our customer support team using the contact details available on our website.',
    ],
    address: ['Cybernexus', 'Abuja, Nigeria'],
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide">TERMS &amp; CONDITIONS</h1>

      <div className="mt-8 rounded-3xl border border-line bg-card p-6 sm:p-10">
        <h2 className="font-display text-2xl tracking-wide">Welcome to Cybernexus!</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Thank you for shopping with Cybernexus. By using our website or placing an order, you
          agree to the terms outlined below. Please read them carefully before making a purchase.
        </p>

        <div className="mt-10 space-y-9">
          {SECTIONS.map((section, i) => (
            <section key={section.title}>
              <h3 className="flex items-baseline gap-2.5 text-base font-bold text-cream">
                <span className="font-display text-lg text-brand">{i + 1}.</span>
                {section.title}
              </h3>
              <div className="mt-2.5 space-y-2.5">
                {section.paragraphs.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
              {section.address && (
                <p className="mt-3 text-sm font-bold text-cream">
                  {section.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              )}
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-line pt-6 text-sm font-semibold text-cream">
          Thank you for choosing Cybernexus. We appreciate your trust and look forward to serving
          you.
        </p>
      </div>
    </div>
  );
}
