const SECTIONS = [
  {
    title: 'Information We Collect',
    paragraphs: [
      'Account details — when you create an account we collect your name and email address. Your password is stored in hashed form by our authentication provider and is never visible to us.',
      'Order details — when you place an order we record your name, email address, the items ordered (product, size, quantity, price), the order amount, the payment method, and the payment reference.',
      'Payment confirmations — for cryptocurrency payments we store the coin, transaction hash (if provided), and any proof of payment you upload, such as a screenshot or PDF. Files you upload may contain personal information, so only share what is necessary.',
      'Vendor applications — when you apply to sell on Cybernexus we collect your business name, store address (slug), category, WhatsApp number, and business description. Vendors also provide product listings, which may include product photos and descriptions.',
      'Communications — if you contact us through our support email, WhatsApp, or in-app notifications, we keep a record of that conversation so we can help you.',
    ],
  },
  {
    title: 'How We Use Your Information',
    paragraphs: [
      'We use the information we collect to create and manage your account, process and fulfil your orders, confirm payments, prevent fraud, provide customer support, notify you about your order status, and operate and improve the marketplace.',
      'We use vendor-provided information to review applications, set up vendor storefronts, and connect buyers with the right vendor.',
      'We do not sell your personal information, and we do not use your data to build advertising profiles.',
    ],
  },
  {
    title: 'Payments and Financial Data',
    paragraphs: [
      'Card payments are processed by Paystack, a PCI-DSS compliant payment service provider. When you pay by card, bank transfer, or USSD, your payment details are entered directly into Paystack\u2019s secure window — your card details never touch our servers. We only receive a payment reference and confirmation of the outcome.',
      'For cryptocurrency payments, we rely on the transaction details and proof of payment you provide. Never send us your wallet seed phrase, private keys, or banking passwords — we will never ask for them.',
    ],
  },
  {
    title: 'Sharing Your Information',
    paragraphs: [
      'Service providers — we share the minimum information necessary with the companies that help us operate the store: our hosting and database provider (Appwrite), our payment processor (Paystack), and our email delivery provider for order notifications.',
      'Vendors — where an order needs to be fulfilled by a vendor, the relevant order details may be shared with that vendor so they can prepare and dispatch the item.',
      'Legal requirements — we may disclose information where required by law, regulation, or a valid request from law enforcement or a court.',
      'We do not otherwise share your personal information with third parties for their own marketing purposes.',
    ],
  },
  {
    title: 'Data Storage and Security',
    paragraphs: [
      'Your data is stored on Appwrite\u2019s infrastructure. Access to order and account records is restricted to authorised accounts — customers can only view their own orders, and vendors can only view orders for their own store.',
      'Sessions are managed with secure tokens by our authentication provider. We take reasonable steps to protect your information against unauthorised access, loss, or misuse, but no system can be guaranteed completely secure. Please use a strong, unique password for your Cybernexus account.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We keep your account information for as long as your account is active. Order records are retained for as long as needed to fulfil orders, handle returns and disputes, and meet accounting and legal obligations.',
      'Proof-of-payment files are kept only as long as needed to verify the payment and resolve any related dispute. Vendor application details are kept while the vendor is active on the marketplace.',
      'If you close your account or ask us to delete your data, we will delete or anonymise it, except where we are required to keep certain records by law.',
    ],
  },
  {
    title: 'Your Rights',
    paragraphs: [
      'You have the right to access the personal information we hold about you, to ask for corrections, to ask for deletion where the law allows, and to object to or restrict certain uses of your data.',
      'To exercise any of these rights, contact us using the details below. We will respond within a reasonable timeframe and may ask you to verify your identity before we act on the request.',
      'This policy is intended to comply with the Nigeria Data Protection Act and other applicable data protection laws.',
    ],
  },
  {
    title: 'Cookies and Local Storage',
    paragraphs: [
      'Cybernexus does not use advertising or tracking cookies. We use only what is necessary for the site to function: a session token that keeps you signed in, and local storage for things like your cart between visits.',
      'You can clear these at any time from your browser settings — clearing them will simply sign you out and empty your saved cart.',
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      'Cybernexus is not directed at children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it.',
    ],
  },
  {
    title: 'Changes to This Policy',
    paragraphs: [
      'We may update this Data Policy from time to time, for example when we add new features or service providers. The updated policy will be published on this page with a revised effective date.',
    ],
  },
  {
    title: 'Contact Us',
    paragraphs: [
      'If you have questions about this Data Policy, your data, or a request regarding your account, contact our support team.',
    ],
    address: ['Cybernexus', 'gishisrael432@gmail.com', 'Abuja, Nigeria'],
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide">DATA POLICY</h1>

      <div className="mt-8 rounded-3xl border border-line bg-card p-6 sm:p-10">
        <h2 className="font-display text-2xl tracking-wide">Your data, in plain words</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This policy explains what information Cybernexus collects when you shop or sell on our
          platform, how we use it, and the choices you have. Effective date: 25 October 2026.
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
          Questions about your data? Reach us at gishisrael432@gmail.com — we're happy to help.
        </p>
      </div>
    </div>
  );
}
