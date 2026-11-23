import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

/**
 * Contact — self-contained form (no backend yet, so submission just
 * simulates success). The map is a styled placeholder rather than an
 * embedded iframe since this environment has no live network access;
 * swapping in a real Google Maps embed later is a one-element change.
 */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.message.trim().length < 10) next.message = 'Message should be at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSent(true);
    toast.success('Message sent — we\'ll reply within a day.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container-page py-14">
      <p className="eyebrow">Get in touch</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Contact us</h1>
      <p className="mt-3 max-w-md text-sm text-ink/60">
        Questions about an order, a plant's care, or a bulk request for your office? We usually reply within a day.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl bg-paper p-6 shadow-card">
          <Input
            id="contact-name"
            label="Name"
            value={form.name}
            error={errors.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
          />
          <Input
            id="contact-email"
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com"
          />
          <div>
            <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink/80">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              aria-invalid={!!errors.message}
              placeholder="How can we help?"
              className={`w-full rounded-xl border bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none ${
                errors.message ? 'border-red-400 focus:border-red-500' : 'border-ink/15 focus:border-fern'
              }`}
            />
            {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full">
            {sent ? 'Sent!' : 'Send message'}
          </Button>
        </form>

        <div className="space-y-6">
          <div className="flex h-48 items-center justify-center rounded-2xl bg-mist text-sm text-ink/40">
            <div className="flex items-center gap-2">
              <FiMapPin size={16} /> Map placeholder — Chennai, Tamil Nadu
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-paper p-6 shadow-card">
            <a href="mailto:hello@plantista.com" className="flex items-center gap-3 text-sm text-ink/70 hover:text-fern">
              <FiMail size={18} className="text-fern" /> hello@plantista.com
            </a>
            <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-ink/70 hover:text-fern">
              <FiPhone size={18} className="text-fern" /> +91 98765 43210
            </a>
            <div className="flex gap-3 pt-2">
              {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="rounded-full border border-ink/15 p-2.5 hover:border-fern hover:text-fern"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
