import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-28 pb-16 container mx-auto px-6 max-w-3xl">
      <h1 className="font-display text-4xl font-bold text-foreground mb-3">Refund Policy</h1>
      <p className="font-body text-sm text-muted-foreground mb-8">Last updated: 2026</p>

      <div className="prose prose-sm max-w-none font-body space-y-5 text-foreground/90">
        <section>
          <h2 className="font-display text-xl font-bold text-foreground">1. Coin Purchases</h2>
          <p>Coin purchases made via Easypaisa (0092 302 4771572) are <strong>non-refundable once credited</strong> to your wallet, except in the following cases:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Duplicate charge confirmed by Easypaisa transaction logs</li>
            <li>Payment captured but coins never credited within 24 hours</li>
            <li>Account terminated by Qadrdaan before any coins were spent</li>
          </ul>
          <p>Refunds in approved cases are issued back to the original Easypaisa wallet within 7 business days.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">2. Book Purchases</h2>
          <p>Digital book purchases include a 5-page preview before checkout. Refunds are granted only if:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The downloaded file is corrupt or unreadable</li>
            <li>Content materially differs from the preview/description</li>
            <li>The book was removed for copyright violation within 24 hours of purchase</li>
          </ul>
          <p>Submit refund requests to <a href="mailto:support@qadrdaan.com" className="text-primary font-bold">support@qadrdaan.com</a> within 7 days of purchase.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">3. Fan Club Subscriptions</h2>
          <p>Monthly subscriptions ($3/mo) are <strong>non-refundable</strong> for the current billing cycle. You may cancel anytime; access continues until the cycle ends.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">4. Mentorship Sessions</h2>
          <p>Cancel a booked session at least 24 hours before the scheduled time for a full coin refund. Cancellations within 24 hours are non-refundable.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">5. Gifts to Creators</h2>
          <p>Gifts sent to other creators are <strong>final and non-refundable</strong>. Once a gift is delivered, the recipient's earnings cannot be reversed.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">6. Ad Campaigns</h2>
          <p>Unspent ad balance can be refunded to your Easypaisa wallet (minimum $20). Funds already spent on impressions or clicks are non-refundable.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">7. How to request a refund</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Email <a href="mailto:support@qadrdaan.com" className="text-primary font-bold">support@qadrdaan.com</a> with your transaction ID.</li>
            <li>Include screenshots of the issue and your Easypaisa receipt.</li>
            <li>Our team reviews within 3 business days and replies via email.</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-foreground">8. Chargebacks</h2>
          <p>Filing a chargeback without first contacting support may result in immediate account suspension and forfeiture of all coins, earnings, and pending payouts.</p>
        </section>
      </div>
    </section>
    <Footer />
  </div>
);

export default RefundPolicy;
