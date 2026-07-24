import './ShippingReturns.css';

export function ShippingReturns() {
  return (
    <div className="shipping-returns-page container">
      <div className="section-header">
        <h2 className="section-title">Shipping & Returns</h2>
      </div>

      <div className="policy-content">
        <div className="policy-section">
          <h3>Shipping Policy</h3>
          <p>
            At Chrisdelight Apparels, we strive to deliver your everyday essentials as quickly and securely as possible. All orders are processed within 1-2 business days.
          </p>
          <ul>
            <li>Standard Shipping (3-5 business days): ₦2,500</li>
            <li>Express Shipping (1-2 business days): ₦5,000</li>
            <li>International Shipping: Calculated at checkout based on location.</li>
          </ul>
          
          <div className="policy-highlight">
            <p>🌟 Free shipping above ₦200,000 in Abuja!</p>
          </div>
        </div>

        <div className="policy-section">
          <h3>Returns & Exchanges</h3>
          <p>
            We want you to love your Chrisdelight items. If you are not entirely satisfied with your purchase, we're here to help.
          </p>
          <ul>
            <li>Items can be returned within 14 days of delivery.</li>
            <li>Products must be unworn, unwashed, and in their original condition with tags attached.</li>
            <li>Refunds will be processed to the original payment method within 5-7 business days of receiving the return.</li>
            <li>Exchange items will be shipped out free of charge once the original item is received.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
