// ============================================
// Atelier Bleu — logique de la page commande
// ============================================

// 1) Adresse de votre backend une fois déployé (Vercel/Railway/Render...).
//    En local pendant les tests : http://localhost:3000
const API_BASE = "https://atelier-bleu-production.up.railway.app";

// 2) Liens de paiement Stripe pour chaque forfait.
//    À créer dans le Dashboard Stripe > Payment Links (aucun code requis).
//    Pensez à régler le "redirect" du Payment Link vers merci.html dans Stripe.
const STRIPE_LINKS = {
  "essentiel": "https://buy.stripe.com/test_aFaeV69xN4Yf6dCaFj3oA00",
  "pro": "https://buy.stripe.com/test_14A8wI39p3UbeK800F3oA01",
  "sur-mesure": "https://buy.stripe.com/test_8x2cMYeS7duL6dC5kZ3oA02"
};

document.addEventListener("DOMContentLoaded", () => {
  // Préselectionne le forfait si on arrive depuis la page tarifs (?forfait=pro)
  const params = new URLSearchParams(window.location.search);
  const forfaitParam = params.get("forfait");
  const select = document.getElementById("forfait");
  if (forfaitParam && select) {
    const match = Array.from(select.options).find(o => o.value === forfaitParam);
    if (match) select.value = forfaitParam;
  }

  const form = document.getElementById("order-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = document.getElementById("status");
    const submitBtn = form.querySelector("button[type=submit]");

    const payload = {
      forfait: form.forfait.value,
      nom: form.nom.value.trim(),
      entreprise: form.entreprise.value.trim(),
      email: form.email.value.trim(),
      telephone: form.telephone.value.trim(),
      secteur: form.secteur.value.trim(),
      description: form.description.value.trim(),
      contenu: form.contenu.value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";
    status.textContent = "";
    status.className = "form-status";

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur serveur");

      status.textContent = "Demande envoyée. Redirection vers le paiement…";
      status.classList.add("ok");

      const stripeUrl = STRIPE_LINKS[payload.forfait];
      setTimeout(() => {
        if (stripeUrl) {
          window.location.href = stripeUrl;
        } else {
          window.location.href = "merci.html";
        }
      }, 900);

    } catch (err) {
      status.textContent = "Une erreur est survenue. Vérifiez votre connexion et réessayez, ou écrivez-nous directement à contact@atelierbleu.fr.";
      status.classList.add("err");
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer ma demande et passer au paiement →";
    }
  });
});
